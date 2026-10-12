# Criterios de aceptación: Mensajero Orbital v3

> Estado: **decididos en modo autónomo** el 2026-10-11 (`proyecto/autorizacion-v3.md`). Las secuencias C-52 a C-54 están calculadas a mano y se confirman en la primera corrida. Derivados de `proyecto/brief.md` (v3).
> Tipos: **A** = prueba automática (`node --test "src/tests/*.test.js"`), **E** = revisión estática del revisor, **M** = verificación manual de Nanni.
> Tolerancia numérica en pruebas A: `1e-9`, salvo que se indique otra.
> Siguen vigentes con su ID los criterios de v1 (`proyecto/v1/criterios.md`) y de v2 (`proyecto/v2/criterios.md`), salvo los que aquí se reescriben con **(v3)**. C-36 de v2 queda acotada a los niveles 1 a 3 y la sustituye C-47 para la campaña completa.

## 1. Valores

### 1.1 `CONFIG`: sin cambios
Mismos nombres y valores que en v1 y v2 (`proyecto/v2/criterios.md` §1.1). Empuje, giro, caja de colisión, suelo y límites de aterrizaje son iguales en los 6 niveles y solo viven en `CONFIG`.

### 1.2 Niveles 1 a 3: idénticos a v2
`LEVELS[0..2]` es `deepStrictEqual` a `LEVELS` de `entregables/v2/js/levels.js` (tabla en `proyecto/v2/criterios.md` §1.2). No llevan ninguno de los campos opcionales nuevos.

### 1.3 Niveles 4 a 6 (`LEVELS[3..5]` en `src/js/levels.js`)

| Campo | 4 · Luna gigante | 5 · Tormenta | 6 · Aproximación |
|---|---|---|---|
| `id` / `name` / `theme` | `'gigante'` / `'Luna gigante'` / `'gigante'` | `'tormenta'` / `'Tormenta'` / `'tormenta'` | `'aproximacion'` / `'Aproximación'` / `'aproximacion'` |
| `gravity` (px/s²) | 30 | 20 | 0 |
| `wind` (px/s²) | 0 | 0 | 0 |
| `fuel` | 90 | 50 | 30 |
| `fuelRate` (unidades/s, opcional) | **30** | — | — |
| `gusts` (opcional) | — | **`[{ steps: 60, wind: 15 }, { steps: 120, wind: -15 }, { steps: 60, wind: 15 }]`** | — |
| `start` | `{ x: 170, y: 30 }` | `{ x: 152, y: 30 }` | **`{ x: 24, y: 24, vx: 32, vy: 28 }`** |
| `platform` (ancho) | `{ x1: 150, x2: 190, speed: 0 }` (40) | `{ x1: 136, x2: 184, speed: 0 }` (48) | `{ x1: 124, x2: 164, speed: 0 }` (40) |

`LEVELS.length === 6`; `id` en orden `luna`, `marte`, `asteroide`, `gigante`, `tormenta`, `aproximacion`.

### 1.4 Mecánicas opcionales (valor por defecto = Luna)

| Campo | Significado | Si falta |
|---|---|---|
| `fuelRate` | consumo por segundo de empuje | `CONFIG.FUEL_RATE` (20) |
| `gusts` | lista de fases `{ steps, wind }` que se repite; se **suma** a `wind` | sin ráfagas |
| `start.vx`, `start.vy` | velocidad inicial | 0 |

**`windAt(level, n)`** (nueva, en `physics.js`): viento del paso con `n` pasos dados antes. Sin `gusts` → `level.wind`. Con `gusts`: `T = Σ steps`, `p = n mod T`; la fase `i` cubre `[s_i, s_i + steps_i)` con `s_i` la suma de las anteriores; regresa `level.wind + gusts[i].wind`. Tormenta: `T = 240`; n ∈ [0, 59] → +15, [60, 179] → −15, [180, 239] → +15, y se repite.

**Cambios en `step(state, input, level, n)`**: consumo `(level.fuelRate ?? CONFIG.FUEL_RATE) · DT`; viento `windAt(level, n)` en lugar de `level.wind`. **`createState(level)`**: `vx = level.start.vx ?? 0`, `vy = level.start.vy ?? 0` (los mismos 8 campos). Lo demás, igual que v2.

