// Pruebas de puntaje, guardado y temas (criterios C-57 a C-63 de proyecto/criterios.md).
// Correr desde moon/:  node --test "src/tests/*.test.js"
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const physics = require('../js/physics.js');
const { createState, step, platformAt } = physics;
const { LEVELS } = require('../js/levels.js');
const { SCORE, scoreLanding, campaignTotal } = require('../js/score.js');
const {
  STORAGE_KEY, emptySave, parseSave, recordLanding, loadSave, writeSave, clearSave, resolveStart,
} = require('../js/save.js');

const GIGANTE = LEVELS[3];
const PLATFORM = { x1: 150, x2: 190, vx: 0 };
const LEVEL_90 = { fuel: 90 };
const UP = { thrust: true, left: false, right: false };
const NONE = { thrust: false, left: false, right: false };

function landed(x, fuel) {
  return { x, y: 154, vx: 0, vy: 5, angle: 0, fuel, status: 'landed', crashReason: null };
}

// Almacenamiento falso en memoria; con broken = true cada método lanza.
function fakeStorage(broken = false) {
  const data = new Map();
  const fail = () => { throw new Error('almacenamiento bloqueado'); };
  return {
    data,
    getItem: broken ? fail : (k) => (data.has(k) ? data.get(k) : null),
    setItem: broken ? fail : (k, v) => { data.set(k, String(v)); },
    removeItem: broken ? fail : (k) => { data.delete(k); },
  };
}

test('C-57 scoreLanding', () => {
  assert.deepStrictEqual(SCORE, { PRECISION_MAX: 500, FUEL_MAX: 300, TIME_MAX: 200, STEPS_PER_TIME_POINT: 4 });

  const crashed = { ...landed(170, 90), status: 'crashed', crashReason: 'speed_v' };
  assert.strictEqual(scoreLanding(crashed, LEVEL_90, PLATFORM, 100), null);

  const cases = [
    [170, 90, 0, { precision: 500, fuel: 300, time: 200, total: 1000 }],
    [180, 45, 400, { precision: 250, fuel: 150, time: 100, total: 500 }],
    [150, 0, 800, { precision: 0, fuel: 0, time: 0, total: 0 }],
    [175, 21, 248, { precision: 375, fuel: 70, time: 138, total: 583 }],
  ];
  for (const [x, fuel, steps, expected] of cases) {
    assert.deepStrictEqual(scoreLanding(landed(x, fuel), LEVEL_90, PLATFORM, steps), expected, `x=${x} fuel=${fuel} pasos=${steps}`);
  }

  assert.strictEqual(scoreLanding(landed(170, 90), LEVEL_90, PLATFORM, 1000).time, 0);
  assert.strictEqual(scoreLanding(landed(170, 90), LEVEL_90, PLATFORM, 3).time, 200);
  assert.strictEqual(scoreLanding(landed(170, 90), LEVEL_90, PLATFORM, 4).time, 199);

  const moving = { x1: 140.25, x2: 188.25, vx: -15 };
  assert.strictEqual(scoreLanding(landed(164.25, 45), { fuel: 45 }, moving, 575).precision, 500);

  const s = landed(175, 21);
  const sCopy = structuredClone(s);
  const pCopy = structuredClone(PLATFORM);
  const lCopy = structuredClone(LEVEL_90);
  scoreLanding(s, LEVEL_90, PLATFORM, 248);
  assert.deepStrictEqual(s, sCopy);
  assert.deepStrictEqual(PLATFORM, pCopy);
  assert.deepStrictEqual(LEVEL_90, lCopy);
});

test('C-58 campaignTotal', () => {
  assert.strictEqual(campaignTotal({ luna: 700, marte: 500, zzz: 999 }, LEVELS), 1200);
  assert.strictEqual(campaignTotal({}, LEVELS), 0);
});

