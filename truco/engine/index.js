// Motor del truco argentino: sin flor, mazo de 36 (sin 8, 9 ni 10), de a 2, 4 o 6, a 15 o 30.
// Puro: no sabe de sockets ni de relojes. El server llama act/timeout/nextHand y le manda view(m, asiento) a cada uno.
// Reglas y defaults explicados en truco/docs/reglas.md
const crypto = require('crypto');

const PALOS = ['espada', 'basto', 'oro', 'copa'];
const NUMS = [1, 2, 3, 4, 5, 6, 7, 11, 12];
const BRAVAS = { '1-espada': 13, '1-basto': 12, '7-espada': 11, '7-oro': 10 };
const POR_NUM = { 3: 9, 2: 8, 1: 7, 12: 6, 11: 5, 7: 4, 6: 3, 5: 2, 4: 1 };
const LLAMADAS = ['E', 'R', 'F']; // envido, real envido, falta envido
const GRAMATICA = /^E{0,2}R?F?$/; // como mucho E-E-R-F, siempre creciente

const carta = (num, palo) => ({ id: `${num}-${palo}`, num, palo });
const fuerza = (c) => BRAVAS[c.id] ?? POR_NUM[c.num];
const equipo = (asiento) => asiento % 2;
const V = (nivel) => (nivel === 0 ? 1 : nivel + 1); // valor de la mano según el truco querido

// Envido de una mano: tanto y las cartas que lo forman (lo que muestra el ganador)
function envidoDe(cartas) {
  const val = (c) => (c.num <= 7 ? c.num : 0);
  let mejor = cartas.reduce((b, c) => (val(c) > val(b) ? c : b));
  let res = { tanto: val(mejor), cartas: [mejor] };
  for (let i = 0; i < cartas.length; i++) {
    for (let j = i + 1; j < cartas.length; j++) {
      const [a, b] = [cartas[i], cartas[j]];
      if (a.palo === b.palo && 20 + val(a) + val(b) > res.tanto) res = { tanto: 20 + val(a) + val(b), cartas: [a, b] };
    }
  }
  return res;
}

function puntosEnvido(cadena) {
  const suma = (xs) => xs.reduce((s, c) => s + ({ E: 2, R: 3 }[c] ?? 0), 0);
  return { querido: suma(cadena), noQuerido: cadena.length === 1 ? 1 : suma(cadena.slice(0, -1)) };
}

// La gana la primera baza decidida; con todo pardo, el equipo del mano. null = se sigue jugando
function ganadorMano(r, equipoMano) {
  const a = r.filter((x) => x === 0).length;
  const b = r.filter((x) => x === 1).length;
  if (a === 2) return 0;
  if (b === 2) return 1;
  if (r.length === 2 && a + b === 1) return a ? 0 : 1;
  if (r.length < 3) return null;
  if (a !== b) return a > b ? 0 : 1;
  const primera = r.find((x) => x !== 'P');
  return primera ?? equipoMano;
}

// Parda solo si la carta más alta la comparten equipos distintos; entre compañeros gana el que la tiró primero
function resolverBaza(jugadas) {
  const max = Math.max(...jugadas.map((j) => fuerza(j.card)));
  const top = jugadas.filter((j) => fuerza(j.card) === max);
  return new Set(top.map((j) => equipo(j.seat))).size === 1 ? { res: equipo(top[0].seat), lider: top[0].seat } : { res: 'P' };
}

function falta(m, ganador) {
  if (m.hand.faltaFija) return m.hand.faltaFija; // pica-pica: 6
  const puntero = Math.max(...m.scores);
  // "En malas es partido": a 30, si el que va adelante no llegó a 15, la falta gana la partida
  if (m.target === 30 && m.faltaMode === 'malas' && puntero < 15) return m.target - m.scores[ganador];
  return Math.max(1, m.target - puntero);
}

