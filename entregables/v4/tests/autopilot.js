// Piloto automático de Mensajero Orbital (v4). Vive solo en src/tests/ y NUNCA lo carga el juego.
// Sirve para generar las secuencias de referencia de los niveles 8 a 10 (las pruebas guardan las listas
// fijas que genera; no corren el piloto). Se valida contra la secuencia a mano del nivel 7 (C-82).
// Un plan es una lista de fases [pasos, teclas] con teclas '', 'U' (↑), 'L' (←), 'R' (→) o combinaciones.
//
// Uso para generar:  node src/tests/autopilot.js <número de nivel> ['{"opciones": ...}']
'use strict';

const { LEVELS } = require('../js/levels.js');
const { createMission, missionStep } = require('../js/mission.js');

const MAX_STEPS = 2000;

function keys(s) {
  return { thrust: s.includes('U'), left: s.includes('L'), right: s.includes('R') };
}

// Lista plana de entradas, una por paso.
function expand(plan) {
  const inputs = [];
  for (const [count, k] of plan) for (let i = 0; i < count; i++) inputs.push(keys(k));
  return inputs;
}

// Corre el plan con missionStep. phases = estado de la nave al final de cada fase (o donde terminó la misión).
function simulate(level, plan) {
  let m = createMission(level);
  let pickedAt = null;
  const phases = [];
  for (const [count, k] of plan) {
    const input = keys(k);
    for (let i = 0; i < count && m.status === 'flying' && m.n < MAX_STEPS; i++) {
      m = missionStep(m, input, level);
      if (m.cargo && pickedAt === null) pickedAt = m.n;
    }
    phases.push({ ...m.ship });
  }
  return { mission: m, phases, pickedAt };
}

// Avanza sin teclas hasta que la misión termina, se estaciona o pasan `limit` pasos. Regresa [misión, pasos].
function coast(m, level, limit) {
  const none = keys('');
  let k = 0;
  while (m.status === 'flying' && !m.parked && k < limit) {
    m = missionStep(m, none, level);
    k++;
  }
  return [m, k];
}

// Mantiene la entrada `count` pasos. Si la nave se estaciona a media fase (tocó una plataforma y el ↑ siguiente
// la vuelve a despegar), marca la misión con bounced: el piloto descarta esos planes de rebote.
function hold(m, input, level, count) {
  for (let i = 0; i < count && m.status === 'flying'; i++) {
    m = missionStep(m, input, level);
    if (m.parked && !m.bounced) m = { ...m, bounced: true };
  }
  return m;
}

function range([min, max, inc = 1]) {
  const out = [];
  for (let v = min; v <= max; v += inc) out.push(v);
  return out;
}

// Mejor = más combustible al final; empate: menos pasos.
function better(a, b) {
  if (!b) return true;
  if (Math.abs(a.fuel - b.fuel) > 1e-9) return a.fuel > b.fuel;
  return a.steps < b.steps;
}

const DEFAULTS = {
  fall: [100, 200, 1],      // tramo 1: pasos sin teclas
  burn: [40, 140, 1],       // tramo 1: pasos con ↑
  lift: [10, 40, 1],        // salto: ↑ para despegar
  turn: 30,                 // pasos de giro (30 = 45°)
  dir: 1,                   // 1 = B a la derecha de A; -1 = a la izquierda
  push: [40, 120, 1],       // ↑ inclinado para acelerar (y luego el mismo número para frenar)
  drift: [0, 120, 1],       // deriva entre acelerar y voltear
  flare: [0, 20, 1],        // ↑ después de enderezar, antes de caer a B
  maxVy: 10,                // vy máxima en cada contacto
  edge: 10,                 // distancia mínima a las orillas de B al tocar (px)
  minFuel: 10,              // margen de combustible
  required: [],             // índices de cápsulas que hay que recoger
};

