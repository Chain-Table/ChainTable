const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

// Cargar variables de entorno PRIMERO
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: false });

// Luego cargar contractService (que usa process.env)
const contractService = require('./contractService');
const { STATE } = contractService;
const Truco = require('../truco/engine');

const app = express();
app.disable('x-powered-by');
const server = http.createServer(app);

// Normalizar FRONTEND_ORIGIN. Acepta uno o varios origins separados por coma.
const rawOrigin = process.env.FRONTEND_ORIGIN || '';
const configuredOrigins = rawOrigin
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  'http://localhost:5173',
  'http://localhost:3000'
];

// Si no hay FRONTEND_ORIGIN definido, permitir todos solo para dev/testing.
const corsOrigin = configuredOrigins.includes('*') || configuredOrigins.length === 0
  ? '*'
  : Array.from(new Set(allowedOrigins));

console.log('🔒 CORS origins permitidos:', corsOrigin);

// Configurar CORS para Express
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST'],
  credentials: corsOrigin !== '*'
}));

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Configurar Socket.IO con CORS
const io = socketIo(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: corsOrigin !== '*'
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 16 * 1024, // ningún evento del juego pesa más; frena payloads gigantes
});

// ===== MODELOS BÁSICOS =====
class Card {
  constructor(color, value, type, variant = 'a') {
    this.color = color; // Red, Blue, Green, Yellow, Wild
    this.value = value; // 0-9, Skip, Reverse, DrawTwo, WildDrawFour
    this.type = type;   // 'Number' | 'Action' | 'Wild'
    this.variant = variant; // a/b/c/d for artwork variants
  }
}

class UnoGame {
  constructor(lobbyId, players, lobbyData = {}) {
    this.lobbyId = lobbyId;
    this.players = players.map(p => ({ ...p }));
    this.drawPile = this.createDeck();
    this.discardPile = [];
    this.currentTurnIndex = 0;
    this.direction = 1;
    this.currentActiveColor = null;
    this.drawStackCount = 0;
    this.drawStackActive = false;
    this.hasDrawnCard = {};
    this.finishedIds = new Set();
    this.winners = [];
    this.status = 'in_game';
    this.turnSeq = 0; // sube con cada cambio de turno: el reloj se reinicia cuando cambia
    this.awaitingColor = false;
    
    // CRITICAL: Incluir información del lobby para auto-distribución de premios
    this.type = lobbyData.type; // 'gratuito' | 'pago'
    this.onchainLobbyId = lobbyData.onchainLobbyId; // ID del lobby en el contrato
    this.onchain = lobbyData.onchain; // Objeto completo con contract, chain, token, etc.
    this.entryCost = lobbyData.entryCost; // Costo de entrada (para referencia)

    this.shuffleDeck();
    this.dealInitialCards();
    this.setFirstCard();
  }

  createDeck() {
    const deck = [];
    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const numbers = ['0','1','2','3','4','5','6','7','8','9'];
    const actions = ['Skip','Reverse','DrawTwo'];
    const variants = ['a','b'];

    colors.forEach(color => {
      // 0 variants
      variants.forEach(v => deck.push(new Card(color, '0', 'Number', v)));
      // 1-9 two variants
      numbers.slice(1).forEach(num => variants.forEach(v => deck.push(new Card(color, num, 'Number', v))));
      // actions
      actions.forEach(action => variants.forEach(v => deck.push(new Card(color, action, 'Action', v))));
    });

    // Wilds
    ['a','b','c','d'].forEach(v => deck.push(new Card('Wild', 'Wild', 'Wild', v)));
    // Wild Draw Four x4
    for (let i=0;i<4;i++) deck.push(new Card('Wild','WildDrawFour','Wild','a'));

    return deck;
  }

  shuffleDeck() {
    for (let i = this.drawPile.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1); // CSPRNG: el orden del mazo no se puede predecir
      [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
    }
  }

  dealInitialCards() {
    this.players.forEach(player => {
      player.hand = [];
      for (let i = 0; i < 7; i++) {
        if (this.drawPile.length > 0) player.hand.push(this.drawPile.pop());
      }
      player.cardCount = player.hand.length;
    });
  }

  setFirstCard() {
    let firstCard;
    do {
      if (this.drawPile.length === 0) this.reshuffleDiscardPile();
      firstCard = this.drawPile.pop();
    } while (firstCard.type === 'Wild');
    this.discardPile.push(firstCard);
    this.currentActiveColor = firstCard.color;
  }

  getCurrentCard() {
    return this.discardPile[this.discardPile.length - 1];
  }

  isValidPlay(cardToPlay, topDiscardCard, currentActiveColor, drawStackActive) {
    if (cardToPlay.color === 'Wild' && !drawStackActive) return true;
    if (drawStackActive) {
      if (cardToPlay.value === 'DrawTwo' && topDiscardCard.value === 'DrawTwo') return true;
      if (cardToPlay.value === 'WildDrawFour' && topDiscardCard.value === 'WildDrawFour') return true;
      return false;
    }
    if (cardToPlay.color === topDiscardCard.color || cardToPlay.color === currentActiveColor) return true;
    if (cardToPlay.value === topDiscardCard.value) return true;
    return false;
  }

  drawCard(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return null;
    if (this.drawPile.length === 0) this.reshuffleDiscardPile();
    if (this.drawPile.length === 0) return null;
    const card = this.drawPile.pop();
    player.hand.push(card);
    player.cardCount = player.hand.length;
    return card;
  }

  reshuffleDiscardPile() {
    if (this.discardPile.length <= 1) return;
    const top = this.discardPile.pop();
    this.drawPile = [...this.discardPile];
    this.discardPile = [top];
    this.shuffleDeck();
  }

  nextTurn() {
    this.currentTurnIndex = (this.currentTurnIndex + this.direction + this.players.length) % this.players.length;
    this.turnSeq++;
    Object.keys(this.hasDrawnCard).forEach(k => { this.hasDrawnCard[k] = false; });
  }

