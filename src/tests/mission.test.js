// Pruebas de v4: thrustFactor, estado de misión, cápsulas, puntaje de misión, niveles 1 a 6 iguales a v3
// y datos del nivel 7 (criterios C-66 a C-80 de proyecto/criterios.md).
// Correr desde moon/:  node --test "src/tests/*.test.js"
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const physics = require('../js/physics.js');
const { CONFIG, createState, step } = physics;
const { LEVELS } = require('../js/levels.js');
const { MISSION, createMission, capsuleHits, missionStep } = require('../js/mission.js');
const { scoreLanding, scoreRun, MISSION_SCORE } = require('../js/score.js');

// La raíz de moon/ se busca hacia arriba (la carpeta con CLAUDE.md), así la prueba corre igual
// desde src/ que desde una copia en entregables/.
function moonRoot() {
  let dir = __dirname;
  while (!fs.existsSync(path.join(dir, 'CLAUDE.md'))) {
    const up = path.dirname(dir);
    if (up === dir) throw new Error('no encontré la raíz de moon/ (CLAUDE.md)');
    dir = up;
  }
  return dir;
}
const V3 = path.join(moonRoot(), 'entregables', 'v3', 'js');
const v3Levels = require(path.join(V3, 'levels.js'));
const v3Physics = require(path.join(V3, 'physics.js'));

const ENTREGA = LEVELS[6];
const EPS = 1e-9;
const NONE = { thrust: false, left: false, right: false };
const UP = { thrust: true, left: false, right: false };
const RIGHT = { thrust: false, left: false, right: true };
const LEFT = { thrust: false, left: true, right: false };
const ALL = { thrust: true, left: true, right: true };
const STATE_KEYS = ['angle', 'crashReason', 'fuel', 'status', 'vx', 'vy', 'x', 'y'];

function near(actual, expected, eps = EPS, label = '') {
  assert.ok(Math.abs(actual - expected) <= eps, `${label} esperado ${expected} ± ${eps}, se obtuvo ${actual}`);
}

// Misión con la nave en un estado dado (los demás campos como al crear).
function missionWith(level, ship, extra = {}) {
  return { ...createMission(level), ship: { ...createState(level), ...ship }, ...extra };
}

function runMission(m, input, level, k) {
  for (let i = 0; i < k; i++) m = missionStep(m, input, level);
  return m;
}

// Secuencias de referencia de v1 a v3 (iguales a las de worlds.test.js y campaign.test.js).
const V3_SEQUENCES = {
  luna: (k) => (k >= 163 && k <= 270 ? UP : NONE),
  marte: (k) => (k <= 124 ? NONE : k <= 144 ? RIGHT : k <= 192 ? UP : k <= 212 ? LEFT : k <= 284 ? UP : NONE),
  asteroide: (k) => (k <= 260 ? NONE : k <= 310 ? UP : k <= 440 ? NONE : k <= 460 ? LEFT : k <= 496 ? UP : k <= 516 ? RIGHT : NONE),
  gigante: (k) => (k <= 110 ? NONE : UP),
  tormenta: (k) => (k <= 164 ? NONE : k <= 258 ? UP : NONE),
  aproximacion: (k) => (k <= 160 ? NONE : k <= 200 ? LEFT : k <= 244 ? UP : k <= 284 ? RIGHT : NONE),
};

test('C-66 thrustFactor opcional en step', () => {
  const luna = LEVELS[0];
  let half = createState(luna);
  let full = createState(luna);
  const lunaHalf = { ...luna, thrustFactor: 0.5 };
  for (let i = 0; i < 60; i++) {
    half = step(half, UP, lunaHalf, i);
    full = step(full, UP, luna, i);
  }
  near(half.vy, -5, EPS, 'vy con 0.5');
  near(half.fuel, 80, EPS, 'fuel con 0.5');
  near(full.vy, -30, EPS, 'vy sin factor');
});

test('C-67 los niveles 1 a 6 son los datos de v3', () => {
  assert.deepStrictEqual(LEVELS.slice(0, 6), v3Levels.LEVELS);
  for (const level of LEVELS.slice(0, 6)) {
    for (const k of ['pickup', 'cargoThrust', 'capsules', 'thrustFactor']) {
      assert.ok(!(k in level), `${level.id} no debe traer ${k}`);
    }
  }
});