### 1.5 Regla de dificultad (req. 10)
Mecánicas reconocidas (las que la física no tenía antes de su nivel): viento (`wind ≠ 0`), plataforma móvil (`platform.speed > 0`), consumo propio (`fuelRate` presente), ráfagas (`gusts` presente), velocidad inicial (`start.vx` o `start.vy` ≠ 0). Cambiar el valor de un campo base (gravedad, combustible, ancho, inicio) no es mecánica.
- Cada nivel trae **como máximo una** mecánica que no aparezca en ningún nivel anterior. Luna 0; Marte: viento; Asteroide: plataforma móvil; Luna gigante: consumo; Tormenta: ráfagas; Aproximación: velocidad inicial.
- La secuencia de referencia de cada nivel termina con `fuel ≥ 10` (C-38, C-39, C-52 a C-54; la de la Luna termina en 64).
- Ningún nivel tiene límites de aterrizaje propios.
- La dificultad final se confirma jugando (C-M8).

### 1.6 Puntaje (`src/js/score.js`, global `MoonScore`)
`scoreLanding(state, level, platform, steps)`:
- Si `state.status !== 'landed'` → `null` (chocar no da puntos ni resta).
- `precision = round(500 · (1 − |x − c| / (w/2)))`, con `c = (x1 + x2)/2` y `w = x2 − x1` de `platform` (la plataforma en el paso del contacto), acotado a [0, 500].
- `fuel = round(300 · state.fuel / level.fuel)`, acotado a [0, 300].
- `time = max(0, 200 − floor(steps / 4))`, donde `steps` = pasos de física desde el inicio del intento hasta el contacto, incluido.
- `total = precision + fuel + time` (máximo 1000). Regresa `{ precision, fuel, time, total }`.

`campaignTotal(best, levels)` = suma de `best[level.id]` de los niveles de `levels` (los que falten cuentan 0; las llaves desconocidas se ignoran). **Total de campaña = suma de los mejores puntajes por nivel** (D-07). `SCORE` exporta las constantes 500, 300, 200 y 4.

### 1.7 Guardado (`src/js/save.js`, global `MoonSave`)
- Llave `STORAGE_KEY = 'mensajero-orbital'`. Forma: `{ unlocked: n, best: { [id]: entero } }`. Vacío: `{ unlocked: 1, best: {} }`.
- `parseSave(text, levels)`: JSON inválido o nulo → vacío. `unlocked` entero en [1, `levels.length`] (si se pasa, se acota; si no es entero ≥ 1, vale 1). `best` solo con `id` conocidos y enteros ≥ 0.
- `recordLanding(save, n, levels, score)` → guardado **nuevo** (no modifica el recibido): `unlocked = max(unlocked, min(n + 1, levels.length))`; `best[id] = max(best[id] ?? 0, score.total)`.
- `loadSave(storage, levels)`, `writeSave(storage, save)` y `clearSave(storage)`: todo acceso a `storage` va en try/catch; con `storage` nulo o que lanza, `loadSave` regresa vacío y `writeSave`/`clearSave` regresan `false`, sin lanzar.
- `resolveStart(search, save, levels)` → `{ level, persist, reset }`:
  - Sin parámetros: `{ level: save.unlocked, persist: true, reset: false }`.
  - `?nuevo`: `reset: true`, nivel 1, `persist: true`.
  - `?nivel=N` (con o sin `?nuevo`): `level = N` si es entero en [1, `levels.length`], si no 1; `persist: false`. `reset` es `true` solo si viene `?nuevo`.

### 1.8 Orden de scripts en `src/index.html` (v3)
Todos clásicos, en este orden: 1) `https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js`, 2) `js/physics.js`, 3) `js/levels.js`, 4) `js/score.js`, 5) `js/save.js`, 6) `js/sprites.js`, 7) `js/game.js`.

## 2. Criterios automáticos (A)

### 2.1 Heredados
| ID | Criterio |
|---|---|
| C-01 a C-14 | `src/tests/physics.test.js` de v1, **sin cambios**. |
| C-27, C-29 a C-35, C-38 a C-41 | Los de v2 (`src/tests/worlds.test.js`), sin cambios. |
| C-26 (v3) | `require('../js/levels.js')` exporta `LEVELS` (6 entradas) y `nextLevel`; `id` y `name` en el orden de §1.3. |
| C-28 (v3) | Como v2, pero el estado inicial `vx = vy = 0` se comprueba en los niveles 1 a 3 (los nuevos los cubren C-46 y C-51). |
| C-36 (v3) | Regla de dificultad de v2 aplicada **solo** a los niveles 1 a 3; ningún nivel tiene límites de aterrizaje. |
| C-37 (v3) | `nextLevel`: (1,'landed') → 2; (2,'landed') → 3; (3,'landed') → 4; (6,'landed') → `null`; (n,'crashed') → n para 1, 2, 3 y 6; (1,'flying') lanza error. |