  checkWinner() {
    const finished = this.players.filter(p => p.cardCount === 0 && !this.finishedIds.has(p.id));
    finished.forEach(p => {
      this.finishedIds.add(p.id);
      this.winners.push({ username: p.username, walletAddress: p.walletAddress, socketId: p.socketId, rank: this.winners.length + 1 });
    });
    const remaining = this.players.filter(p => !this.finishedIds.has(p.id));
    if (remaining.length <= 1) {
      if (remaining.length === 1) {
        const lp = remaining[0];
        if (!this.finishedIds.has(lp.id)) {
          this.finishedIds.add(lp.id);
          this.winners.push({ username: lp.username, walletAddress: lp.walletAddress, socketId: lp.socketId, rank: this.winners.length + 1 });
        }
      }
      this.status = 'finished';
      return true;
    }
    return false;
  }
}

// ===== GESTOR DE LOBBIES =====
class LobbyManager {
  constructor() {
    this.lobbies = new Map();
    this.games = new Map();
    this.trucoGames = new Map(); // aparte: los handlers del UNO no deben encontrar una partida de truco
    this.playerLobbyMap = new Map();
    this.disconnectTimeouts = new Map();
  }

  handleDisconnectGrace(lobbyId, playerId, onExpel) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;
    const player = lobby.players.find(p => p.id === playerId);
    if (!player) return;
    player.isConnected = false;
    player.disconnectTimestamp = Date.now();
    const timeoutId = setTimeout(() => {
      onExpel();
      this.disconnectTimeouts.delete(playerId);
    }, 30000);
    this.disconnectTimeouts.set(playerId, timeoutId);
  }

  handleReconnect(lobbyId, playerId, newSocketId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;
    const player = lobby.players.find(p => p.id === playerId);
    if (!player) return;
    player.isConnected = true;
    player.disconnectTimestamp = null;
    player.socketId = newSocketId;
    if (this.disconnectTimeouts.has(playerId)) {
      clearTimeout(this.disconnectTimeouts.get(playerId));
      this.disconnectTimeouts.delete(playerId);
    }
  }

  createLobby(data, creatorId, creatorUsername, walletAddress, socketId, token) {
    const lobbyId = `lobby_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
    const lobby = {
      id: lobbyId,
      name: data.name,
      type: data.type,
      game: data.game || 'uno',
      status: 'waiting',
      hostId: creatorId,
      maxPlayers: data.maxPlayers || 8, // mesas pagas: el máximo lo define el contrato
      players: [{ id: creatorId, token, username: creatorUsername, walletAddress, socketId, isHost: true, isReady: false, joinedAt: new Date(), isConnected: true }],
      createdAt: new Date(),
      ...(data.onchain && { onchain: data.onchain }),
      ...(data.token && { token: data.token }),
      ...(data.mode && { mode: data.mode }),
      ...(data.network && { network: data.network }),
      ...(data.password && { password: data.password }),
      ...(data.entryCost && { entryCost: data.entryCost }),
      ...(data.target && { target: data.target })
    };
    this.lobbies.set(lobbyId, lobby);
    this.playerLobbyMap.set(creatorId, lobbyId);
    return { success: true, lobby };
  }

  joinLobby(lobbyId, playerId, username, walletAddress, socketId, password, token) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return { success: false, error: 'Lobby no encontrado' };
    if (lobby.status !== 'waiting') return { success: false, error: 'La partida ya empezó' };
    if (lobby.players.length >= lobby.maxPlayers) return { success: false, error: 'Lobby lleno' };
    if (lobby.password && lobby.password !== password) return { success: false, error: 'Contraseña incorrecta' };
    if (this.playerLobbyMap.has(playerId)) return { success: false, error: 'Ya estás en otro lobby' };
    // El juego identifica turnos y ganadores por nombre: tiene que ser único en la mesa
    if (lobby.players.some((p) => p.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Ese alias ya está en la mesa' };
    }
    const player = { id: playerId, token, username, walletAddress, socketId, isHost: false, isReady: false, joinedAt: new Date(), isConnected: true };
    lobby.players.push(player);
    this.playerLobbyMap.set(playerId, lobbyId);
    return { success: true, lobby };
  }

  leaveLobby(lobbyId, playerId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return { success: false, error: 'Lobby no encontrado' };
    lobby.players = lobby.players.filter(p => p.id !== playerId);
    this.playerLobbyMap.delete(playerId);
    if (lobby.players.length === 0) {
      this.lobbies.delete(lobbyId);
      this.games.delete(lobbyId);
      this.trucoGames.delete(lobbyId);
    } else {
      const hasHost = lobby.players.some(p => p.isHost);
      if (!hasHost && lobby.players.length > 0) {
        lobby.players[0].isHost = true;
        lobby.hostId = lobby.players[0].id;
      }
    }
    return { success: true, lobbyId };
  }

  getActiveLobbiesInfo() {
    const waitingForPlayers = [];
    const inGame = [];
    for (const lobby of this.lobbies.values()) {
      if (lobby.status === 'waiting' || lobby.status === 'starting') {
        waitingForPlayers.push({ 
          id: lobby.id, 
          name: lobby.name, 
          type: lobby.type, 
          game: lobby.game,
          ...(lobby.target && { target: lobby.target }),
          currentPlayers: lobby.players.length, 
          maxPlayers: lobby.maxPlayers,
          ...(lobby.mode && { mode: lobby.mode }), // Agregar modo BEAST/CLASSIC
          ...(lobby.onchain && { onchain: lobby.onchain }),
          ...(lobby.entryCost && { entryCost: lobby.entryCost })
        });
      } else if (lobby.status === 'in_game') {
        inGame.push({ 
          id: lobby.id, 
          name: lobby.name, 
          type: lobby.type, 
          game: lobby.game,
          ...(lobby.target && { target: lobby.target }),
          players: lobby.players.length,
          ...(lobby.mode && { mode: lobby.mode }),
          ...(lobby.onchain && { onchain: lobby.onchain }),
          ...(lobby.entryCost && { entryCost: lobby.entryCost })
        });
      }
    }
    return { waitingForPlayers, inGame };
  }

  startGame(lobbyId, playerId) {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return { success: false, error: 'Lobby no encontrado' };
    const player = lobby.players.find(p => p.id === playerId);
    if (!player || !player.isHost) return { success: false, error: 'Solo el host puede iniciar la partida' };
    // Un segundo game:start no reinicia la partida (ni deja un reloj viejo corriendo)
    if (lobby.status !== 'waiting') return { success: false, error: 'La partida ya empezó' };
    if (lobby.players.length < 2) return { success: false, error: 'Se necesitan al menos 2 jugadores' };
    // Truco: mesa completa; equipos por asiento alternado según el orden de llegada
    // ponytail: sin elegir compañero, agregar un "cambiar de asiento" en la sala si se pide
    if (lobby.game === 'truco') {
      if (lobby.players.length !== lobby.maxPlayers) return { success: false, error: `El truco se juega de a ${lobby.maxPlayers}: faltan jugadores` };
      const truco = {
        seats: lobby.players.map(({ id, username }) => ({ id, username })),
        match: Truco.createMatch({ players: lobby.maxPlayers, target: lobby.target }),
      };
      this.trucoGames.set(lobbyId, truco);
      lobby.status = 'in_game';
      return { success: true, truco };
    }
    
    // CRITICAL: Pasar información del lobby al juego para auto-distribución de premios
    const lobbyData = {
      type: lobby.type,
      onchainLobbyId: lobby.onchain?.lobbyId || lobby.onchainLobbyId,
      onchain: lobby.onchain, // Pass the complete onchain object with contract, chain, token, etc.
      entryCost: lobby.entryCost
    };
    
    const game = new UnoGame(lobbyId, lobby.players, lobbyData);
    this.games.set(lobbyId, game);
    lobby.status = 'in_game';
    return { success: true, game };
  }

  getGame(lobbyId) {
    return this.games.get(lobbyId);
  }

  playCard(lobbyId, playerId, cardIndex) {
    const game = this.games.get(lobbyId);
    if (!game) return { success: false, error: 'Juego no encontrado' };
    const player = game.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Jugador no encontrado' };
    const currentPlayer = game.players[game.currentTurnIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'No es tu turno' };
    if (game.status === 'finished') return { success: false, error: 'La partida terminó' };
    if (cardIndex < 0 || cardIndex >= player.hand.length) return { success: false, error: 'Índice de carta inválido' };

    const cardToPlay = player.hand[cardIndex];
    const topCard = game.getCurrentCard();

    // If there is an active draw stack, only allow stacking the same draw-type
    if (game.drawStackActive) {
      const topVal = topCard?.value;
      if (cardToPlay.value !== topVal) {
        return { success: false, error: 'Debes jugar un +2/+4 igual o robar/pasar' };
      }
    }

    if (!game.isValidPlay(cardToPlay, topCard, game.currentActiveColor, game.drawStackActive)) return { success: false, error: 'Jugada no válida' };

    player.hand.splice(cardIndex,1);
    player.cardCount = player.hand.length;
    game.discardPile.push(cardToPlay);

    let action = 'play';
    let skipNextTurn = false;
    let drawCards = 0;
    let needsColorChoice = false;

    if (cardToPlay.type === 'Action') {
      switch (cardToPlay.value) {
        case 'Skip': action = 'skip'; skipNextTurn = true; break;
        case 'Reverse': action = 'reverse'; game.direction *= -1; if (game.players.length === 2) skipNextTurn = true; break;
        case 'DrawTwo': action = 'drawTwo_played'; game.drawStackCount += 2; game.drawStackActive = true; break;
      }
    } else if (cardToPlay.type === 'Wild') {
      if (cardToPlay.value === 'WildDrawFour') { action = 'drawFour_played'; game.drawStackCount += 4; game.drawStackActive = true; }
      needsColorChoice = true;
    }


    // For non-wild cards set active color immediately. For wilds (including WildDrawFour)
    // the active color must be chosen by the player via chooseColor before we change turns
    if (cardToPlay.color !== 'Wild') game.currentActiveColor = cardToPlay.color;
    game.awaitingColor = needsColorChoice;

    // Advance turn only if we don't need the player to choose a color first.
    if (!needsColorChoice) {
      if (skipNextTurn) game.nextTurn();
      game.nextTurn();
    } else {
      // When a wild requiring color is played, we hold the turn until chooseColor is called.
      // Notify caller that a color choice is needed; the server will advance turns after chooseColor.
    }

    // If there's an active draw stack after advancing the turn, DO NOT apply the penalty here.
    // We must give the penalized player the opportunity to respond (stack another +2/+4)
    // or to draw/pass. The actual penalty (drawing the accumulated cards and skipping the
    // player's turn) will be applied by `drawCardForPlayer` or `passTurn` when the penalized
    // player chooses to draw or explicitly passes.
    if (game.drawStackActive && !needsColorChoice) {
      const penalizedIndex = game.currentTurnIndex;
      const penalizedPlayer = game.players[penalizedIndex];
      const lastPlayed = game.getCurrentCard();
      const canDefend = penalizedPlayer.hand.some(card => (
        lastPlayed.value === 'WildDrawFour' && card.value === 'WildDrawFour'
      ) || (
        lastPlayed.value === 'DrawTwo' && card.value === 'DrawTwo'
      ));
      // Notify clients whether stacking is allowed. Do NOT apply the penalty here.
      if (canDefend) {
        action = 'stack_allowed';
      } else {
        action = 'stack_not_allowed';
      }
      // Note: the actual penalty will be applied when the penalized player chooses to draw
      // (drawCardForPlayer) or explicitly passes (passTurn).
    }

    // NOTE: do not apply draw stack penalty immediately here. We must give the next player
    // the chance to respond (stack another DrawTwo / WildDrawFour). The penalty will be
    // applied when the next player chooses to draw (handled in drawCardForPlayer) or fails
    // to play a defending draw card.

    const gameEnded = game.checkWinner();

  return { success: true, game, playedCard: cardToPlay, action, needsColorChoice, gameEnded, drawCards };
  }

  drawCardForPlayer(lobbyId, playerId) {
    const game = this.games.get(lobbyId);
    if (!game) return { success: false, error: 'Juego no encontrado' };
    const currentPlayer = game.players[game.currentTurnIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'No es tu turno' };
    // If there's an active draw stack (e.g., accumulated +2/+4), the player must take the full penalty
    if (game.drawStackActive) {
      const n = game.drawStackCount || 0;
      if (n <= 0) {
        // fallback to single draw
      } else {
        for (let i = 0; i < n; i++) game.drawCard(playerId);
        game.drawStackCount = 0;
        game.drawStackActive = false;
        // After receiving penalty, skip this player's turn
        game.nextTurn();
        return { success: true, game, action: 'draw_penalty', cardsDrawn: n };
      }
    }

    // Prevent drawing more than once per turn
    if (game.hasDrawnCard[playerId]) return { success: false, error: 'Ya robaste esta ronda' };
    const drawn = game.drawCard(playerId);
    if (!drawn) return { success: false, error: 'No hay más cartas en el mazo' };
    game.hasDrawnCard[playerId] = true;
    return { success: true, game, drawnCard: drawn };
  }

  passTurn(lobbyId, playerId) {
    const game = this.games.get(lobbyId);
    if (!game) return { success: false, error: 'Juego no encontrado' };
    const currentPlayer = game.players[game.currentTurnIndex];
    if (currentPlayer.id !== playerId) return { success: false, error: 'No es tu turno' };
    // If there's an active draw stack, passing means you decline to defend and must take the penalty
    if (game.drawStackActive) {
      const n = game.drawStackCount || 0;
      if (n > 0) {
        for (let i = 0; i < n; i++) game.drawCard(playerId);
        game.drawStackCount = 0;
        game.drawStackActive = false;
        // After penalizing, skip this player's turn
        game.nextTurn();
        return { success: true, game, action: 'draw_penalty', cardsDrawn: n };
      }
    }

    if (!game.hasDrawnCard[playerId]) return { success: false, error: 'Debes robar una carta antes de pasar' };
    game.nextTurn();
    return { success: true, game };
  }

  chooseColor(lobbyId, playerId, color) {
    const game = this.games.get(lobbyId);
    if (!game) return { success: false, error: 'Juego no encontrado' };
    if (game.players[game.currentTurnIndex]?.id !== playerId || !game.awaitingColor) return { success: false, error: 'No es tu turno' };
    const validColors = ['Red','Blue','Green','Yellow'];
    if (!validColors.includes(color)) return { success: false, error: 'Color inválido' };
    game.currentActiveColor = color;
    game.awaitingColor = false;
    let drawCards = 0;
    let action = null;
    game.nextTurn();
    // +4: el siguiente apila si puede; si no, se come las cartas y pierde el turno
    if (game.drawStackActive) {
      const penalized = game.players[game.currentTurnIndex];
      const canDefend = penalized.hand.some((c) => c.value === game.getCurrentCard().value);
      if (canDefend) {
        action = 'stack_allowed';
      } else {
        drawCards = game.drawStackCount;
        for (let i = 0; i < drawCards; i++) game.drawCard(penalized.id);
        game.drawStackCount = 0;
        game.drawStackActive = false;
        action = 'draw_penalty';
        game.nextTurn();
      }
    }
    return { success: true, game, chosenColor: color, action, drawCards };
  }
}

const lobbyManager = new LobbyManager();

// Nunca mandar manos ajenas, mazo ni contraseña a los clientes
function publicGame(game) {
  const { drawPile, hasDrawnCard, finishedIds, turnDeadline, ...rest } = game;
  return {
    ...rest,
    turnMs: TURN_MS,
    turnMsLeft: turnDeadline ? Math.max(0, turnDeadline - Date.now()) : null,
    drawnThisTurn: !!hasDrawnCard[game.players[game.currentTurnIndex]?.id],
    drawPileCount: drawPile.length,
    players: game.players.map(({ hand, token, ...p }) => ({ ...p, cardCount: hand ? hand.length : p.cardCount })),
  };
}

function publicLobby(lobby) {
  const { password, ...rest } = lobby;
  return { ...rest, players: lobby.players.map(({ token, ...p }) => p), hasPassword: !!password };
}
const publicResult = (r) => (r.lobby ? { ...r, lobby: publicLobby(r.lobby) } : r);

// El id de jugador es público (va en la info de la mesa); el token del handshake es secreto
// y prueba que ese id es tuyo. Sin esto cualquiera podía jugar o cancelar por otro.
const validToken = (t) => typeof t === 'string' && t.length >= 32;
function ownsId(id, token) {
  const lobby = lobbyManager.lobbies.get(lobbyManager.playerLobbyMap.get(id));
  const p = lobby?.players.find((x) => x.id === id);
  return !p || p.token === token;
}

// ===== Reloj de turno: solo actúa si se acaba el tiempo =====
const TURN_MS = Number(process.env.TURN_MS) || 15000;
const turnTimers = new Map(); // lobbyId -> { seq, t }

function emitGameUpdate(lobbyId, game, playerId, extra = {}) {
  io.to(lobbyId).emit('game:update', {
    gameState: publicGame(game),
    playerPlayed: game.players.find((p) => p.id === playerId)?.username || 'Unknown',
    newTurnIndex: game.currentTurnIndex,
    currentPlayerName: game.players[game.currentTurnIndex]?.username || null,
    currentActiveColor: game.currentActiveColor,
    ...extra,
  });
  // Penalidades y robos por timeout cambian manos ajenas: se mandan todas
  game.players.forEach((p) => io.to(p.socketId).emit('game:yourHand', p.hand));
}

// Reinicia los 15s solo cuando cambia el turno (robar no da tiempo extra)
function armTurnTimer(lobbyId, game) {
  const prev = turnTimers.get(lobbyId);
  if (game.status === 'finished') {
    clearTimeout(prev?.t);
    turnTimers.delete(lobbyId);
    game.turnDeadline = null;
    return;
  }
  if (prev?.seq === game.turnSeq) return;
  clearTimeout(prev?.t);
  game.turnDeadline = Date.now() + TURN_MS;
  turnTimers.set(lobbyId, { seq: game.turnSeq, t: setTimeout(() => onTurnTimeout(lobbyId), TURN_MS) });
}

// Jugada forzada por timeout: elige color, o roba y pasa
function autoStep(lobbyId) {
  const game = lobbyManager.getGame(lobbyId);
  if (!game || game.status === 'finished') return false;
  const p = game.players[game.currentTurnIndex];
  let r, action;
  if (game.awaitingColor) {
    // el color que más tiene en la mano
    const counts = {};
    p.hand.forEach((c) => { if (c.color !== 'Wild') counts[c.color] = (counts[c.color] || 0) + 1; });
    const color = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'Red';
    r = lobbyManager.chooseColor(lobbyId, p.id, color);
    action = r.action || 'color_chosen';
  } else {
    if (game.drawStackActive || game.hasDrawnCard[p.id]) {
      r = lobbyManager.passTurn(lobbyId, p.id);
      action = r.action || 'pass';
    } else {
      r = lobbyManager.drawCardForPlayer(lobbyId, p.id);
      action = 'draw';
    }
  }
  if (!r.success) return false;
  armTurnTimer(lobbyId, game);
  emitGameUpdate(lobbyId, game, p.id, { action, auto: 'timeout', ...(r.cardsDrawn && { cardsDrawn: r.cardsDrawn }), ...(r.drawCards && { cardsDrawn: r.drawCards }) });
  return true;
}

function onTurnTimeout(lobbyId) {
  turnTimers.delete(lobbyId);
  const game = lobbyManager.getGame(lobbyId);
  if (!game) return;
  // Mesa abandonada: no seguir jugando solos
  if (!lobbyManager.lobbies.has(lobbyId)) {
    lobbyManager.games.delete(lobbyId);
    return;
  }
  const seq = game.turnSeq;
  for (let i = 0; i < 3 && game.turnSeq === seq && autoStep(lobbyId); i++);
}

// Errores de ethers/RPC pueden traer la URL del RPC (con su API key): al cliente le llega un mensaje genérico
function clientError(e) {
  if (!e?.code && !e?.shortMessage) return e.message;
  console.error('Error on-chain:', e.shortMessage || e.message);
  return 'Error de la red, probá de nuevo en un momento';
}

// Partida terminada: sale de la lista, los jugadores quedan libres para otra mesa y en 5 min se borra
const FINISHED_TTL_MS = 5 * 60 * 1000;
function finishLobby(lobbyId) {
  const lobby = lobbyManager.lobbies.get(lobbyId);
  if (!lobby) return;
  lobby.status = 'finished';
  lobby.players.forEach((p) => lobbyManager.playerLobbyMap.delete(p.id));
  setTimeout(() => {
    lobbyManager.lobbies.delete(lobbyId);
    lobbyManager.games.delete(lobbyId);
    lobbyManager.trucoGames.delete(lobbyId);
  }, FINISHED_TTL_MS).unref();
  io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
}

// ===== Truco: las reglas están en truco/engine; acá solo sockets y reloj =====
const TRUCO_MS = Number(process.env.TRUCO_TURN_MS) || 30000;
const TRUCO_PAUSE_MS = Number(process.env.TRUCO_PAUSE_MS) || 3000; // para ver cómo terminó la mano

// Cada asiento recibe solo su vista: su mano, la del compañero y nada de los rivales
function trucoEmit(lobbyId, g, events = []) {
  const lobby = lobbyManager.lobbies.get(lobbyId);
  const names = g.seats.map((s) => s.username);
  const msLeft = g.deadline ? Math.max(0, g.deadline - Date.now()) : null;
  g.seats.forEach(({ id }, seat) => {
    const sid = lobby?.players.find((p) => p.id === id)?.socketId;
    if (sid) io.to(sid).emit('truco:state', { lobbyId, seat, names, events, turnMs: TRUCO_MS, msLeft, ...Truco.view(g.match, seat) });
  });
}

// Después de cada cambio: fin de partida, pausa entre manos o reloj de la próxima acción
function trucoStep(lobbyId, g, events = []) {
  clearTimeout(g.t);
  g.deadline = null;
  const m = g.match;
  const alive = (fn) => () => {
    // Mesa abandonada: no seguir jugando solos
    if (!lobbyManager.lobbies.has(lobbyId)) return lobbyManager.trucoGames.delete(lobbyId);
    fn();
  };
  if (m.over) {
    trucoEmit(lobbyId, g, events);
    return finishLobby(lobbyId);
  }
  if (m.hand.phase === 'OVER') {
    g.t = setTimeout(alive(() => { Truco.nextHand(m); trucoStep(lobbyId, g, [{ type: 'nuevaMano' }]); }), TRUCO_PAUSE_MS);
  } else {
    g.deadline = Date.now() + TRUCO_MS;
    // Sin respuesta: si tenía que jugar se va al mazo; si tenía que contestar, no quiero
    g.t = setTimeout(alive(() => trucoStep(lobbyId, g, Truco.timeout(m).events.map((e) => ({ ...e, auto: 'timeout' })))), TRUCO_MS);
  }
  trucoEmit(lobbyId, g, events);
}

const MAX_LOBBIES = Number(process.env.MAX_LOBBIES) || 200;
const LOBBY_TYPES = ['publico', 'privado', 'pago'];
const cleanText = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);

const sameAddr = (a, b) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
const ADDR_RE = /^0x[0-9a-fA-F]{40}$/;

// Alias (2-20) o la propia wallet como nombre. Nadie puede usar una dirección
// ajena ni un alias que parezca una dirección.
// ponytail: la wallet sigue siendo autodeclarada hasta tener SIWE; en mesas pagas lo cubre isPlayer on-chain
function identity(rawName, rawWallet) {
  const walletAddress = ADDR_RE.test(rawWallet || '') ? rawWallet : '';
  const username = String(rawName || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  if (ADDR_RE.test(username)) {
    if (!sameAddr(username, walletAddress)) throw new Error('Alias inválido');
  } else if (username.length < 2 || username.length > 20 || /^0x[0-9a-f]{4,}/i.test(username)) {
    throw new Error('El alias debe tener entre 2 y 20 caracteres');
  }
  return { username, walletAddress };
}

// El RPC del server puede ir un bloque atrás del de la wallet del usuario
async function readLobbyWithRetry(chain, lobbyId, ok, tries = 4) {
  for (let i = 0; ; i++) {
    const l = await contractService.getLobby(chain, lobbyId);
    if (ok(l) || i === tries - 1) return l;
    await new Promise((r) => setTimeout(r, 2000));
  }
}

// Paga la mesa on-chain con la wallet del referee según el ranking del servidor
async function settlePaidLobby(lobbyId, lobby, game) {
  if (lobby.settled) return;
  lobby.settled = true;
  const { chain, lobbyId: onchainId } = lobby.onchain;
  const ranked = game.winners.map((w) => w.walletAddress);
  const count = lobby.mode === 'CLASSIC' ? Math.min(3, game.players.length - 1) : 1;
  const winners = ranked.slice(0, count);
  try {
    const txHash = await contractService.endLobby(chain, onchainId, winners);
    io.to(lobbyId).emit('game:prizesDistributed', {
      success: true,
      txHash,
      explorerUrl: contractService.txUrl(chain, txHash),
      winners,
    });
  } catch (e) {
    console.error('❌ Error pagando mesa on-chain', { lobbyId, chain, onchainId, winners }, e.message);
    io.to(lobbyId).emit('game:prizeError', {
      error: 'No se pudo pagar on-chain todavía. Si no se resuelve en 24h, cualquier jugador puede pedir el reembolso desde el contrato.',
    });
  }
}

// Manejar conexiones WebSocket
io.on('connection', (socket) => {
  let currentUserId = null;
  const token = socket.handshake.auth?.token;

  // ~10 eventos/s por socket con ráfagas de 20: un jugador real no llega; un script de spam sí
  let bucket = 20;
  let last = Date.now();
  socket.use((_packet, next) => {
    const now = Date.now();
    bucket = Math.min(20, bucket + ((now - last) / 1000) * 10);
    last = now;
    if (bucket < 1) return;
    bucket--;
    next();
  });

  // Enviar lista de lobbies al conectar
  socket.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
  socket.emit('lobbiesList', lobbyManager.getActiveLobbiesInfo());

  // Crear lobby
  socket.on('lobby:create', async (data) => {
    let username, walletAddress, lobbyData;

    try {
      if (!validToken(token) || !ownsId(data.creatorId, token)) throw new Error('Sesión inválida, recargá la página');
      if (lobbyManager.playerLobbyMap.has(data.creatorId) || (currentUserId && lobbyManager.playerLobbyMap.has(currentUserId))) {
        throw new Error('Ya estás en otro lobby');
      }
      if (lobbyManager.lobbies.size >= MAX_LOBBIES) throw new Error('Hay demasiadas mesas abiertas, probá en un rato');
      if (!LOBBY_TYPES.includes(data.type)) throw new Error('Tipo de mesa inválido');
      const name = cleanText(data.name, 40);
      if (!name) throw new Error('Ponele un nombre a la mesa');
      lobbyData = { name, type: data.type, ...(data.type === 'privado' && { password: String(data.password ?? '').slice(0, 64) }) };
      if (data.game === 'truco') {
        // ponytail: sin mesas pagas hasta que el contrato reparta por equipo y haya consulta legal
        if (data.type === 'pago') throw new Error('El truco todavía no tiene mesas pagas');
        const players = Number(data.players);
        const target = Number(data.target);
        if (![2, 4, 6].includes(players)) throw new Error('El truco se juega de a 2, 4 o 6');
        if (![15, 30].includes(target)) throw new Error('El truco se juega a 15 o a 30');
        Object.assign(lobbyData, { game: 'truco', maxPlayers: players, target });
      }
      ({ username, walletAddress } = identity(data.creatorUsername, data.walletAddress));
      // Mesa paga: la verdad es el contrato, no lo que manda el cliente
      if (data.type === 'pago') {
        if (!walletAddress) throw new Error('Conectá tu wallet para crear una mesa paga');
        const chain = data.onchain?.chain;
        const onchainId = String(data.onchain?.lobbyId ?? '');
        if (!/^\d+$/.test(onchainId)) throw new Error('Falta el id de la mesa on-chain');
        const duplicated = [...lobbyManager.lobbies.values()].some(
          (l) => l.onchain?.chain === chain && l.onchain?.lobbyId === onchainId
        );
        if (duplicated) throw new Error('Esa mesa on-chain ya está publicada');

        const l = await readLobbyWithRetry(chain, onchainId, (x) => x.state === STATE.OPEN);
        if (l.state !== STATE.OPEN) throw new Error('La mesa on-chain no está abierta');
        if (!sameAddr(l.creator, walletAddress)) throw new Error('La mesa on-chain es de otra wallet');

        Object.assign(lobbyData, {
          mode: l.mode,
          maxPlayers: l.maxPlayers,
          entryCost: l.entryFee,
          network: chain,
          onchain: { chain, lobbyId: onchainId, contract: contractService.get(chain).address, entryFee: l.entryFee },
        });
      }
    } catch (e) {
      const result = { success: false, error: clientError(e) };
      socket.emit('lobby:created', result);
      socket.emit('lobbyCreated', result);
      return;
    }

    const result = publicResult(lobbyManager.createLobby(lobbyData, data.creatorId, username, walletAddress, socket.id, token));
    socket.emit('lobby:created', result);
    socket.emit('lobbyCreated', result);
    if (result.success) {
      currentUserId = data.creatorId;
      socket.join(result.lobby.id);
      io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
      io.emit('lobbiesList', lobbyManager.getActiveLobbiesInfo());
      io.to(result.lobby.id).emit('lobby:updated', { lobbyId: result.lobby.id });
      io.to(result.lobby.id).emit('lobbyUpdate', { lobbyId: result.lobby.id });
    }
  });

  // Unirse a lobby
  socket.on('lobby:join', async (data) => {

    let result, username, walletAddress;
    const target = lobbyManager.lobbies.get(data.lobbyId);
    try {
      if (!validToken(token) || !ownsId(data.playerId, token)) throw new Error('Sesión inválida, recargá la página');
      if (currentUserId && currentUserId !== data.playerId && lobbyManager.playerLobbyMap.has(currentUserId)) throw new Error('Ya estás en otro lobby');
      ({ username, walletAddress } = identity(data.username, data.walletAddress));
      // Pagó si el contrato lo tiene como jugador; una wallet = un asiento
      if (target?.type === 'pago') {
        if (!walletAddress) throw new Error('Conectá tu wallet para entrar a una mesa paga');
        const { chain, lobbyId } = target.onchain;
        if (target.players.some((p) => sameAddr(p.walletAddress, walletAddress))) {
          throw new Error('Esa wallet ya está en la mesa');
        }
        let paid = false;
        for (let i = 0; i < 4 && !paid; i++) {
          if (i) await new Promise((r) => setTimeout(r, 2000));
          paid = await contractService.isPlayer(chain, lobbyId, walletAddress);
        }
        if (!paid) throw new Error('No encontramos tu pago on-chain para esta mesa');
      }
    } catch (e) {
      result = { success: false, error: clientError(e) };
    }
    result = result || lobbyManager.joinLobby(
      data.lobbyId,
      data.playerId,
      username,
      walletAddress,
      socket.id,
      data.password,
      token
    );
    result = publicResult(result);

    socket.emit('lobby:joined', result);
    socket.emit('lobbyJoined', result);
    if (result.success) {
      currentUserId = data.playerId;
      socket.join(data.lobbyId);
      io.to(data.lobbyId).emit('lobby:updated', { lobbyId: data.lobbyId });
      io.to(data.lobbyId).emit('lobbyUpdate', { lobbyId: data.lobbyId });
      io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
      io.emit('lobbiesList', lobbyManager.getActiveLobbiesInfo());
    }
  });

  // Salir de lobby
  socket.on('lobby:leave', (data) => {
    const result = currentUserId ? lobbyManager.leaveLobby(data.lobbyId, currentUserId) : { success: false, error: 'Sesión inválida' };
    socket.emit('lobby:left', result);
    socket.emit('lobbyLeft', result);
    if (result.success) {
      socket.leave(data.lobbyId);
      io.to(data.lobbyId).emit('lobby:updated', { lobbyId: data.lobbyId });
      io.to(data.lobbyId).emit('lobbyUpdate', { lobbyId: data.lobbyId });
      io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
      io.emit('lobbiesList', lobbyManager.getActiveLobbiesInfo());
    }
  });

  // Solicitar lista
  socket.on('lobby:list', () => {
    socket.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
    socket.emit('lobbiesList', lobbyManager.getActiveLobbiesInfo());
  });

  // Ready (placeholder)
  socket.on('lobby:ready', () => {});

  // Start game
  socket.on('game:start', async (data) => {
    const lobby = lobbyManager.lobbies.get(data.lobbyId);
    if (lobby?.type === 'pago') {
      const host = lobby.players.find((p) => p.id === currentUserId);
      if (!host?.isHost) return socket.emit('game:error', 'Solo el host puede iniciar la partida');
      if (lobby.status !== 'waiting') return;
      lobby.status = 'starting';
      try {
        const { chain, lobbyId } = lobby.onchain;
        let l = await contractService.getLobby(chain, lobbyId);
        const wallets = lobby.players.map((p) => p.walletAddress.toLowerCase());
        const allPresent = l.players.length === wallets.length && l.players.every((p) => wallets.includes(p));
        if (!allPresent) throw new Error('Todos los que pagaron tienen que estar en la mesa para empezar');
        if (l.state === STATE.OPEN) {
          await contractService.startLobby(chain, lobbyId);
          l = await contractService.getLobby(chain, lobbyId);
        }
        if (l.state !== STATE.STARTED) throw new Error('La mesa on-chain no se pudo empezar');
      } catch (e) {
        lobby.status = 'waiting';
        return socket.emit('game:error', clientError(e));
      }
      lobby.status = 'waiting'; // startGame lo pasa a in_game
    }
    const result = lobbyManager.startGame(data.lobbyId, currentUserId);
    if (result.truco) {
      trucoStep(data.lobbyId, result.truco);
      io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
      return;
    }
    if (result.success) {
      const game = result.game;
      const firstCard = game.getCurrentCard();
      armTurnTimer(data.lobbyId, game);
      io.to(data.lobbyId).emit('game:started', { gameState: publicGame(game), firstCard });
      io.to(data.lobbyId).emit('gameStarted', { gameState: publicGame(game), firstCard });
      game.players.forEach(player => {
        io.to(player.socketId).emit('game:yourHand', player.hand);
        io.to(player.socketId).emit('yourHand', player.hand);
      });
      io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
      io.emit('lobbiesList', lobbyManager.getActiveLobbiesInfo());
    } else {
      socket.emit('game:error', result.error);
    }
  });

  // Game actions
  socket.on('game:playCard', (data) => {
    const result = lobbyManager.playCard(data.lobbyId, currentUserId, data.cardIndex);
    if (result.success) {
      const game = result.game;
      armTurnTimer(data.lobbyId, game);
      const updateData = {
        gameState: publicGame(game),
        playedCard: result.playedCard,
        playerPlayed: game.players.find(p => p.id === currentUserId)?.username || 'Unknown',
        newTurnIndex: game.currentTurnIndex,
        action: result.action,
        currentPlayerName: game.players[game.currentTurnIndex]?.username || null,
        currentActiveColor: game.currentActiveColor,
        ...(result.drawCards && { cardsDrawn: result.drawCards })
      };
      io.to(data.lobbyId).emit('game:update', updateData);
      const player = game.players.find(p => p.id === currentUserId);
      if (player) io.to(socket.id).emit('game:yourHand', player.hand);
      // If a penalty was applied immediately, send the penalized player's updated hand
      if (result.penalizedPlayerId) {
        const penalized = game.players.find(p => p.id === result.penalizedPlayerId);
        if (penalized) io.to(penalized.socketId).emit('game:yourHand', penalized.hand);
      }
      if (result.needsColorChoice) socket.emit('game:promptColor', { lobbyId: data.lobbyId, playedCardIndex: data.cardIndex });
      if (result.gameEnded) {
        io.to(data.lobbyId).emit('game:over', { gameState: publicGame(game) });
        game.winners.forEach(w => {
          if (w.socketId) io.to(w.socketId).emit('game:winner', { username: w.username, rank: w.rank, gameState: publicGame(game) });
        });
        
        const lobby = lobbyManager.lobbies.get(data.lobbyId);
        if (lobby?.type === 'pago') settlePaidLobby(data.lobbyId, lobby, game);
        finishLobby(data.lobbyId);
      }
    } else {
      socket.emit('game:error', result.error);
    }
  });

  // Robar, pasar y elegir color comparten el mismo cierre: reloj y aviso a la mesa
  const turnAction = (event, fn, action) => socket.on(event, (data) => {
    const result = fn(data);
    if (!result.success) return socket.emit('game:error', result.error);
    armTurnTimer(data.lobbyId, result.game);
    emitGameUpdate(data.lobbyId, result.game, currentUserId, {
      action: result.action || action,
      ...(result.cardsDrawn && { cardsDrawn: result.cardsDrawn }),
      ...(result.drawCards && { cardsDrawn: result.drawCards }),
    });
  });
  turnAction('game:drawCard', (d) => lobbyManager.drawCardForPlayer(d.lobbyId, currentUserId), 'draw');
  turnAction('game:passTurn', (d) => lobbyManager.passTurn(d.lobbyId, currentUserId), 'pass');
  turnAction('game:chooseColor', (d) => lobbyManager.chooseColor(d.lobbyId, currentUserId, d.color), 'color_chosen');

  // Toda jugada del truco entra por acá; el motor valida contra las jugadas legales del asiento
  socket.on('truco:act', (data) => {
    const g = lobbyManager.trucoGames.get(data?.lobbyId);
    const seat = g ? g.seats.findIndex((s) => s.id === currentUserId) : -1;
    if (seat < 0) return socket.emit('game:error', 'No estás jugando en esta mesa');
    const a = data.action || {};
    const r = Truco.act(g.match, seat, { type: a.type, call: a.call, card: a.card });
    if (!r.ok) return socket.emit('game:error', r.error);
    trucoStep(data.lobbyId, g, r.events);
  });

  socket.on('game:getLobbyInfo', (data) => {
    const lobby = lobbyManager.lobbies.get(data.lobbyId);
    if (lobby) {
      if (!currentUserId) {
        const currentPlayer = lobby.players.find(p => p.socketId === socket.id);
        if (currentPlayer) currentUserId = currentPlayer.id;
      }

      socket.emit('game:lobbyInfo', { success: true, lobby: publicLobby(lobby) });
      const truco = lobbyManager.trucoGames.get(data.lobbyId);
      if (truco) trucoEmit(data.lobbyId, truco);
      const game = lobbyManager.getGame(data.lobbyId);
      if (game) {
        socket.emit('game:gameInfo', { success: true, game: publicGame(game) });
        const player = game.players.find(p => p.id === currentUserId);
        if (player) socket.emit('game:yourHand', player.hand);
      }
    } else {
      socket.emit('game:lobbyInfo', { success: false, error: 'Lobby no encontrado' });
    }
  });

  socket.on('disconnect', (reason) => {
    if (currentUserId && lobbyManager.playerLobbyMap.has(currentUserId)) {
      const lobbyId = lobbyManager.playerLobbyMap.get(currentUserId);
      lobbyManager.handleDisconnectGrace(lobbyId, currentUserId, () => {
        // Before expelling, ensure lobby still exists (it might have been cancelled)
        // En partida el asiento se guarda: puede volver cuando quiera
        if (lobbyManager.lobbies.get(lobbyId)?.status !== 'waiting') return;
        if (!lobbyManager.lobbies.has(lobbyId)) {
          return;
        }
        const result = lobbyManager.leaveLobby(lobbyId, currentUserId);
        if (result.success) {
          io.to(lobbyId).emit('lobby:updated', { lobbyId });
          io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
        }
      });
      io.to(lobbyId).emit('lobby:updated', { lobbyId });
      io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
    }
  });

  // Cancel lobby explicitly by host before starting
  socket.on('lobby:cancel', async (data) => {
    const { lobbyId } = data;
    const playerId = currentUserId;
    const lobby = lobbyManager.lobbies.get(lobbyId);
    if (!lobby) { socket.emit('lobby:left', { success: false, lobbyId }); return; }
    if (lobby.hostId !== playerId) { socket.emit('lobby:left', { success: false, lobbyId }); return; }
    if (lobby.status !== 'waiting') { socket.emit('lobby:left', { success: false, lobbyId }); return; }
    // Mesa paga: el referee cancela on-chain y el contrato devuelve todas las entradas
    if (lobby.type === 'pago') {
      lobby.status = 'cancelling';
      try {
        const { chain, lobbyId: onchainId } = lobby.onchain;
        const l = await contractService.getLobby(chain, onchainId);
        if (l.state === STATE.OPEN) await contractService.cancelLobby(chain, onchainId);
      } catch (e) {
        lobby.status = 'waiting';
        socket.emit('game:error', 'No se pudo cancelar on-chain: ' + clientError(e));
        socket.emit('lobby:left', { success: false, lobbyId });
        return;
      }
    }
    // Notify clients in the lobby that it was cancelled
    io.to(lobbyId).emit('lobby:cancelled', { lobbyId });
    io.to(lobbyId).emit('lobbyCancelled', { lobbyId });

    // Central cleanup using LobbyManager helper
    try {
      // Direct cleanup since cleanupLobby method doesn't exist
      lobby.players.forEach(p => { 
        if (lobbyManager.playerLobbyMap.has(p.id)) {
          lobbyManager.playerLobbyMap.delete(p.id); 
        }
      });
      lobbyManager.lobbies.delete(lobbyId);
    } catch (e) {
      console.error('Error during cleanup:', e);
    }

    socket.emit('lobby:left', { success: true, lobbyId });
    io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
    io.emit('lobbiesList', lobbyManager.getActiveLobbiesInfo());
  });

  socket.on('lobby:reconnect', ({ lobbyId, userId }) => {
    const seat = lobbyManager.lobbies.get(lobbyId)?.players.find((p) => p.id === userId);
    if (!seat || !validToken(token) || seat.token !== token) {
      return socket.emit('game:lobbyInfo', { success: false, error: 'Ya no estás en esta mesa' });
    }
    currentUserId = userId;
    lobbyManager.handleReconnect(lobbyId, userId, socket.id);
    socket.join(lobbyId);

    const lobby = lobbyManager.lobbies.get(lobbyId);
    if (lobby) {
      socket.emit('game:lobbyInfo', { success: true, lobby: publicLobby(lobby) });
    }
    const truco = lobbyManager.trucoGames.get(lobbyId);
    if (truco) trucoEmit(lobbyId, truco);

    const game = lobbyManager.getGame(lobbyId);
    if (game) {
      socket.emit('game:gameInfo', { success: true, game: publicGame(game) });
      const player = game.players.find(p => p.id === userId);
      if (player) {
        player.socketId = socket.id;
        socket.emit('game:yourHand', player.hand);
      }
    }

    io.to(lobbyId).emit('lobby:updated', { lobbyId });
    io.emit('lobby:list-updated', lobbyManager.getActiveLobbiesInfo());
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';


server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor WebSocket corriendo en ${HOST}:${PORT}`);
  console.log(`🔗 Clientes pueden conectarse desde: ${process.env.FRONTEND_ORIGIN || 'any origin (CORS=* configured)'} (set FRONTEND_ORIGIN env to restrict)`);
  console.log(`📋 Eventos disponibles: lobby:*, game:*`);
});