function repartir(n, mano) {
  const mazo = PALOS.flatMap((p) => NUMS.map((num) => carta(num, p)));
  for (let i = mazo.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1); // CSPRNG, como el mazo del UNO
    [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
  }
  const manos = Array.from({ length: n }, () => []);
  for (let k = 0; k < 3 * n; k++) manos[(mano + k) % n].push(mazo[k]);
  return manos;
}

/**
 * players: 2, 4 o 6 (equipo = asiento % 2; el orden de juego es el de los asientos).
 * faltaMode: 'malas' (a 30, en malas es partido) o 'simple'. A 15 siempre es simple.
 * deal(ronda): opcional, devuelve las manos por asiento (para tests).
 */
function createMatch({ players, target = 30, faltaMode = 'malas', picaPica = true, verCompanero = true, dealer, deal } = {}) {
  if (![2, 4, 6].includes(players)) throw new Error('El truco se juega de a 2, 4 o 6');
  if (![15, 30].includes(target)) throw new Error('La partida es a 15 o a 30');
  const m = {
    players, target, faltaMode, picaPica, verCompanero, deal,
    scores: [0, 0], dealer: dealer ?? crypto.randomInt(players), round: 0,
    lastWasPica: false, duels: [], dealt: [], cards: [], hand: null, over: false, winner: null,
  };
  startRound(m);
  return m;
}

function startRound(m) {
  const n = m.players;
  const mano = (m.dealer + 1) % n;
  const manos = m.deal?.(m.round) ?? repartir(n, mano);
  m.dealt = manos.map((h) => h.slice());
  m.cards = manos.map((h) => h.slice());
  const puntero = Math.max(...m.scores);
  const pica = n === 6 && m.picaPica && m.target === 30 && !m.lastWasPica && puntero >= 5 && puntero < 25;
  m.lastWasPica = pica;
  // Pica-pica: tres duelos en secuencia contra el de enfrente, empezando por el mano
  m.duels = pica ? [0, 1, 2].map((i) => [(mano + i) % n, (mano + i + 3) % n]) : [];
  startHand(m, pica ? m.duels.shift() : Array.from({ length: n }, (_, i) => (mano + i) % n), pica ? 6 : 0);
}

function startHand(m, order, faltaFija) {
  m.hand = {
    order, mano: order[0], faltaFija, baza: 0, leader: order[0], turn: order[0],
    played: [[]], results: [], phase: 'PLAYING', suspended: false,
    envido: { state: 'NONE', chain: [], caller: null, result: null },
    truco: { level: 0, pendingBy: null, owner: null },
  };
}

// Después de una mano (o un duelo): arranca la siguiente. El server decide cuándo (pausa para ver el resultado)
function nextHand(m) {
  if (m.over || m.hand.phase !== 'OVER') return false;
  if (m.duels.length) startHand(m, m.duels.shift(), 6);
  else {
    m.dealer = (m.dealer + 1) % m.players;
    m.round++;
    startRound(m);
  }
  return true;
}

const jugo = (h, s) => h.played[0].some((p) => p.seat === s);
const respondiendo = (h) => (h.phase === 'ENVIDO' ? 1 - h.envido.caller : h.phase === 'TRUCO' ? 1 - h.truco.pendingBy : null);

// Lo que puede hacer un asiento ahora. La botonera sale de acá: lo ilegal ni se ofrece
function legalActions(m, seat) {
  const h = m.hand;
  if (m.over || h.phase === 'OVER' || !h.order.includes(seat)) return [];
  const t = equipo(seat);
  const out = [];
  const envidos = () => LLAMADAS.forEach((call) => out.push({ type: 'envido', call }));
  if (h.phase === 'PLAYING') {
    if (seat !== h.turn) return [];
    m.cards[seat].forEach((c) => out.push({ type: 'jugar', card: c.id }));
    if (h.baza === 0 && !jugo(h, seat) && h.envido.state === 'NONE' && h.truco.level === 0) envidos();
    if (h.truco.level < 3 && (h.truco.level === 0 || h.truco.owner === t)) out.push({ type: 'truco' });
  } else {
    if (t !== respondiendo(h)) return [];
    out.push({ type: 'quiero' }, { type: 'noQuiero' });
    if (h.phase === 'ENVIDO') {
      LLAMADAS.forEach((call) => GRAMATICA.test(h.envido.chain.join('') + call) && out.push({ type: 'envido', call }));
    } else {
      if (h.truco.level <= 1) out.push({ type: 'quieroSubir' }); // "quiero retruco" / "quiero vale cuatro"
      // El envido está primero: contestar un truco con envido en la 1.ª baza
      if (h.baza === 0 && h.truco.level === 0 && h.envido.state === 'NONE' && !jugo(h, seat)) envidos();
    }
  }
  out.push({ type: 'mazo' });
  return out;
}

