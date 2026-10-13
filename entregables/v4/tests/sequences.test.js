// Secuencias de referencia de v4 (criterios C-81 a C-88 de proyecto/criterios.md).
// Nivel 7: calculada a mano (criterios §2.4). Niveles 8 a 10: listas fijas GENERADAS por el piloto
// automático (src/tests/autopilot.js) y copiadas aquí; estas pruebas solo las repiten, no corren el piloto.
// Correr desde moon/:  node --test "src/tests/*.test.js"
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { LEVELS } = require('../js/levels.js');
const { createMission, missionStep } = require('../js/mission.js');
const { scoreRun } = require('../js/score.js');
const { platformAt, step } = require('../js/physics.js');

const ENTREGA = LEVELS[6];
const MAX_STEPS = 2000;

function near(actual, expected, eps, label = '') {
  assert.ok(Math.abs(actual - expected) <= eps, `${label} esperado ${expected} ± ${eps}, se obtuvo ${actual}`);
}

// 'U' = ↑, 'L' = ←, 'R' = →; se pueden combinar ('UL').
function keys(s) {
  return { thrust: s.includes('U'), left: s.includes('L'), right: s.includes('R') };
}

// Repite una lista fija [[pasos, teclas], ...] con missionStep hasta que la misión termina.
// Regresa la misión final, los pasos dados y el paso en que se recogió el paquete.
function replay(level, list) {
  let m = createMission(level);
  let pickedAt = null;
  for (const [count, k] of list) {
    for (let i = 0; i < count && m.status === 'flying' && m.n < MAX_STEPS; i++) {
      m = missionStep(m, keys(k), level);
      if (m.cargo && pickedAt === null) pickedAt = m.n;
    }
  }
  return { m, pickedAt };
}

// Nivel 7, calculada a mano (criterios §2.4).
const SEQ_7 = [[164, ''], [94, 'U'], [3, ''], [17, 'U'], [30, 'R'], [71, 'U'], [41, ''], [60, 'L'], [71, 'U'], [30, 'R'], [2, '']];

// Tabla a mano: fin de cada fase [x, y, vx, vy, ángulo, combustible]. En la fila de A la nave ya está
// estacionada (y 154, velocidad y ángulo 0); la tabla a mano da el contacto en y 154.01944, vy 8.66667.
const HAND_7 = [
  [70, 105.16667, 0, 54.66667, 0, 110],
  [70, 153.60278, 0, 7.66667, 0, 78.66667],
  [70, 154, 0, 0, 0, 78.66667],
  [70, 152.725, 0, -8.5, 0, 73],
  [70, 151.05833, 0, 1.5, 45, 73],
  [95.10229, 141.93104, 41.83715, -16.67048, 45, 49.33333],
  [123.69101, 135.32288, 41.83715, -3.00382, 45, 49.33333],
  [165.52816, 142.48573, 41.83715, 16.99618, -45, 49.33333],
  [189.93317, 151.69559, 0, -1.1743, -45, 25.66667],
  [189.93317, 153.69177, 0, 8.8257, 0, 25.66667],
  [189.93317, 154.00262, 0, 9.49236, 0, 25.66667],
];

