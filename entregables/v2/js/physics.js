// Lógica pura de Mensajero Orbital: estado, paso de física y evaluación de aterrizaje.
// Script clásico: en el navegador queda como MoonPhysics global; en Node se carga con require.
// Paso fijo de CONFIG.DT segundos; step no recibe tiempo y no modifica el estado que recibe.
// El nivel y el número de paso son argumentos opcionales: sin ellos, todo se comporta como la Luna de v1.
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

  // Nivel por defecto: la Luna de v1, armada desde CONFIG (mismos datos que LEVELS[0] en levels.js).
  const DEFAULT_LEVEL = Object.freeze({
    gravity: CONFIG.GRAVITY,
    wind: 0,
    fuel: CONFIG.FUEL_START,
    start: Object.freeze({ x: CONFIG.START_X, y: CONFIG.START_Y }),
    platform: Object.freeze({ x1: CONFIG.PLATFORM_X1, x2: CONFIG.PLATFORM_X2, speed: 0 }),
  });

  const DEFAULT_PLATFORM = Object.freeze({ x1: CONFIG.PLATFORM_X1, x2: CONFIG.PLATFORM_X2, vx: 0 });

  function createState(level = DEFAULT_LEVEL) {
    return {
      x: level.start.x,
      y: level.start.y,
      vx: 0,
      vy: 0,
      angle: 0,
      fuel: level.fuel,
      status: 'flying',
      crashReason: null,
    };
  }

  // Plataforma después de t pasos: { x1, x2, vx }. La móvil va y viene entre minX y maxX
  // (onda triangular en forma cerrada, sin acumular error), empezando hacia la derecha.
  function platformAt(level, t) {
    const p = level.platform;
    if (p.speed === 0) return { x1: p.x1, x2: p.x2, vx: 0 };
    const w = p.x2 - p.x1;
    const travel = p.maxX - p.minX - w;
    const u = (p.x1 - p.minX + p.speed * t * CONFIG.DT) % (2 * travel);
    const x1 = u <= travel ? p.minX + u : p.minX + 2 * travel - u;
    return { x1: x1, x2: x1 + w, vx: u <= travel ? p.speed : -p.speed };
  }

  // Normaliza a (-180, 180].
  function normalizeAngle(a) {
    let n = ((a % 360) + 360) % 360;
    if (n > 180) n -= 360;
    return n;
  }

  // La velocidad horizontal se mide relativa a la plataforma.
  function evaluateLanding(state, platform = DEFAULT_PLATFORM) {
    if (state.x < platform.x1 || state.x > platform.x2) {
      return { status: 'crashed', crashReason: 'off_platform' };
    }
    if (Math.abs(state.vy) > CONFIG.MAX_LAND_VY) return { status: 'crashed', crashReason: 'speed_v' };
    if (Math.abs(state.vx - platform.vx) > CONFIG.MAX_LAND_VX) return { status: 'crashed', crashReason: 'speed_h' };
    if (Math.abs(state.angle) > CONFIG.MAX_LAND_ANGLE) return { status: 'crashed', crashReason: 'angle' };
    return { status: 'landed', crashReason: null };
  }

  // n = pasos dados antes de este (0 en el primero); solo lo usa la plataforma móvil.
  function step(state, input, level = DEFAULT_LEVEL, n = 0) {
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

    // 4. Viento y gravedad del nivel.
    ax += level.wind;
    ay += level.gravity;

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
      const result = evaluateLanding(s, platformAt(level, n + 1));
      s.status = result.status;
      s.crashReason = result.crashReason;
    }
    return s;
  }

  return { CONFIG, createState, step, evaluateLanding, platformAt };
});
