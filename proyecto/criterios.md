# Criterios de aceptación: Mensajero Orbital v4

> Estado: **decididos en modo autónomo** el 2026-10-11 (`proyecto/autorizacion-v4.md`). Derivados de `proyecto/brief.md` (v4). La secuencia del nivel 7 (C-81) está calculada a mano; las de los niveles 8 a 10 (C-83 a C-85) las **generó el piloto automático** (D-09).
> Tipos: **A** = prueba automática (`node --test "src/tests/*.test.js"`), **E** = revisión estática del revisor, **M** = verificación manual de Nanni.
> Tolerancia numérica en pruebas A: `1e-9`, salvo que se indique otra.
> Siguen vigentes con su ID los criterios de v1, v2 y v3 (`proyecto/v1/`, `proyecto/v2/`, `proyecto/v3/criterios.md`), salvo los que aquí se reescriben con **(v4)**.

## 1. Valores

### 1.1 `CONFIG`: sin cambios
Mismos nombres y valores que v1 a v3. Límites de aterrizaje, giro, caja de colisión y suelo iguales en los 10 niveles.

### 1.2 Niveles 1 a 6: idénticos a v3
`LEVELS.slice(0, 6)` es `deepStrictEqual` a `LEVELS` de `entregables/v3/js/levels.js` y ninguno trae `pickup`, `cargoThrust`, `capsules` ni `thrustFactor`.

### 1.3 Niveles 7 a 10 (`LEVELS[6..9]`)

| Campo | 7 · Primera entrega | 8 · Carga pesada | 9 · Cápsulas | 10 · Gran entrega |
|---|---|---|---|---|
| `id` / `theme` | `'entrega'` | `'carga'` | `'capsulas'` | `'final'` |
| `name` | `'Primera entrega'` | `'Carga pesada'` | `'Cápsulas'` | `'Gran entrega'` |
| `gravity` / `wind` | 20 / 0 | ver §1.3b | ver §1.3b | ver §1.3b |
| `fuel` | 110 | | | |
| `start` | `{ x: 70, y: 30 }` | | | |
| `pickup` (A) | `{ x1: 40, x2: 100 }` | | | |
| `platform` (B) | `{ x1: 160, x2: 220, speed: 0 }` | | | |
| `cargoThrust` | — | **sí** | — | sí |
| `capsules` | — | sí (D-14) | **sí** | sí |

### 1.3b Niveles 8 a 10
Fijados en T05 probando datos con el piloto (D-12) y escritos aquí antes de agregarlos a `levels.js`.

| Campo | 8 · Carga pesada | 9 · Cápsulas | 10 · Gran entrega |
|---|---|---|---|
| `gravity` / `wind` | 20 / 0 | 20 / 0 | 22 / 0 |
| `fuel` | 150 | 80 | 110 |
| `start` | `{ x: 240, y: 30 }` | `{ x: 60, y: 30 }` | `{ x: 265, y: 30 }` |
| `pickup` (A) | `{ x1: 210, x2: 270 }` | `{ x1: 30, x2: 90 }` | `{ x1: 240, x2: 290 }` |
| `platform` (B) | `{ x1: 90, x2: 150, speed: 0 }` | `{ x1: 210, x2: 260, speed: 0 }` | `{ x1: 50, x2: 94, speed: 0 }` |
| `cargoThrust` | **0.6** | — | 0.7 |
| `capsules` | `{180,125, fuel 30, pts 50}` (D-14) | **`{110,112, fuel 25, pts 50}`, `{170,112, 25, 50}`, `{140,60, 0, 150}`** | `{200,115, 30, 50}`, `{130,115, 30, 50}`, `{165,70, 10, 100}` |

(Cápsulas como `{ x, y, fuel, points }`.) En 9 y 10 las dos primeras cápsulas son las de la ruta (obligatorias para el piloto); la tercera es opcional, arriba, solo por puntos.