test('C-87 datos de los niveles 8 a 10', () => {
  assert.strictEqual(LEVELS.length, 10);
  assert.deepStrictEqual(LEVELS.map((l) => l.id), [
    'luna', 'marte', 'asteroide', 'gigante', 'tormenta', 'aproximacion', 'entrega', 'carga', 'capsulas', 'final',
  ]);
  assert.deepStrictEqual(LEVELS[7], {
    id: 'carga', name: 'Carga pesada', theme: 'carga',
    gravity: 20, wind: 0, fuel: 150,
    start: { x: 240, y: 30 },
    pickup: { x1: 210, x2: 270 },
    platform: { x1: 90, x2: 150, speed: 0 },
    cargoThrust: 0.6,
    capsules: [{ x: 180, y: 125, fuel: 30, points: 50 }],
  });
  assert.deepStrictEqual(LEVELS[8], {
    id: 'capsulas', name: 'Cápsulas', theme: 'capsulas',
    gravity: 20, wind: 0, fuel: 80,
    start: { x: 60, y: 30 },
    pickup: { x1: 30, x2: 90 },
    platform: { x1: 210, x2: 260, speed: 0 },
    capsules: [
      { x: 110, y: 112, fuel: 25, points: 50 },
      { x: 170, y: 112, fuel: 25, points: 50 },
      { x: 140, y: 60, fuel: 0, points: 150 },
    ],
  });
  assert.deepStrictEqual(LEVELS[9], {
    id: 'final', name: 'Gran entrega', theme: 'final',
    gravity: 22, wind: 0, fuel: 110,
    start: { x: 265, y: 30 },
    pickup: { x1: 240, x2: 290 },
    platform: { x1: 50, x2: 94, speed: 0 },
    cargoThrust: 0.7,
    capsules: [
      { x: 200, y: 115, fuel: 30, points: 50 },
      { x: 130, y: 115, fuel: 30, points: 50 },
      { x: 165, y: 70, fuel: 10, points: 100 },
    ],
  });
});

test('C-81 secuencia a mano del nivel 7', () => {
  const { m, pickedAt } = replay(ENTREGA, SEQ_7);
  assert.strictEqual(m.status, 'landed', `reason=${m.reason}, pasos=${m.n}`);
  assert.strictEqual(m.delivered, true);
  assert.strictEqual(pickedAt, 261);
  assert.strictEqual(m.n, 583);
  near(m.ship.x, 189.93317, 0.001, 'x');
  near(m.ship.vy, 9.49236, 0.001, 'vy');
  near(m.ship.vx, 0, 1e-9, 'vx');
  near(m.ship.fuel, 25.66667, 0.001, 'fuel');
  assert.ok(m.ship.fuel >= 10, `margen ${m.ship.fuel}`);
  assert.deepStrictEqual(scoreRun(m, ENTREGA, platformAt(ENTREGA, m.n)), {
    delivery: 400, precision: 200, fuel: 47, time: 128, capsules: 0, total: 775,
  });

  // Contacto con A (fila "toca A" de la tabla a mano): la misión estaciona en ese mismo paso, así que el
  // contacto se mira con step sobre el estado del paso 260 (sin teclas, igual que en la secuencia).
  const before = replay(ENTREGA, [[164, ''], [94, 'U'], [2, '']]).m;
  assert.strictEqual(before.n, 260);
  assert.strictEqual(before.cargo, false);
  const touch = step(before.ship, keys(''), ENTREGA, 260);
  near(touch.y, 154.01944, 1e-5, 'y al tocar A');
  near(touch.vy, 8.66667, 1e-5, 'vy al tocar A');
  near(touch.x, 70, 1e-9, 'x al tocar A');
});

test('C-82 el piloto reproduce la tabla a mano del nivel 7', () => {
  const autopilot = require('./autopilot.js');
  const trace = autopilot.simulate(ENTREGA, SEQ_7).phases;
  assert.strictEqual(trace.length, HAND_7.length);
  trace.forEach((s, i) => {
    const [x, y, vx, vy, angle, fuel] = HAND_7[i];
    near(s.x, x, 1e-5, `fase ${i + 1} x`);
    near(s.y, y, 1e-5, `fase ${i + 1} y`);
    near(s.vx, vx, 1e-5, `fase ${i + 1} vx`);
    near(s.vy, vy, 1e-5, `fase ${i + 1} vy`);
    near(s.angle, angle, 1e-9, `fase ${i + 1} ángulo`);
    near(s.fuel, fuel, 1e-5, `fase ${i + 1} fuel`);
  });
});