Los cambios a C-26, C-28, C-36 y C-37 se hacen en los tests de v2 **solo después** de ver que fallan por haber 6 niveles (regla 2 de la autorización), y se registran en la bitácora con la falla observada.

### 2.2 Nuevos (en `src/tests/campaign.test.js` y `src/tests/score.test.js`)

| ID | Criterio | Esperado |
|---|---|---|
| C-44 | Niveles 1 a 3 = v2 (datos) | `LEVELS.slice(0, 3)` `deepStrictEqual` `LEVELS` de `entregables/v2/js/levels.js`; ninguno trae `fuelRate`, `gusts`, `start.vx` ni `start.vy` |
| C-45 | Niveles 1 a 3 = v2 (física) | Con las secuencias de C-11, C-38 y C-39, `step` de `src/` y de `entregables/v2/js/physics.js` dan estados `deepStrictEqual` en cada paso; `createState` igual en los 3 |
| C-46 | Datos de los niveles 4 a 6 | Iguales a la tabla de §1.3; `createState(L)` tiene los 8 campos en los 6 niveles; en 4 a 6: `x`, `y`, `fuel` del nivel, `vx = start.vx ?? 0`, `vy = start.vy ?? 0` |
| C-47 | Regla de dificultad v3 | Recorriendo `LEVELS` con las mecánicas de §1.5: cada nivel estrena ≤ 1; el conjunto estrenado es exactamente el de §1.5; ningún nivel tiene campos `land`/`limit` |
| C-48 | Consumo por nivel | Luna gigante, 60 pasos con ↑: fuel = 60, vy = −20, y = 30 − 61/6. Luna, 60 pasos con ↑: fuel = 80 (consumo por defecto) |
| C-49 | `windAt` | Tormenta: n = 0, 59 → 15; 60, 179 → −15; 180, 239 → 15; 240 → 15; 300 → −15; 479 → 15. Marte (n = 0 y 1000) → −4; Luna → 0 |
| C-50 | Ráfagas en la física | Tormenta, sin teclas: tras 60 pasos vx = 15, x = 159.625, vy = 20, fuel = 50; tras 180 pasos vx = −15, x = 159.375 |
| C-51 | Velocidad inicial y gravedad 0 | `gravity === 0`; `createState(APROX)` con vx 32, vy 28; tras 60 pasos sin teclas: vx = 32, vy = 28, x = 56, y = 52 |
| C-52 | Secuencia de Luna gigante (§2.3) | `landed`; pasos ∈ [246, 250]; vy ∈ [7, 11]; x = 170; vx = 0; \|angle\| ≤ 1e-9; fuel = 21 ± 0.001 (≥ 10) |
| C-53 | Secuencia de Tormenta (§2.3) | `landed`; pasos ∈ [259, 263]; vy ∈ [7.5, 10]; vx ∈ [4.5, 6]; x ∈ [152, 154]; \|angle\| ≤ 1e-9; fuel = 50 − 94/3 (18.667) ± 0.001 (≥ 10) |
| C-54 | Secuencia de Aproximación (§2.3) | `landed`; pasos ∈ [383, 391]; vy ∈ [9.5, 9.8]; vx ∈ [0, 0.5]; x ∈ [141, 144.5]; \|angle\| ≤ 1e-9; fuel = 30 − 44/3 (15.333) ± 0.001 (≥ 10) |
| C-55 | Determinismo y pureza (4 a 6) | Cada secuencia corrida dos veces da lo mismo; `step(s, ALL, L, 5)` no modifica `s` ni `L`; desde `landed`/`crashed` regresa el mismo estado |
| C-56 | `physics.js` exporta | `CONFIG`, `createState`, `step`, `evaluateLanding`, `platformAt`, `windAt`; `step.length === 2` |
| C-57 | `scoreLanding` | Plataforma `{ x1: 150, x2: 190 }`, nivel con fuel 90: crashed → `null`; (x 170, fuel 90, 0 pasos) → 500/300/200 = 1000; (180, 45, 400) → 250/150/100 = 500; (150, 0, 800) → 0/0/0 = 0; (175, 21, 248) → 375/70/138 = 583; 1000 pasos → time 0; 3 pasos → 200; 4 → 199. Con `{ x1: 140.25, x2: 188.25 }` y x = 164.25 → precision 500. No modifica sus argumentos |
| C-58 | `campaignTotal` | `{ luna: 700, marte: 500, zzz: 999 }` → 1200; `{}` → 0 |
| C-59 | `parseSave` y `recordLanding` | Casos de §1.7: nulo, JSON roto, unlocked 99 → 6, 0 → 1, 2.5 → 1, `best` con id desconocido, negativo o no entero → se descarta. `recordLanding`: 1ª vez nivel 1 con 700 → `{ unlocked: 2, best: { luna: 700 } }`; luego 600 → sigue 700; nivel 6 → unlocked 6; nivel 2 con unlocked 5 → sigue 5; no modifica el guardado recibido |
| C-60 | Almacenamiento que falla | Con `storage` nulo o cuyos métodos lanzan: `loadSave` → vacío, `writeSave` → `false`, `clearSave` → `false`, sin lanzar. Con uno que funciona: `writeSave` guarda `JSON.stringify(save)` en `STORAGE_KEY` y `loadSave` lo regresa igual; `clearSave` lo borra |
| C-61 | `resolveStart` | `''` con unlocked 4 → `{ 4, persist: true, reset: false }`; `'?nuevo'` → `{ 1, true, true }`; `'?nivel=2'` → `{ 2, false, false }`; `'?nivel=9'` y `'?nivel=abc'` → `{ 1, false, false }`; `'?nuevo&nivel=3'` → `{ 3, false, true }` |
| C-62 | Temas | Con `sprites.js` cargado en Node: cada `theme` de `LEVELS` existe en `THEMES`; cada tema usa solo índices 0 a 8; `SHIP_COLORS` solo 9 a F; paleta (tema + nave) ≤ 16 colores |
| C-63 | Puntaje de la referencia | `scoreLanding` del final de C-52 con `platformAt(GIGANTE, pasos)` → `{ precision: 500, fuel: 70, time: 138, total: 708 }` |

