// E2E de una mesa paga: anvil + ChainTable + server real + bots que juegan una partida entera.
// Requiere Foundry (anvil/forge). Correr con: node test/paidLobby.e2e.js
const assert = require('assert');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { ethers } = require('ethers');
const { io } = require('socket.io-client');

const ROOT = path.resolve(__dirname, '../..');
const RPC_PORT = 8546;
const RPC = `http://127.0.0.1:${RPC_PORT}`;
const SERVER_PORT = 3999;
// Cuentas por defecto de anvil: deployer, referee, fees, alice, bob, mallory
const MNEMONIC = 'test test test test test test test test test test test junk';
const KEYS = [0, 1, 2, 3, 4, 5].map((i) => ethers.HDNodeWallet.fromPhrase(MNEMONIC, undefined, `m/44'/60'/0'/0/${i}`).privateKey);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const once = (sock, ev) => new Promise((r) => sock.once(ev, r));

function isValidPlay(card, top, color, stack) {
  if (stack) return card.value === top.value && (card.value === 'DrawTwo' || card.value === 'WildDrawFour');
  return card.color === 'Wild' || card.color === top.color || card.color === color || card.value === top.value;
}

// Bot mínimo: juega la primera carta válida, si no roba, si sigue sin poder pasa
function bot(sock, me, lobbyId) {
  let hand = [];
  let state = null;
  let drew = false;
  let lastTurnKey = '';
  let choosingColor = false;
  const act = () => setTimeout(() => {
    if (!state || state.status === 'finished' || choosingColor) return;
    const cur = state.players[state.currentTurnIndex];
    if (cur.id !== me) { drew = false; return; }
    const turnKey = `${state.discardPile.length}:${hand.length}:${drew}`;
    if (turnKey === lastTurnKey) return;
    lastTurnKey = turnKey;
    const top = state.discardPile[state.discardPile.length - 1];
    const idx = hand.findIndex((c) => isValidPlay(c, top, state.currentActiveColor, state.drawStackActive));
    if (idx >= 0) {
      choosingColor = hand[idx].color === 'Wild';
      sock.emit('game:playCard', { lobbyId, cardIndex: idx });
    }
    else if (state.drawStackActive || !drew) { drew = !state.drawStackActive; sock.emit('game:drawCard', { lobbyId }); }
    else { drew = false; sock.emit('game:passTurn', { lobbyId }); }
  }, 150); // ritmo humano: el server limita ~10 eventos/s por socket
  sock.on('game:yourHand', (h) => { hand = h; act(); });
  sock.on('game:started', (d) => { state = d.gameState; act(); });
  sock.on('game:update', (d) => { state = d.gameState; act(); });
  sock.on('game:over', (d) => { state = d.gameState; });
  sock.on('game:promptColor', () => {
    choosingColor = false;
    sock.emit('game:chooseColor', { lobbyId, color: 'Red' });
  });
  sock.on('game:error', () => { lastTurnKey = ''; act(); });
}