`LEVELS.length === 10`; `id` en orden `luna`, `marte`, `asteroide`, `gigante`, `tormenta`, `aproximacion`, `entrega`, `carga`, `capsulas`, `final`.

### 1.4 Mecánicas opcionales nuevas (el valor por defecto deja el nivel como antes)

| Campo | Significado | Si falta |
|---|---|---|
| `pickup: { x1, x2 }` | plataforma de recogida A (fija, en el suelo); `platform` pasa a ser la de entrega B | nivel normal de una plataforma |
| `cargoThrust` | factor del empuje con el paquete a bordo | 1 |
| `capsules: [{ x, y, fuel, points }]` | cápsulas fijas; `fuel` y `points` ≥ 0 | `[]` |
| `thrustFactor` (interno, en `physics.js`) | factor del empuje en `step` | 1; ningún nivel lo trae en sus datos, lo pone la misión |

**`physics.js`**: el empuje es `CONFIG.THRUST * (level.thrustFactor ?? 1)`. Nada más cambia.

### 1.5 Estado de misión (`src/js/mission.js`, global `MoonMission`)
`MISSION = { CAPSULE_HALF: 4, REST_Y: CONFIG.GROUND_Y − CONFIG.SHIP_HALF }` (154).

`createMission(level)` → `{ ship: createState(level), n: 0, cargo: false, delivered: false, parked: false, taken: [false × capsules], capsulePoints: 0, status: 'flying', reason: null }`.

`capsuleHits(ship, capsules, taken)` → índices `i` con `!taken[i]`, `|ship.x − c.x| ≤ SHIP_HALF + CAPSULE_HALF` y `|ship.y − c.y| ≤ SHIP_HALF + CAPSULE_HALF` (10), en orden.

`missionStep(m, input, level)` → misión nueva (no modifica `m`, `input` ni `level`):
1. Si `m.status !== 'flying'`, regresa una copia igual.
2. `leg` = `level`; si `m.cargo` y `level.cargoThrust` existe, `leg = { ...level, thrustFactor: level.cargoThrust }`.
3. Si `m.parked` y no (`input.thrust` y `ship.fuel > 0`): solo `n + 1`; la nave no se mueve.
4. Si no: `ship = step(m.ship, input, leg, m.n)`, `parked = false`.
5. Si el nivel tiene `pickup` y la nave tocó el suelo (`status !== 'flying'` y `crashReason !== 'out_of_bounds'`): `where` = A si `A.x1 ≤ x ≤ A.x2`, si no B; el resultado se reemplaza por `evaluateLanding(ship, { x1, x2, vx: 0 })` de A, o por `evaluateLanding(ship, platformAt(level, n + 1))` de B.
6. Si no chocó: por cada índice de `capsuleHits`, `taken[i] = true`, `fuel = min(level.fuel, fuel + c.fuel)`, `capsulePoints += c.points`.
7. Choque → `status: 'crashed'`, `reason = crashReason`.
8. Aterrizaje: sin `pickup` → `status: 'landed'`. Con `pickup`: en B con paquete → `delivered: true`, `status: 'landed'`; en A sin paquete → `cargo: true` y estaciona; cualquier otro → estaciona. **Estacionar** = `parked: true` y `ship = { ...ship, y: REST_Y, vx: 0, vy: 0, angle: 0, status: 'flying', crashReason: null }`. Si al estacionar `fuel ≤ 0` → `status: 'crashed'`, `reason: 'no_fuel'`.
9. `n + 1`.

Sin `pickup` y sin `capsules`, `missionStep(m, input, level).ship` es exactamente `step(m.ship, input, level, m.n)`.

