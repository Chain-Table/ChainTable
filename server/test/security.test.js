// Abusos básicos contra el server: spam de eventos, datos basura y colarse en partidas empezadas
const assert = require('assert');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { io } = require('socket.io-client');

const PORT = 3997;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (s, ev) => new Promise((r) => s.once(ev, r));
const connect = () => io(`http://127.0.0.1:${PORT}`, { transports: ['websocket'], auth: { token: crypto.randomBytes(24).toString('hex') } });

(async () => {
  const server = spawn('node', ['server.js'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: String(PORT) } });
  try {
    await sleep(1200);
    const [a, b, c] = [connect(), connect(), connect()];
    await Promise.all([a, b, c].map((s) => once(s, 'connect')));

    // Spam: 200 pedidos seguidos, el server atiende solo la ráfaga permitida
    let answers = 0;
    c.on('lobby:list-updated', () => answers++);
    await sleep(300);
    answers = 0;
    for (let i = 0; i < 200; i++) c.emit('lobby:list');
    await sleep(800);
    assert.ok(answers <= 30, `rate limit (respondió ${answers})`);
    console.log(`✓ spam frenado: 200 pedidos, ${answers} respuestas`);

    // Datos basura
    a.emit('lobby:create', { name: 'x', type: 'hackeada', creatorId: 'a', creatorUsername: 'Ana' });
    assert.equal((await once(a, 'lobby:created')).error, 'Tipo de mesa inválido');
    a.emit('lobby:create', { name: '   ', type: 'publico', creatorId: 'a', creatorUsername: 'Ana' });
    assert.equal((await once(a, 'lobby:created')).error, 'Ponele un nombre a la mesa');
    a.emit('lobby:create', { name: 'n'.repeat(5000), type: 'publico', creatorId: 'a', creatorUsername: 'Ana', password: 'no-va' });
    const created = await once(a, 'lobby:created');
    assert.ok(created.success);
    assert.equal(created.lobby.name.length, 40, 'nombre recortado');
    assert.equal(created.lobby.hasPassword, false, 'una pública no guarda contraseña');
    // Un socket, un asiento: no puede abrir otra mesa con otro id
    a.emit('lobby:create', { name: 'otra', type: 'publico', creatorId: 'a2', creatorUsername: 'Ana' });
    assert.equal((await once(a, 'lobby:created')).error, 'Ya estás en otro lobby');
    // Payload gigante: el server corta la conexión en vez de procesarlo
    const big = connect();
    await once(big, 'connect');
    big.emit('lobby:create', { name: 'x', type: 'publico', creatorId: 'z', creatorUsername: 'Zed', pad: 'x'.repeat(100000) });
    await once(big, 'disconnect');
    big.close();
    console.log('✓ tipo, nombre, contraseña y tamaño validados; un asiento por socket');

    // No se puede entrar a una partida que ya empezó
    const lobbyId = created.lobby.id;
    b.emit('lobby:join', { lobbyId, playerId: 'b', username: 'Beto' });
    await once(b, 'lobby:joined');
    a.emit('game:start', { lobbyId });
    await once(b, 'game:started');
    c.emit('lobby:join', { lobbyId, playerId: 'c', username: 'Colado' });
    assert.equal((await once(c, 'lobby:joined')).error, 'La partida ya empezó');
    console.log('✓ no se entra a partidas empezadas');

    [a, b, c].forEach((s) => s.close());
    console.log('SEGURIDAD OK');
  } finally {
    server.kill();
  }
})().catch((e) => { console.error('SEGURIDAD FALLÓ:', e); process.exitCode = 1; });