test('C-59 parseSave y recordLanding', () => {
  const empty = { unlocked: 1, best: {} };
  assert.deepStrictEqual(emptySave(), empty);
  assert.deepStrictEqual(parseSave(null, LEVELS), empty);
  assert.deepStrictEqual(parseSave('{malo', LEVELS), empty);
  assert.deepStrictEqual(parseSave('42', LEVELS), empty);
  assert.deepStrictEqual(
    parseSave('{"unlocked":4,"best":{"luna":700,"marte":-5,"zzz":3,"tormenta":"x","asteroide":2.5}}', LEVELS),
    { unlocked: 4, best: { luna: 700 } }
  );
  assert.strictEqual(parseSave('{"unlocked":99}', LEVELS).unlocked, 10);
  assert.strictEqual(parseSave('{"unlocked":0}', LEVELS).unlocked, 1);
  assert.strictEqual(parseSave('{"unlocked":2.5}', LEVELS).unlocked, 1);

  const s0 = emptySave();
  const s1 = recordLanding(s0, 1, LEVELS, { total: 700 });
  assert.deepStrictEqual(s1, { unlocked: 2, best: { luna: 700 } });
  assert.deepStrictEqual(s0, empty, 'no modifica el guardado recibido');
  const s2 = recordLanding(s1, 1, LEVELS, { total: 600 });
  assert.deepStrictEqual(s2, { unlocked: 2, best: { luna: 700 } });
  assert.deepStrictEqual(s1, { unlocked: 2, best: { luna: 700 } });
  const s6 = recordLanding({ unlocked: 10, best: {} }, 10, LEVELS, { total: 50 });
  assert.deepStrictEqual(s6, { unlocked: 10, best: { final: 50 } });
  assert.strictEqual(recordLanding({ unlocked: 5, best: {} }, 2, LEVELS, { total: 10 }).unlocked, 5);
});

test('C-60 almacenamiento que falla', () => {
  for (const storage of [null, fakeStorage(true)]) {
    assert.deepStrictEqual(loadSave(storage, LEVELS), emptySave());
    assert.strictEqual(writeSave(storage, { unlocked: 2, best: { luna: 1 } }), false);
    assert.strictEqual(clearSave(storage), false);
  }

  const storage = fakeStorage();
  const save = { unlocked: 3, best: { luna: 700, marte: 450 } };
  assert.strictEqual(writeSave(storage, save), true);
  assert.strictEqual(storage.data.get(STORAGE_KEY), JSON.stringify(save));
  assert.deepStrictEqual(loadSave(storage, LEVELS), save);
  assert.strictEqual(clearSave(storage), true);
  assert.strictEqual(storage.data.has(STORAGE_KEY), false);
  assert.deepStrictEqual(loadSave(storage, LEVELS), emptySave());
});

test('C-61 resolveStart', () => {
  const save = { unlocked: 4, best: {} };
  assert.deepStrictEqual(resolveStart('', save, LEVELS), { level: 4, persist: true, reset: false });
  assert.deepStrictEqual(resolveStart('?nuevo', save, LEVELS), { level: 1, persist: true, reset: true });
  assert.deepStrictEqual(resolveStart('?nivel=2', save, LEVELS), { level: 2, persist: false, reset: false });
  assert.deepStrictEqual(resolveStart('?nivel=11', save, LEVELS), { level: 1, persist: false, reset: false });
  assert.deepStrictEqual(resolveStart('?nivel=abc', save, LEVELS), { level: 1, persist: false, reset: false });
  assert.deepStrictEqual(resolveStart('?nuevo&nivel=3', save, LEVELS), { level: 3, persist: false, reset: true });
});

test('C-62 temas de 16 colores con la nave en 9 a F', () => {
  globalThis.MoonPhysics = physics;
  require('../js/sprites.js');
  const { THEMES, SHIP_COLORS } = globalThis.MoonSprites;

  assert.deepStrictEqual(Object.keys(SHIP_COLORS).sort(), ['9', 'A', 'B', 'C', 'D', 'E', 'F']);
  for (const level of LEVELS) {
    const theme = THEMES[level.theme];
    assert.ok(theme, `falta el tema ${level.theme}`);
    for (const k of Object.keys(theme.colors)) assert.match(k, /^[0-8]$/, `${level.theme}: índice ${k}`);
    const palette = Object.assign({}, theme.colors, SHIP_COLORS);
    assert.ok(Object.keys(palette).length <= 16, `${level.theme}: ${Object.keys(palette).length} colores`);
  }
});

test('C-63 puntaje de la secuencia de Luna gigante', () => {
  let s = createState(GIGANTE);
  let steps = 0;
  while (s.status === 'flying' && steps < 900) {
    steps++;
    s = step(s, steps <= 110 ? NONE : UP, GIGANTE, steps - 1);
  }
  assert.deepStrictEqual(
    scoreLanding(s, GIGANTE, platformAt(GIGANTE, steps), steps),
    { precision: 500, fuel: 70, time: 138, total: 708 }
  );
});
