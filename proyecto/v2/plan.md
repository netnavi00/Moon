# Plan: Mensajero Orbital v2

> Estado: **aprobado por Nanni el 2026-10-02**, con la condición de que las secuencias fijas de Marte y Asteroide se confirmen en la primera corrida (si no coinciden, no se ajusta la prueba: pasa al diagnosticador). Fuente de verdad: `proyecto/brief.md` (aprobado 2026-10-02).
> Lo que no cambia respecto a v1 (paso fijo, acumulador de 5 pasos, escala, HUD en HTML, estilo arcade) sigue como en `proyecto/v1/plan.md` §3–5.

## 1. Fases

| # | Fase | Quién | Sale con | Punto de revisión |
|---|---|---|---|---|
| 0 | Plan, tareas y criterios | Coordinador | `plan.md`, `tareas.md`, `criterios.md` | **Aprobación de Nanni** |
| 1 | Pruebas nuevas, luego datos y física | Programador | `src/tests/levels.test.js`, `src/tests/worlds.test.js`, `src/js/levels.js`, `src/js/physics.js` | `node --test` en verde, con las 14 de v1 intactas |
| 2 | Arte e interfaz (en paralelo) | Arte + Programador | `src/js/sprites.js`, `src/js/game.js`, `src/index.html`, `src/README.md` | — |
| 3 | Revisión | Revisor | Reporte contra `criterios.md` | Si falla → diagnóstico/reparación (máx. 3 ciclos) |
| 4 | Verificación manual | Nanni | C-M1 a C-M6 | **Aprobación de Nanni** |
| 5 | Cierre | Coordinador | `entregables/v2/`, lecciones | **Aprobación de Nanni** |

## 2. Estructura de archivos

```
src/
├── index.html            # entrada; carga los scripts en el orden de §5
├── README.md             # + niveles, progresión, ?nivel=N
├── js/
│   ├── physics.js        # lógica pura; ahora recibe el nivel y el número de paso (opcionales)
│   ├── levels.js         # NUEVO: datos de los 3 niveles + nextLevel (función pura)
│   ├── sprites.js        # paletas por mundo; medidas desde CONFIG y el nivel
│   └── game.js           # escenas, HUD, flujo de campaña
└── tests/
    ├── physics.test.js   # v1, SIN CAMBIOS (sha256 en proyecto/regresion-v1.md)
    ├── levels.test.js    # NUEVO: datos, Luna = v1, dificultad, progresión
    └── worlds.test.js    # NUEVO: viento, plataforma móvil, evaluateLanding, secuencias fijas
```

## 3. Decisión central: cómo llegan el nivel y el número de paso a la física

**Restricción.** `createState()` sin argumentos regresa los 8 campos de v1, `step.length === 2` y `CONFIG` no cambia. El test de v1 no se toca.

**Decisión.** El nivel y el contador de pasos viajan **como argumentos opcionales**, no dentro del estado:

```
createState(level?)                       → { x, y, vx, vy, angle, fuel, status, crashReason }   (8 campos, en todos los niveles)
step(state, input, level = LUNA, n = 0)   → estado nuevo                                          (step.length === 2 por los valores por defecto)
platformAt(level, t)                      → { x1, x2, vx }                                         (NUEVA, pura)
evaluateLanding(state, platform = { x1: 120, x2: 200, vx: 0 })
```

- **`LUNA` por defecto** se arma dentro de `physics.js` desde `CONFIG` (gravedad 20, viento 0, plataforma 120–200 quieta, inicio 160,30, combustible 100). Así, llamar sin nivel es exactamente v1 y `physics.js` no depende de `levels.js`.
- **Viento:** `level.wind` (px/s², con signo; positivo = hacia la derecha). Entra a la aceleración horizontal en cada paso, igual que la gravedad entra a la vertical. No gasta combustible.
- **Gravedad:** `level.gravity` sustituye a `CONFIG.GRAVITY` dentro de `step`. `CONFIG.GRAVITY` sigue existiendo (lo usan las pruebas de v1 y el nivel por defecto).
- **Contador de pasos `n`:** cuántos pasos se han dado **antes** de este (0 en el primero). Lo lleva quien llama: `game.js` ya tiene `this.stepCount` (se reinicia al reiniciar la escena) y las pruebas llevan su propio contador. El estado no lo guarda.
- **Plataforma móvil:** su posición no se guarda en ningún lado; se **calcula** con `platformAt(level, t)` (forma cerrada, onda triangular), donde `t` = pasos transcurridos. No se acumula error y la prueba compara contra valores calculados a mano.
- **Contacto:** en el paso `n`, después de mover la nave, si toca suelo se llama `evaluateLanding(s, platformAt(level, n + 1))` (la plataforma ya avanzó ese paso). El HUD y el dibujo usan `platformAt(level, stepCount)`, que es lo mismo después de incrementar.
- **Al terminar** (`landed` o `crashed`), `step` regresa una copia sin mirar `level` ni `n` (igual que v1), y el juego deja de dar pasos: la plataforma se queda quieta en la pantalla final.

