# Plan: Mensajero Orbital (versión mínima)

> Estado: **aprobado por Nanni el 2026-10-01**, con la condición de que C-11 se confirme en la primera corrida. Fuente de verdad: `proyecto/brief.md` (aprobado 2026-10-01).

## 1. Fases

| # | Fase | Quién | Sale con | Punto de revisión |
|---|---|---|---|---|
| 0 | Plan, tareas y criterios | Coordinador | `plan.md`, `tareas.md`, `criterios.md` | **Aprobación de Nanni** |
| 1 | Lógica y pruebas | Programador | `src/js/physics.js`, `src/tests/physics.test.js` | `node --test` en verde |
| 2 | Arte e interfaz (en paralelo) | Arte + Programador | `src/js/sprites.js`, `src/index.html`, `src/js/game.js`, `src/README.md` | — |
| 3 | Revisión | Revisor | Reporte contra `criterios.md` | Si falla → diagnóstico/reparación (máx. 3 ciclos) |
| 4 | Verificación manual | Nanni | Visto bueno de los criterios manuales | **Aprobación de Nanni** |
| 5 | Cierre | Coordinador | Copia en `entregables/v1/`, lecciones | **Aprobación de Nanni** |

La fase de diseño de `diseno.md` se absorbe aquí: las mecánicas y sus números ya quedan fijos en `criterios.md`, así que no hace falta un agente de diseño para esta versión.

## 2. Estructura de archivos

```
src/
├── index.html            # entrada; se abre con doble clic
├── README.md             # cómo abrir, jugar y correr pruebas
├── js/
│   ├── physics.js        # lógica pura: estado, paso de física, evaluación de aterrizaje
│   ├── sprites.js        # pixel art definido en código (matrices + paleta) → texturas
│   └── game.js           # escenas de Phaser, entrada, HUD, bucle de paso fijo
└── tests/
    └── physics.test.js   # pruebas con node:test
```

Identificadores en inglés; textos que ve el jugador en español.

## 3. Decisión: cómo se carga la lógica de física (navegador + Node, sin instalar nada)

**Problema.** Con doble clic, `index.html` se abre como `file://`. Ahí Chrome bloquea los módulos ES (`<script type="module">`) y también la carga de archivos con `fetch`/XHR (que Phaser usa para imágenes). Node, por su parte, necesita poder hacer `require` del mismo archivo.

**Decisión.**
1. `physics.js` es un **script clásico** con envoltura tipo UMD, sin `import`/`export`:
   ```
   (function (root, factory) {
     const api = factory();
     if (typeof module === 'object' && module.exports) module.exports = api;   // Node
     else root.MoonPhysics = api;                                              // navegador
   })(typeof globalThis !== 'undefined' ? globalThis : this, function () { ... return { CONFIG, createState, step, evaluateLanding }; });
   ```
   - En el navegador queda disponible como `window.MoonPhysics`.
   - En Node, sin `package.json`, un `.js` sin sintaxis ESM se trata como CommonJS, así que `require('../js/physics.js')` funciona sin configurar nada.
2. `physics.js` **no toca** Phaser, `window`, `document` ni el reloj. Solo números y objetos.
3. `index.html` carga todo con `<script src>` clásicos, en este orden: Phaser (CDN) → `js/physics.js` → `js/sprites.js` → `js/game.js`.
4. **Sin archivos de imagen.** Por la restricción de `file://`, el arte se define en código (matrices de caracteres + paleta en `sprites.js`) y se convierte en texturas al arrancar. Esto cae dentro de lo que permite el brief ("dibujados en código").
5. Las pruebas se corren desde `moon/` con:
   ```
   node --test "src/tests/*.test.js"
   ```
   Usan solo `node:test` y `node:assert/strict`. Cero dependencias, sin `package.json`.

Nota: el juego necesita internet al abrirse, porque Phaser viene del CDN. Las pruebas no lo necesitan.

## 4. Decisión: paso de tiempo fijo (determinismo)

**Regla.** La física avanza **solo** en pasos de `DT = 1/60 s` exactos. Nunca se le pasa a la física el `delta` real del cuadro.

- `step(state, input)` no recibe tiempo: usa `CONFIG.DT` por dentro. Es una función pura: devuelve un estado nuevo y no modifica el que recibe.
- `input = { thrust: bool, left: bool, right: bool }`.
- **Orden dentro de un paso** (fijo, las pruebas dependen de él):
  1. Si `status !== 'flying'`, se devuelve el mismo estado sin cambios.
  2. Giro: `angle += ROT_SPEED * DT` (derecha) / `-=` (izquierda). Si ambas teclas están presionadas, se anulan.
  3. Empuje: si `thrust` y `fuel > 0` → aceleración de empuje en la dirección de la punta, y `fuel = max(0, fuel - FUEL_RATE * DT)`.
  4. Gravedad: `ay += GRAVITY`.
  5. Velocidad: `vx += ax * DT`, `vy += ay * DT`.
  6. Posición (Euler semi-implícito, con la velocidad ya actualizada): `x += vx * DT`, `y += vy * DT`.
  7. Colisiones: primero los bordes de pantalla, luego el contacto con el suelo (ver `criterios.md`, sección 1).
