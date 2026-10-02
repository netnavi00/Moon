# Criterios de aceptación: Mensajero Orbital (versión mínima)

> Estado: **aprobado por Nanni el 2026-10-01** (C-11 sujeto a confirmarse en la primera corrida). Derivados de `proyecto/brief.md` (aprobado 2026-10-01).
> Tipos de verificación: **A** = prueba automática (`node --test "src/tests/*.test.js"`), **E** = revisión estática del código por el revisor, **M** = verificación manual de Nanni.
> Tolerancia numérica en pruebas A: `1e-9`, salvo que se indique otra.

## 1. Valores fijos (`CONFIG` en `src/js/physics.js`)

| Nombre | Valor | Unidad | Nota |
|---|---|---|---|
| `DT` | 1/60 | s | Paso fijo de física |
| `WIDTH` × `HEIGHT` | 320 × 180 | px | Lienzo base |
| `GRAVITY` | 20 | px/s² | Hacia abajo |
| `THRUST` | 50 | px/s² | Mayor que la gravedad (neto con nave derecha: 30 hacia arriba) |
| `ROT_SPEED` | 90 | °/s | |
| `FUEL_START` | 100 | unidades | |
| `FUEL_RATE` | 20 | unidades/s | 5 s de empuje en total |
| `SHIP_HALF` | 6 | px | Caja de colisión de 12×12 alineada a los ejes; no gira con la nave |
| `START` | x = 160, y = 30, vx = 0, vy = 0, angle = 0 | | Posición del centro de la nave |
| `GROUND_Y` | 160 | px | Borde superior del suelo plano |
| `PLATFORM_X1`, `PLATFORM_X2` | 120, 200 | px | Plataforma de 80 px, al nivel del suelo |
| `MAX_LAND_VY` | 15 | px/s | Límite inclusivo, en valor absoluto |
| `MAX_LAND_VX` | 10 | px/s | Límite inclusivo, en valor absoluto |
| `MAX_LAND_ANGLE` | 10 | ° | Límite inclusivo, en valor absoluto |

**Reglas de colisión** (paso 7 del plan), evaluadas en este orden después de mover la nave:
1. **Borde de pantalla:** si `x - 6 < 0`, `x + 6 > 320` o `y - 6 < 0` → `crashed`, `crashReason = 'out_of_bounds'`. El borde inferior queda cubierto por el suelo: la nave siempre toca suelo antes de llegar a él.
2. **Contacto con el suelo:** si `y + 6 >= 160`, se llama a `evaluateLanding`:
   - Si `x < 120` o `x > 200` → `crashed`, `'off_platform'`.
   - Si no, se revisan los límites en este orden: `|vy| > 15` → `'speed_v'`; `|vx| > 10` → `'speed_h'`; `|angle| > 10` → `'angle'`.
   - Si se cumplen los tres límites → `landed`.

**Forma del estado:** `{ x, y, vx, vy, angle, fuel, status, crashReason }`, con `status` ∈ `'flying' | 'landed' | 'crashed'` y `crashReason` = `null` mientras no haya choque. `angle` se normaliza a (-180, 180].

**Contrato de `evaluateLanding(state)`** (aprobado por Nanni el 2026-10-01): recibe un estado y regresa `{ status, crashReason }`, con `status` ∈ `'landed' | 'crashed'` y `crashReason` = `null` si aterrizó, o uno de `'off_platform' | 'speed_v' | 'speed_h' | 'angle'`. No revisa la altura: `step` la llama solo cuando hay contacto con el suelo.

## 2. Criterios automáticos (A)

