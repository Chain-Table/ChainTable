// Tests de reglas del motor del truco: node truco/engine/test.js
const assert = require('assert');
const T = require('.');

const PALO = { e: 'espada', b: 'basto', o: 'oro', c: 'copa' };
const c = (s) => T.carta(Number(s.slice(0, -1)), PALO[s.slice(-1)]); // '7e' = 7 de espada
const manos = (...hs) => hs.map((h) => h.split(' ').map(c));
// dealer = último asiento, así el mano es el asiento 0
const partida = (players, hs, opts = {}) => T.createMatch({ players, dealer: players - 1, deal: () => manos(...hs), ...opts });
const ok = (m, seat, type, extra = {}) => {
  const r = T.act(m, seat, { type, ...extra });
  assert.ok(r.ok, `${type} de ${seat} debería ser válido: ${JSON.stringify(T.legalActions(m, seat))}`);
  return r;
};
const tiene = (m, seat, type) => T.legalActions(m, seat).some((a) => a.type === type);

let n = 0;
const test = (name, fn) => { fn(); n++; console.log('✓', name); };

test('jerarquía de 13 escalones', () => {
  const orden = ['1e', '1b', '7e', '7o', '3c', '2b', '1o', '12e', '11c', '7c', '6o', '5b', '4e'];
  for (let i = 1; i < orden.length; i++) assert.ok(T.fuerza(c(orden[i - 1])) > T.fuerza(c(orden[i])), orden[i]);
  assert.equal(T.fuerza(c('1o')), T.fuerza(c('1c')));
  assert.equal(T.fuerza(c('7c')), T.fuerza(c('7b')));
  assert.equal(T.fuerza(c('3e')), T.fuerza(c('3o')));
});

test('envido: casos y nunca entre 8 y 19', () => {
  const env = (s) => T.envidoDe(s.split(' ').map(c)).tanto;
  assert.equal(env('7e 6e 1b'), 33);
  assert.equal(env('11c 12c 4o'), 20);
  assert.equal(env('4o 5b 6c'), 6);
  assert.equal(env('11o 12b 11e'), 0);
  assert.equal(env('6b 3b 2b'), 29); // tres del mismo palo: las dos mejores
  const mazo = T.PALOS.flatMap((p) => T.NUMS.map((num) => T.carta(num, p)));
  assert.equal(mazo.length, 36);
  for (let i = 0; i < 36; i++) for (let j = i + 1; j < 36; j++) for (let k = j + 1; k < 36; k++) {
    const t = T.envidoDe([mazo[i], mazo[j], mazo[k]]).tanto;
    assert.ok((t >= 0 && t <= 7) || (t >= 20 && t <= 33), `tanto ${t}`);
  }
});

test('pardas: las 8 filas y sus simétricas', () => {
  const casos = [
    [[0, 0], 0], [[0, 'P'], 0], [['P', 0], 0], [[0, 1, 0], 0], [[0, 1, 1], 1],
    [[0, 1, 'P'], 0], [['P', 'P', 0], 0], [[0, 1], null], [['P', 'P'], null], [[0], null],
  ];
  for (const [r, w] of casos) {
    assert.equal(T.ganadorMano(r, 1), w, JSON.stringify(r));
    const espejo = r.map((x) => (x === 'P' ? 'P' : 1 - x));
    assert.equal(T.ganadorMano(espejo, 0), w === null ? null : 1 - w, JSON.stringify(espejo));
  }
  assert.equal(T.ganadorMano(['P', 'P', 'P'], 0), 0);
  assert.equal(T.ganadorMano(['P', 'P', 'P'], 1), 1);
});

test('tabla de puntos del envido', () => {
  const tabla = { E: [2, 1], R: [3, 1], F: [0, 1], EE: [4, 2], ER: [5, 2], EF: [0, 2], RF: [0, 3], EER: [7, 4], EEF: [0, 4], ERF: [0, 5], EERF: [0, 7] };
  for (const [k, [q, nq]] of Object.entries(tabla)) {
    const p = T.puntosEnvido([...k]);
    assert.equal(p.noQuerido, nq, k);
    if (!k.includes('F')) assert.equal(p.querido, q, k);
  }
});