### 1.6 Regla de dificultad (v4)
Mecánicas reconocidas: las de v3 (viento, plataforma móvil, consumo, ráfagas, velocidad inicial) más **misión** (`pickup` presente), **carga pesada** (`cargoThrust` presente y ≠ 1) y **cápsulas** (`capsules` no vacía). Cada nivel estrena ≤ 1, salvo la **excepción del nivel 8** aprobada por Nanni (D-14), que estrena carga pesada y cápsulas; estrenos: `[—, viento, plataforma móvil, consumo, ráfagas, velocidad inicial, misión, carga pesada + cápsulas, —, —]`. Toda secuencia de referencia termina con `fuel ≥ 10`; la del nivel 8, con `fuel ≥ 45` (30 % de su combustible inicial, D-14). Ningún nivel tiene campos `land`/`limit`. En las misiones, A y B no se enciman, caben en la pantalla y B tiene `speed: 0`; las cápsulas quedan dentro de la pantalla y arriba del suelo.

### 1.7 Puntaje (`score.js`)
`SCORE` y `scoreLanding` sin cambios. Nuevo `MISSION_SCORE = { DELIVERY: 400, PRECISION_MAX: 200, FUEL_MAX: 200, TIME_MAX: 200, STEPS_PER_TIME_POINT: 8 }` y `scoreRun(m, level, platform)`:
- `m.status !== 'landed'` → `null`.
- Sin `pickup`: `scoreLanding(m.ship, level, platform, m.n)` más `capsules: m.capsulePoints`, y `total` sumado.
- Con `pickup`: `delivery: 400`; `precision = round(200 · (1 − |x − c| / (w/2)))` en [0, 200] con `platform` = B; `fuel = round(200 · fuel / level.fuel)` en [0, 200]; `time = max(0, 200 − floor(n / 8))`; `capsules = m.capsulePoints`; `total` = suma.

### 1.8 Orden de scripts (v4)
Phaser 3.80.1 (URL fija) → `js/physics.js` → `js/levels.js` → `js/mission.js` → `js/score.js` → `js/save.js` → `js/sprites.js` → `js/game.js`.

## 2. Criterios automáticos (A)

### 2.1 Heredados
| ID | Criterio |
|---|---|
| C-01 a C-14 | `src/tests/physics.test.js` de v1, **sin cambios**. |
| C-27 a C-41, C-44 a C-63 | Los de v2 y v3, sin cambios, salvo los que fallen **solo** por haber 10 niveles (se ajusta el número y se registra la falla en la bitácora). |

### 2.2 Nuevos (en `src/tests/mission.test.js`)
| ID | Criterio | Esperado |
|---|---|---|
| C-66 | `thrustFactor` | Luna, 60 pasos con ↑ y `thrustFactor: 0.5`: vy = −5, fuel = 80. Sin él, vy = −30 (igual que v1) |
| C-67 | Niveles 1 a 6 = v3 (datos) | §1.2 contra `entregables/v3/js/levels.js`, resuelta desde la raíz de `moon/` |
| C-68 | Niveles 1 a 6 = v3 (paso a paso) | Con las secuencias de v1 a v3 de los 6 niveles: `step` de `src/` y de `entregables/v3/js/physics.js` dan estados `deepStrictEqual` en cada paso; y `missionStep(...).ship` también, con `n` = pasos y `status` final `'landed'` |
| C-69 | `createMission` | Campos de §1.5; `taken` con un `false` por cápsula; `ship` con los 8 campos |
| C-70 | `capsuleHits` | Cápsula en (100, 100): nave en (110, 110) → toca; (110.01, 100) → no; (90, 90) → toca; tomada → no; varias → índices en orden |
| C-71 | Pureza y determinismo | `missionStep` no modifica `m`, `input` ni `level`; terminada (`landed`/`crashed`) regresa lo mismo |
| C-72 | Recoger en A | Nivel 7, nave en (70, 153.99) con vy 5 sin teclas: `cargo` true, `parked` true, nave en y 154 con vx = vy = angle = 0, `status` `'flying'`, `n` = 1 |
| C-73 | Estacionado y despegue | Sin ↑ la nave no cambia y `n` sube; con ↑ la nave sube (y < 154), gasta combustible y `parked` = false |
| C-74 | Plataforma que no avanza | B sin paquete → estaciona sin `cargo`; A con paquete → estaciona; B con paquete → `landed`, `delivered` true |
| C-75 | Choque en misión | Entre A y B → `crashed`/`off_platform`; en A con vy 20 → `speed_v`; fuera de pantalla → `out_of_bounds` |
| C-76 | Sin combustible | Aterrizar en A con fuel 0 → `crashed`, `reason: 'no_fuel'` |
| C-77 | Carga pesada | Con `cargoThrust: 0.6` y paquete: 60 pasos ↑ desde A dan vy = 20 − 30 = −10; sin paquete o sin el campo, −30 |
| C-78 | Cápsulas en la misión | Suma `fuel` con tope en `level.fuel` y `points`; cada una se toma una vez; al chocar no se toma |
| C-79 | Nivel 7 y regla v4 | Datos de §1.3; regla de §1.6 en los 10 niveles |
| C-80 | `scoreRun` | `null` si no ganó; sin `pickup` = `scoreLanding` + cápsulas; con `pickup` = fórmula §1.7 (casos fijos en la prueba) |

