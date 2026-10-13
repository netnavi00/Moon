// Pruebas de la campaña v3: niveles 1 a 3 iguales a v2, niveles 4 a 6, mecánicas opcionales y secuencias
// de referencia (criterios C-44 a C-56 de proyecto/criterios.md).
// Correr desde moon/:  node --test "src/tests/*.test.js"
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const physics = require('../js/physics.js');
const { CONFIG, createState, step, platformAt, windAt } = physics;
const { LEVELS } = require('../js/levels.js');
const v2Levels = require('../../entregables/v2/js/levels.js');
const v2Physics = require('../../entregables/v2/js/physics.js');

const [LUNA, MARTE, ASTEROIDE, GIGANTE, TORMENTA, APROX] = LEVELS;

const EPS = 1e-9;
const MAX_STEPS = 900;
const NONE = { thrust: false, left: false, right: false };
const UP = { thrust: true, left: false, right: false };
const RIGHT = { thrust: false, left: false, right: true };
const LEFT = { thrust: false, left: true, right: false };
const ALL = { thrust: true, left: true, right: true };

const STATE_KEYS = ['angle', 'crashReason', 'fuel', 'status', 'vx', 'vy', 'x', 'y'];

function near(actual, expected, eps = EPS, label = '') {
  assert.ok(Math.abs(actual - expected) <= eps, `${label} esperado ${expected} ± ${eps}, se obtuvo ${actual}`);
}

function inRange(actual, min, max, label) {
  assert.ok(actual >= min && actual <= max, `${label} esperado en [${min}, ${max}], se obtuvo ${actual}`);
}

// Corre n pasos con la misma entrada, con el contador de pasos desde n0.
function run(state, input, level, n, n0 = 0) {
  let s = state;
  for (let i = 0; i < n; i++) s = step(s, input, level, n0 + i);
  return s;
}

// inputFor(k) da la entrada del paso k (desde 1); en el paso k se pasa n = k − 1.
function runSequence(level, inputFor) {
  let s = createState(level);
  let steps = 0;
  while (s.status === 'flying' && steps < MAX_STEPS) {
    steps++;
    s = step(s, inputFor(steps), level, steps - 1);
  }
  return { state: s, steps };
}

// Secuencias de v1 (C-11) y v2 (§2.3 de proyecto/v2/criterios.md).
function lunaInput(k) {
  return k >= 163 && k <= 270 ? UP : NONE;
}
function marteInput(k) {
  if (k <= 124) return NONE;
  if (k <= 144) return RIGHT;
  if (k <= 192) return UP;
  if (k <= 212) return LEFT;
  if (k <= 284) return UP;
  return NONE;
}
function asteroideInput(k) {
  if (k <= 260) return NONE;
  if (k <= 310) return UP;
  if (k <= 440) return NONE;
  if (k <= 460) return LEFT;
  if (k <= 496) return UP;
  if (k <= 516) return RIGHT;
  return NONE;
}

// Secuencias de referencia de v3 (§2.3 de proyecto/criterios.md).
function giganteInput(k) {
  return k <= 110 ? NONE : UP;
}
function tormentaInput(k) {
  if (k <= 164) return NONE;
  if (k <= 258) return UP;
  return NONE;
}
function aproxInput(k) {
  if (k <= 160) return NONE;
  if (k <= 200) return LEFT;
  if (k <= 244) return UP;
  if (k <= 284) return RIGHT;
  return NONE;
}

// Mecánicas reconocidas por la regla de dificultad (§1.5).
function mechanics(level) {
  const m = [];
  if (level.wind !== 0) m.push('viento');
  if (level.platform.speed > 0) m.push('plataforma móvil');
  if ('fuelRate' in level) m.push('consumo');
  if ('gusts' in level) m.push('ráfagas');
  if ((level.start.vx || 0) !== 0 || (level.start.vy || 0) !== 0) m.push('velocidad inicial');
  return m;
}

function allKeys(obj) {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    keys.push(k);
    if (v && typeof v === 'object') keys.push(...allKeys(v));
  }
  return keys;
}

test('C-44 los niveles 1 a 3 son los datos de v2', () => {
  assert.deepStrictEqual(LEVELS.slice(0, 3), v2Levels.LEVELS);
  for (const level of LEVELS.slice(0, 3)) {
    assert.ok(!('fuelRate' in level), `${level.id} no debe traer fuelRate`);
    assert.ok(!('gusts' in level), `${level.id} no debe traer gusts`);
    assert.ok(!('vx' in level.start) && !('vy' in level.start), `${level.id} no debe traer velocidad inicial`);
  }
});