**Orden dentro de un paso** (cambios en negritas respecto a v1):
1. Si `status !== 'flying'` → copia sin cambios.
2. Giro (igual).
3. Empuje y combustible (igual, con `CONFIG.THRUST` y `CONFIG.FUEL_RATE`).
4. **`ax += level.wind`**; **`ay += level.gravity`**.
5–6. Euler semi-implícito (igual).
7. Bordes de pantalla (igual, con `CONFIG`); luego suelo con **`evaluateLanding(s, platformAt(level, n + 1))`**.

**`evaluateLanding(state, platform)`**: mismo orden que v1. `off_platform` si `x < platform.x1` o `x > platform.x2`; `speed_h` compara **`|state.vx − platform.vx|`** contra `MAX_LAND_VX`. Sin segundo argumento, usa los valores de la Luna: resultados idénticos a v1.

**Identidad de la Luna.** Con `level` por defecto, `ax += 0` y `ay += CONFIG.GRAVITY` dan los mismos números en punto flotante que v1. Una prueba nueva corre la secuencia de C-11 con `LEVELS[0]` y sin nivel, y exige estados idénticos (`deepStrictEqual`).

**¿Se volvió retorcido?** No: son dos parámetros opcionales y una función nueva; el estado no cambia en ningún nivel. No hace falta escalar.

**Alternativas descartadas:**
- Guardar `t` o la posición de la plataforma en el estado de Marte/Asteroide: la forma del estado variaría por nivel y complica HUD y pruebas.
- Acumular la posición de la plataforma paso a paso: más campos y error acumulado; la forma cerrada se prueba directo contra el valor calculado.

## 4. Niveles como datos (`src/js/levels.js`)

Script clásico con la misma envoltura UMD que `physics.js` (global `MoonLevels` en el navegador, `require` en Node). **No depende** de `physics.js`: solo datos y una función pura.

```
LEVELS = [
  { id: 'luna', name: 'Luna', theme: 'luna', gravity, wind, fuel, start: { x, y },
    platform: { x1, x2, speed } },                  // quieta: speed = 0; móvil: speed > 0 y además minX, maxX
  ...
]
nextLevel(n, status)   // n de 1 a LEVELS.length; regresa n + 1, n, o null (fin de campaña)
```

- Los valores exactos están en `criterios.md` §1.
- `platform.x1/x2` = posición inicial. Con `speed > 0`, la plataforma completa se mueve entre `minX` y `maxX` (sus bordes nunca salen de ese rango), empieza hacia la derecha y rebota en los extremos.
- `theme` es la llave de la paleta en `sprites.js` (el arte vive en `sprites.js`, que solo toca el agente de arte). Un nivel nuevo con un tema existente se agrega solo con datos.
- Los límites de aterrizaje **no** están en los niveles: solo existen en `CONFIG`, así que son iguales en los 3 por construcción.
- `nextLevel(n, 'landed')` → `n + 1`, o `null` si `n === LEVELS.length`. `nextLevel(n, 'crashed')` → `n`. Cualquier otro `status` lanza error.
- Numeración: `n` de 1 a 3 en `nextLevel`, el HUD y `?nivel=N`; el arreglo `LEVELS` es de 0 a 2.

**Luna duplica los números de `CONFIG`** (son datos, no se leen de `physics.js`). Para que no se desalineen, una prueba compara `LEVELS[0]` contra los valores de v1 y contra `CONFIG`.

## 5. Orden de scripts en `index.html`

Todos clásicos, sin `type="module"`:

1. Phaser 3.80.1 (CDN, igual que v1)
2. `js/physics.js` → `MoonPhysics`
3. `js/levels.js` → `MoonLevels`
4. `js/sprites.js` → `MoonSprites` (usa `CONFIG` y los datos del nivel)
5. `js/game.js`

## 6. Arte (`sprites.js`)

- Una paleta de máximo 16 colores **por tema** (`luna`, `marte`, `asteroide`). Los colores de la nave y la llama son los mismos en las 3 y cuentan dentro de los 16.
- Medidas desde `CONFIG` y el nivel: fondo `WIDTH × HEIGHT`; suelo `WIDTH × (HEIGHT − GROUND_Y)`; plataforma `(x2 − x1)` de ancho. Las estrellas se quedan arriba del suelo (`y < GROUND_Y`). Ningún 320, 180, 20 u 80 escrito a mano.
- Llaves de textura por tema (por ejemplo `ground_marte`) para que el caché de texturas no mezcle mundos.
- Semillas constantes por tema. Asteroide con más estrellas que Luna; Marte con suelo rojizo y cielo más cálido; Asteroide con suelo gris oscuro rocoso.
- Cada tema puede definir la cantidad de estrellas y cráteres como datos dentro de `sprites.js`.

## 7. Juego (`game.js` + `index.html`)