(async () => {
  const anvil = spawn('anvil', ['--port', RPC_PORT, '--chain-id', '11155111', '--silent']);
  let server;
  try {
    assert.equal(spawnSync('forge', ['build'], { cwd: ROOT }).status, 0, 'forge build falló');
    await sleep(1000);

    const provider = new ethers.JsonRpcProvider(RPC);
    const [deployer, referee, fees, alice, bob, mallory] = KEYS.map((k) => new ethers.Wallet(k, provider));
    const artifact = require(path.join(ROOT, 'out/ChainTable.sol/ChainTable.json'));
    const table = await new ethers.ContractFactory(artifact.abi, artifact.bytecode.object, deployer)
      .deploy(referee.address, fees.address);
    await table.waitForDeployment();

    server = spawn('node', ['server.js'], {
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        PORT: SERVER_PORT,
        RPC_URL_SEPOLIA: RPC,
        CONTRACT_SEPOLIA: await table.getAddress(),
        REFEREE_PRIVATE_KEY: KEYS[1],
      },
    });
    server.stderr.on('data', (d) => process.stderr.write(d));
    await sleep(1500);

    // On-chain: alice crea (paga) y bob se une
    const fee = ethers.parseEther('1');
    const receipt = await (await table.connect(alice).createLobby(3, 0, { value: fee })).wait();
    const onchainId = table.interface.parseLog(receipt.logs[0]).args.lobbyId.toString();
    await (await table.connect(bob).joinLobby(onchainId, { value: fee })).wait();

    const newToken = () => require('crypto').randomBytes(24).toString('hex');
    const connect = (token = newToken()) => io(`http://127.0.0.1:${SERVER_PORT}`, { transports: ['websocket'], auth: { token } });
    const bobToken = newToken();
    const [sa, sb, sm] = [connect(), connect(bobToken), connect()];

    // Mesa con datos falsos del cliente: el server usa los del contrato
    sa.emit('lobby:create', {
      name: 'e2e', type: 'pago', creatorId: 'alice', creatorUsername: alice.address,
      walletAddress: alice.address, entryCost: '1', mode: 'CLASSIC', onchain: { chain: 'sepolia', lobbyId: onchainId },
    });
    const created = await once(sa, 'lobby:created');
    assert.ok(created.success, created.error);
    assert.equal(created.lobby.mode, 'BEAST');
    assert.equal(created.lobby.maxPlayers, 3);
    assert.equal(created.lobby.entryCost, fee.toString());
    const lobbyId = created.lobby.id;

    // Mallory no pagó: no entra
    sm.emit('lobby:join', { lobbyId, playerId: 'mallory', username: mallory.address, walletAddress: mallory.address });
    const rejected = await once(sm, 'lobby:joined');
    assert.equal(rejected.success, false);
    console.log('✓ sin pago no se entra:', rejected.error);

    // Mallory diciendo ser bob tampoco puede ocupar dos asientos con la misma wallet
    sb.emit('lobby:join', { lobbyId, playerId: 'bob', username: bob.address, walletAddress: bob.address });
    assert.ok((await once(sb, 'lobby:joined')).success);
    sm.emit('lobby:join', { lobbyId, playerId: 'mallory', username: bob.address, walletAddress: bob.address });
    assert.equal((await once(sm, 'lobby:joined')).success, false);
    console.log('✓ una wallet = un asiento');

    // Los ids son públicos: sin el token de la sesión no se puede usar el de otro
    assert.ok(created.lobby.players.every((p) => p.token === undefined), 'el token no se manda a nadie');
    sm.emit('lobby:reconnect', { lobbyId, userId: 'bob' });
    assert.equal((await once(sm, 'game:lobbyInfo')).success, false);
    sm.emit('lobby:create', { name: 'x', type: 'publico', creatorId: 'alice', creatorUsername: 'Mallory' });
    assert.equal((await once(sm, 'lobby:created')).success, false);
    sm.emit('lobby:cancel', { lobbyId, playerId: 'alice' });
    assert.equal((await once(sm, 'lobby:left')).success, false);
    // Bob recarga la página (mismo token, socket nuevo): recupera su asiento
    const sb2 = connect(bobToken);
    sb2.emit('lobby:reconnect', { lobbyId, userId: 'bob' });
    assert.ok((await once(sb2, 'game:lobbyInfo')).success);
    sb2.close();
    sb.emit('lobby:reconnect', { lobbyId, userId: 'bob' });
    await once(sb, 'game:lobbyInfo');
    console.log('✓ sin token no se toma el asiento de otro; con token se reconecta');

    // Alias sin wallet: no entra a la paga; con la dirección de otro como alias, tampoco
    sm.emit('lobby:join', { lobbyId, playerId: 'mallory', username: 'Mallory', walletAddress: '' });
    assert.equal((await once(sm, 'lobby:joined')).success, false);
    sm.emit('lobby:create', { name: 'free', type: 'publico', creatorId: 'mallory', creatorUsername: alice.address });
    assert.equal((await once(sm, 'lobby:created')).success, false);
    console.log('✓ alias sin wallet no entra a mesas pagas ni suplanta direcciones');

    // Info pública no filtra manos ni mazo
    bot(sa, 'alice', lobbyId);
    bot(sb, 'bob', lobbyId);
    const started = once(sb, 'game:started');
    sa.emit('game:start', { lobbyId });
    const { gameState } = await started;
    assert.equal(gameState.drawPile, undefined);
    assert.ok(gameState.players.every((p) => p.hand === undefined && p.cardCount === 7));
    const [, , , state] = await table.getLobby(onchainId).then((l) => [l[0], l[1], l[2], l[4]]);
    assert.equal(Number(state), 2, 'la mesa debería estar STARTED on-chain');
    console.log('✓ partida empezada y mesa bloqueada on-chain');

    const before = { alice: await provider.getBalance(alice.address), bob: await provider.getBalance(bob.address) };
    const paid = await Promise.race([
      once(sa, 'game:prizesDistributed'),
      once(sa, 'game:prizeError').then((e) => { throw new Error(e.error); }),
      sleep(120000).then(() => { throw new Error('la partida no terminó a tiempo'); }),
    ]);
    const [winner] = paid.winners;
    const who = winner.toLowerCase() === alice.address.toLowerCase() ? 'alice' : 'bob';
    const gain = (await provider.getBalance(winner)) - before[who];
    assert.equal(gain, ethers.parseEther('1.9'), 'el ganador cobra 95% del pozo');
    assert.equal(await provider.getBalance(fees.address) - ethers.parseEther('10000'), ethers.parseEther('0.1'));
    assert.equal(await provider.getBalance(await table.getAddress()), 0n);
    console.log(`✓ ganó ${who}, cobró 1.9 ETH, fee 0.1 ETH, contrato vacío`);

    // Partida terminada: deja de figurar y los jugadores pueden armar otra mesa
    sa.emit('lobby:list');
    const list = await once(sa, 'lobby:list-updated');
    assert.ok(![...list.waitingForPlayers, ...list.inGame].some((l) => l.id === lobbyId), 'la mesa terminada no se lista');
    sa.emit('lobby:create', { name: 'revancha', type: 'publico', creatorId: 'alice', creatorUsername: 'Alicia' });
    const again = await once(sa, 'lobby:created');
    assert.ok(again.success, again.error);
    console.log('✓ mesa terminada liberada: no se lista y los jugadores pueden crear otra');

    [sa, sb, sm].forEach((s) => s.close());
    console.log('E2E OK');
  } finally {
    server?.kill();
    anvil.kill();
  }
})().catch((e) => {
  console.error('E2E FALLÓ:', e);
  process.exitCode = 1;
});
