// Niveles de Mensajero Orbital como datos, más la regla de progresión.
// Script clásico: en el navegador queda como MoonLevels global; en Node se carga con require.
// No depende de physics.js: los límites de aterrizaje, empuje y giro viven solo en CONFIG.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MoonLevels = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // gravity y wind en px/s² (wind positivo = hacia la derecha); fuel en unidades.
  // platform: x1–x2 es la posición inicial; con speed > 0 va y viene entre minX y maxX (px/s),
  // empezando hacia la derecha. theme es la llave de la paleta en sprites.js.
  // Campos opcionales (mecánicas de v3, con el valor de la Luna si faltan): fuelRate, gusts, start.vx/vy.
  // Campos opcionales de v4: pickup { x1, x2 } (misión), cargoThrust (factor del empuje con el paquete, 1 si falta)
  // y capsules [{ x, y, fuel, points }] ([] si falta).
  const LEVELS = Object.freeze([
    Object.freeze({
      id: 'luna',
      name: 'Luna',
      theme: 'luna',
      gravity: 20,
      wind: 0,
      fuel: 100,
      start: Object.freeze({ x: 160, y: 30 }),
      platform: Object.freeze({ x1: 120, x2: 200, speed: 0 }),
    }),
    Object.freeze({
      id: 'marte',
      name: 'Marte',
      theme: 'marte',
      gravity: 20,
      wind: -4,
      fuel: 80,
      start: Object.freeze({ x: 180, y: 30 }),
      platform: Object.freeze({ x1: 140, x2: 204, speed: 0 }),
    }),
    Object.freeze({
      id: 'asteroide',
      name: 'Asteroide',
      theme: 'asteroide',
      gravity: 8,
      wind: 0,
      fuel: 45,
      start: Object.freeze({ x: 180, y: 30 }),
      platform: Object.freeze({ x1: 100, x2: 148, speed: 15, minX: 80, maxX: 240 }),
    }),
    // Mecánica: consumo propio (fuelRate, unidades/s; sin él, CONFIG.FUEL_RATE).
    Object.freeze({
      id: 'gigante',
      name: 'Luna gigante',
      theme: 'gigante',
      gravity: 30,
      wind: 0,
      fuel: 90,
      fuelRate: 30,
      start: Object.freeze({ x: 170, y: 30 }),
      platform: Object.freeze({ x1: 150, x2: 190, speed: 0 }),
    }),
    // Mecánica: ráfagas. Fases { steps, wind } que se repiten y se suman a wind (ver windAt en physics.js).
    Object.freeze({
      id: 'tormenta',
      name: 'Tormenta',
      theme: 'tormenta',
      gravity: 20,
      wind: 0,
      fuel: 50,
      gusts: Object.freeze([
        Object.freeze({ steps: 60, wind: 15 }),
        Object.freeze({ steps: 120, wind: -15 }),
        Object.freeze({ steps: 60, wind: 15 }),
      ]),
      start: Object.freeze({ x: 152, y: 30 }),
      platform: Object.freeze({ x1: 136, x2: 184, speed: 0 }),
    }),
    // Mecánica: velocidad inicial (start.vx, start.vy; sin ellas, 0). Sin gravedad.
    Object.freeze({
      id: 'aproximacion',
      name: 'Aproximación',
      theme: 'aproximacion',
      gravity: 0,
      wind: 0,
      fuel: 30,
      start: Object.freeze({ x: 24, y: 24, vx: 32, vy: 28 }),
      platform: Object.freeze({ x1: 124, x2: 164, speed: 0 }),
    }),
    // Mecánica: misión de entrega. pickup = plataforma de recogida A; platform = la de entrega B (ver mission.js).
    Object.freeze({
      id: 'entrega',
      name: 'Primera entrega',
      theme: 'entrega',
      gravity: 20,
      wind: 0,
      fuel: 110,
      start: Object.freeze({ x: 70, y: 30 }),
      pickup: Object.freeze({ x1: 40, x2: 100 }),
      platform: Object.freeze({ x1: 160, x2: 220, speed: 0 }),
    }),
    // Mecánicas: carga pesada (cargoThrust = factor del empuje con el paquete a bordo) y una cápsula a medio
    // camino (excepción a "una mecánica nueva por nivel", aprobada por Nanni). B queda a la izquierda.
    Object.freeze({
      id: 'carga',
      name: 'Carga pesada',
      theme: 'carga',
      gravity: 20,
      wind: 0,
      fuel: 150,
      start: Object.freeze({ x: 240, y: 30 }),
      pickup: Object.freeze({ x1: 210, x2: 270 }),
      platform: Object.freeze({ x1: 90, x2: 150, speed: 0 }),
      cargoThrust: 0.6,
      capsules: Object.freeze([
        Object.freeze({ x: 180, y: 125, fuel: 30, points: 50 }),
      ]),
    }),
    // Mecánica: cápsulas { x, y, fuel, points }. Sin las dos de la ruta no alcanza el combustible.
    Object.freeze({
      id: 'capsulas',
      name: 'Cápsulas',
      theme: 'capsulas',
      gravity: 20,
      wind: 0,
      fuel: 80,
      start: Object.freeze({ x: 60, y: 30 }),
      pickup: Object.freeze({ x1: 30, x2: 90 }),
      platform: Object.freeze({ x1: 210, x2: 260, speed: 0 }),
      capsules: Object.freeze([
        Object.freeze({ x: 110, y: 112, fuel: 25, points: 50 }),
        Object.freeze({ x: 170, y: 112, fuel: 25, points: 50 }),
        Object.freeze({ x: 140, y: 60, fuel: 0, points: 150 }),
      ]),
    }),
    // Final: misión con carga pesada y cápsulas; no estrena mecánica.
    Object.freeze({
      id: 'final',
      name: 'Gran entrega',
      theme: 'final',
      gravity: 22,
      wind: 0,
      fuel: 110,
      start: Object.freeze({ x: 265, y: 30 }),
      pickup: Object.freeze({ x1: 240, x2: 290 }),
      platform: Object.freeze({ x1: 50, x2: 94, speed: 0 }),
      cargoThrust: 0.7,
      capsules: Object.freeze([
        Object.freeze({ x: 200, y: 115, fuel: 30, points: 50 }),
        Object.freeze({ x: 130, y: 115, fuel: 30, points: 50 }),
        Object.freeze({ x: 165, y: 70, fuel: 10, points: 100 }),
      ]),
    }),
  ]);

  // n va de 1 a LEVELS.length. Aterrizar avanza (null = fin de campaña); chocar repite.
  function nextLevel(n, status) {
    if (status === 'landed') return n === LEVELS.length ? null : n + 1;
    if (status === 'crashed') return n;
    throw new Error('nextLevel: status debe ser "landed" o "crashed", llegó ' + status);
  }

  return { LEVELS, nextLevel };
});