- **Arranque:** `?nivel=N` con `URLSearchParams`. Si `N` no es un entero entre 1 y `LEVELS.length`, arranca en 1 sin error.
- **`FlightScene`** recibe el número de nivel en los datos de la escena (`scene.restart({ level: n })`). Crea el estado con `createState(level)`, pone `stepCount = 0` y llama `step(state, input, level, stepCount)` antes de incrementar. La plataforma se dibuja en `platformAt(level, stepCount).x1`.
- **HUD:**
  - Fila nueva arriba: `NIVEL N/3 · NOMBRE` (el 3 sale de `LEVELS.length`).
  - Vel. horiz. muestra `state.vx − platformAt(level, stepCount).vx` y su color usa ese mismo valor contra `MAX_LAND_VX`. En Luna y Marte es igual a `state.vx`.
  - Indicador de viento: solo si `level.wind !== 0`. Flecha según el signo y la magnitud (por ejemplo `VIENTO ← 4`). Se decide por el dato, no por el nombre del nivel.
  - La barra de combustible se calcula como fracción del **combustible inicial del nivel**, no de `CONFIG.FUEL_START`.
- **Pantalla final** (`EndScene`), con `nextLevel`:
  - Choque: "¡Choque!", motivo, "R o Espacio para reintentar" → mismo nivel.
  - Aterrizaje con nivel siguiente: "¡Aterrizaje exitoso!", "Siguiente: Marte", "R o Espacio para continuar" → nivel siguiente.
  - Aterrizaje en el último nivel: directo a "¡Misión completa!", "R o Espacio para volver a la Luna" → nivel 1. (No se muestra antes el éxito normal.)
- Todo sin recargar la página. Combustible nuevo en cada intento y en cada nivel.

## 8. Secuencias fijas (resumen; detalle en `criterios.md` §2.3)

Calculadas a mano con Euler semi-implícito, fase por fase (aceleración constante en cada fase):
`v_fin = v0 + a·k/60` y `Δ = k·v0/60 + a·k(k+1)/7200`.

| Nivel | Secuencia | Toca suelo | vy | vx (relativa) | Combustible final |
|---|---|---|---|---|---|
| Luna | La de C-11 de v1 | paso 300 | 10 | 0 | 64 |
| Marte | caída, gira a 30°, empuje inclinado, regresa a 0°, frenado, caída | paso 316 | ≈ 10.69 | ≈ −1.07 | 40 |
| Asteroide | caída, frenado, caída lenta, gira a −30°, empuje inclinado, regresa a 0°, caída (recalculada 2026-10-02) | paso 575 | ≈ 9.02 | 0 (nave y plataforma a −15) | ≈ 16.33 |

Los márgenes contra los límites (15, 10, 10°) y contra los bordes de la plataforma son de al menos 2 px/s y 23 px. **Se confirman en la primera corrida.** Si no coinciden, no se ajusta la prueba para que pase: pasa al diagnosticador para clasificar si falla la secuencia, el cálculo o la física.

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Un cambio en `step` rompe la Luna sin que fallen las pruebas de v1 | Prueba nueva de identidad: misma secuencia con y sin `LEVELS[0]`, `deepStrictEqual` |
| El juego desfasa `stepCount` y la plataforma que se ve no es la que evalúa la física | Criterio E: el mismo `stepCount` va a `step` y a `platformAt`, se incrementa justo después de cada paso y se reinicia con la escena |
| Los datos de Luna se desalinean de `CONFIG` | Prueba que compara `LEVELS[0]` con `CONFIG` y con los valores de v1 |
| Error en el cálculo a mano de Marte o Asteroide | Rangos con margen en las aserciones; si falla, diagnóstico, no ajuste |
| La plataforma móvil a 15 px/s supera el límite horizontal (10): hay que igualar su velocidad inclinando la nave | Es intencional (cambio del 2026-10-02): el Asteroide se sentía fácil y la plataforma lenta. La secuencia fija se rehízo con giro |
| El revisor de v1 tiene criterios de v1 escritos en su procedimiento | T07b: actualizar `.claude/agents/revisor.md` a los IDs de v2 y reiniciar la sesión antes de T08 (lección de v1) |

## 10. Decisiones de Nanni (2026-10-02)

1. Marte con gravedad 20, igual que la Luna: el reto es solo el viento.
2. ~~Plataforma móvil a 8 px/s (debajo del límite horizontal de 10).~~ **Revertida el 2026-10-02** tras la prueba de juego de Nanni (Asteroide fácil, plataforma muy lenta): plataforma a **15 px/s** (arriba del límite de 10, obliga a igualar velocidad) y combustible del Asteroide de 70 a **45**. Luna y Marte no cambian; gravedad del Asteroide sigue en 8.
3. Aterrizar en el último nivel va directo a "¡Misión completa!".
4. `?nivel=N` inválido arranca en la Luna sin error.
5. La barra de combustible se mide contra el combustible inicial de cada nivel.
6. Orden: T07b primero; T02 no empieza hasta que Nanni confirme, tras reiniciar la sesión, que el revisor cargó solo con Read, Grep y Glob.
