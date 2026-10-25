// Truco por sockets: crear, empezar, jugar hasta el final, reloj y que el UNO no se cruce.
// Con SERVER_URL prueba un server ya levantado (p. ej. el contenedor) en vez de lanzar uno.
const assert = require('assert');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

const PORT = 3997;
const URL = process.env.SERVER_URL || `http://127.0.0.1:${PORT}`;
const TURN_MS = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((r) => s.once(ev, r));
const connect = () => io(URL, { transports: ['websocket'], auth: { token: crypto.randomBytes(24).toString('hex') } });
const uid = () => crypto.randomBytes(4).toString('hex');

async function mesa(n, target = 15) {
  const socks = Array.from({ length: n }, connect);
  const ids = socks.map(uid);
  socks[0].emit('lobby:create', { name: 'truco', type: 'publico', game: 'truco', players: n, target, creatorId: ids[0], creatorUsername: `J${ids[0]}` });
  const { lobby, error } = await once(socks[0], 'lobby:created');
  assert.ok(lobby, error);
  for (let i = 1; i < n; i++) {
    socks[i].emit('lobby:join', { lobbyId: lobby.id, playerId: ids[i], username: `J${ids[i]}` });
    assert.ok((await once(socks[i], 'lobby:joined')).success);
  }
  return { socks, lobby };
}

(async () => {
  const server = process.env.SERVER_URL ? null : spawn('node', ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT), TRUCO_TURN_MS: String(TURN_MS), TRUCO_PAUSE_MS: '50' },
  });
  try {
    await sleep(server ? 1200 : 0);

    // Validaciones al crear
    const x = connect();
    x.emit('lobby:create', { name: 't', type: 'pago', game: 'truco', players: 2, target: 15, creatorId: uid(), creatorUsername: 'Xx' });
    assert.equal((await once(x, 'lobby:created')).error, 'El truco todavía no tiene mesas pagas');
    x.emit('lobby:create', { name: 't', type: 'publico', game: 'truco', players: 3, target: 15, creatorId: uid(), creatorUsername: 'Xx' });
    assert.equal((await once(x, 'lobby:created')).error, 'El truco se juega de a 2, 4 o 6');
    x.close();
    console.log('✓ valida modo, puntos y que no haya truco pago');

    // 2v2 sin la mesa completa no arranca
    {
      const socks = [connect(), connect()];
      const ids = socks.map(uid);
      socks[0].emit('lobby:create', { name: 't', type: 'publico', game: 'truco', players: 4, target: 30, creatorId: ids[0], creatorUsername: `J${ids[0]}` });
      const { lobby } = await once(socks[0], 'lobby:created');
      assert.equal(lobby.game, 'truco');
      assert.equal(lobby.maxPlayers, 4);
      socks[1].emit('lobby:join', { lobbyId: lobby.id, playerId: ids[1], username: `J${ids[1]}` });
      await once(socks[1], 'lobby:joined');
      socks[0].emit('game:start', { lobbyId: lobby.id });
      assert.match(await once(socks[0], 'game:error'), /faltan jugadores/);
      socks.forEach((s) => s.close());
      console.log('✓ el 2v2 necesita la mesa completa');
    }

    // 1v1 a 15: la lista lo muestra como truco, cada uno ve solo su mano
    const { socks: [a, b], lobby } = await mesa(2);
    const listed = await new Promise((r) => { a.once('lobby:list-updated', r); a.emit('lobby:list'); });
    assert.equal(listed.waitingForPlayers.find((l) => l.id === lobby.id).game, 'truco');
    const states = new Map();
    for (const s of [a, b]) s.on('truco:state', (st) => states.set(s, st));
    a.emit('game:start', { lobbyId: lobby.id });
    await sleep(300);
    const sa = states.get(a);
    const sb = states.get(b);
    assert.equal(sa.hand.length, 3);
    assert.notEqual(sa.seat, sb.seat);
    assert.ok(sb.hand.every((c) => !JSON.stringify(sa).includes(`"${c}"`)), 'no ve la mano rival');
    assert.ok(sa.msLeft > 0 && sa.msLeft <= sa.turnMs);
    console.log('✓ empieza y cada uno recibe su vista');

    // Un evento del UNO sobre la mesa de truco no rompe nada; jugar fuera de turno tampoco
    a.emit('game:playCard', { lobbyId: lobby.id, cardIndex: 0 });
    assert.equal(await once(a, 'game:error'), 'Juego no encontrado');
    a.emit('game:start', { lobbyId: lobby.id });
    assert.equal(await once(a, 'game:error'), 'La partida ya empezó');
    const idle = sa.turn === sa.seat ? b : a;
    idle.emit('truco:act', { lobbyId: lobby.id, action: { type: 'jugar', card: states.get(idle).hand[0] } });
    assert.equal(await once(idle, 'game:error'), 'Jugada no válida');
    console.log('✓ el UNO no se cruza, sin doble inicio, sin jugar fuera de turno');

    // Nadie juega: el reloj manda al mazo
    const before = states.get(a).scores.reduce((x, y) => x + y, 0);
    await sleep(sa.turnMs + 400);
    const after = states.get(a);
    assert.ok(after.scores.reduce((x, y) => x + y, 0) > before, 'el timeout sumó puntos');
    console.log('✓ timeout: al mazo');

    // Jugar hasta el final eligiendo jugadas legales (sesgo a tirar cartas)
    const over = new Promise((r) => a.on('truco:state', (st) => st.over && r(st)));
    const play = (s) => s.on('truco:state', (st) => {
      if (st.over || !st.legal.length) return;
      const cartas = st.legal.filter((l) => l.type === 'jugar');
      const pick = cartas.length && Math.random() < 0.8 ? cartas[0] : st.legal[Math.floor(Math.random() * st.legal.length)];
      setTimeout(() => s.emit('truco:act', { lobbyId: lobby.id, action: pick }), 5);
    });
    play(a); play(b);
    a.emit('game:getLobbyInfo', { lobbyId: lobby.id }); // re-manda el estado y arranca el bucle
    const fin = await Promise.race([over, sleep(60000).then(() => null)]);
    assert.ok(fin, 'la partida termina');
    assert.equal(Math.max(...fin.scores), 15);
    const after2 = await new Promise((r) => { a.once('lobby:list-updated', r); a.emit('lobby:list'); });
    assert.ok(!after2.waitingForPlayers.concat(after2.inGame).some((l) => l.id === lobby.id), 'sale de la lista');
    console.log(`✓ partida completa ${fin.scores.join('-')}`);

    [a, b].forEach((s) => s.close());

    // Levantarse en plena partida la pierde
    {
      const { socks: [c, d], lobby: l2 } = await mesa(2);
      let last;
      c.on('truco:state', (st) => (last = st));
      c.emit('game:start', { lobbyId: l2.id });
      await sleep(300);
      d.emit('lobby:leave', { lobbyId: l2.id });
      await sleep(300);
      assert.ok(last.over && last.winner === last.seat % 2, 'gana el que se quedó');
      assert.ok(last.events.some((e) => e.type === 'abandono'));
      [c, d].forEach((s) => s.close());
      console.log('✓ el que se va pierde');
    }
    console.log('TRUCO OK');
  } finally {
    server?.kill();
  }
})().catch((e) => { console.error('TRUCO FALLÓ:', e); process.exitCode = 1; });