test('C-68 los niveles 1 a 6 se comportan igual que v3, también por la misión', () => {
  for (const level of LEVELS.slice(0, 6)) {
    const inputFor = V3_SEQUENCES[level.id];
    let a = v3Physics.createState(level);
    let b = createState(level);
    let m = createMission(level);
    assert.deepStrictEqual(b, a, `estado inicial de ${level.id}`);
    assert.deepStrictEqual(m.ship, a, `misión inicial de ${level.id}`);
    let k = 0;
    while (a.status === 'flying' && k < 900) {
      k++;
      a = v3Physics.step(a, inputFor(k), level, k - 1);
      b = step(b, inputFor(k), level, k - 1);
      m = missionStep(m, inputFor(k), level);
      assert.deepStrictEqual(b, a, `${level.id}, paso ${k} (step)`);
      assert.deepStrictEqual(m.ship, a, `${level.id}, paso ${k} (misión)`);
      assert.strictEqual(m.n, k);
    }
    assert.strictEqual(a.status, 'landed', `${level.id} debe aterrizar`);
    assert.strictEqual(m.status, 'landed');
    assert.strictEqual(m.cargo, false);
    assert.strictEqual(m.delivered, false);
  }
  assert.deepStrictEqual(createState(), v3Physics.createState());
});

test('C-69 createMission', () => {
  assert.strictEqual(MISSION.CAPSULE_HALF, 4);
  assert.strictEqual(MISSION.REST_Y, CONFIG.GROUND_Y - CONFIG.SHIP_HALF);
  const m = createMission(ENTREGA);
  assert.deepStrictEqual(m, {
    ship: createState(ENTREGA), n: 0, cargo: false, delivered: false, parked: false,
    taken: [], capsulePoints: 0, status: 'flying', reason: null,
  });
  assert.deepStrictEqual(Object.keys(m.ship).sort(), STATE_KEYS);
  const withCaps = { ...ENTREGA, capsules: [{ x: 1, y: 1, fuel: 0, points: 0 }, { x: 2, y: 2, fuel: 0, points: 0 }] };
  assert.deepStrictEqual(createMission(withCaps).taken, [false, false]);
});

test('C-70 capsuleHits', () => {
  const caps = [{ x: 100, y: 100, fuel: 10, points: 0 }];
  const ship = (x, y) => ({ ...createState(), x, y });
  assert.deepStrictEqual(capsuleHits(ship(110, 110), caps, [false]), [0]);
  assert.deepStrictEqual(capsuleHits(ship(90, 90), caps, [false]), [0]);
  assert.deepStrictEqual(capsuleHits(ship(110.01, 100), caps, [false]), []);
  assert.deepStrictEqual(capsuleHits(ship(100, 89.99), caps, [false]), []);
  assert.deepStrictEqual(capsuleHits(ship(100, 100), caps, [true]), []);
  const many = [{ x: 50, y: 50, fuel: 0, points: 1 }, { x: 105, y: 100, fuel: 0, points: 1 }, { x: 95, y: 104, fuel: 0, points: 1 }];
  assert.deepStrictEqual(capsuleHits(ship(100, 100), many, [false, false, false]), [1, 2]);
  assert.deepStrictEqual(capsuleHits(ship(100, 100), many, [false, true, false]), [2]);
});

test('C-71 pureza y determinismo de missionStep', () => {
  const level = { ...ENTREGA, cargoThrust: 0.6, capsules: [{ x: 75, y: 80, fuel: 5, points: 10 }] };
  const m = missionWith(level, { x: 75, y: 80, vx: 3, vy: -2, angle: 15, fuel: 20 }, { cargo: true, taken: [false] });
  const mCopy = structuredClone(m);
  const lCopy = structuredClone(level);
  const iCopy = structuredClone(ALL);
  const r1 = missionStep(m, ALL, level);
  const r2 = missionStep(m, ALL, level);
  assert.deepStrictEqual(m, mCopy);
  assert.deepStrictEqual(level, lCopy);
  assert.deepStrictEqual(ALL, iCopy);
  assert.deepStrictEqual(r1, r2);
  assert.notStrictEqual(r1.taken, m.taken);

  for (const status of ['landed', 'crashed']) {
    const ended = { ...createMission(ENTREGA), status };
    const copy = structuredClone(ended);
    assert.deepStrictEqual(missionStep(ended, ALL, ENTREGA), copy, status);
  }
});

