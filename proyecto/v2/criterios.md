# Criterios de aceptación: Mensajero Orbital v2

> Estado: **aprobado por Nanni el 2026-10-02** (C-38 y C-39 sujetos a confirmarse en la primera corrida). Derivados de `proyecto/brief.md` (aprobado 2026-10-02).
> Tipos: **A** = prueba automática (`node --test "src/tests/*.test.js"`), **E** = revisión estática del revisor, **M** = verificación manual de Nanni.
> Tolerancia numérica en pruebas A: `1e-9`, salvo que se indique otra.
> Los criterios de v1 (`proyecto/v1/criterios.md`) siguen vigentes con su mismo ID. Los que cambian en v2 se reescriben aquí completos y llevan **(v2)**.

## 1. Valores

### 1.1 `CONFIG` (`src/js/physics.js`): sin cambios

Los mismos nombres y valores de `proyecto/v1/criterios.md` §1: `DT` 1/60, `WIDTH` × `HEIGHT` 320 × 180, `GRAVITY` 20, `THRUST` 50, `ROT_SPEED` 90, `FUEL_START` 100, `FUEL_RATE` 20, `SHIP_HALF` 6, `START_X`/`START_Y` 160/30, `GROUND_Y` 160, `PLATFORM_X1`/`PLATFORM_X2` 120/200, `MAX_LAND_VY` 15, `MAX_LAND_VX` 10, `MAX_LAND_ANGLE` 10. Empuje, giro, consumo, caja de colisión, suelo y límites de aterrizaje son **iguales en los 3 niveles** y solo viven en `CONFIG`.

### 1.2 Niveles (`LEVELS` en `src/js/levels.js`)

| Campo | 1 · Luna | 2 · Marte | 3 · Asteroide |
|---|---|---|---|
| `id` / `name` / `theme` | `'luna'` / `'Luna'` / `'luna'` | `'marte'` / `'Marte'` / `'marte'` | `'asteroide'` / `'Asteroide'` / `'asteroide'` |
| `gravity` (px/s², hacia abajo) | 20 | 20 | 8 |
| `wind` (px/s², + = derecha) | 0 | −4 (sopla a la izquierda) | 0 |
| `fuel` (unidades) | 100 | 80 | 45 (antes 70; cambio aprobado por Nanni el 2026-10-02) |
| `start` (x, y) | 160, 30 | 180, 30 | 180, 30 |
| `platform.x1`–`x2` (ancho) | 120–200 (80) | 140–204 (64) | 100–148 (48), posición inicial |
| `platform.speed` (px/s) | 0 | 0 | 15, empieza hacia la derecha (antes 8; cambio aprobado por Nanni el 2026-10-02) |
| `platform.minX`–`maxX` | — | — | 80–240 |

Las plataformas quietas llevan solo `x1`, `x2` y `speed: 0`. La móvil agrega `minX` y `maxX`.

### 1.3 Regla de dificultad (requisito 16), comprobada contra los datos

Para cada nivel `i` ≥ 2, comparado con el nivel `i − 1`:
- `fuel[i] ≤ fuel[i−1]` y `ancho[i] ≤ ancho[i−1]` (ancho = `x2 − x1`), y al menos uno de los dos es estrictamente menor.
  - Marte vs. Luna: 80 < 100 y 64 < 80. Asteroide vs. Marte: 45 < 80 y 48 < 64.
- Reto propio: Marte tiene `wind ≠ 0`; Asteroide tiene `platform.speed > 0`.
- Límites de aterrizaje iguales: ningún nivel tiene campos de límites (`MAX_LAND_*` o equivalentes); se usan los de `CONFIG`.

### 1.4 Plataforma móvil: `platformAt(level, t)`

`t` = pasos transcurridos (entero ≥ 0). Regresa `{ x1, x2, vx }`.
- Si `speed === 0`: `{ x1, x2, vx: 0 }` del dato.
- Si no, con `w = x2 − x1`, `D = (maxX − minX) − w` y `u = ((x1 − minX) + speed · t · DT) mod 2D`:
  - Si `u ≤ D`: `x1(t) = minX + u`, `vx = +speed`.
  - Si `u > D`: `x1(t) = minX + 2D − u`, `vx = −speed`.
  - `x2(t) = x1(t) + w`.
- En Asteroide: `w = 48`, `D = 112`, `u = 20 + 15t/60 = 20 + t/4`, periodo de 896 pasos. Va a la derecha hasta t = 368 y a la izquierda de 368 a 816.

### 1.5 Contratos