### 2.3 Secuencias de referencia (calculadas a mano el 2026-10-11)
En el paso k se llama `step(s, input, nivel, k − 1)`; se corre hasta que `status !== 'flying'` o 900 pasos.

| Nivel | Pasos y teclas |
|---|---|
| Luna gigante | 1–110 nada; 111–… ↑ hasta tocar |
| Tormenta | 1–164 nada; 165–258 ↑; 259–… nada |
| Aproximación | 1–160 nada; 161–200 ←; 201–244 ↑; 245–284 →; 285–… nada |

Cálculo por fases con fórmulas cerradas (`v = v0 + a·k/60`, `Δ = k·v0/60 + a·k(k+1)/7200`), sin usar `physics.js`. Contacto cuando `y ≥ 154`.

**Luna gigante** (g = 30; con ↑, `ay = −20`; consumo 0.5 por paso):

| Fase | Pasos | Hasta | vy | y | Combustible |
|---|---|---|---|---|---|
| Caída | 110 | 110 | 55 | 80.875 | 90 |
| Empuje hasta tocar | 138 | **248** | **9** | 154.09167 | **21** |

x = 170 todo el tiempo (sin viento ni giro). Sensibilidad: cayendo 111 pasos toca con vy 13.17; con 109 no alcanza a tocar con empuje continuo.

**Tormenta** (g = 20; con ↑, `ay = −30`; ráfagas de §1.4, por tramos):

| Fase | Pasos | Hasta | vy | y | vx | x | Combustible |
|---|---|---|---|---|---|---|---|
| Caída | 164 | 164 | 54.66667 | 105.16667 | −11 | 162.875 | 50 |
| Empuje | 94 | 258 | 7.66667 | 153.60278 | 4.5 | 152.7125 | 18.66667 |
| Caída | 3 | **261** | **8.66667** | 154.01944 | **5.25** | **152.9625** | 18.66667 |

Contacto en la posición 21 del 2º ciclo (ráfaga +15, vx todavía chica). Vecinos: empuje de 93 o 95 pasos → vy 9.5 / 8.17, mismo rango.

**Aproximación** (g = 0; a −60° con ↑: `ax = −43.30127`, `ay = −25`):

| Fase | Pasos | Hasta | vy | y | vx | x | Ángulo | Combustible |
|---|---|---|---|---|---|---|---|---|
| Deriva | 160 | 160 | 28 | 98.66667 | 32 | 109.33333 | 0 | 30 |
| Giro ← | 40 | 200 | 28 | 117.33333 | 32 | 130.66667 | −60 | 30 |
| Empuje | 44 | 244 | 9.66667 | 130.99167 | 0.24574 | 142.22548 | −60 | 15.33333 |
| Giro → | 40 | 284 | 9.66667 | 137.43611 | 0.24574 | 142.38931 | 0 | 15.33333 |
| Deriva | 103 | **387** | **9.66667** | 154.03056 | **0.24574** | **142.81115** | 0 | **15.33333** |

La nave nunca sube (vy > 0) ni toca un borde; la plataforma 124–164 tiene su centro en 144.