// Busca el mejor plan con la plantilla: [caer, ↑, caer hasta A] + [↑, giro, ↑, deriva, giro contrario, ↑, enderezar, ↑, caer hasta B].
function search(level, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const none = keys('');
  const up = keys('U');
  const toward = o.dir > 0 ? 'R' : 'L';
  const back = o.dir > 0 ? 'L' : 'R';

  // Tramo 1: aterrizar en A con vy ≤ maxVy.
  let leg1 = null;
  for (const f of range(o.fall)) {
    const m0 = hold(createMission(level), none, level, f);
    if (m0.status !== 'flying') continue;
    for (const k of range(o.burn)) {
      const m1 = hold(m0, up, level, k);
      if (m1.status !== 'flying' || m1.parked || m1.bounced) continue;
      const [m2, c] = coast(m1, level, 600);
      // El contacto con A: la nave quedó estacionada con el paquete. La vy del contacto se lee del paso anterior.
      if (!m2.cargo || m2.status !== 'flying') continue;
      const vyAtTouch = touchVy(m1, level, c);
      if (vyAtTouch > o.maxVy) continue;
      const cand = { f, k, c, m: m2, fuel: m2.ship.fuel, steps: m2.n };
      if (better(cand, leg1)) leg1 = cand;
    }
  }
  if (!leg1) return null;

  // Salto de A a B.
  let best = null;
  const R = o.turn;
  for (const u of range(o.lift)) {
    const mu = hold(leg1.m, up, level, u);
    const mr = hold(mu, keys(toward), level, R);
    if (mr.status !== 'flying' || mr.parked) continue;
    for (const a of range(o.push)) {
      const ma = hold(mr, up, level, a);
      if (ma.status !== 'flying' || ma.parked) continue;
      // La deriva crece en orden: se avanza desde la anterior en lugar de repetir desde el principio.
      let md = ma;
      let done = 0;
      for (const d of range(o.drift)) {
        md = hold(md, none, level, d - done);
        done = d;
        if (md.status !== 'flying' || md.parked) break;
        let mb = hold(md, keys(back), level, 2 * R);
        mb = hold(mb, up, level, a);
        mb = hold(mb, keys(toward), level, R);
        if (mb.status !== 'flying' || mb.parked) continue;
        for (const e of range(o.flare)) {
          const me = hold(mb, up, level, e);
          if (me.status !== 'flying' || me.parked) break;
          const [mf, g] = coast(me, level, 600);
          if (mf.status !== 'landed' || !mf.delivered || mf.bounced) continue;
          if (mf.ship.vy > o.maxVy || mf.ship.fuel < o.minFuel) continue;
          if (mf.ship.x < level.platform.x1 + o.edge || mf.ship.x > level.platform.x2 - o.edge) continue;
          if (!o.required.every((i) => mf.taken[i])) continue;
          const cand = { u, a, d, e, g, m: mf, fuel: mf.ship.fuel, steps: mf.n };
          if (better(cand, best)) best = cand;
        }
      }
    }
  }
  if (!best) return null;

  const plan = [
    [leg1.f, ''], [leg1.k, 'U'], [leg1.c, ''],
    [best.u, 'U'], [R, toward], [best.a, 'U'], [best.d, ''], [2 * R, back], [best.a, 'U'], [R, toward],
    [best.e, 'U'], [best.g, ''],
  ].filter(([count]) => count > 0);
  return { plan, mission: best.m };
}

// vy en el paso de contacto: se repiten los pasos sin teclas hasta el anterior al contacto y se da uno más.
function touchVy(m, level, c) {
  const before = hold(m, keys(''), level, c - 1);
  const s = before.ship;
  return s.vy + level.gravity / 60;
}

module.exports = { expand, simulate, search };

if (require.main === module) {
  const n = Number(process.argv[2]);
  const level = LEVELS[n - 1];
  if (!level) throw new Error('nivel inválido: ' + process.argv[2]);
  const options = process.argv[3] ? JSON.parse(process.argv[3]) : {};
  const t0 = Date.now();
  const r = search(level, options);
  if (!r) {
    console.log(JSON.stringify({ level: level.id, plan: null, ms: Date.now() - t0 }));
  } else {
    const m = r.mission;
    console.log(JSON.stringify({
      level: level.id, plan: r.plan, steps: m.n, x: m.ship.x, vx: m.ship.vx, vy: m.ship.vy,
      fuel: m.ship.fuel, taken: m.taken, capsulePoints: m.capsulePoints, ms: Date.now() - t0,
    }));
  }
}