function addPoints(m, team, pts, reason, ev) {
  m.scores[team] = Math.min(m.target, m.scores[team] + pts);
  ev.push({ type: 'puntos', team, pts, reason });
  if (m.scores[team] >= m.target) {
    m.over = true;
    m.winner = team;
    m.hand.phase = 'OVER';
    ev.push({ type: 'fin', winner: team });
  }
}

function endHand(m, team, pts, reason, ev) {
  addPoints(m, team, pts, reason, ev);
  m.hand.phase = 'OVER';
  ev.push({ type: 'finMano' });
}

function resolveEnvido(m, quiso, ev) {
  const h = m.hand;
  const { querido, noQuerido } = puntosEnvido(h.envido.chain);
  h.envido.state = 'DONE';
  if (quiso) {
    // Lo calcula el server: gana el tanto más alto y, en empate, el más cercano al mano
    let best = null;
    for (const s of h.order) {
      const e = envidoDe(m.dealt[s]);
      if (!best || e.tanto > best.tanto) best = { seat: s, ...e };
    }
    const team = equipo(best.seat);
    h.envido.result = best;
    ev.push({ type: 'envido', seat: best.seat, tanto: best.tanto });
    addPoints(m, team, h.envido.chain.includes('F') ? falta(m, team) : querido, 'envido', ev);
  } else {
    addPoints(m, h.envido.caller, noQuerido, 'envido', ev);
  }
  if (!m.over) h.phase = h.suspended ? 'TRUCO' : 'PLAYING';
  h.suspended = false;
}

// Irse al mazo = no querer todo lo pendiente. Antes de que se tire la primera carta cuesta 2 (el rival pierde su envido)
function puntosMazo(h) {
  if (h.envido.state === 'PENDING') return V(h.truco.level) + puntosEnvido(h.envido.chain).noQuerido;
  const deEntrada = h.played[0].length === 0 && h.envido.state === 'NONE' && h.truco.level === 0;
  return V(h.truco.level) + (deEntrada ? 1 : 0);
}

