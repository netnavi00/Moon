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
  ]);

  // n va de 1 a LEVELS.length. Aterrizar avanza (null = fin de campaña); chocar repite.
  function nextLevel(n, status) {
    if (status === 'landed') return n === LEVELS.length ? null : n + 1;
    if (status === 'crashed') return n;
    throw new Error('nextLevel: status debe ser "landed" o "crashed", llegó ' + status);
  }

  return { LEVELS, nextLevel };
});
