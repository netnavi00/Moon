// Pruebas de los datos de niveles y la progresión (criterios C-26, C-28, C-36 y C-37 de proyecto/criterios.md).
// Correr desde moon/:  node --test "src/tests/*.test.js"
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { CONFIG, createState } = require('../js/physics.js');
const { LEVELS, nextLevel } = require('../js/levels.js');

const STATE_KEYS = ['angle', 'crashReason', 'fuel', 'status', 'vx', 'vy', 'x', 'y'];

function width(level) {
  return level.platform.x2 - level.platform.x1;
}

// Junta todas las llaves de un objeto, incluidas las anidadas.
function allKeys(obj) {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    keys.push(k);
    if (v && typeof v === 'object') keys.push(...allKeys(v));
  }
  return keys;
}

test('C-26 los niveles cargan con require', () => {
  assert.ok(Array.isArray(LEVELS), 'LEVELS debe ser un arreglo');
  assert.strictEqual(LEVELS.length, 3);
  assert.strictEqual(typeof nextLevel, 'function');
  assert.deepStrictEqual(LEVELS.map((l) => l.id), ['luna', 'marte', 'asteroide']);
  assert.deepStrictEqual(LEVELS.map((l) => l.name), ['Luna', 'Marte', 'Asteroide']);
});

test('C-28 datos de los niveles y estado inicial', () => {
  const [luna, marte, asteroide] = LEVELS;

  // Tabla §1.2.
  assert.deepStrictEqual(
    { id: luna.id, name: luna.name, theme: luna.theme, gravity: luna.gravity, wind: luna.wind, fuel: luna.fuel, start: luna.start, platform: luna.platform },
    { id: 'luna', name: 'Luna', theme: 'luna', gravity: 20, wind: 0, fuel: 100, start: { x: 160, y: 30 }, platform: { x1: 120, x2: 200, speed: 0 } }
  );
  assert.deepStrictEqual(
    { id: marte.id, name: marte.name, theme: marte.theme, gravity: marte.gravity, wind: marte.wind, fuel: marte.fuel, start: marte.start, platform: marte.platform },
    { id: 'marte', name: 'Marte', theme: 'marte', gravity: 20, wind: -4, fuel: 80, start: { x: 180, y: 30 }, platform: { x1: 140, x2: 204, speed: 0 } }
  );
  assert.deepStrictEqual(
    { id: asteroide.id, name: asteroide.name, theme: asteroide.theme, gravity: asteroide.gravity, wind: asteroide.wind, fuel: asteroide.fuel, start: asteroide.start, platform: asteroide.platform },
    { id: 'asteroide', name: 'Asteroide', theme: 'asteroide', gravity: 8, wind: 0, fuel: 45, start: { x: 180, y: 30 }, platform: { x1: 100, x2: 148, speed: 15, minX: 80, maxX: 240 } }
  );

  // La Luna coincide con CONFIG (v1).
  assert.strictEqual(luna.gravity, CONFIG.GRAVITY);
  assert.strictEqual(luna.fuel, CONFIG.FUEL_START);
  assert.strictEqual(luna.start.x, CONFIG.START_X);
  assert.strictEqual(luna.start.y, CONFIG.START_Y);
  assert.strictEqual(luna.platform.x1, CONFIG.PLATFORM_X1);
  assert.strictEqual(luna.platform.x2, CONFIG.PLATFORM_X2);

  assert.deepStrictEqual(createState(luna), createState());

  for (const level of LEVELS) {
    const s = createState(level);
    assert.deepStrictEqual(Object.keys(s).sort(), STATE_KEYS, `campos de ${level.id}`);
    assert.deepStrictEqual(s, {
      x: level.start.x, y: level.start.y, vx: 0, vy: 0, angle: 0,
      fuel: level.fuel, status: 'flying', crashReason: null,
    }, `estado inicial de ${level.id}`);
  }
});

test('C-36 regla de dificultad', () => {
  for (let i = 1; i < LEVELS.length; i++) {
    const prev = LEVELS[i - 1];
    const cur = LEVELS[i];
    assert.ok(cur.fuel <= prev.fuel, `${cur.id}: combustible ${cur.fuel} > ${prev.fuel}`);
    assert.ok(width(cur) <= width(prev), `${cur.id}: ancho ${width(cur)} > ${width(prev)}`);
    assert.ok(cur.fuel < prev.fuel || width(cur) < width(prev), `${cur.id}: ni combustible ni ancho bajan`);
  }

  const marte = LEVELS[1];
  const asteroide = LEVELS[2];
  assert.notStrictEqual(marte.wind, 0, 'Marte debe tener viento');
  assert.ok(asteroide.platform.speed > 0, 'Asteroide debe tener plataforma móvil');

  for (const level of LEVELS) {
    const limits = allKeys(level).filter((k) => /land|limit/i.test(k));
    assert.deepStrictEqual(limits, [], `${level.id} no debe tener límites de aterrizaje propios`);
  }
});

test('C-37 progresión', () => {
  assert.strictEqual(nextLevel(1, 'landed'), 2);
  assert.strictEqual(nextLevel(2, 'landed'), 3);
  assert.strictEqual(nextLevel(3, 'landed'), null);
  assert.strictEqual(nextLevel(1, 'crashed'), 1);
  assert.strictEqual(nextLevel(2, 'crashed'), 2);
  assert.strictEqual(nextLevel(3, 'crashed'), 3);
  assert.throws(() => nextLevel(1, 'flying'));
});