- **Convenciones:** coordenadas de pantalla (y crece hacia abajo), unidades en píxeles del lienzo base y segundos. `angle` en grados, 0 = punta hacia arriba, positivo = sentido horario. Dirección del empuje: `(sin(angle), -cos(angle))`.
- **En el juego (`game.js`)**, el bucle usa un acumulador:
  - `acc += min(delta, 250) / 1000`.
  - Mientras `acc >= DT` y se hayan dado menos de 5 pasos en el cuadro: `state = step(state, input)` y `acc -= DT`.
  - La entrada se lee una vez por cuadro y se aplica a todos los pasos de ese cuadro.
  - Si se llega al tope de 5 pasos, el sobrante se descarta (`acc = 0`) para no acumular atraso.
- **En las pruebas**, se llama a `step` N veces con entradas predefinidas. Mismo código, mismos resultados, siempre.

## 5. Pantallas y flujo del juego

- **`FlightScene`**: dibuja en el canvas el fondo, el suelo, la plataforma, la nave y la llama del propulsor cuando empuja. Además actualiza el HUD (combustible, vel. vertical, vel. horizontal, ángulo) con los valores del estado de física.
- Cuando `status` pasa a `landed` o `crashed`, se lanza **`EndScene`**, que muestra el resultado ("¡Aterrizaje exitoso!" / "¡Choque!" con el motivo) y la instrucción "R o Espacio para reintentar". Espacio se captura con Phaser para que no haga scroll.
- Al reintentar, `FlightScene` se reinicia con `createState()`, sin recargar la página.
- **Textos en HTML, no en el canvas** (cambio del 2026-10-01): el HUD (`#hud`) y el panel final (`#end`) son elementos HTML encima del canvas, dentro de `#stage`.
  - Fuente monoespaciada del sistema en negrita, sin fuentes de internet.
  - Tamaño en `vw` (relativo al ancho de la ventana) con mínimo y máximo (`clamp`).
  - Color claro con contorno oscuro (`text-shadow`).
  - El texto de 8 px dentro del lienzo de 320×180 se veía borroso y deforme al escalar.
  - **Estilo arcade** (cambio del 2026-10-01): todo en HTML/CSS dentro de `index.html`, sin tocar la física ni el lienzo.
    - Mayúsculas, letras espaciadas, brillo neón y paneles con borde de píxeles.
    - Barra de combustible verde/amarillo/rojo que parpadea cuando queda poco.
    - Velocidades y ángulo en verde/rojo según los límites de `CONFIG`.
    - Mini nave SVG que gira con el ángulo.
    - Animaciones con `steps()`: rebote y destellos en éxito; sacudida y parpadeo al entrar en choque, y luego quieto.
    - Todo se desactiva con `prefers-reduced-motion`.
- **Lienzo y escala**: el lienzo se queda en 320×180, con `pixelArt: true` y `Scale.NONE` + `zoom`.
  - El zoom es entero en píxeles físicos cuando cabe: `floor(min(ancho/320, alto/180) × devicePixelRatio) / devicePixelRatio`. Así los píxeles salen parejos aun con la escala de Windows al 125 % o 150 %.
  - Si la ventana es más chica que 320×180, se ajusta sin ser entero.
  - Se recalcula al cambiar el tamaño de la ventana, y `#stage` se centra con CSS.

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Sin internet no carga Phaser | Se documenta en el README; pasar a copia local requiere tu aprobación |
| Texto del HUD borroso a baja resolución | Revisión manual (C-M4); si molesta, se ajusta en un ciclo de reparación |
| La secuencia fija de teclas no aterriza por errores de redondeo | Se calculó a mano con márgenes (ver C-11); se confirma en la primera corrida de pruebas |

## 7. Decisiones de Nanni (2026-10-01)

1. El agente de arte solo escribe en `src/js/sprites.js` (ya está en la tabla de permisos de CLAUDE.md).
2. Los roles se corren en esta sesión respetando sus permisos. Antes de la fase 3, el revisor se define como agente real en `.claude/agents/`, con herramientas restringidas a leer y correr pruebas.
3. Al cierre, con aprobación de Nanni, el coordinador copia `src/` a `entregables/v1/`.
4. Si C-11 no da lo calculado, no se ajusta la prueba: pasa al diagnosticador para clasificar si falla la secuencia o la física.