test('falta envido a 30 (en malas es partido) y a 15', () => {
  const m = partida(2, ['4o 5o 6o', '4b 5b 6b']);
  m.scores = [10, 8];
  assert.equal(T.falta(m, 1), 22); // los dos en malas: la falta gana la partida
  m.scores = [18, 8];
  assert.equal(T.falta(m, 1), 12);
  m.faltaMode = 'simple';
  m.scores = [10, 8];
  assert.equal(T.falta(m, 0), 20);
  const q = partida(2, ['4o 5o 6o', '4b 5b 6b'], { target: 15 });
  q.scores = [9, 4];
  assert.equal(T.falta(q, 1), 6);
});

test('mano 1v1 con truco querido: 2 puntos al que gana dos bazas', () => {
  const m = partida(2, ['1e 4o 5o', '3c 4b 6b']);
  ok(m, 0, 'truco');
  assert.ok(!tiene(m, 1, 'jugar'), 'con canto pendiente no se juegan cartas');
  assert.deepEqual(T.legalActions(m, 0), [], 'el que cantó espera');
  ok(m, 1, 'quiero');
  ok(m, 0, 'jugar', { card: '1-espada' });
  ok(m, 1, 'jugar', { card: '3-copa' });
  assert.equal(m.hand.turn, 0, 'sale el que ganó la baza');
  ok(m, 0, 'jugar', { card: '5-oro' });
  ok(m, 1, 'jugar', { card: '4-basto' });
  assert.equal(m.hand.phase, 'OVER');
  assert.deepEqual(m.scores, [2, 0]);
});

test('subir el truco: solo quien tiene el quiero', () => {
  const m = partida(2, ['1e 4o 5o', '3c 4b 6b']);
  ok(m, 0, 'truco');
  ok(m, 1, 'quieroSubir'); // quiero retruco
  ok(m, 0, 'quiero');
  assert.equal(m.hand.truco.level, 2);
  assert.ok(tiene(m, 0, 'truco'), 'A aceptó el retruco: puede cantar vale cuatro');
  ok(m, 0, 'jugar', { card: '4-oro' });
  assert.ok(!tiene(m, 1, 'truco'), 'B no tiene el quiero');
  ok(m, 1, 'jugar', { card: '3-copa' });
  ok(m, 1, 'mazo');
  assert.deepEqual(m.scores, [3, 0], 'mazo con retruco querido paga 3');
});

test('no querer el truco paga lo anterior', () => {
  const m = partida(2, ['1e 4o 5o', '3c 4b 6b']);
  ok(m, 0, 'truco');
  ok(m, 1, 'quieroSubir');
  ok(m, 0, 'noQuiero');
  assert.deepEqual(m.scores, [0, 2]);
});

test('el envido está primero y después vuelve el truco', () => {
  const m = partida(2, ['7e 6e 4o', '3c 4b 6b']);
  ok(m, 0, 'truco');
  ok(m, 1, 'envido', { call: 'E' });
  assert.equal(m.hand.phase, 'ENVIDO');
  ok(m, 0, 'quiero');
  assert.deepEqual(m.scores, [2, 0], 'A gana 33 a 20');
  assert.equal(m.hand.phase, 'TRUCO', 'queda el truco pendiente');
  ok(m, 1, 'noQuiero');
  assert.deepEqual(m.scores, [3, 0]);
  assert.deepEqual(T.view(m, 1).envido.result.cards, ['7-espada', '6-espada'], 'al final se muestran las cartas del tanto');
});

test('el envido se canta antes de tirar la carta propia y solo en la 1.ª baza', () => {
  const m = partida(2, ['7e 6e 4o', '3c 4b 6b']);
  ok(m, 0, 'jugar', { card: '4-oro' });
  assert.ok(tiene(m, 1, 'envido'), 'el pie todavía no jugó');
  ok(m, 1, 'jugar', { card: '3-copa' });
  assert.ok(!tiene(m, 1, 'envido'), 'terminó la 1.ª baza');
});