test('C-45 los niveles 1 a 3 se comportan igual que v2', () => {
  const cases = [[LUNA, lunaInput], [MARTE, marteInput], [ASTEROIDE, asteroideInput]];
  for (const [level, inputFor] of cases) {
    let a = v2Physics.createState(level);
    let b = createState(level);
    assert.deepStrictEqual(b, a, `estado inicial de ${level.id}`);
    let steps = 0;
    while (a.status === 'flying' && steps < MAX_STEPS) {
      steps++;
      a = v2Physics.step(a, inputFor(steps), level, steps - 1);
      b = step(b, inputFor(steps), level, steps - 1);
      assert.deepStrictEqual(b, a, `${level.id}, paso ${steps}`);
    }
    assert.strictEqual(a.status, 'landed', `${level.id} debe aterrizar`);
  }
  assert.deepStrictEqual(createState(), v2Physics.createState());
});

test('C-46 datos de los niveles 4 a 6 y estado inicial', () => {
  assert.strictEqual(LEVELS.length, 10);
  assert.deepStrictEqual(GIGANTE, {
    id: 'gigante', name: 'Luna gigante', theme: 'gigante',
    gravity: 30, wind: 0, fuel: 90, fuelRate: 30,
    start: { x: 170, y: 30 },
    platform: { x1: 150, x2: 190, speed: 0 },
  });
  assert.deepStrictEqual(TORMENTA, {
    id: 'tormenta', name: 'Tormenta', theme: 'tormenta',
    gravity: 20, wind: 0, fuel: 50,
    gusts: [{ steps: 60, wind: 15 }, { steps: 120, wind: -15 }, { steps: 60, wind: 15 }],
    start: { x: 152, y: 30 },
    platform: { x1: 136, x2: 184, speed: 0 },
  });
  assert.deepStrictEqual(APROX, {
    id: 'aproximacion', name: 'Aproximación', theme: 'aproximacion',
    gravity: 0, wind: 0, fuel: 30,
    start: { x: 24, y: 24, vx: 32, vy: 28 },
    platform: { x1: 124, x2: 164, speed: 0 },
  });

  for (const level of LEVELS) {
    const s = createState(level);
    assert.deepStrictEqual(Object.keys(s).sort(), STATE_KEYS, `campos de ${level.id}`);
  }
  for (const level of [GIGANTE, TORMENTA, APROX]) {
    assert.deepStrictEqual(createState(level), {
      x: level.start.x, y: level.start.y, vx: level.start.vx ?? 0, vy: level.start.vy ?? 0, angle: 0,
      fuel: level.fuel, status: 'flying', crashReason: null,
    }, `estado inicial de ${level.id}`);
  }
});

test('C-47 regla de dificultad v3', () => {
  const seen = new Set();
  const introduced = [];
  for (const level of LEVELS) {
    const fresh = mechanics(level).filter((m) => !seen.has(m));
    assert.ok(fresh.length <= 1, `${level.id} estrena ${fresh.length} mecánicas: ${fresh.join(', ')}`);
    introduced.push(fresh[0] || null);
    for (const m of fresh) seen.add(m);
  }
  assert.deepStrictEqual(introduced, [null, 'viento', 'plataforma móvil', 'consumo', 'ráfagas', 'velocidad inicial', null, null, null, null]);

  for (const level of LEVELS) {
    const limits = allKeys(level).filter((k) => /land|limit/i.test(k));
    assert.deepStrictEqual(limits, [], `${level.id} no debe tener límites de aterrizaje propios`);
  }
});

test('C-48 consumo de combustible por nivel', () => {
  const g = run(createState(GIGANTE), UP, GIGANTE, 60);
  near(g.fuel, 60, EPS, 'fuel gigante');
  near(g.vy, -20, EPS, 'vy gigante');
  near(g.y, 30 - 61 / 6, EPS, 'y gigante');
  assert.strictEqual(g.status, 'flying');

  const l = run(createState(LUNA), UP, LUNA, 60);
  near(l.fuel, 100 - CONFIG.FUEL_RATE, EPS, 'fuel luna');
  near(l.fuel, 80, EPS, 'fuel luna');
});

test('C-49 viento por paso (windAt)', () => {
  const cases = [[0, 15], [59, 15], [60, -15], [179, -15], [180, 15], [239, 15], [240, 15], [300, -15], [479, 15]];
  for (const [n, w] of cases) assert.strictEqual(windAt(TORMENTA, n), w, `Tormenta n=${n}`);
  assert.strictEqual(windAt(MARTE, 0), -4);
  assert.strictEqual(windAt(MARTE, 1000), -4);
  assert.strictEqual(windAt(LUNA, 0), 0);
  assert.strictEqual(windAt(LUNA, 500), 0);
});