// Listas GENERADAS por el piloto automático (src/tests/autopilot.js) el 2026-10-11 y copiadas aquí fijas
// (proyecto/decisiones-autonomas.md, D-09). Para regenerarlas: node src/tests/autopilot.js <nivel> '<opciones>'
// con las opciones de proyecto/criterios.md §2.5.
const GENERATED = [
  {
    id: 'C-83', level: 8,
    // Regenerada el 2026-10-11 tras agregar la cápsula del nivel 8 (D-14).
    list: [[164, ''], [93, 'U'], [4, ''], [40, 'U'], [20, 'L'], [122, 'U'], [35, ''], [40, 'R'], [122, 'U'], [20, 'L'], [2, '']],
    pickedAt: 261, steps: 662, x: 139.858333, vy: 8.011567, fuel: 54.333333, taken: [true], minFuel: 45,
    score: { delivery: 400, precision: 68, fuel: 72, time: 118, capsules: 50, total: 708 },
  },
  {
    id: 'C-84', level: 9,
    list: [[164, ''], [93, 'U'], [4, ''], [25, 'U'], [30, 'R'], [78, 'U'], [76, ''], [60, 'L'], [78, 'U'], [30, 'R'], [7, 'U'], [1, '']],
    pickedAt: 261, steps: 646, x: 223.930922, vy: 9.742785, fuel: 36.333333, taken: [true, true, false],
    score: { delivery: 400, precision: 111, fuel: 91, time: 120, capsules: 100, total: 822 },
  },
  {
    id: 'C-85', level: 10,
    list: [[151, ''], [102, 'U'], [5, ''], [33, 'U'], [20, 'L'], [146, 'U'], [70, ''], [40, 'R'], [146, 'U'], [20, 'L'], [7, '']],
    pickedAt: 258, steps: 740, x: 83.311111, vy: 9.97034, fuel: 27.666667, taken: [true, true, false],
    score: { delivery: 400, precision: 97, fuel: 50, time: 108, capsules: 100, total: 755 },
  },
];

for (const g of GENERATED) {
  const level = LEVELS[g.level - 1];
  test(`${g.id} secuencia generada del nivel ${g.level} (${level.name})`, () => {
    const { m, pickedAt } = replay(level, g.list);
    assert.strictEqual(m.status, 'landed', `reason=${m.reason}, pasos=${m.n}`);
    assert.strictEqual(m.delivered, true);
    assert.strictEqual(pickedAt, g.pickedAt);
    assert.strictEqual(m.n, g.steps);
    near(m.ship.x, g.x, 1e-6, 'x');
    near(m.ship.vy, g.vy, 1e-6, 'vy');
    near(m.ship.vx, 0, 1e-9, 'vx');
    near(m.ship.fuel, g.fuel, 1e-6, 'fuel');
    // Margen: 10 en general; en el nivel 8, el 30 % del combustible inicial (feedback de Nanni, D-14).
    assert.ok(m.ship.fuel >= (g.minFuel ?? 10), `margen ${m.ship.fuel}`);
    assert.deepStrictEqual(m.taken, g.taken);
    assert.deepStrictEqual(scoreRun(m, level, platformAt(level, m.n)), g.score);
  });
}