function act(m, seat, a) {
  const legal = legalActions(m, seat);
  if (!a || !legal.some((l) => l.type === a.type && l.call === a.call && l.card === a.card)) {
    return { ok: false, error: 'Jugada no válida' };
  }
  const h = m.hand;
  const t = equipo(seat);
  const ev = [];
  switch (a.type) {
    case 'jugar': {
      const [c] = m.cards[seat].splice(m.cards[seat].findIndex((x) => x.id === a.card), 1);
      h.played[h.baza].push({ seat, card: c });
      ev.push({ type: 'jugar', seat, card: c.id });
      if (h.played[h.baza].length < h.order.length) {
        h.turn = h.order[(h.order.indexOf(seat) + 1) % h.order.length];
        break;
      }
      const r = resolverBaza(h.played[h.baza]);
      h.results.push(r.res);
      ev.push({ type: 'baza', res: r.res, seat: r.lider ?? null });
      if (h.baza === 0) h.envido.state = 'DONE'; // terminada la 1.ª baza ya no hay envido
      const w = ganadorMano(h.results, equipo(h.mano));
      if (w !== null) {
        endHand(m, w, V(h.truco.level), 'mano', ev);
        break;
      }
      if (r.res !== 'P') h.leader = r.lider; // tras una parda vuelve a salir el mismo
      h.turn = h.leader;
      h.baza++;
      h.played.push([]);
      break;
    }
    case 'envido':
      if (h.phase === 'TRUCO') h.suspended = true;
      h.envido.chain.push(a.call);
      h.envido.caller = t;
      h.envido.state = 'PENDING';
      h.phase = 'ENVIDO';
      ev.push({ type: 'canto', seat, call: a.call });
      break;
    case 'truco':
      h.truco.pendingBy = t;
      h.phase = 'TRUCO';
      ev.push({ type: 'canto', seat, call: ['truco', 'retruco', 'valeCuatro'][h.truco.level] });
      break;
    case 'quiero':
      ev.push({ type: 'quiero', seat });
      if (h.phase === 'ENVIDO') resolveEnvido(m, true, ev);
      else {
        h.truco.level++;
        h.truco.owner = t;
        h.truco.pendingBy = null;
        h.phase = 'PLAYING';
      }
      break;
    case 'quieroSubir':
      h.truco.level++;
      h.truco.owner = t;
      h.truco.pendingBy = t;
      ev.push({ type: 'quiero', seat }, { type: 'canto', seat, call: ['truco', 'retruco', 'valeCuatro'][h.truco.level] });
      break;
    case 'noQuiero':
      ev.push({ type: 'noQuiero', seat });
      if (h.phase === 'ENVIDO') resolveEnvido(m, false, ev);
      else endHand(m, h.truco.pendingBy, V(h.truco.level), 'noQuiero', ev);
      break;
    case 'mazo':
      ev.push({ type: 'mazo', seat });
      endHand(m, 1 - t, puntosMazo(h), 'mazo', ev);
      break;
  }
  return { ok: true, events: ev };
}

// Se venció el reloj: el que debía jugar se va al mazo (nunca se tira una carta sola); el que debía responder, no quiere
function timeout(m) {
  const h = m.hand;
  if (m.over || h.phase === 'OVER') return { ok: false, error: 'No hay nada pendiente' };
  if (h.phase === 'PLAYING') return act(m, h.turn, { type: 'mazo' });
  return act(m, h.order.find((s) => equipo(s) === respondiendo(h)), { type: 'noQuiero' });
}

// Lo que ve un asiento: su mano, la de sus compañeros (salvo en pica-pica) y nada de los rivales
function view(m, seat) {
  const h = m.hand;
  const pica = h.faltaFija > 0;
  const ids = (cs) => cs.map((c) => c.id);
  const compas = m.verCompanero && !pica ? m.cards.map((_, s) => s).filter((s) => s !== seat && equipo(s) === equipo(seat)) : [];
  const env = h.envido.result;
  return {
    players: m.players, target: m.target, scores: [...m.scores], dealer: m.dealer,
    mano: h.mano, order: h.order, pica, phase: h.phase, turn: h.turn, baza: h.baza,
    hand: ids(m.cards[seat]),
    partners: Object.fromEntries(compas.map((s) => [s, ids(m.cards[s])])),
    counts: m.cards.map((c) => c.length),
    played: h.played.map((b) => b.map((p) => ({ seat: p.seat, card: p.card.id }))),
    results: h.results,
    envido: {
      state: h.envido.state, chain: h.envido.chain, caller: h.envido.caller,
      // Las cartas del tanto ganador se muestran recién al terminar la mano
      result: env && { seat: env.seat, tanto: env.tanto, ...(h.phase === 'OVER' && { cards: ids(env.cartas) }) },
    },
    truco: { ...h.truco },
    falta: falta(m, equipo(seat)),
    legal: legalActions(m, seat),
    over: m.over, winner: m.winner,
  };
}

module.exports = {
  createMatch, act, timeout, nextHand, view, legalActions,
  // reglas sueltas, para tests y para la UI
  carta, fuerza, envidoDe, puntosEnvido, ganadorMano, falta, PALOS, NUMS,
};