- `createState(level?)` → los 8 campos de v1 `{ x, y, vx, vy, angle, fuel, status, crashReason }` en todos los niveles; `x`, `y` y `fuel` salen del nivel. Sin argumento: idéntico a v1.
- `step(state, input, level?, n?)` → `step.length === 2`. Sin `level` usa la Luna armada desde `CONFIG`; `n` (por defecto 0) = pasos dados antes de este. Orden del paso en `plan.md` §3. Si toca suelo, evalúa contra `platformAt(level, n + 1)`.
- `evaluateLanding(state, platform?)` → igual que v1; `platform = { x1, x2, vx }`, por defecto `{ x1: 120, x2: 200, vx: 0 }`. `off_platform` contra `platform.x1/x2`; `speed_h` con `|state.vx − platform.vx| > 10`.
- `nextLevel(n, status)` (en `levels.js`) → `'landed'`: `n + 1`, o `null` si `n === LEVELS.length`; `'crashed'`: `n`; otro `status`: lanza error.
- `physics.js` exporta `CONFIG`, `createState`, `step`, `evaluateLanding` y `platformAt`. `levels.js` exporta `LEVELS` y `nextLevel`.

### 1.6 Orden de scripts en `src/index.html`

Todos clásicos (sin `type="module"`), en este orden exacto:
1. `https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js`
2. `js/physics.js`
3. `js/levels.js`
4. `js/sprites.js`
5. `js/game.js`

## 2. Criterios automáticos (A)

### 2.1 Heredados de v1

| ID | Criterio |
|---|---|
| C-01 a C-14 | Los de `proyecto/v1/criterios.md` §2, en `src/tests/physics.test.js` **sin cambios**. |

### 2.2 Nuevos (en `src/tests/levels.test.js` y `src/tests/worlds.test.js`)

| ID | Criterio | Cómo se prueba | Esperado |
|---|---|---|---|
| C-26 | Niveles cargan con `require` | `require('../js/levels.js')` | Exporta `LEVELS` (3 entradas) y `nextLevel`; `id` en orden `luna`, `marte`, `asteroide`; `name` `Luna`, `Marte`, `Asteroide` |
| C-27 | Test de v1 intacto | sha256 de `src/tests/physics.test.js` con `node:crypto` | `5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a` (`proyecto/regresion-v1.md`) |
| C-28 | Datos y estado de la Luna | Comparar `LEVELS[0]` contra la tabla §1.2 y contra `CONFIG`; `createState(LEVELS[0])` vs. `createState()`; `createState(L)` para los 3 | Luna = gravedad 20, viento 0, combustible 100, inicio 160,30, plataforma 120–200 quieta, y coincide con `CONFIG`. `createState(LEVELS[0])` `deepStrictEqual` `createState()`. Para cada nivel: exactamente los 8 campos, con `x`, `y` y `fuel` del nivel |
| C-29 | La Luna con datos es idéntica a v1 | Secuencia de C-11 corrida dos veces: con `step(s, input)` y con `step(s, input, LEVELS[0], n)` | Estados `deepStrictEqual` **en cada paso**, y el final `landed` |
| C-30 | `evaluateLanding` con plataforma | Estado con `y = 154`, `vy = 0`, `angle = 0`. Con `{ x1: 140, x2: 204, vx: 0 }` y `vx = 0`: x = 139.99, 140, 204, 204.01. Con `{ x1: 100, x2: 148, vx: 8 }` y `x = 120`: vx = 8, 18, 18.01, −2, −2.01, 0 | x: `off_platform`, `landed`, `landed`, `off_platform`. vx: `landed`, `landed`, `speed_h`, `landed`, `speed_h`, `landed` |
| C-31 | Viento de Marte | `createState(MARTE)`, 60 pasos sin teclas, con `n` contando | vx = −4, vy = 20, x = 180 − 2.0333… (= 177.96666666…), fuel = 80 exacto |
| C-32 | El viento puede sacar a la nave | Estado con x = 6.0005, y = 90, vx = 0, vy = 0; 1 paso sin teclas con Marte y con Luna | Marte → `crashed` / `'out_of_bounds'`; Luna → `flying` |
| C-33 | Gravedad del Asteroide | `ASTEROIDE.gravity < LEVELS[0].gravity`; `createState(ASTEROIDE)`, 60 pasos sin teclas | 8 < 20; vy = 8, vx = 0 |
| C-34 | Posición de la plataforma móvil | `platformAt(ASTEROIDE, t)` | t=0 → x1 100, vx +15; t=60 → 115, +15; t=368 → 192 (extremo derecho); t=400 → 184, −15; t=575 → 140.25, −15; t=816 → 80 (extremo izquierdo); t=856 → 90, +15. En todos, x2 = x1 + 48. Plataformas quietas: `platformAt(LUNA, 1000)` = `{ x1: 120, x2: 200, vx: 0 }` |
| C-35 | Contacto con la plataforma móvil usa el paso `n + 1` | `step` con Asteroide y `n = 0` desde y = 153.99, vy = 5, vx = 15, angle = 0 (plataforma en t=1: x1 = 100.25; la nave avanza 0.25 px) | x = 99.9 → `crashed` / `'off_platform'`; x = 100.1 → `landed`. *Nota explicativa (no son aserciones de la prueba; decisión de Nanni del 2026-10-02): la nave avanza 0.25 px en el paso y queda en 100.15 y 100.35; con la plataforma de t=0 (x1 = 100) la primera habría aterrizado, por eso distingue n de n + 1; la vx relativa es 15 − 15 = 0.* |
| C-36 | Regla de dificultad | Recorrer `LEVELS` con la regla de §1.3 | Se cumple para Marte y Asteroide; ningún nivel tiene campos de límites de aterrizaje |
| C-37 | Progresión | `nextLevel` | (1,'landed') → 2; (2,'landed') → 3; (3,'landed') → `null`; (1,'crashed') → 1; (2,'crashed') → 2; (3,'crashed') → 3; (1,'flying') lanza error |
| C-38 | Secuencia fija de Marte | §2.3 | `landed` en ≤ 600 pasos; vy ∈ [9.5, 12]; vx ∈ [−3, 1]; \|angle\| ≤ 1e-9; fuel = 40 ± 0.001; x ∈ [170, 178] |
| C-39 | Secuencia fija del Asteroide | §2.3 | `landed` en ≤ 600 pasos, con pasos ∈ [570, 580]; vy ∈ [8, 10]; x ∈ [150, 161]; vx = −15; \|angle\| ≤ 1e-9; fuel = 45 − 86/3 (16.333…) ± 0.001; vx de la plataforma en el paso final = −15 |
| C-40 | Determinismo por nivel | Correr C-38 y C-39 dos veces cada una | Resultados `deepStrictEqual` |
| C-41 | Pureza y fin con nivel | `step(s, ALL, MARTE, 5)` y `step(s, ALL, ASTEROIDE, 5)`; además, desde estados `landed` y `crashed` | No modifica `s` ni el objeto del nivel (comparar contra `structuredClone`). Terminado → estado idéntico al recibido |

