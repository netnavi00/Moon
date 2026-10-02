// Lógica pura de Mensajero Orbital: estado, paso de física y evaluación de aterrizaje.
// Script clásico: en el navegador queda como MoonPhysics global; en Node se carga con require.
// Paso fijo de CONFIG.DT segundos; step no recibe tiempo y no modifica el estado que recibe.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MoonPhysics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONFIG = Object.freeze({
    DT: 1 / 60,
    WIDTH: 320,
    HEIGHT: 180,
    GRAVITY: 20,          // px/s², hacia abajo
    THRUST: 50,           // px/s², en dirección de la punta
    ROT_SPEED: 90,        // °/s
    FUEL_START: 100,
    FUEL_RATE: 20,        // unidades/s
    SHIP_HALF: 6,         // caja de colisión 12×12, no gira con la nave
    START_X: 160,
    START_Y: 30,
    GROUND_Y: 160,
    PLATFORM_X1: 120,
    PLATFORM_X2: 200,
    MAX_LAND_VY: 15,
    MAX_LAND_VX: 10,
    MAX_LAND_ANGLE: 10,
  });

  const DEG = Math.PI / 180;

  function createState() {
    return {
      x: CONFIG.START_X,
      y: CONFIG.START_Y,
      vx: 0,
      vy: 0,
      angle: 0,
      fuel: CONFIG.FUEL_START,
      status: 'flying',
      crashReason: null,
    };
  }

  // Normaliza a (-180, 180].
  function normalizeAngle(a) {
    let n = ((a % 360) + 360) % 360;
    if (n > 180) n -= 360;
    return n;
  }

  function evaluateLanding(state) {
    if (state.x < CONFIG.PLATFORM_X1 || state.x > CONFIG.PLATFORM_X2) {
      return { status: 'crashed', crashReason: 'off_platform' };
    }
    if (Math.abs(state.vy) > CONFIG.MAX_LAND_VY) return { status: 'crashed', crashReason: 'speed_v' };
    if (Math.abs(state.vx) > CONFIG.MAX_LAND_VX) return { status: 'crashed', crashReason: 'speed_h' };
    if (Math.abs(state.angle) > CONFIG.MAX_LAND_ANGLE) return { status: 'crashed', crashReason: 'angle' };
    return { status: 'landed', crashReason: null };
  }

  function step(state, input) {
    // 1. Partida terminada: no cambia nada.
    if (state.status !== 'flying') return { ...state };

    const dt = CONFIG.DT;
    const s = { ...state };

    // 2. Giro (ambas teclas se anulan).
    const turn = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    s.angle = normalizeAngle(s.angle + turn * CONFIG.ROT_SPEED * dt);

    // 3. Empuje en dirección de la punta, mientras haya combustible.
    let ax = 0;
    let ay = 0;
    if (input.thrust && s.fuel > 0) {
      ax += Math.sin(s.angle * DEG) * CONFIG.THRUST;
      ay += -Math.cos(s.angle * DEG) * CONFIG.THRUST;
      s.fuel = Math.max(0, s.fuel - CONFIG.FUEL_RATE * dt);
    }

    // 4. Gravedad.
    ay += CONFIG.GRAVITY;

    // 5–6. Euler semi-implícito: velocidad y luego posición con la velocidad nueva.
    s.vx += ax * dt;
    s.vy += ay * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    // 7. Colisiones: primero bordes de pantalla, luego suelo.
    const h = CONFIG.SHIP_HALF;
    if (s.x - h < 0 || s.x + h > CONFIG.WIDTH || s.y - h < 0) {
      s.status = 'crashed';
      s.crashReason = 'out_of_bounds';
      return s;
    }
    if (s.y + h >= CONFIG.GROUND_Y) {
      const result = evaluateLanding(s);
      s.status = result.status;
      s.crashReason = result.crashReason;
    }
    return s;
  }

  return { CONFIG, createState, step, evaluateLanding };
});
