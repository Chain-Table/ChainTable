// Reloj de turno: si nadie juega, el server roba y pasa solo; chooseColor fuera de turno no hace nada
const assert = require('assert');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

const PORT = 3998;
const TURN_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((r) => s.once(ev, r));
const connect = () => io(`http://127.0.0.1:${PORT}`, { transports: ['websocket'], auth: { token: crypto.randomBytes(24).toString('hex') } });

(async () => {
  const server = spawn('node', ['server.js'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: String(PORT), TURN_MS: String(TURN_MS) } });
  try {
    await sleep(1200);
    const [a, b] = [connect(), connect()];
    a.emit('lobby:create', { name: 't', type: 'publico', creatorId: 'a', creatorUsername: 'Ana' });
    const { lobby } = await once(a, 'lobby:created');
    b.emit('lobby:join', { lobbyId: lobby.id, playerId: 'b', username: 'Beto' });
    await once(b, 'lobby:joined');
    a.emit('game:start', { lobbyId: lobby.id });
    const { gameState: g0 } = await once(b, 'game:started');
    assert.ok(g0.turnMsLeft > 0 && g0.turnMsLeft <= TURN_MS, 'manda el tiempo restante');
    assert.equal(g0.turnMs, TURN_MS);

    // El que no tiene el turno no puede elegir color ni saltear a nadie
    const idle = g0.players[g0.currentTurnIndex].id === 'a' ? b : a;
    idle.emit('game:chooseColor', { lobbyId: lobby.id, color: 'Red' });
    assert.equal(await once(idle, 'game:error'), 'No es tu turno');

    // Nadie juega: en ~1 turno el server tiene que haber pasado el turno solo
    const updates = [];
    a.on('game:update', (u) => updates.push(u));
    await sleep(TURN_MS * 2 + 2500);
    assert.ok(updates.length && updates.every((u) => u.auto === "timeout"), "solo actúa el timeout");
    const last = updates[updates.length - 1].gameState;
    assert.ok(last.turnSeq >= 2, `el turno avanzó solo (turnSeq=${last.turnSeq})`);
    assert.ok(last.players.reduce((n, p) => n + p.cardCount, 0) > 14, 'robaron por timeout');
    console.log(`✓ ${updates.length} jugadas automáticas, turnSeq=${last.turnSeq}`);
    [a, b].forEach((s) => s.close());
    console.log('TURNOS OK');
  } finally {
    server.kill();
  }
})().catch((e) => { console.error('TURNOS FALLÓ:', e); process.exitCode = 1; });
