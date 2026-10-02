// Pruebas de la lógica de física (criterios C-01 a C-14 de proyecto/criterios.md).
// Correr desde moon/:  node --test "src/tests/*.test.js"
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { CONFIG, createState, step, evaluateLanding } = require('../js/physics.js');

const EPS = 1e-9;
const NONE = { thrust: false, left: false, right: false };
const UP = { thrust: true, left: false, right: false };
const RIGHT = { thrust: false, left: false, right: true };
const LEFT = { thrust: false, left: true, right: false };
const BOTH_TURNS = { thrust: false, left: true, right: true };
const ALL = { thrust: true, left: true, right: true };

function run(state, input, n) {
  let s = state;
  for (let i = 0; i < n; i++) s = step(s, input);
  return s;
}

function near(actual, expected, eps = EPS, label = '') {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `${label} esperado ${expected} ± ${eps}, se obtuvo ${actual}`
  );
}

function at(overrides) {
  return { ...createState(), ...overrides };
}

// Secuencia fija de C-11: 1–162 sin teclas, 163–270 con ↑, luego sin teclas (máx. 600 pasos).
function runFixedSequence() {
  let s = createState();
  let steps = 0;
  while (s.status === 'flying' && steps < 600) {
    steps++;
    const input = steps >= 163 && steps <= 270 ? UP : NONE;
    s = step(s, input);
  }
  return { state: s, steps };
}

test('C-01 estado inicial correcto', () => {
  assert.deepStrictEqual(createState(), {
    x: 160, y: 30, vx: 0, vy: 0, angle: 0, fuel: 100, status: 'flying', crashReason: null,
  });
});

test('C-02 la gravedad jala hacia abajo', () => {
  const s = run(createState(), NONE, 60);
  near(s.vy, 20, EPS, 'vy');
  near(s.vx, 0, EPS, 'vx');
});

test('C-03 empuje mayor que gravedad', () => {
  assert.ok(CONFIG.THRUST > CONFIG.GRAVITY, 'THRUST debe ser mayor que GRAVITY');
  const s = run(createState(), UP, 60);
  near(s.vy, -30, EPS, 'vy');
});

test('C-04 el empuje gasta combustible', () => {
  const s = run(createState(), UP, 60);
  near(s.fuel, 80, EPS, 'fuel');
});

test('C-05 sin combustible no hay empuje', () => {
  const s = run(at({ fuel: 0 }), UP, 60);
  near(s.vy, 20, EPS, 'vy');
  assert.strictEqual(s.fuel, 0);

  const t = step(at({ fuel: 0.1 }), UP);
  assert.strictEqual(t.fuel, 0, 'el combustible nunca baja de 0');
});

test('C-06 giro y dirección del empuje', () => {
  near(run(createState(), RIGHT, 60).angle, 90, EPS, 'derecha');
  near(run(createState(), LEFT, 60).angle, -90, EPS, 'izquierda');
  near(run(createState(), BOTH_TURNS, 60).angle, 0, EPS, 'ambas');

  const s = run(at({ angle: 90 }), UP, 60);
  near(s.vx, 50, EPS, 'vx');
  near(s.vy, 20, EPS, 'vy');
});

test('C-07 límites de aterrizaje (inclusivos)', () => {
  const cases = [
    // [x, vy, vx, angle, status, crashReason]
    [160, 15, 0, 0, 'landed', null],
    [160, 0, 10, 0, 'landed', null],
    [160, 0, -10, 0, 'landed', null],
    [160, 0, 0, 10, 'landed', null],
    [160, 0, 0, -10, 'landed', null],
    [160, 15.01, 0, 0, 'crashed', 'speed_v'],
    [160, 0, 10.01, 0, 'crashed', 'speed_h'],
    [160, 0, -10.01, 0, 'crashed', 'speed_h'],
    [160, 0, 0, 10.01, 'crashed', 'angle'],
    [160, 0, 0, -10.01, 'crashed', 'angle'],
    [120, 0, 0, 0, 'landed', null],
    [200, 0, 0, 0, 'landed', null],
    [119.99, 0, 0, 0, 'crashed', 'off_platform'],
    [200.01, 0, 0, 0, 'crashed', 'off_platform'],
  ];
  for (const [x, vy, vx, angle, status, crashReason] of cases) {
    const r = evaluateLanding(at({ x, y: 154, vx, vy, angle }));
    assert.deepStrictEqual(
      { status: r.status, crashReason: r.crashReason },
      { status, crashReason },
      `x=${x} vy=${vy} vx=${vx} angle=${angle}`
    );
  }
});

test('C-08 contacto real con step', () => {
  const ok = step(at({ x: 160, y: 153.99, vy: 5 }), NONE);
  assert.strictEqual(ok.status, 'landed');

  const off = step(at({ x: 60, y: 153.99, vy: 5 }), NONE);
  assert.strictEqual(off.status, 'crashed');
  assert.strictEqual(off.crashReason, 'off_platform');
});

test('C-09 salir por los bordes es choque', () => {
  const starts = [
    at({ x: 6.1, y: 90, vx: -30 }),
    at({ x: 313.9, y: 90, vx: 30 }),
    at({ x: 160, y: 6.1, vy: -30 }),
  ];
  for (const s0 of starts) {
    const s = step(s0, NONE);
    assert.strictEqual(s.status, 'crashed', `desde x=${s0.x} y=${s0.y}`);
    assert.strictEqual(s.crashReason, 'out_of_bounds', `desde x=${s0.x} y=${s0.y}`);
  }
});

test('C-10 al terminar ya no responde', () => {
  const ended = [
    at({ y: 154, status: 'landed' }),
    at({ y: 154, status: 'crashed', crashReason: 'speed_v' }),
  ];
  for (const s0 of ended) {
    const copy = structuredClone(s0);
    assert.deepStrictEqual(step(s0, ALL), copy);
  }
});

test('C-11 la secuencia fija aterriza con éxito', () => {
  const { state, steps } = runFixedSequence();
  assert.strictEqual(state.status, 'landed', `crashReason=${state.crashReason}, pasos=${steps}`);
  assert.ok(steps <= 600, `pasos=${steps}`);
  assert.ok(state.vy >= 9 && state.vy <= 11, `vy al contacto=${state.vy}`);
  near(state.fuel, 64, 0.001, 'fuel');
  assert.strictEqual(state.vx, 0);
  assert.strictEqual(state.angle, 0);
});

test('C-12 determinismo', () => {
  assert.deepStrictEqual(runFixedSequence(), runFixedSequence());
});

test('C-13 paso fijo', () => {
  assert.strictEqual(CONFIG.DT, 1 / 60);
  assert.strictEqual(step.length, 2);
});

test('C-14 pureza', () => {
  const s = at({ x: 150, y: 80, vx: 3, vy: -2, angle: 15, fuel: 50 });
  const copy = structuredClone(s);
  step(s, ALL);
  assert.deepStrictEqual(s, copy);
});
