# Plan: Mensajero Orbital v4

> Estado: **decidido en modo autónomo** el 2026-10-11 (`proyecto/autorizacion-v4.md`). Fuente de verdad: `proyecto/brief.md` y `proyecto/criterios.md` (v4). Lo que no cambia sigue como en `proyecto/v3/plan.md`.

## 1. Fases

| # | Fase | Quién | Sale con | Control |
|---|---|---|---|---|
| 0 | Archivo de v3, herramientas del revisor, brief, plan, tareas, criterios, secuencia del nivel 7 a mano | Coordinador / Intake | `proyecto/*.md` | Decisiones en `decisiones-autonomas.md` |
| 1 | Pruebas nuevas (fallan primero) | Programador | `src/tests/mission.test.js` | Fallan solo por lo que falta |
| 2 | Física, misión, puntaje, nivel 7 | Programador | `physics.js`, `mission.js`, `score.js`, `levels.js` | Nivel 7 igual al cálculo a mano en la primera corrida |
| 3 | Piloto automático y niveles 8 a 10 | Programador | `src/tests/autopilot.js`, datos y secuencias fijas en `src/tests/sequences.test.js` | Piloto validado contra el nivel 7; secuencias con margen ≥ 10 |
| 4 | Tests de v3 que dependen del número de niveles | Programador | `levels.test.js`, `campaign.test.js`, `score.test.js` | Solo tras verlos fallar por eso |
| 5 | Arte | Arte | `sprites.js` | Paleta ≤ 16, nave 9–F |
| 6 | Juego, HTML, README | Programador | `game.js`, `index.html`, `README.md` | Prueba de humo en Node |
| 7 | Revisión | Revisor | Reporte | Foto de hashes antes y después; salida completa de pruebas |
| 8 | Reparación | Coordinador → reparador | Arreglo mínimo | Máx. 3 ciclos por problema |
| 9 | Reporte final | Coordinador | Reporte a Nanni | Cierre solo con su aprobación |

## 2. Archivos

```
src/
├── index.html            # + filas Paquete y Cápsulas; carga mission.js
├── README.md
├── js/
│   ├── physics.js        # + thrustFactor opcional (una línea)
│   ├── mission.js        # NUEVO: estado de misión, estacionamiento, cápsulas (puro)
│   ├── levels.js         # + niveles 7 a 10 (datos)
│   ├── score.js          # + scoreRun (misión y cápsulas); scoreLanding sin cambios
│   ├── save.js           # sin cambios
│   ├── sprites.js        # + 4 temas, paquete, cápsulas, plataforma A
│   └── game.js           # usa missionStep; HUD de paquete y cápsulas
└── tests/
    ├── physics.test.js   # v1, SIN CAMBIOS
    ├── levels.test.js, worlds.test.js, campaign.test.js, score.test.js   # heredados
    ├── mission.test.js   # NUEVO: C-66 a C-80
    ├── sequences.test.js # NUEVO: C-81 a C-86 (listas fijas, validación del piloto)
    └── autopilot.js      # NUEVO: piloto (no es *.test.js; nunca lo carga el juego)
```

## 3. Física y misión

- `physics.js`: el empuje pasa a `CONFIG.THRUST * (level.thrustFactor ?? 1)`. Multiplicar por 1 es exacto, así que los niveles 1 a 6 dan los mismos bits.
- `mission.js` (global `MoonMission`, depende solo de `MoonPhysics`):
  - `createMission(level)` → `{ ship, n, cargo, delivered, parked, taken, capsulePoints, status, reason }`; `ship` es el estado de 8 campos de siempre.
  - `missionStep(m, input, level)`: llama a `step(ship, input, legLevel, n)`. `legLevel` es el mismo objeto `level` salvo con paquete y `cargoThrust`, que agrega `thrustFactor`. En niveles con `pickup`, si la nave tocó el suelo, el aterrizaje se reevalúa con `evaluateLanding` contra la plataforma que hay bajo la nave (A o B). `evaluateLanding` es pura y es la misma que usa `step`, así que equivale a llamar a `step` con esa plataforma.
  - Aterrizaje que no gana: la nave queda **estacionada** (`parked`) con `y = GROUND_Y − SHIP_HALF`, velocidades y ángulo en 0 y `status: 'flying'` (un estado nuevo, no se "revive" el de `step`). Mientras está estacionada, los pasos sin ↑ no la mueven; con ↑ (y combustible) se da un `step` normal desde el reposo.
  - Cápsulas: `capsuleHits(ship, capsules, taken)` pura, caja contra caja (`SHIP_HALF + CAPSULE_HALF`).
- Sin `pickup` ni `capsules`, `missionStep` hace exactamente un `step(ship, input, level, n)`: los niveles 1 a 6 no cambian.

## 4. Piloto automático (`src/tests/autopilot.js`)

- `expand(plan)` convierte fases `[pasos, teclas]` en la lista de entradas; `simulate(level, plan)` la corre con `missionStep`.
- `search(level, opciones)` prueba planes con la plantilla fija: tramo 1 (caer, ↑, caer hasta tocar A) y salto (↑, giro, ↑, deriva, giro contrario, ↑ de frenado, enderezar, ↑ opcional, caer hasta tocar B). Se queda con el que gana con más combustible (y menos pasos), cumpliendo vy en el contacto ≤ 10, todas las cápsulas obligatorias y margen ≥ 10.
- Se valida en el nivel 7 contra la tabla calculada a mano. Las listas que genera para 8 a 10 se copian fijas a `sequences.test.js`.

## 5. Juego

- `FlightScene` guarda `this.mission`; el `step` directo se reemplaza por `missionStep`. `stepCount` pasa a ser `mission.n`.
- Al ganar: `scoreRun(mission, level, platformAt(level, n))` → `recordLanding` → `writeSave` si `persist`.
- Visual: paquete encima de A hasta recogerlo; cápsulas en su lugar, se ocultan al tomarlas; A con marcas invertidas.

## 6. Revisión
Igual que v3: foto sha256 completa de `src/` (y de `entregables/v1` a `v3`) antes y después, en `proyecto/foto-src.md`; salida completa de las pruebas al revisor.
