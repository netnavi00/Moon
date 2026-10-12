# Mensajero Orbital

Campaña de 6 mundos: aterriza la nave de carga en la plataforma de cada uno sin chocar, con el mejor puntaje que puedas.

## Cómo abrirlo

Abre `index.html` con doble clic. **Necesitas internet**, porque Phaser 3.80.1 se carga desde el CDN de jsDelivr. No hay que instalar nada.

El juego arranca en el nivel más alto que hayas desbloqueado (se guarda en el navegador).

### Ayudas en la dirección (agrega al final y presiona Enter)

| Dirección | Qué hace |
|---|---|
| `…/src/index.html` | Arranca en el nivel guardado |
| `…/src/index.html?nuevo` | **Borra lo guardado** (avance y récords) y empieza desde la Luna |
| `…/src/index.html?nivel=4` | Arranca en ese nivel (1 a 6). Es solo para probar: **no guarda nada** mientras juegas así |

Si `N` no es un nivel válido, `?nivel=N` arranca en la Luna. No es un menú.

### Aviso conocido en la consola

Al abrirlo con doble clic, la consola del navegador puede mostrar:

```
Unsafe attempt to load URL file:///.../src/index.html from frame with URL file:///.../src/index.html. 'file:' URLs are treated as unique security origins.
```

Es un aviso del navegador por abrir la página desde `file://`, no un error del juego: el juego carga y se juega normal.

## Niveles

| # | Mundo | Qué cambia |
|---|---|---|
| 1 | Luna | Gravedad 20, 100 de combustible, plataforma de 80 px |
| 2 | Marte | Viento constante hacia la izquierda; 80 de combustible, plataforma de 64 px |
| 3 | Asteroide | Gravedad 8 y plataforma de 48 px que va y viene a 15 px/s; 45 de combustible |
| 4 | Luna gigante | Gravedad 30 y el propulsor gasta más (30 por segundo en vez de 20); 90 de combustible, plataforma de 40 px |
| 5 | Tormenta | Ráfagas que cambian de dirección en ciclos de 4 s: → 15 por 1 s, ← 15 por 2 s, → 15 por 1 s. El HUD muestra el viento del momento. 50 de combustible, plataforma de 48 px |
| 6 | Aproximación | Sin gravedad: entras volando en diagonal (velocidad 32 → y 28 ↓) y tienes que frenar girando la nave; 30 de combustible, plataforma de 40 px |

Cada nivel empieza con su propio combustible.

## Puntaje

Solo al aterrizar (chocar no suma ni resta). Máximo 1000 por nivel:

| Parte | Cómo se calcula | Máximo |
|---|---|---|
| Precisión | Qué tan cerca del centro de la plataforma tocas: 500 en el centro, 0 en la orilla | 500 |
| Combustible | Lo que te sobra, como fracción del combustible inicial del nivel | 300 |
| Tiempo | 200 menos 1 punto por cada 4 pasos de física (1/15 s) desde el inicio | 200 |

La pantalla de éxito muestra el desglose y si es récord. El **Total** del HUD es la suma de tu mejor puntaje en cada nivel.

## Guardado

Se guardan en el navegador el nivel más alto desbloqueado y el mejor puntaje de cada nivel. Si el navegador no deja guardar, el juego funciona igual, solo que no recuerda nada al recargar.

## Progresión

- Aterrizas → pasas al siguiente nivel (la pantalla dice cuál).
- Chocas → reintentas el mismo nivel, sin límite.
- Aterrizas en el nivel 6 → "¡Misión completa!" con el total de campaña; R o Espacio vuelve a empezar desde la Luna.

Todo sin recargar la página.

## Controles

| Tecla | Acción |
|---|---|
| ↑ | Propulsor |
| ← / → | Girar la nave |
| R o Espacio | En la pantalla final: continuar, reintentar o volver a empezar |

## Cómo se gana

Toca la plataforma con las tres lecturas en verde en el HUD:
- velocidad vertical de 15 o menos,
- velocidad horizontal de 10 o menos (en el Asteroide se mide relativa a la plataforma),
- ángulo de 10° o menos.

Los límites son los mismos en todos los niveles. Si tocas el suelo fuera de la plataforma, te pasas de algún límite o sales de la pantalla, chocas.

## Pruebas automáticas

Desde la carpeta `moon/`:

```
node --test "src/tests/*.test.js"
```

Solo necesitas Node, sin dependencias ni `package.json`. Cubren la física, los niveles, las mecánicas, una secuencia fija que gana cada nivel, el puntaje y el guardado (criterios de `proyecto/criterios.md`). `tests/campaign.test.js` compara los niveles 1 a 3 con `entregables/v2/`.

## Archivos

- `index.html`: página de entrada, con el HUD y la pantalla final en HTML/CSS. Carga Phaser → `physics.js` → `levels.js` → `score.js` → `save.js` → `sprites.js` → `game.js`.
- `js/physics.js`: lógica pura (paso fijo de 1/60 s). Recibe el nivel y el número de paso como argumentos opcionales. Incluye `windAt` para las ráfagas.
- `js/levels.js`: los 6 niveles como datos y la regla de progresión. Las mecánicas nuevas son campos opcionales: `fuelRate`, `gusts` y `start.vx`/`start.vy`.
- `js/score.js`: puntaje (funciones puras).
- `js/save.js`: guardado (lectura y escritura protegidas con try/catch) y elección del nivel inicial.
- `js/sprites.js`: pixel art en código, con una paleta por mundo y sin archivos de imagen.
- `js/game.js`: escenas de Phaser, controles, HUD, puntaje y guardado.
- `tests/physics.test.js`: pruebas de la primera versión (no se modifican).
- `tests/levels.test.js` y `tests/worlds.test.js`: pruebas de v2.
- `tests/campaign.test.js` y `tests/score.test.js`: pruebas de v3.
