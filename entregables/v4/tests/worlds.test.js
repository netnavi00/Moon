// Pruebas de los mundos: viento, plataforma móvil, aterrizaje con plataforma y secuencias fijas
// (criterios C-27, C-29 a C-35 y C-38 a C-41 de proyecto/criterios.md).
// Correr desde moon/:  node --test "src/tests/*.test.js"
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createState, step, evaluateLanding, platformAt } = require('../js/physics.js');
const { LEVELS } = require('../js/levels.js');

const [LUNA, MARTE, ASTEROIDE] = LEVELS;

const EPS = 1e-9;
const NONE = { thrust: false, left: false, right: false };
const UP = { thrust: true, left: false, right: false };
const RIGHT = { thrust: false, left: false, right: true };
const LEFT = { thrust: false, left: true, right: false };
const ALL = { thrust: true, left: true, right: true };

const V1_TEST_SHA256 = '5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a';

function near(actual, expected, eps = EPS, label = '') {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `${label} esperado ${expected} ± ${eps}, se obtuvo ${actual}`
  );
}

function inRange(actual, min, max, label) {
  assert.ok(actual >= min && actual <= max, `${label} esperado en [${min}, ${max}], se obtuvo ${actual}`);
}

// Corre n pasos con la misma entrada; n0 = pasos ya dados antes.
function run(state, input, level, n, n0 = 0) {
  let s = state;
  for (let i = 0; i < n; i++) s = step(s, input, level, n0 + i);
  return s;
}

// Corre una secuencia: inputFor(k) da la entrada del paso k (desde 1). En el paso k se pasa n = k − 1.
function runSequence(level, inputFor) {
  let s = createState(level);
  let steps = 0;
  while (s.status === 'flying' && steps < 600) {
    steps++;
    s = step(s, inputFor(steps), level, steps - 1);
  }
  return { state: s, steps };
}

// Secuencia de C-11 (v1).
function lunaInput(k) {
  return k >= 163 && k <= 270 ? UP : NONE;
}

// §2.3, Marte.
function marteInput(k) {
  if (k <= 124) return NONE;
  if (k <= 144) return RIGHT;
  if (k <= 192) return UP;
  if (k <= 212) return LEFT;
  if (k <= 284) return UP;
  return NONE;
}

// §2.3, Asteroide.
function asteroideInput(k) {
  if (k <= 260) return NONE;
  if (k <= 310) return UP;
  if (k <= 440) return NONE;
  if (k <= 460) return LEFT;
  if (k <= 496) return UP;
  if (k <= 516) return RIGHT;
  return NONE;
}

test('C-27 el test de v1 está intacto', () => {
  const file = path.join(__dirname, 'physics.test.js');
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.strictEqual(hash, V1_TEST_SHA256);
});

test('C-29 la Luna con datos es idéntica a v1', () => {
  let a = createState();
  let b = createState(LUNA);
  let steps = 0;
  while (a.status === 'flying' && steps < 600) {
    steps++;
    const input = lunaInput(steps);
    a = step(a, input);
    b = step(b, input, LUNA, steps - 1);
    assert.deepStrictEqual(b, a, `paso ${steps}`);
  }
  assert.strictEqual(a.status, 'landed');
});

test('C-30 evaluateLanding con plataforma', () => {
  const base = { ...createState(), y: 154, vy: 0, angle: 0 };

  const fixed = { x1: 140, x2: 204, vx: 0 };
  const xCases = [
    [139.99, 'crashed', 'off_platform'],
    [140, 'landed', null],
    [204, 'landed', null],
    [204.01, 'crashed', 'off_platform'],
  ];
  for (const [x, status, crashReason] of xCases) {
    const r = evaluateLanding({ ...base, x, vx: 0 }, fixed);
    assert.deepStrictEqual({ status: r.status, crashReason: r.crashReason }, { status, crashReason }, `x=${x}`);
  }

  const moving = { x1: 100, x2: 148, vx: 8 };
  const vxCases = [
    [8, 'landed', null],
    [18, 'landed', null],
    [18.01, 'crashed', 'speed_h'],
    [-2, 'landed', null],
    [-2.01, 'crashed', 'speed_h'],
    [0, 'landed', null],
  ];
  for (const [vx, status, crashReason] of vxCases) {
    const r = evaluateLanding({ ...base, x: 120, vx }, moving);
    assert.deepStrictEqual({ status: r.status, crashReason: r.crashReason }, { status, crashReason }, `vx=${vx}`);
  }
});

test('C-31 viento de Marte', () => {
  const s = run(createState(MARTE), NONE, MARTE, 60);
  near(s.vx, -4, EPS, 'vx');
  near(s.vy, 20, EPS, 'vy');
  near(s.x, 180 - (4 * 60 * 61) / 7200, EPS, 'x');
  assert.strictEqual(s.fuel, 80);
});

