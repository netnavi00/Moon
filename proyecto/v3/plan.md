# Plan: Mensajero Orbital v3

> Estado: **decidido en modo autónomo** el 2026-10-11 (`proyecto/autorizacion-v3.md`). Fuente de verdad: `proyecto/brief.md` y `proyecto/criterios.md` (v3).
> Lo que no cambia respecto a v2 (paso fijo, acumulador, escala, HUD en HTML, `platformAt`, progresión) sigue como en `proyecto/v2/plan.md`.

## 1. Fases

| # | Fase | Quién | Sale con | Control |
|---|---|---|---|---|
| 0 | Brief, plan, tareas y criterios | Intake / Coordinador | `proyecto/*.md` | Decisiones en `decisiones-autonomas.md` |
| 1 | Pruebas nuevas (fallan primero) | Programador | `src/tests/campaign.test.js`, `src/tests/score.test.js` | Fallan solo por lo que falta |
| 2 | Datos, física, puntaje y guardado | Programador | `levels.js`, `physics.js`, `score.js`, `save.js` | Tests de v2 que fallen por los 6 niveles: ver falla → ajustar solo eso |
| 3 | Arte | Arte | `sprites.js` | C-62 en verde |
| 4 | Juego, HTML y README | Programador | `game.js`, `index.html`, `README.md` | — |
| 5 | Revisión | Revisor (subagente) | Reporte | Foto de hashes de `src/` antes y después; salida completa de pruebas |
| 6 | Diagnóstico y reparación | Coordinador → reparador | Arreglo mínimo | Máximo 3 ciclos por problema; si no, queda pendiente en `estado.md` |
| 7 | Reporte final | Coordinador | Reporte a Nanni | Nanni prueba; cierre a `entregables/v3/` solo con su aprobación |

## 2. Archivos

```
src/
├── index.html            # + filas de total; panel final con desglose; carga score.js y save.js
├── README.md
├── js/
│   ├── physics.js        # + windAt; fuelRate y start.vx/vy opcionales
│   ├── levels.js         # + niveles 4 a 6 (datos)
│   ├── score.js          # NUEVO: scoreLanding, campaignTotal (puro)
│   ├── save.js           # NUEVO: parse/record/resolveStart (puros) + load/write/clear con try/catch
│   ├── sprites.js        # + temas gigante, tormenta, aproximacion
│   └── game.js           # puntaje, guardado, HUD dinámico de viento
└── tests/
    ├── physics.test.js   # v1, SIN CAMBIOS
    ├── levels.test.js    # v2; solo C-26, C-28, C-36 y C-37 si fallan por los 6 niveles
    ├── worlds.test.js    # v2, sin cambios previstos
    ├── campaign.test.js  # NUEVO: C-44 a C-56
    └── score.test.js     # NUEVO: C-57 a C-63
```

## 3. Física: mecánicas como datos opcionales

- `step` sigue con la firma `step(state, input, level = DEFAULT_LEVEL, n = 0)`. Solo cambian dos líneas:
  - el consumo usa `level.fuelRate ?? CONFIG.FUEL_RATE`,
  - el viento usa `windAt(level, n)`.
- `windAt(level, n)` es pura. Sin `gusts` regresa `level.wind`, el mismo número que v2, así que Luna, Marte y Asteroide dan resultados idénticos bit a bit.
- `createState(level)` toma `vx`/`vy` de `level.start` con 0 por defecto y conserva los mismos 8 campos.
- `DEFAULT_LEVEL` no cambia.
- **Por qué así:** los niveles 1 a 3 no traen los campos nuevos y los valores por defecto reproducen exactamente las operaciones de v2. C-45 lo comprueba paso a paso contra `entregables/v2/js/physics.js`.

## 4. Puntaje y guardado fuera de la física

- `score.js` y `save.js` son scripts clásicos con la misma envoltura UMD (`MoonScore`, `MoonSave`), sin dependencias.
- `scoreLanding` recibe la plataforma ya calculada (`platformAt(level, stepCount)`), así que no toca `physics.js`.
- El total de campaña es la suma de los mejores puntajes por nivel (D-07). Así funciona igual al arrancar desde un nivel guardado y no puede bajar al chocar.
- `save.js` recibe el `storage` como argumento. `game.js` obtiene `window.localStorage` dentro de un try/catch: si el acceso lanza, `storage = null` y se juega sin guardar.
- `resolveStart(location.search, save, LEVELS)` decide el nivel inicial, si se guarda y si se borra.

## 5. Juego (`game.js`)

- **Arranque:** `storage` → `resolveStart`. Si `reset`, se llama `clearSave`. Luego `save = loadSave(...)` (o vacío) y `persist`. El nivel inicial sale de `resolveStart`.
- **Al aterrizar:** `scoreLanding` → `recordLanding` (en memoria) → `writeSave` solo si `persist`.
- **Panel final:** desglose del puntaje y "Nuevo récord" o "Mejor: Y". El HUD actualiza el total.
- **HUD de viento:** fila visible si el nivel tiene `wind ≠ 0` o `gusts`. Valor `windAt(level, stepCount)` en cada cuadro.

## 6. Arte

- Tres temas nuevos de 9 colores (índices 0 a 8) más los 7 de la nave:
  - **gigante:** cielo violeta oscuro, suelo pardo-ocre pesado y cráteres grandes,
  - **tormenta:** cielo gris azulado, suelo pizarra y pocas estrellas,
  - **aproximacion:** espacio profundo, cubierta metálica y plataforma cian.
- Los temas de v2 no se tocan.

## 7. Revisión

- Antes y después de cada revisión, el coordinador toma una foto con sha256 completo de `src/` y la guarda en `proyecto/foto-src.md` (no se le pasa al revisor).
- El coordinador pasa al revisor la salida completa de `node --test "src/tests/*.test.js"` y el sha256 del test de v1.