test('C-72 aterrizar en A recoge el paquete y estaciona', () => {
  const m = missionStep(missionWith(ENTREGA, { x: 70, y: 153.99, vy: 5, fuel: 50 }), NONE, ENTREGA);
  assert.strictEqual(m.cargo, true);
  assert.strictEqual(m.parked, true);
  assert.strictEqual(m.status, 'flying');
  assert.strictEqual(m.n, 1);
  assert.deepStrictEqual(m.ship, { x: 70, y: 154, vx: 0, vy: 0, angle: 0, fuel: 50, status: 'flying', crashReason: null });
});

test('C-73 estacionado: quieto sin ↑, despega con ↑', () => {
  const parked = missionWith(ENTREGA, { x: 70, y: 154, fuel: 50 }, { cargo: true, parked: true, n: 10 });
  const still = runMission(parked, LEFT, ENTREGA, 30);
  assert.deepStrictEqual(still.ship, parked.ship);
  assert.strictEqual(still.n, 40);
  assert.strictEqual(still.parked, true);

  const up = missionStep(parked, UP, ENTREGA);
  assert.strictEqual(up.parked, false);
  assert.ok(up.ship.y < 154, `y=${up.ship.y}`);
  near(up.ship.vy, -0.5, EPS, 'vy');
  near(up.ship.fuel, 50 - 1 / 3, EPS, 'fuel');
  assert.strictEqual(up.n, 11);

  const noFuel = missionWith(ENTREGA, { x: 70, y: 154, fuel: 0 }, { cargo: true, parked: true });
  assert.deepStrictEqual(missionStep(noFuel, UP, ENTREGA).ship, noFuel.ship);
});

test('C-74 plataformas que no avanzan la misión y entrega', () => {
  const onB = missionStep(missionWith(ENTREGA, { x: 190, y: 153.99, vy: 5, fuel: 50 }), NONE, ENTREGA);
  assert.strictEqual(onB.status, 'flying');
  assert.strictEqual(onB.parked, true);
  assert.strictEqual(onB.cargo, false);
  assert.strictEqual(onB.ship.y, 154);

  const onA = missionStep(missionWith(ENTREGA, { x: 70, y: 153.99, vy: 5, fuel: 50 }, { cargo: true }), NONE, ENTREGA);
  assert.strictEqual(onA.status, 'flying');
  assert.strictEqual(onA.parked, true);
  assert.strictEqual(onA.delivered, false);

  const win = missionStep(missionWith(ENTREGA, { x: 190, y: 153.99, vy: 5, fuel: 50 }, { cargo: true }), NONE, ENTREGA);
  assert.strictEqual(win.status, 'landed');
  assert.strictEqual(win.delivered, true);
  assert.strictEqual(win.parked, false);
  assert.strictEqual(win.ship.status, 'landed');
  near(win.ship.y, 153.99 + (5 + 20 / 60) / 60, EPS, 'y sin estacionar');
});

test('C-75 choques en misión', () => {
  const between = missionStep(missionWith(ENTREGA, { x: 130, y: 153.99, vy: 5 }, { cargo: true }), NONE, ENTREGA);
  assert.strictEqual(between.status, 'crashed');
  assert.strictEqual(between.reason, 'off_platform');

  const hard = missionStep(missionWith(ENTREGA, { x: 70, y: 153.99, vy: 20 }), NONE, ENTREGA);
  assert.strictEqual(hard.status, 'crashed');
  assert.strictEqual(hard.reason, 'speed_v');
  assert.strictEqual(hard.cargo, false);

  const out = missionStep(missionWith(ENTREGA, { x: 6.0001, y: 90, vx: -1 }), NONE, ENTREGA);
  assert.strictEqual(out.status, 'crashed');
  assert.strictEqual(out.reason, 'out_of_bounds');
});