test('C-50 ráfagas en la física', () => {
  const s60 = run(createState(TORMENTA), NONE, TORMENTA, 60);
  near(s60.vx, 15, EPS, 'vx a 60');
  near(s60.x, 159.625, EPS, 'x a 60');
  near(s60.vy, 20, EPS, 'vy a 60');
  assert.strictEqual(s60.fuel, 50);

  const s180 = run(s60, NONE, TORMENTA, 120, 60);
  near(s180.vx, -15, EPS, 'vx a 180');
  near(s180.x, 159.375, EPS, 'x a 180');
  assert.strictEqual(s180.status, 'flying');
});

test('C-51 velocidad inicial y gravedad 0', () => {
  assert.strictEqual(APROX.gravity, 0);
  const s0 = createState(APROX);
  assert.strictEqual(s0.vx, 32);
  assert.strictEqual(s0.vy, 28);
  const s = run(s0, NONE, APROX, 60);
  near(s.vx, 32, EPS, 'vx');
  near(s.vy, 28, EPS, 'vy');
  near(s.x, 56, EPS, 'x');
  near(s.y, 52, EPS, 'y');
  assert.strictEqual(s.fuel, 30);
});

test('C-52 la secuencia de Luna gigante aterriza', () => {
  const { state, steps } = runSequence(GIGANTE, giganteInput);
  assert.strictEqual(state.status, 'landed', `crashReason=${state.crashReason}, pasos=${steps}`);
  inRange(steps, 246, 250, 'pasos');
  inRange(state.vy, 7, 11, 'vy');
  near(state.x, 170, EPS, 'x');
  near(state.vx, 0, EPS, 'vx');
  assert.ok(Math.abs(state.angle) <= 1e-9, `angle=${state.angle}`);
  near(state.fuel, 21, 0.001, 'fuel');
  assert.ok(state.fuel >= 10, `margen de combustible ${state.fuel}`);
});

test('C-53 la secuencia de Tormenta aterriza', () => {
  const { state, steps } = runSequence(TORMENTA, tormentaInput);
  assert.strictEqual(state.status, 'landed', `crashReason=${state.crashReason}, pasos=${steps}`);
  inRange(steps, 259, 263, 'pasos');
  inRange(state.vy, 7.5, 10, 'vy');
  inRange(state.vx, 4.5, 6, 'vx');
  inRange(state.x, 152, 154, 'x');
  assert.ok(Math.abs(state.angle) <= 1e-9, `angle=${state.angle}`);
  near(state.fuel, 50 - 94 / 3, 0.001, 'fuel');
  assert.ok(state.fuel >= 10, `margen de combustible ${state.fuel}`);
});

test('C-54 la secuencia de Aproximación aterriza', () => {
  const { state, steps } = runSequence(APROX, aproxInput);
  assert.strictEqual(state.status, 'landed', `crashReason=${state.crashReason}, pasos=${steps}`);
  inRange(steps, 383, 391, 'pasos');
  inRange(state.vy, 9.5, 9.8, 'vy');
  inRange(state.vx, 0, 0.5, 'vx');
  inRange(state.x, 141, 144.5, 'x');
  assert.ok(Math.abs(state.angle) <= 1e-9, `angle=${state.angle}`);
  near(state.fuel, 30 - 44 / 3, 0.001, 'fuel');
  assert.ok(state.fuel >= 10, `margen de combustible ${state.fuel}`);
});

test('C-55 determinismo y pureza en los niveles 4 a 6', () => {
  const cases = [[GIGANTE, giganteInput], [TORMENTA, tormentaInput], [APROX, aproxInput]];
  for (const [level, inputFor] of cases) {
    assert.deepStrictEqual(runSequence(level, inputFor), runSequence(level, inputFor), `determinismo ${level.id}`);

    const s = { ...createState(level), x: 150, y: 80, vx: 3, vy: -2, angle: 15, fuel: 20 };
    const stateCopy = structuredClone(s);
    const levelCopy = structuredClone(level);
    step(s, ALL, level, 5);
    windAt(level, 5);
    assert.deepStrictEqual(s, stateCopy, `estado en ${level.id}`);
    assert.deepStrictEqual(level, levelCopy, `nivel ${level.id}`);

    const ended = [
      { ...createState(level), y: 154, status: 'landed' },
      { ...createState(level), y: 154, status: 'crashed', crashReason: 'speed_v' },
    ];
    for (const e of ended) {
      const copy = structuredClone(e);
      assert.deepStrictEqual(step(e, ALL, level, 5), copy, `${level.id} ${e.status}`);
    }
  }
});

test('C-56 exportaciones de physics.js', () => {
  for (const name of ['CONFIG', 'createState', 'step', 'evaluateLanding', 'platformAt', 'windAt']) {
    assert.ok(name in physics, `falta ${name}`);
  }
  assert.strictEqual(step.length, 2);
  assert.deepStrictEqual(platformAt(GIGANTE, 300), { x1: 150, x2: 190, vx: 0 });
});