test('cadena de envido E-E-R y empate al mano', () => {
  const m = partida(2, ['7e 6e 4o', '7c 6c 4b']);
  ok(m, 0, 'envido', { call: 'E' });
  ok(m, 1, 'envido', { call: 'E' });
  assert.ok(!T.legalActions(m, 0).some((a) => a.call === 'E'), 'no hay tercer envido');
  ok(m, 0, 'envido', { call: 'R' });
  ok(m, 1, 'quiero');
  assert.deepEqual(m.scores, [7, 0], '33 a 33: gana el mano');
});

test('envido no querido y mazo', () => {
  const m = partida(2, ['7e 6e 4o', '3c 4b 6b']);
  ok(m, 0, 'envido', { call: 'E' });
  ok(m, 1, 'envido', { call: 'R' });
  ok(m, 0, 'mazo');
  assert.deepEqual(m.scores, [0, 3], 'E-R no querido (2) + la mano (1)');

  const d = partida(2, ['7e 6e 4o', '3c 4b 6b']);
  ok(d, 0, 'mazo');
  assert.deepEqual(d.scores, [0, 2], 'irse de entrada cuesta 2');
  const e = partida(2, ['7e 6e 4o', '3c 4b 6b']);
  ok(e, 0, 'jugar', { card: '4-oro' });
  ok(e, 1, 'mazo');
  assert.deepEqual(e.scores, [1, 0], 'con una carta en la mesa cuesta 1');
});

test('el envido puede terminar la partida y el truco ya no cuenta', () => {
  const m2 = partida(2, ['7e 6e 4o', '3c 4b 6b']);
  m2.scores = [29, 0];
  ok(m2, 0, 'truco');
  ok(m2, 1, 'envido', { call: 'E' }); // el envido está primero
  ok(m2, 0, 'envido', { call: 'E' });
  const r = ok(m2, 1, 'quiero');
  assert.ok(m2.over && m2.winner === 0);
  assert.deepEqual(m2.scores, [30, 0], 'el marcador se recorta a la meta');
  assert.ok(r.events.some((e) => e.type === 'fin'));
  assert.deepEqual(T.legalActions(m2, 0), []);
  assert.equal(T.nextHand(m2), false);
});

test('equipos: parda solo entre equipos distintos', () => {
  // 2v2: asientos 0 y 2 son el equipo 0
  const m = partida(4, ['3e 4o 5o', '4b 5b 6b', '3o 4c 5c', '6e 6o 6c']);
  ok(m, 0, 'jugar', { card: '3-espada' });
  ok(m, 1, 'jugar', { card: '4-basto' });
  ok(m, 2, 'jugar', { card: '3-oro' });
  ok(m, 3, 'jugar', { card: '6-espada' });
  assert.deepEqual(m.hand.results, [0], 'dos treses del mismo equipo: gana el equipo');
  assert.equal(m.hand.turn, 0, 'sale el que la tiró primero');

  const p = partida(4, ['3e 4o 5o', '3b 5b 6b', '4e 4c 5c', '6e 6o 6c']);
  ok(p, 0, 'jugar', { card: '3-espada' });
  ok(p, 1, 'jugar', { card: '3-basto' });
  ok(p, 2, 'jugar', { card: '4-espada' });
  ok(p, 3, 'jugar', { card: '6-espada' });
  assert.deepEqual(p.hand.results, ['P']);
  assert.equal(p.hand.turn, 0, 'tras la parda vuelve a salir el mismo');
});

test('equipos: responde cualquiera y vale la primera respuesta', () => {
  const m = partida(4, ['3e 4o 5o', '4b 5b 6b', '3o 4c 5c', '6e 6o 6c']);
  ok(m, 0, 'truco');
  assert.ok(tiene(m, 3, 'quiero') && tiene(m, 1, 'quiero'));
  ok(m, 3, 'quiero');
  assert.equal(T.act(m, 1, { type: 'noQuiero' }).ok, false, 'la segunda respuesta llega tarde');
});