### 2.3 Secuencias fijas (calculadas a mano)

Pasos numerados desde 1. Cada prueba lleva su contador: en el paso k se llama `step(s, input, nivel, k − 1)`. Se corre hasta que `status !== 'flying'` o 600 pasos.

**Luna:** la de C-11, sin cambios (C-29).

**Marte:**

| Pasos | Teclas | Qué pasa |
|---|---|---|
| 1–124 | ninguna | Cae; el viento la empuja a la izquierda |
| 125–144 | → | Gira a 30° (20 × 1.5°), sin empuje |
| 145–192 | ↑ | 48 pasos de empuje inclinado: compensa el viento y frena |
| 193–212 | ← | Regresa a 0°, sin empuje |
| 213–284 | ↑ | 72 pasos de frenado con la nave derecha |
| 285–… | ninguna | Cae hasta tocar |

**Asteroide:**

| Pasos | Teclas | Qué pasa |
|---|---|---|
| 1–260 | ninguna | Cae (gravedad 8) |
| 261–310 | ↑ | 50 pasos de frenado con la nave derecha |
| 311–440 | ninguna | Caída lenta; la plataforma ya va a la izquierda desde el paso 368 |
| 441–460 | ← | Gira a −30°, sin empuje |
| 461–496 | ↑ | 36 pasos de empuje inclinado: llega a vx = −15 (igual que la plataforma) y frena |
| 497–516 | → | Regresa a 0°, sin empuje |
| 517–… | ninguna | Cae hasta tocar; nave y plataforma van juntas a −15 |

### 2.4 Referencia del cálculo (Euler semi-implícito, aceleración constante por fase)

Por fase de `k` pasos con aceleración `a` y velocidad inicial `v0`: `v = v0 + a·k/60` y `Δ = k·v0/60 + a·k(k+1)/7200`. Contacto cuando `y ≥ 154`.

**Marte** (vertical: gravedad 20; con la nave a 30°, `ay = 20 − 50·cos 30° = −23.30127`. Horizontal: viento −4; a 30° con empuje, `ax = −4 + 50·sin 30° = +21`):

