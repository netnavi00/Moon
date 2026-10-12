// Puntaje de Mensajero Orbital: funciones puras, sin depender de physics.js.
// Script clásico: en el navegador queda como MoonScore global; en Node se carga con require.
// Puntaje de un aterrizaje = precisión + combustible sobrante + tiempo (en pasos de física). Máximo 1000.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MoonScore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SCORE = Object.freeze({
    PRECISION_MAX: 500,       // en el centro de la plataforma; 0 en la orilla
    FUEL_MAX: 300,            // con todo el combustible inicial del nivel
    TIME_MAX: 200,            // en el paso 0; baja 1 punto cada STEPS_PER_TIME_POINT pasos
    STEPS_PER_TIME_POINT: 4,
  });

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  // platform = { x1, x2 } en el paso del contacto; steps = pasos del intento, incluido el del contacto.
  // Chocar no da puntos: regresa null.
  function scoreLanding(state, level, platform, steps) {
    if (state.status !== 'landed') return null;
    const half = (platform.x2 - platform.x1) / 2;
    const center = (platform.x1 + platform.x2) / 2;
    const precision = clamp(Math.round(SCORE.PRECISION_MAX * (1 - Math.abs(state.x - center) / half)), 0, SCORE.PRECISION_MAX);
    const fuel = clamp(Math.round(SCORE.FUEL_MAX * state.fuel / level.fuel), 0, SCORE.FUEL_MAX);
    const time = Math.max(0, SCORE.TIME_MAX - Math.floor(steps / SCORE.STEPS_PER_TIME_POINT));
    return { precision, fuel, time, total: precision + fuel + time };
  }

  // Total de campaña = suma del mejor puntaje de cada nivel (best = { [id]: puntaje }).
  function campaignTotal(best, levels) {
    let total = 0;
    for (const level of levels) total += best[level.id] || 0;
    return total;
  }

  return { SCORE, scoreLanding, campaignTotal };
});