### 2.3 Secuencias (en `src/tests/sequences.test.js`)
En el paso k se llama `missionStep(m, input_k, nivel)`; se corre hasta `status !== 'flying'` o 2000 pasos. Las listas son fijas: `[pasos, teclas]` con teclas `''`, `'U'`, `'L'`, `'R'` (o combinaciones).

| ID | Criterio |
|---|---|
| C-81 | Nivel 7, secuencia a mano (§2.4): toca A en el paso 261 (contacto con y 154.01944 y vy 8.66667 ± 1e-5, mirado con `step` sobre el estado del paso 260) y gana en el **583** con x = 189.93317, vy = 9.49236 y fuel = 25.66667 (valores de la tabla §2.4, cada uno ± 0.001) y vx = 0 (± 1e-9). Puntaje: entrega 400, precisión 200, combustible 47, tiempo 128 = **775** |
| C-82 | El piloto (`src/tests/autopilot.js`) reproduce la tabla a mano del nivel 7 en cada fin de fase (± 1e-5, la tabla tiene 5 decimales). En la fila "toca A" se compara el estado ya estacionado (y 154, velocidad y ángulo 0, mismo x y combustible); el contacto mismo (y 154.01944, vy 8.66667) lo comprueba C-81 |
| C-83 | Nivel 8 con su lista fija (regenerada en D-14): gana, toma la cápsula, `fuel ≥ 45` (30 % de 150), valores finales de §2.5 |
| C-84 | Nivel 9 con su lista fija: gana, cápsulas obligatorias tomadas, `fuel ≥ 10`, valores de §2.5 |
| C-85 | Nivel 10 con su lista fija: gana, cápsulas obligatorias tomadas, `fuel ≥ 10`, valores de §2.5 |
| C-86 | Determinismo de las 4 secuencias (dos corridas iguales) |
| C-87 | Datos de los niveles 8 a 10 iguales a §1.3b; `LEVELS.length === 10` |
| C-88 | Temas: los 10 temas existen, paleta ≤ 16, temas 0–8 y nave 9–F; sprites de paquete y cápsulas usan solo `.` y 9–F |
| C-90 | Solo cambia el nivel 8 (D-14): `sha256(JSON.stringify(nivel))` de los otros 9 niveles y de las listas de los niveles 7, 9 y 10 son iguales a las huellas tomadas el 2026-10-11 antes del cambio |

### 2.4 Secuencia del nivel 7 (calculada a mano el 2026-10-11)
Fórmulas cerradas por fase (`v = v0 + a·k/60`, `Δ = k·v0/60 + a·k(k+1)/7200`), sin usar `physics.js` ni `mission.js`. Al tocar A la nave se estaciona en y = 154 con velocidad y ángulo 0.