| ID | Criterio | Cómo se prueba | Esperado |
|---|---|---|---|
| C-01 | Estado inicial correcto | `createState()` | x=160, y=30, vx=0, vy=0, angle=0, fuel=100, status `'flying'`, crashReason `null` |
| C-02 | La gravedad jala hacia abajo | 60 pasos sin teclas desde el estado inicial | vy = 20, vx = 0 |
| C-03 | Empuje mayor que gravedad | `THRUST > GRAVITY`; 60 pasos con ↑ desde el inicio | vy = −30 (sube) |
| C-04 | El empuje gasta combustible | 60 pasos con ↑ desde el inicio | fuel = 80 |
| C-05 | Sin combustible no hay empuje | Estado inicial con fuel = 0; 60 pasos con ↑ | vy = 20 y fuel = 0. Además, con fuel = 0.1 y 1 paso con ↑ → fuel = 0 (nunca negativo) |
| C-06 | Giro y dirección del empuje | 60 pasos con →; 60 pasos con ←; ← y → juntas 60 pasos; estado con angle = 90 y 60 pasos con ↑ | angle = 90; angle = −90; angle = 0; en el último caso vx = 50 y vy = 20 |
| C-07 | Límites de aterrizaje (inclusivos) | `evaluateLanding` con x = 160 y combinaciones de vy, vx y angle | (15, 0, 0) → landed; (0, 10, 0) y (0, −10, 0) → landed; (0, 0, 10) y (0, 0, −10) → landed; vy = 15.01 → `'speed_v'`; vx = ±10.01 → `'speed_h'`; angle = ±10.01 → `'angle'`; x = 120 y x = 200 con valores en 0 → landed; x = 119.99 y x = 200.01 → `'off_platform'` |
| C-08 | Contacto real con `step` | Estado con x=160, y=153.99, vy=5, sin teclas, 1 paso; mismo estado con x=60 | `landed`; con x=60 → `crashed` / `'off_platform'` |
| C-09 | Salir por los bordes es choque | 1 paso sin teclas desde: (x=6.1, vx=−30), (x=313.9, vx=30), (y=6.1, vy=−30), todos con y o x a media pantalla | Los tres → `crashed` / `'out_of_bounds'` |
| C-10 | Al terminar ya no responde | Desde un estado `landed` y otro `crashed`: 1 paso con todas las teclas | Estado idéntico al recibido (`deepStrictEqual`) |
| C-11 | Secuencia fija aterriza con éxito | Desde `createState()`: pasos 1–162 sin teclas; pasos 163–270 con ↑; luego sin teclas hasta que `status !== 'flying'` (máximo 600 pasos en total) | `status = 'landed'` en máximo 600 pasos (≤ 600); vy al contacto entre 9 y 11; fuel = 64 ± 0.001; vx = 0; angle = 0 |
| C-12 | Determinismo | Correr C-11 dos veces | Estados finales idénticos (`deepStrictEqual`) |
| C-13 | Paso fijo | `CONFIG.DT === 1/60`; `step.length === 2` (no recibe tiempo) | Verdadero |
| C-14 | Pureza | Llamar a `step(s, input)` | `s` no cambia (comparar contra una copia hecha antes) |

Referencia del cálculo de C-11, hecho a mano con Euler semi-implícito:
- 162 pasos de caída: baja 73.35 px y llega a vy = 54.
- 108 pasos de empuje (neto −30): baja 48.15 px y llega a vy = 0. El borde inferior de la nave queda en 157.5.
- 30 pasos de caída: baja 2.58 px, toca suelo en el paso 300 con vy = 10.
- Combustible: 100 − 108 × (20/60) = 64.

## 3. Criterios estáticos (E)

