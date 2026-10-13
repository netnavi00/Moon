// Estado de misión de Mensajero Orbital (v4): paquete, estacionamiento, cápsulas y entrega.
// Script clásico: en el navegador queda como MoonMission global (usa MoonPhysics); en Node se carga con require.
// Envuelve el estado de 8 campos de physics.js sin cambiarlo: step nunca regresa de 'landed' a 'flying';
// al estacionar, la misión crea un estado nuevo en reposo. Todo es puro y determinista.
// Sin pickup ni capsules, missionStep es exactamente un step(ship, input, level, n).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./physics.js'));
  else root.MoonMission = factory(root.MoonPhysics);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (physics) {
  'use strict';

  const { CONFIG, createState, step, evaluateLanding, platformAt } = physics;

  const MISSION = Object.freeze({
    CAPSULE_HALF: 4,                              // caja de la cápsula: 8×8
    REST_Y: CONFIG.GROUND_Y - CONFIG.SHIP_HALF,   // y de la nave estacionada sobre una plataforma
  });

  // status: 'flying' mientras dura; 'landed' = nivel ganado; 'crashed' = reinicia (reason dice por qué).
  function createMission(level) {
    return {
      ship: createState(level),
      n: 0,
      cargo: false,
      delivered: false,
      parked: false,
      taken: (level.capsules || []).map(function () { return false; }),
      capsulePoints: 0,
      status: 'flying',
      reason: null,
    };
  }

  // Índices de las cápsulas no tomadas que la caja de la nave toca (caja contra caja, no gira).
  function capsuleHits(ship, capsules, taken) {
    const reach = CONFIG.SHIP_HALF + MISSION.CAPSULE_HALF;
    const hits = [];
    capsules.forEach(function (c, i) {
      if (!taken[i] && Math.abs(ship.x - c.x) <= reach && Math.abs(ship.y - c.y) <= reach) hits.push(i);
    });
    return hits;
  }

  // Nave en reposo sobre la plataforma: enderezada, quieta y lista para despegar con ↑.
  function park(ship) {
    return { ...ship, y: MISSION.REST_Y, vx: 0, vy: 0, angle: 0, status: 'flying', crashReason: null };
  }

  function missionStep(m, input, level) {
    if (m.status !== 'flying') return { ...m, ship: { ...m.ship }, taken: m.taken.slice() };

    const next = { ...m, taken: m.taken.slice(), n: m.n + 1 };

    // Estacionada: sin ↑ (o sin combustible) no se mueve ni gira.
    if (m.parked && !(input.thrust && m.ship.fuel > 0)) {
      next.ship = { ...m.ship };
      return next;
    }

    // Con el paquete a bordo, la carga pesada reduce el empuje.
    const leg = m.cargo && level.cargoThrust !== undefined ? { ...level, thrustFactor: level.cargoThrust } : level;
    let ship = step(m.ship, input, leg, m.n);
    next.parked = false;

    // En misiones hay dos plataformas: el contacto con el suelo se evalúa contra la que está bajo la nave.
    let where = null;
    if (level.pickup && ship.status !== 'flying' && ship.crashReason !== 'out_of_bounds') {
      const a = level.pickup;
      const onA = ship.x >= a.x1 && ship.x <= a.x2;
      where = onA ? 'A' : 'B';
      const r = evaluateLanding(ship, onA ? { x1: a.x1, x2: a.x2, vx: 0 } : platformAt(level, m.n + 1));
      ship = { ...ship, status: r.status, crashReason: r.crashReason };
    }

    // Cápsulas: solo si no chocó. El combustible no pasa del inicial del nivel.
    if (ship.status !== 'crashed' && level.capsules) {
      for (const i of capsuleHits(ship, level.capsules, next.taken)) {
        const c = level.capsules[i];
        next.taken[i] = true;
        ship = { ...ship, fuel: Math.min(level.fuel, ship.fuel + c.fuel) };
        next.capsulePoints += c.points;
      }
    }

    if (ship.status === 'crashed') {
      next.status = 'crashed';
      next.reason = ship.crashReason;
    } else if (ship.status === 'landed') {
      if (!level.pickup) {
        next.status = 'landed';
      } else if (where === 'B' && m.cargo) {
        next.status = 'landed';
        next.delivered = true;
      } else {
        // A sin paquete lo recoge; cualquier otro aterrizaje bueno solo estaciona.
        if (where === 'A' && !m.cargo) next.cargo = true;
        next.parked = true;
        ship = park(ship);
        if (ship.fuel <= 0) {
          next.status = 'crashed';
          next.reason = 'no_fuel';
        }
      }
    }
    next.ship = ship;
    return next;
  }

  return { MISSION, createMission, capsuleHits, missionStep };
});