test('pica-pica: 3v3 a 30 entre 5 y 24, duelos en secuencia con falta de 6', () => {
  const hs = ['7e 6e 4o', '3c 4b 6b', '1e 4c 5c', '2o 5b 5e', '1b 6c 6o', '7o 2c 2e'];
  const m = partida(6, hs);
  assert.equal(m.hand.order.length, 6, 'la primera mano es redonda');
  m.scores = [5, 0];
  ok(m, 0, 'mazo');
  assert.ok(T.nextHand(m));
  assert.equal(m.hand.order.length, 2, 'ahora pica-pica');
  assert.equal(m.duels.length, 2);
  const [a, b] = m.hand.order;
  assert.equal((b - a + 6) % 6, 3, 'contra el de enfrente');
  assert.deepEqual(T.legalActions(m, (a + 1) % 6), [], 'los demás miran');
  assert.deepEqual(T.view(m, a).partners, {}, 'en pica-pica no se ven cartas del compañero');
  const antes = [...m.scores];
  ok(m, a, 'envido', { call: 'F' });
  ok(m, b, 'quiero');
  const ganados = m.scores.map((s, i) => s - antes[i]);
  assert.equal(ganados[0] + ganados[1], 6, 'falta fija de 6');
  ok(m, m.hand.turn, 'mazo');
  assert.ok(T.nextHand(m));
  assert.equal(m.hand.order.length, 2, 'segundo duelo');
  ok(m, m.hand.turn, 'mazo');
  T.nextHand(m);
  ok(m, m.hand.turn, 'mazo');
  T.nextHand(m);
  assert.equal(m.hand.order.length, 6, 'después del pica-pica vuelve la redonda');
});

test('timeouts: jugar = mazo, responder = no quiero', () => {
  const m = partida(2, ['7e 6e 4o', '3c 4b 6b']);
  ok(m, 0, 'jugar', { card: '4-oro' });
  ok(m, 1, 'truco');
  T.timeout(m);
  assert.deepEqual(m.scores, [0, 1], 'no respondió: no quiero');
  T.nextHand(m);
  const turno = m.hand.turn;
  T.timeout(m);
  assert.equal(m.scores[1 - (turno % 2)] > 0, true, 'no jugó: se fue al mazo');
});

test('cada uno ve su mano y la del compañero, nunca la del rival', () => {
  const m = partida(4, ['3e 4o 5o', '4b 5b 6b', '3o 4c 5c', '6e 6o 6c']);
  const v = T.view(m, 0);
  assert.deepEqual(v.hand, ['3-espada', '4-oro', '5-oro']);
  assert.deepEqual(Object.keys(v.partners), ['2']);
  assert.ok(!JSON.stringify(v).includes('4-basto'), 'no filtra cartas del rival');
  const uno = T.view(partida(2, ['3e 4o 5o', '4b 5b 6b']), 0);
  assert.deepEqual(uno.partners, {}, '1v1: no hay compañero');
  assert.ok(!JSON.stringify(uno).includes('-basto'), '1v1: no se ve la mano del rival');
  const sin = partida(4, ['3e 4o 5o', '4b 5b 6b', '3o 4c 5c', '6e 6o 6c'], { verCompanero: false });
  assert.deepEqual(T.view(sin, 0).partners, {});
});

test('el que se levanta pierde la partida para su equipo', () => {
  const m = partida(4, ['3e 4o 5o', '4b 5b 6b', '3o 4c 5c', '6e 6o 6c']);
  assert.deepEqual(T.abandon(m, 2).events.at(-1), { type: 'fin', winner: 1 });
  assert.ok(m.over && T.view(m, 1).legal.length === 0);
  assert.equal(T.abandon(m, 1).ok, false);
});

test('partida aleatoria completa sin errores', () => {
  for (const players of [2, 4, 6]) {
    const m = T.createMatch({ players, target: 30 });
    for (let i = 0; i < 5000 && !m.over; i++) {
      if (m.hand.phase === 'OVER') { T.nextHand(m); continue; }
      const seat = m.hand.order.find((s) => T.legalActions(m, s).length);
      const legal = T.legalActions(m, seat);
      // sesgo a jugar cartas para que las manos terminen por bazas
      const cartas = legal.filter((a) => a.type === 'jugar');
      const a = cartas.length && Math.random() < 0.7 ? cartas[0] : legal[Math.floor(Math.random() * legal.length)];
      assert.ok(T.act(m, seat, a).ok);
    }
    assert.ok(m.over, `${players} jugadores: la partida termina`);
    assert.equal(Math.max(...m.scores), 30);
  }
});

console.log(`\n${n} tests OK`);