| Fase | Pasos | vy al final | Δy | vx al final | Δx |
|---|---|---|---|---|---|
| Caída | 124 | 41.33333 | 43.05556 | −8.26667 | −8.61111 |
| Giro → | 20 | 48.00000 | 14.94444 | −9.60000 | −2.98889 |
| Empuje a 30° | 48 | 29.35898 | 30.78825 | +7.20000 | −0.82000 |
| Giro ← | 20 | 36.02565 | 10.95299 | +5.86667 | +2.16667 |
| Frenado | 72 | 0.02565 | 21.33078 | +1.06667 | +4.12000 |
| Caída | 32 | **10.69231** | 2.94701 | **−1.06667** | −0.01778 |

- Al terminar el frenado (paso 284): y = 151.07203; el borde inferior queda en 157.07 (no toca).
- Con 31 pasos de caída llegaría a y = 153.84 (no toca); con 32, y = 154.02 → **toca en el paso 316**.
- La velocidad vertical nunca es negativa, así que no sube ni sale por arriba.
- x final = 180 − 6.15111 = **173.85**: 33.8 px del borde izquierdo de la plataforma (140) y 30.2 px del derecho (204).
- Ángulo final ≈ 0 (20 giros de ida y 20 de vuelta). Combustible: 80 − 120/3 = **40**.
- Márgenes: vy 10.69 contra 15; |vx| 1.07 contra 10; si tocara un paso antes o después, vy quedaría entre 10.4 y 11.0 y seguiría dentro de [9.5, 12].

**Asteroide** (recalculado el 2026-10-02 por la plataforma a 15 px/s; gravedad 8; con la nave derecha `ay = 8 − 50 = −42`; a −30° con empuje `ay = 8 − 50·cos 30° = −35.30127` y `ax = 50·sin(−30°) = −25`):

| Fase | Pasos | vy al final | Δy | y al final |
|---|---|---|---|---|
| Caída | 260 | 34.66667 | 75.40000 | 105.40000 |
| Frenado | 50 | −0.33333 | 14.01389 | 119.41389 |
| Caída | 130 | 17.00000 | 18.20000 | 137.61389 |
| Giro ← | 20 | 19.66667 | 6.13333 | 143.74722 |
| Empuje a −30° | 36 | −1.51410 | 5.26927 | 149.01649 |
| Giro → | 20 | 1.15257 | −0.03803 | 148.97846 |
| Caída | 59 | **9.01924** | 5.06670 | **154.04515** |

- Con 58 pasos en la última caída llegaría a y = 153.89 (no toca); con 59 → **toca en el paso 575**.
- Antes de la última caída el borde inferior no pasa de ≈ 155.1; la subida después del frenado es de décimas de px.
- Horizontal: vx = 0 hasta el paso 460; el empuje inclinado da Δx = −25·36·37/7200 = −4.625 y vx = −15; luego 79 pasos a −15 dan −19.75. **x final = 155.625.**
- Plataforma en t = 575: u = 20 + 143.75 = 163.75 > 112 → x1 = 140.25, x2 = 188.25, va a −15. La nave queda a 15.4 px del borde izquierdo y 32.6 del derecho. Desde el paso 497 nave y plataforma van a −15, así que la distancia entre ellas no cambia.
- vx relativa = −15 − (−15) = 0 (límite 10). Combustible: 45 − (50 + 36)/3 = **16.33** (sobran más de 10, por eso se queda en 45).
- Si tocara un paso antes o después, vy quedaría entre 8.89 y 9.15, dentro de [8, 10].

**Se confirman en la primera corrida.** Si una secuencia no da lo esperado, no se ajusta la prueba ni los rangos para que pase: pasa al diagnosticador para clasificar si falla la secuencia, el cálculo a mano o la física.

## 3. Criterios estáticos (E)