test('C-76 estacionar sin combustible reinicia', () => {
  const m = missionStep(missionWith(ENTREGA, { x: 70, y: 153.99, vy: 5, fuel: 0 }), NONE, ENTREGA);
  assert.strictEqual(m.status, 'crashed');
  assert.strictEqual(m.reason, 'no_fuel');
});

test('C-77 carga pesada', () => {
  const heavy = { ...ENTREGA, cargoThrust: 0.6 };
  const parked = (cargo) => missionWith(heavy, { x: 70, y: 154, fuel: 100 }, { cargo, parked: true });
  near(runMission(parked(true), UP, heavy, 60).ship.vy, -10, EPS, 'con paquete');
  near(runMission(parked(false), UP, heavy, 60).ship.vy, -30, EPS, 'sin paquete');
  near(runMission(missionWith(ENTREGA, { x: 70, y: 154, fuel: 100 }, { cargo: true, parked: true }), UP, ENTREGA, 60).ship.vy, -30, EPS, 'sin cargoThrust');
});

test('C-78 cápsulas en la misión', () => {
  const level = {
    ...ENTREGA,
    capsules: [
      { x: 70, y: 80, fuel: 30, points: 0 },
      { x: 70, y: 82, fuel: 0, points: 50 },
      { x: 300, y: 20, fuel: 5, points: 5 },
    ],
  };
  const m = missionStep(missionWith(level, { x: 70, y: 80, fuel: 100 }), NONE, level);
  assert.deepStrictEqual(m.taken, [true, true, false]);
  near(m.ship.fuel, 110, EPS, 'fuel con tope');
  assert.strictEqual(m.capsulePoints, 50);

  const again = missionStep(m, NONE, level);
  assert.strictEqual(again.capsulePoints, 50);
  near(again.ship.fuel, 110, EPS, 'no se toma dos veces');

  const low = missionStep(missionWith(level, { x: 70, y: 80, fuel: 20 }), NONE, level);
  near(low.ship.fuel, 50, EPS, 'fuel sumado');

  const crash = { ...level, capsules: [{ x: 130, y: 154, fuel: 10, points: 10 }] };
  const c = missionStep(missionWith(crash, { x: 130, y: 153.99, vy: 5 }), NONE, crash);
  assert.strictEqual(c.status, 'crashed');
  assert.deepStrictEqual(c.taken, [false]);
  assert.strictEqual(c.capsulePoints, 0);
});

test('C-79 datos del nivel 7 y regla de dificultad v4', () => {
  assert.deepStrictEqual(ENTREGA, {
    id: 'entrega', name: 'Primera entrega', theme: 'entrega',
    gravity: 20, wind: 0, fuel: 110,
    start: { x: 70, y: 30 },
    pickup: { x1: 40, x2: 100 },
    platform: { x1: 160, x2: 220, speed: 0 },
  });

  function mechanics(level) {
    const m = [];
    if (level.wind !== 0) m.push('viento');
    if (level.platform.speed > 0) m.push('plataforma móvil');
    if ('fuelRate' in level) m.push('consumo');
    if ('gusts' in level) m.push('ráfagas');
    if ((level.start.vx || 0) !== 0 || (level.start.vy || 0) !== 0) m.push('velocidad inicial');
    if ('pickup' in level) m.push('misión');
    if ('cargoThrust' in level && level.cargoThrust !== 1) m.push('carga pesada');
    if (level.capsules && level.capsules.length > 0) m.push('cápsulas');
    return m;
  }
  // Excepción aprobada por Nanni (D-14): el nivel 8 estrena carga pesada y cápsulas a la vez.
  const EXCEPTIONS = { carga: 2 };
  const seen = new Set();
  const introduced = [];
  for (const level of LEVELS) {
    const fresh = mechanics(level).filter((m) => !seen.has(m));
    assert.ok(fresh.length <= (EXCEPTIONS[level.id] ?? 1), `${level.id} estrena ${fresh.join(', ')}`);
    introduced.push(fresh);
    for (const m of fresh) seen.add(m);
  }
  assert.deepStrictEqual(introduced, [
    [], ['viento'], ['plataforma móvil'], ['consumo'], ['ráfagas'], ['velocidad inicial'], ['misión'],
    ['carga pesada', 'cápsulas'], [], [],
  ]);

  for (const level of LEVELS) {
    assert.ok(!('thrustFactor' in level), `${level.id} no trae thrustFactor`);
    if (!level.pickup) continue;
    const a = level.pickup;
    const b = level.platform;
    assert.strictEqual(b.speed, 0, `${level.id}: B fija`);
    assert.ok(a.x1 >= 0 && a.x2 <= CONFIG.WIDTH && b.x1 >= 0 && b.x2 <= CONFIG.WIDTH, `${level.id}: en pantalla`);
    assert.ok(a.x1 < a.x2 && b.x1 < b.x2, `${level.id}: anchos`);
    assert.ok(a.x2 < b.x1 || b.x2 < a.x1, `${level.id}: A y B no se enciman`);
    for (const c of level.capsules || []) {
      assert.ok(c.x >= 0 && c.x <= CONFIG.WIDTH && c.y >= 0 && c.y < CONFIG.GROUND_Y, `${level.id}: cápsula en pantalla`);
      assert.ok(c.fuel >= 0 && c.points >= 0, `${level.id}: cápsula sin negativos`);
    }
  }
});