**Se confirman en la primera corrida.** Si una secuencia no da lo esperado, no se ajustan la prueba ni los rangos: se diagnostica si falla la secuencia, el cálculo o la física.

## 3. Criterios estáticos (E)

| ID | Criterio |
|---|---|
| C-15 (v3) | `src/index.html` carga los 7 scripts de §1.8 en ese orden, todos clásicos, Phaser 3.80.1 desde la URL fija. |
| C-16 (v3) | `physics.js`, `levels.js`, `score.js` y `save.js` no mencionan `Phaser`, `window`, `document`, `localStorage`, `Date`, `performance` ni `Math.random`, y no hacen `require` de otros archivos. `score.js` no usa nada de `physics.js` (recibe la plataforma como argumento). |
| C-18 (v3) | Igual que v2 (acumulador, tope de 5 pasos, `step(state, input, level, stepCount)`, `stepCount` reiniciado en cada intento). |
| C-21 (v3) | HUD en HTML: "NIVEL N/total · NOMBRE" con total = `LEVELS.length`; fila de puntaje total con `campaignTotal(save.best, LEVELS)`; fila de viento visible si `level.wind !== 0` o hay `gusts`, con el valor actual `windAt(level, stepCount)` (flecha y magnitud); lo demás igual que v2. |
| C-22 (v3) | `src/README.md`: los 6 niveles, puntaje (fórmula), guardado, `?nivel=N` (no guarda), `?nuevo` (borra) y comando de pruebas. |
| C-23 (v3) | `node --test "src/tests/*.test.js"` con 0 fallas, cubriendo todos los criterios **A**: C-01 a C-14, C-26 a C-41 y C-44 a C-63 (C-42 y C-43 son E). |
| C-25 (v3) | Arte: temas `luna`, `marte`, `asteroide`, `gigante`, `tormenta`, `aproximacion`, con máximo 16 colores cada uno; nave y llama iguales en todos, solo índices 9 a F; medidas desde `CONFIG` y del nivel; los temas de v2 sin cambios. |
| C-42 (v3) | Nivel inicial con `MoonSave.resolveStart(location.search, …)`. El acceso a `window.localStorage` va dentro de try/catch; si falla se juega igual, sin guardar. Con `reset` se llama `clearSave`. Si `persist` es falso, nunca se llama `writeSave`. |
| C-43 (v3) | Pantallas como v2. Éxito y misión completa muestran además "Precisión P · Combustible F · Tiempo T" y "Puntaje X", y "Nuevo récord" o "Mejor: Y". Choque no muestra puntaje. |
| C-64 | Al aterrizar, `game.js` llama `scoreLanding(state, level, platformAt(level, stepCount), stepCount)`, actualiza el guardado en memoria con `recordLanding` y lo escribe con `writeSave` solo si `persist`. Al chocar no cambia ni el guardado ni el total. |
| C-65 | Sin sonido (ni `this.sound` ni `Audio`), sin menú, la misma versión de Phaser, y nada de v4. |

## 4. Criterios manuales (M): Nanni
Toda revisión de consola es en la **consola del navegador** (F12), no en la de VS Code.

| ID | Criterio |
|---|---|
| C-M1 (v3) | Con doble clic en `src/index.html` (con internet), los 6 niveles cargan y se juegan sin errores propios en la consola del navegador. Se acepta el aviso conocido de `file://`. |
| C-M2 (v3) | Cada nivel se puede ganar a mano, y la campaña 1 → 6 → misión completa → Luna se completa sin recargar. |
| C-M3 | Las pantallas de éxito, choque y misión completa se ven, y R o Espacio hace lo que dice cada una. |
| C-M4 (v3) | Lo visual de v2, más tres temas nuevos distinguibles: Luna gigante, Tormenta y Aproximación. La nave es la misma en todos y la plataforma se distingue del suelo. |
| C-M5 (v3) | `index.html?nivel=4` arranca en Luna gigante; jugar así no cambia lo guardado (al abrir sin parámetros sigue el nivel guardado). |
| C-M6 (v3) | El HUD muestra "NIVEL N/6 · NOMBRE" y el total. En Tormenta, el viento cambia de dirección en ciclos y la flecha del HUD lo sigue. |
| C-M7 | Guardado: al ganar el nivel 1 y recargar sin parámetros, arranca en el 2; el mejor puntaje se conserva. `index.html?nuevo` vuelve a empezar desde la Luna con total 0. |
| C-M8 | Curva de dificultad: los niveles 4 a 6 se sienten más difíciles que 1 a 3 y en orden razonable (feedback para afinar). |
| C-M9 | La pantalla de éxito muestra el desglose del puntaje y el total del HUD sube solo al mejorar un nivel. |