| ID | Criterio |
|---|---|
| C-15 (v2) | `src/index.html` carga los 5 scripts de §1.6 en ese orden exacto, todos clásicos (sin `type="module"`), Phaser desde la URL fija. |
| C-16 (v2) | `src/js/physics.js` y `src/js/levels.js` no mencionan `Phaser`, `window`, `document`, `Date`, `performance` ni `Math.random`. `levels.js` no hace `require` de otros archivos. |
| C-17 | Igual que v1: sin carga de archivos de assets; texturas generadas en código; sin imágenes en `src/`. |
| C-18 (v2) | Igual que v1 (acumulador con `CONFIG.DT`, tope de 5 pasos, sin `delta` a la física). Además: `game.js` pasa a `step` el nivel actual y `stepCount`, incrementa `stepCount` justo después de cada paso, lo reinicia a 0 al iniciar o reiniciar la escena, y dibuja la plataforma con `platformAt(level, stepCount)`. |
| C-19 (v2) | Controles: ↑ propulsor, ← / → giro. R o Espacio en la pantalla final: tras choque reintenta el mismo nivel; tras aterrizar pasa al siguiente; en "misión completa" vuelve al nivel 1. El nivel siguiente sale de `nextLevel`, no de lógica escrita aparte. Espacio se captura para que no haga scroll. |
| C-20 (v2) | Reintentar, avanzar o volver a empezar usan reinicio de escena (`createState(level)` con combustible del nivel), no `location.reload`. |
| C-21 (v2) | HUD en HTML, leído del estado de física: igual que v1, más: fila "NIVEL N/3 · NOMBRE" (total desde `LEVELS.length`); Vel. horiz. muestra `state.vx − platformAt(level, stepCount).vx` y su color verde/rojo usa ese mismo valor contra `CONFIG.MAX_LAND_VX`; la barra de combustible es fracción del `fuel` del nivel; indicador de viento con flecha y magnitud solo cuando `level.wind !== 0` (decidido por el dato, no por el nombre del nivel). |
| C-22 (v2) | `src/README.md`: lo de v1 más los 3 niveles, la regla de progresión, la ayuda `?nivel=N` (con ejemplo `index.html?nivel=2`) y el comando de pruebas. |
| C-23 (v2) | `node --test "src/tests/*.test.js"` termina con 0 fallas y cubre C-01 a C-14 y C-26 a C-41. |
| C-24 | Igual que v1: sin `package.json`, `node_modules` ni dependencias. |
| C-25 (v2) | Arte: una paleta por tema (`luna`, `marte`, `asteroide`) con máximo 16 colores cada una; la nave (12×12) y la llama (4×4) son los mismos dibujos en los 3 y **usan solo los índices de paleta 9 a F** (los colores compartidos), así que su textura no depende del nivel con el que arranca el juego (ampliado por Nanni el 2026-10-02); semillas constantes; las medidas de fondo, suelo y plataforma se calculan desde `CONFIG` (`WIDTH`, `HEIGHT`, `GROUND_Y`) y del nivel (`x2 − x1`), sin 320, 180, 20, 80 ni 160 escritos a mano en `sprites.js`; llaves de textura distintas por tema; Asteroide genera más estrellas que Luna. |
| C-42 | `?nivel=N`: `game.js` lo lee con `URLSearchParams`; si `N` no es un entero entre 1 y `LEVELS.length`, arranca en el nivel 1 sin error. |
| C-43 | Pantallas finales: choque → "¡Choque!", motivo y "R o Espacio para reintentar". Aterrizaje con nivel siguiente → "¡Aterrizaje exitoso!", "Siguiente: NOMBRE" y "R o Espacio para continuar". Aterrizaje en el último nivel → "¡Misión completa!" y "R o Espacio para volver a la Luna". |

## 4. Criterios manuales (M) — Nanni

Toda revisión de consola es en la **consola del navegador** (F12 en Chrome), no en la de VS Code.

| ID | Criterio |
|---|---|
| C-M1 (v2) | Con doble clic en `src/index.html` (con internet), los 3 niveles cargan y se juegan sin errores propios del juego en la consola del navegador. Se acepta el aviso conocido de `file://`. |
| C-M2 (v2) | Cada nivel se puede ganar jugando a mano, y la campaña Luna → Marte → Asteroide → misión completa → Luna se completa sin recargar la página. |
| C-M3 (v2) | Se ven las pantallas de éxito (con "Siguiente: …"), choque y misión completa; R o Espacio hace lo que dice cada una; Espacio no mueve la página. |
| C-M4 (v2) | Lo visual de v1 (C-M4 de `proyecto/v1/criterios.md`), más: Marte con suelo rojizo y cielo más cálido; Asteroide con suelo gris oscuro rocoso y más estrellas; la misma nave en los 3; la plataforma se distingue del suelo en los 3. |
| C-M5 | Abriendo `index.html?nivel=2` con doble clic (`file://`), arranca en Marte. |
| C-M6 | El HUD muestra "NIVEL N/3 · NOMBRE" legible; en Marte se ve el indicador de viento; en Asteroide la plataforma se mueve, rebota en los extremos y la vel. horiz. cambia de color según la velocidad relativa. |