test('C-80 scoreRun', () => {
  assert.deepStrictEqual(MISSION_SCORE, { DELIVERY: 400, PRECISION_MAX: 200, FUEL_MAX: 200, TIME_MAX: 200, STEPS_PER_TIME_POINT: 8 });
  const B = { x1: 160, x2: 220, vx: 0 };
  const done = (x, fuel, n, capsulePoints = 0) => ({
    ...createMission(ENTREGA), n, capsulePoints, status: 'landed', delivered: true, cargo: true,
    ship: { ...createState(ENTREGA), x, y: 154, fuel, status: 'landed' },
  });

  assert.strictEqual(scoreRun({ ...done(190, 50, 100), status: 'crashed' }, ENTREGA, B), null);
  assert.strictEqual(scoreRun({ ...done(190, 50, 100), status: 'flying' }, ENTREGA, B), null);

  const cases = [
    [190, 110, 0, 0, { delivery: 400, precision: 200, fuel: 200, time: 200, capsules: 0, total: 1000 }],
    [205, 55, 800, 0, { delivery: 400, precision: 100, fuel: 100, time: 100, capsules: 0, total: 700 }],
    [160, 0, 2000, 150, { delivery: 400, precision: 0, fuel: 0, time: 0, capsules: 150, total: 550 }],
    [189.93317, 25.66667, 583, 0, { delivery: 400, precision: 200, fuel: 47, time: 128, capsules: 0, total: 775 }],
  ];
  for (const [x, fuel, n, caps, expected] of cases) {
    assert.deepStrictEqual(scoreRun(done(x, fuel, n, caps), ENTREGA, B), expected, `x=${x} fuel=${fuel} n=${n}`);
  }
  assert.strictEqual(scoreRun(done(190, 110, 7), ENTREGA, B).time, 200);
  assert.strictEqual(scoreRun(done(190, 110, 8), ENTREGA, B).time, 199);

  // Sin misión: scoreLanding más las cápsulas.
  const gig = LEVELS[3];
  const P = { x1: 150, x2: 190, vx: 0 };
  const ship = { ...createState(gig), x: 175, y: 154, fuel: 21, status: 'landed' };
  const base = scoreLanding(ship, gig, P, 248);
  const plain = { ...createMission(gig), ship, n: 248, status: 'landed' };
  assert.deepStrictEqual(scoreRun(plain, gig, P), { ...base, capsules: 0 });
  assert.deepStrictEqual(scoreRun({ ...plain, capsulePoints: 40 }, gig, P), { ...base, capsules: 40, total: base.total + 40 });

  const m = done(190, 50, 100);
  const copy = structuredClone(m);
  scoreRun(m, ENTREGA, B);
  assert.deepStrictEqual(m, copy);
});