| ID | Criterio |
|---|---|
| C-15 | `src/index.html` carga Phaser exactamente desde `https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js`, con scripts clásicos (sin `type="module"`) en el orden Phaser → physics → sprites → game. |
| C-16 | `src/js/physics.js` no menciona `Phaser`, `window`, `document`, `Date`, `performance` ni `Math.random`. |
| C-17 | No hay carga de archivos externos de assets (`this.load.*`, `fetch`, `XMLHttpRequest`); las texturas se generan en código. No hay imágenes en `src/`. |
| C-18 | `game.js` usa acumulador con `CONFIG.DT` y tope de 5 pasos por cuadro; nunca pasa el `delta` del cuadro a la física. |
| C-19 | Controles: ↑ = propulsor, ← / → = giro, R o Espacio = reintentar (solo en la pantalla final). Espacio se captura para que no haga scroll. |
| C-20 | El reinicio usa reinicio de escena con `createState()`, no `location.reload`. |
| C-21 | El HUD (HTML) muestra, leídos del estado de física: combustible como barra más número, velocidad vertical, velocidad horizontal, y ángulo con número más una mini nave que gira. La barra de combustible cambia de verde a amarillo a rojo según la fracción de `CONFIG.FUEL_START`, y parpadea en rojo. Las velocidades y el ángulo se pintan verde/rojo comparando contra `CONFIG.MAX_LAND_VY`, `MAX_LAND_VX` y `MAX_LAND_ANGLE`, sin umbrales escritos a mano. |
| C-22 | `src/README.md` explica cómo abrir el juego (doble clic, requiere internet), los controles y el comando de pruebas. |
| C-23 | `node --test "src/tests/*.test.js"` termina con 0 fallas y cubre C-01 a C-14. |
| C-24 | No hay `package.json`, `node_modules` ni dependencias instaladas. |
| C-25 | Arte (agregado por Nanni el 2026-10-01): la paleta tiene máximo 16 colores; la textura de la nave mide 12×12 px y la de cada cuadro de llama 4×4 px; las estrellas y los cráteres se generan con semillas constantes (nada aleatorio en cada carga); el suelo y la plataforma quedan en las posiciones de `CONFIG` (suelo desde `GROUND_Y` hasta `HEIGHT`, plataforma de `PLATFORM_X1` a `PLATFORM_X2` a partir de `GROUND_Y`). El aspecto visual sigue en C-M4. |

## 4. Criterios manuales (M) — Nanni

| ID | Criterio |
|---|---|
| C-M1 | Con doble clic en `src/index.html` (con internet), el juego carga y se juega sin errores propios del juego en la consola del navegador. Se acepta el aviso de `file://` ("Unsafe attempt to load URL file:///… 'file:' URLs are treated as unique security origins."), documentado en `src/README.md`. |
| C-M2 | Se puede completar un aterrizaje exitoso jugando a mano con el combustible inicial. |
| C-M3 | Se ven las pantallas de éxito y de choque, R o Espacio reinicia sin recargar, y Espacio no mueve la página. |
| C-M4 | El estilo es pixel art 16 bits nítido: lienzo de 320×180 con escala entera cuando cabe, píxeles parejos y sin desenfoque. La plataforma se distingue del suelo. El HUD y los textos de la pantalla final son HTML encima del canvas (monoespaciada en negrita, del sistema, tamaño relativo al ancho de la ventana, contorno oscuro) y se leen claramente, incluido "Te saliste de la pantalla". Estilo arcade: mayúsculas, letras espaciadas, brillo neón y paneles con borde de píxeles. Las animaciones usan `steps()`. En éxito el panel rebota y salen destellos; en choque se sacude y parpadea al entrar y luego queda quieto. Los números no tienen movimiento constante. Con `prefers-reduced-motion` no hay animaciones. Sin fuentes ni recursos de internet. |

## 5. Arte (para el agente de arte)

- **Nave:** 12×12 px, vista lateral, punta hacia arriba. Además, una llama de 4×4 px que se dibuja abajo de la nave mientras empuja.
- **Suelo:** franja de y = 160 a 180, gris lunar con algunos cráteres de 1 a 2 px.
- **Plataforma:** de x = 120 a 200, de y = 160 a 163, con un color que contraste y marcas en los extremos.
- **Fondo:** negro azulado con estrellas fijas. Si se generan con una semilla, que sea constante; nada de aleatorio en cada carga.
- **Paleta:** máximo 16 colores.