test('C-32 el viento puede sacar a la nave', () => {
  const s0 = { ...createState(), x: 6.0005, y: 90, vx: 0, vy: 0 };

  const marte = step(s0, NONE, MARTE, 0);
  assert.strictEqual(marte.status, 'crashed');
  assert.strictEqual(marte.crashReason, 'out_of_bounds');

  const luna = step(s0, NONE, LUNA, 0);
  assert.strictEqual(luna.status, 'flying');
});

test('C-33 gravedad del Asteroide', () => {
  assert.ok(ASTEROIDE.gravity < LUNA.gravity, `${ASTEROIDE.gravity} debe ser menor que ${LUNA.gravity}`);
  const s = run(createState(ASTEROIDE), NONE, ASTEROIDE, 60);
  near(s.vy, 8, EPS, 'vy');
  near(s.vx, 0, EPS, 'vx');
});

test('C-34 posición de la plataforma móvil', () => {
  // [t, x1, vx]; vx = null donde la plataforma está justo en un extremo.
  const cases = [
    [0, 100, 15],
    [60, 115, 15],
    [368, 192, null],
    [400, 184, -15],
    [575, 140.25, -15],
    [816, 80, null],
    [856, 90, 15],
  ];
  for (const [t, x1, vx] of cases) {
    const p = platformAt(ASTEROIDE, t);
    near(p.x1, x1, EPS, `x1 en t=${t}`);
    near(p.x2, p.x1 + 48, EPS, `x2 en t=${t}`);
    if (vx !== null) assert.strictEqual(p.vx, vx, `vx en t=${t}`);
  }

  assert.deepStrictEqual(platformAt(LUNA, 1000), { x1: 120, x2: 200, vx: 0 });
});

test('C-35 el contacto con la plataforma móvil usa el paso n + 1', () => {
  // Plataforma en t=1: x1 = 100.25. La nave va a +15 (vx relativa 0) y avanza 0.25 px en el paso.
  const base = { ...createState(ASTEROIDE), y: 153.99, vy: 5, vx: 15, angle: 0 };

  const off = step({ ...base, x: 99.9 }, NONE, ASTEROIDE, 0);
  assert.strictEqual(off.status, 'crashed');
  assert.strictEqual(off.crashReason, 'off_platform');

  const on = step({ ...base, x: 100.1 }, NONE, ASTEROIDE, 0);
  assert.strictEqual(on.status, 'landed', `crashReason=${on.crashReason}`);
});

test('C-38 la secuencia fija de Marte aterriza', () => {
  const { state, steps } = runSequence(MARTE, marteInput);
  assert.strictEqual(state.status, 'landed', `crashReason=${state.crashReason}, pasos=${steps}`);
  assert.ok(steps <= 600, `pasos=${steps}`);
  inRange(state.vy, 9.5, 12, 'vy');
  inRange(state.vx, -3, 1, 'vx');
  assert.ok(Math.abs(state.angle) <= 1e-9, `angle=${state.angle}`);
  near(state.fuel, 40, 0.001, 'fuel');
  inRange(state.x, 170, 178, 'x');
});

test('C-39 la secuencia fija del Asteroide aterriza', () => {
  const { state, steps } = runSequence(ASTEROIDE, asteroideInput);
  assert.strictEqual(state.status, 'landed', `crashReason=${state.crashReason}, pasos=${steps}`);
  assert.ok(steps <= 600, `pasos=${steps}`);
  inRange(steps, 570, 580, 'pasos');
  inRange(state.vy, 8, 10, 'vy');
  inRange(state.x, 150, 161, 'x');
  near(state.vx, -15, EPS, 'vx');
  assert.ok(Math.abs(state.angle) <= 1e-9, `angle=${state.angle}`);
  near(state.fuel, 45 - 86 / 3, 0.001, 'fuel');
  assert.strictEqual(platformAt(ASTEROIDE, steps).vx, -15, 'vx de la plataforma');
});

test('C-40 determinismo por nivel', () => {
  assert.deepStrictEqual(runSequence(MARTE, marteInput), runSequence(MARTE, marteInput));
  assert.deepStrictEqual(runSequence(ASTEROIDE, asteroideInput), runSequence(ASTEROIDE, asteroideInput));
});

test('C-41 pureza y fin con nivel', () => {
  for (const level of [MARTE, ASTEROIDE]) {
    const s = { ...createState(level), x: 150, y: 80, vx: 3, vy: -2, angle: 15, fuel: 50 };
    const stateCopy = structuredClone(s);
    const levelCopy = structuredClone(level);
    step(s, ALL, level, 5);
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