// Huellas sha256 de JSON.stringify tomadas el 2026-10-11, antes del cambio del nivel 8 (D-14).
test('C-90 solo cambia el nivel 8: los demás niveles y sus secuencias quedan iguales', () => {
  const crypto = require('node:crypto');
  const sha = (x) => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
  const LEVEL_SHA = {
    luna: '4ffcd5fd6165776d22a29eeb346f3be87173e68bbc418a54e08e69340a5d046a',
    marte: '2c0550cba8feb8b8363e6483311c1ca0fb990ad4e1efad631a6021d7a298b0ae',
    asteroide: 'b6666fd544bd12c1e9aad04feb10e12cbb2775956f38a8216d614fc8e61ac6e2',
    gigante: 'a790642937f63b8f3e92aa15a0c26d4685836f8394f0abbf96171469aa4357e0',
    tormenta: '0c5997d3e7180783affcc2c6aaffabd5db6a1dab00a5a8d25784a3a95517b129',
    aproximacion: '52ba118b4c0273d5dbd3c8f01254e6e9c331efb2b4f8cc30e4edfa29ba275040',
    entrega: 'c6ed255fb8692718f5a88224053e66086b2e56b4f598ed7b76db1fb1e0d15fdc',
    capsulas: 'ca039fc33b6e522a45db7d53b60f9a7d1e83453182f5fbd747be620383d70401',
    final: 'b781b80b60a3ca174b11629c45630d635c966bea4f07e1c5934ce0f9ef0a6c86',
  };
  for (const level of LEVELS) {
    if (level.id === 'carga') continue;
    assert.strictEqual(sha(level), LEVEL_SHA[level.id], `datos de ${level.id}`);
  }
  assert.strictEqual(sha(SEQ_7), '04c1a0e27bb5d9e01b1a86e6ce93ae79ab25aa770ea1591cf753f58142540414', 'secuencia 7');
  const byLevel = Object.fromEntries(GENERATED.map((g) => [g.level, g.list]));
  assert.strictEqual(sha(byLevel[9]), 'a27a12bc52314bdc2aaf0cfbfee1d84cde732f87d4e06c198b1ff62157fc18d5', 'secuencia 9');
  assert.strictEqual(sha(byLevel[10]), '446fcedc3f705797cd0972d52957891265bc5f22fa1861e81cb40ae3ba278344', 'secuencia 10');
});

test('C-88 temas de 10 mundos y sprites de paquete y cápsulas', () => {
  globalThis.MoonPhysics = require('../js/physics.js');
  require('../js/sprites.js');
  const { THEMES, SHIP_COLORS, SPRITES } = globalThis.MoonSprites;
  assert.deepStrictEqual(Object.keys(SHIP_COLORS).sort(), ['9', 'A', 'B', 'C', 'D', 'E', 'F']);
  for (const level of LEVELS) {
    const theme = THEMES[level.theme];
    assert.ok(theme, `falta el tema ${level.theme}`);
    for (const k of Object.keys(theme.colors)) assert.match(k, /^[0-8]$/, `${level.theme}: índice ${k}`);
    assert.ok(Object.keys({ ...theme.colors, ...SHIP_COLORS }).length <= 16, `${level.theme}: más de 16 colores`);
  }
  assert.deepStrictEqual(Object.keys(SPRITES).sort(), ['CAPSULE_BOTH', 'CAPSULE_FUEL', 'CAPSULE_POINTS', 'PACKAGE']);
  for (const [name, rows] of Object.entries(SPRITES)) {
    for (const row of rows) assert.match(row, /^[.9A-F]+$/, `${name}: ${row}`);
    assert.ok(rows.every((r) => r.length === rows[0].length), `${name}: filas parejas`);
  }
  // La cápsula mide 2·CAPSULE_HALF, igual que su caja de contacto.
  const { MISSION } = require('../js/mission.js');
  for (const name of ['CAPSULE_BOTH', 'CAPSULE_FUEL', 'CAPSULE_POINTS']) {
    assert.strictEqual(SPRITES[name].length, 2 * MISSION.CAPSULE_HALF, `${name} alto`);
    assert.strictEqual(SPRITES[name][0].length, 2 * MISSION.CAPSULE_HALF, `${name} ancho`);
  }
});

test('C-86 determinismo de las secuencias de 7 a 10', () => {
  assert.deepStrictEqual(replay(ENTREGA, SEQ_7), replay(ENTREGA, SEQ_7));
  for (const g of GENERATED) {
    const level = LEVELS[g.level - 1];
    assert.deepStrictEqual(replay(level, g.list), replay(level, g.list), `nivel ${g.level}`);
  }
});