| Fase | Pasos | Hasta | x | y | vx | vy | Ángulo | Combustible |
|---|---|---|---|---|---|---|---|---|
| nada | 164 | 164 | 70 | 105.16667 | 0 | 54.66667 | 0 | 110 |
| ↑ | 94 | 258 | 70 | 153.60278 | 0 | 7.66667 | 0 | 78.66667 |
| nada (toca A) | 3 | **261** | 70 | 154.01944 | 0 | 8.66667 | 0 | 78.66667 |
| ↑ (despegue) | 17 | 278 | 70 | 152.72500 | 0 | −8.5 | 0 | 73 |
| → | 30 | 308 | 70 | 151.05833 | 0 | 1.5 | 45 | 73 |
| ↑ | 71 | 379 | 95.10229 | 141.93104 | 41.83715 | −16.67048 | 45 | 49.33333 |
| nada | 41 | 420 | 123.69101 | 135.32288 | 41.83715 | −3.00382 | 45 | 49.33333 |
| ← | 60 | 480 | 165.52816 | 142.48573 | 41.83715 | 16.99618 | −45 | 49.33333 |
| ↑ (frena) | 71 | 551 | 189.93317 | 151.69559 | 0 | −1.17430 | −45 | 25.66667 |
| → | 30 | 581 | 189.93317 | 153.69177 | 0 | 8.82570 | 0 | 25.66667 |
| nada (toca B) | 2 | **583** | 189.93317 | 154.00262 | 0 | 9.49236 | 0 | 25.66667 |

Se confirma en la primera corrida. Si no da, no se ajusta la prueba: se diagnostica el cálculo, la secuencia o el código.

### 2.5 Secuencias de los niveles 8 a 10 (GENERADAS por el piloto el 2026-10-11)
Plantilla del piloto: tramo a A (nada, ↑, nada hasta tocar) y salto (↑, giro, ↑, deriva, giro contrario, ↑ igual al primero, enderezar, ↑ opcional, nada hasta tocar B). Criterio: más combustible al final y luego menos pasos, con vy ≤ 10 en cada contacto, al menos 10 px de las orillas de B, sin rebotes, cápsulas obligatorias tomadas y fuel ≥ 10.

| Nivel | Lista fija | Opciones del piloto | Recoge | Gana | x | vy | fuel | Cápsulas | Puntaje |
|---|---|---|---|---|---|---|---|---|---|
| 8 | 164 nada, 93 ↑, 4 nada, 40 ↑, 20 ←, 122 ↑, 35 nada, 40 →, 122 ↑, 20 ←, 2 nada (regenerada en D-14) | `dir −1, turn 20, required [0], fall 155–170, burn 85–100, lift 30–50, push 115–135, drift 20–50, flare 0–12` | 261 | 662 | 139.858333 | 8.011567 | 54.333333 | la única | 400 + 68 + 72 + 118 + 50 = 708 |
| 9 | 164 nada, 93 ↑, 4 nada, 25 ↑, 30 →, 78 ↑, 76 nada, 60 ←, 78 ↑, 30 →, 7 ↑, 1 nada | `turn 30, required [0,1], fall 155–170, burn 75–100, lift 16–34, push 72–90, drift 56–96, flare 0–12` | 261 | 646 | 223.930922 | 9.742785 | 36.333333 | 1ª y 2ª | 400 + 111 + 91 + 120 + 100 = 822 |
| 10 | 151 nada, 102 ↑, 5 nada, 33 ↑, 20 ←, 146 ↑, 70 nada, 40 →, 146 ↑, 20 ←, 7 nada | `dir −1, turn 20, required [0,1], fall 110–170, burn 60–140, lift 24–42, push 138–158, drift 50–90, flare 0–10` | 258 | 740 | 83.311111 | 9.970340 | 27.666667 | 1ª y 2ª | 400 + 97 + 50 + 108 + 100 = 755 |

Las pruebas comparan con tolerancia 1e-6 y vx = 0 (± 1e-9). Si una deja de dar esto, no se ajusta la prueba: se diagnostica el cambio.

## 3. Criterios estáticos (E)

| ID | Criterio |
|---|---|
| C-15 (v4) | `index.html` carga los 8 scripts de §1.8 en ese orden, clásicos, Phaser 3.80.1. |
| C-16 (v4) | `physics.js`, `levels.js`, `mission.js`, `score.js` y `save.js` no mencionan `Phaser`, `window`, `document`, `localStorage`, `Date`, `performance` ni `Math.random`; no hacen `require` (salvo `mission.js`, que en Node puede hacer `require('./physics.js')`). |
| C-18 (v4) | `game.js` avanza con `missionStep(mission, input, level)` en el acumulador de paso fijo (tope 5); no llama a `step` directo. |
| C-21 (v4) | HUD: "NIVEL N/total · NOMBRE" con `LEVELS.length`; fila Paquete solo en niveles con `pickup` (por recoger / a bordo / entregado); fila Cápsulas solo si hay (`k/total`); lo demás como v3. |
| C-22 (v4) | `README.md`: los 10 niveles, misión, carga pesada, cápsulas, puntaje de misión, `?nivel=N`, `?nuevo` y comando de pruebas. |
| C-23 (v4) | `node --test "src/tests/*.test.js"` con 0 fallas, cubriendo todos los criterios A. |
| C-25 (v4) | Arte: 10 temas con ≤ 16 colores; nave, llama, paquete y cápsulas solo con 9 a F; temas de v3 sin cambios; A se distingue de B. |
| C-43 (v4) | Pantallas: en misión, éxito muestra "Entrega · Precisión · Combustible · Tiempo" y "Cápsulas" si el nivel tiene; choque y "sin combustible" con su mensaje; R o Espacio reinicia el nivel completo. |
| C-64 (v4) | Al ganar: `scoreRun(mission, level, platformAt(level, n))` → `recordLanding` → `writeSave` solo si `persist`. |
| C-65 (v4) | Sin sonido, menú, rocas, niebla ni ráfagas nuevas; misma versión de Phaser. |
| C-89 | El piloto (`src/tests/autopilot.js`) no se carga ni se menciona en `src/index.html` ni en `src/js/`. |

## 4. Criterios manuales (M): Nanni
Consola = la del navegador (F12).

| ID | Criterio |
|---|---|
| C-M1 (v4) | Doble clic en `src/index.html` (con internet): los 10 niveles cargan sin errores propios en la consola. |
| C-M2 (v4) | Cada nivel se puede ganar a mano; la campaña 1 → 10 → misión completa → Luna sin recargar. |
| C-M3 (v4) | En una misión: el paquete desaparece de A al aterrizar ahí, el HUD dice "A bordo", se despega con ↑, y al aterrizar en B dice "Entregado" y gana. Chocar después de recoger reinicia todo (paquete de nuevo en A). |
| C-M4 (v4) | Carga pesada se siente: con el paquete la nave sube más lento en los niveles 8 y 10. |
| C-M5 (v4) | Cápsulas: se ven, desaparecen al tocarlas, el HUD cuenta k/total y el combustible sube con las que dan combustible. |
| C-M6 (v4) | Temas de 7 a 10 distinguibles; nave igual en todos; A y B se distinguen. |
| C-M7 (v4) | `?nivel=7` a `?nivel=10` arrancan en ese nivel sin cambiar lo guardado; `?nuevo` empieza desde la Luna; el guardado sigue funcionando al recargar. |
| C-M8 (v4) | Curva de dificultad de 7 a 10 razonable (feedback). |
| C-M9 (v4) | El desglose del puntaje de misión se ve en la pantalla de éxito y el total del HUD sube. |
