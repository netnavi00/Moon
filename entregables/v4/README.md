# Mensajero Orbital

Campaña de 10 mundos: aterriza la nave de carga sin chocar y, desde el nivel 7, recoge un paquete y entrégalo en otra plataforma. Gana con el mejor puntaje que puedas.

## Cómo abrirlo

Abre `index.html` con doble clic. **Necesitas internet**, porque Phaser 3.80.1 se carga desde el CDN de jsDelivr. No hay que instalar nada.

El juego arranca en el nivel más alto que hayas desbloqueado (se guarda en el navegador).

### Ayudas en la dirección (agrega al final y presiona Enter)

| Dirección | Qué hace |
|---|---|
| `…/src/index.html` | Arranca en el nivel guardado |
| `…/src/index.html?nuevo` | **Borra lo guardado** (avance y récords) y empieza desde la Luna |
| `…/src/index.html?nivel=7` | Arranca en ese nivel (1 a 10). Es solo para probar: **no guarda nada** mientras juegas así |

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
| 7 | Primera entrega | **Misión**: recoge el paquete en A (izquierda) y llévalo a B, 120 px a la derecha. 110 de combustible para todo el nivel; plataformas de 60 px |
| 8 | Carga pesada | Misión hacia la izquierda. **Con el paquete a bordo el propulsor empuja al 60 %** (sube mucho más lento). A medio camino, un poco arriba de la ruta, hay una cápsula de combustible (+30) y puntos (50). 150 de combustible; plataformas de 60 px |
| 9 | Cápsulas | Misión con **cápsulas** en el camino. Solo 80 de combustible: sin las dos cápsulas de la ruta no alcanza. B de 50 px |
| 10 | Gran entrega | Todo junto: gravedad 22, carga pesada (70 %), cápsulas, salto largo a la izquierda y B de 44 px. 110 de combustible |

Cada nivel empieza con su propio combustible.

## Misiones (niveles 7 a 10)

- **A** es la plataforma con el paquete encima (sus colores van al revés que los de B). **B** es la de entrega.
- Aterriza bien en A: recoges el paquete y la nave se queda estacionada, derecha y quieta. Presiona ↑ para despegar.
- Aterriza bien en B con el paquete: entregas y ganas el nivel.
- Si aterrizas bien en una plataforma que no toca (B sin paquete, o A con él), la nave solo se estaciona y puedes volver a despegar.
- El combustible es uno solo para todo el nivel. Si te estacionas sin combustible antes de entregar, pierdes ("Te quedaste sin combustible").
- Chocar reinicia el nivel completo: el paquete vuelve a A, el combustible se llena y las cápsulas regresan.

El HUD dice si el paquete está **Por recoger**, **A bordo** o **Entregado**.

## Cápsulas

Se recogen al tocarlas en vuelo (la caja de la nave toca la de la cápsula) y desaparecen:

| Cápsula | Da |
|---|---|
| Azul con blanco | Combustible |
| Amarilla con naranja | Puntos |
| Mitad azul, mitad amarilla | Combustible y puntos |

El combustible que dan no pasa del tanque lleno del nivel. El HUD cuenta las cápsulas tomadas (por ejemplo, `2/3`).

## Puntaje

Solo al ganar (chocar no suma ni resta).

**Niveles 1 a 6** (máximo 1000):

| Parte | Cómo se calcula | Máximo |
|---|---|---|
| Precisión | Qué tan cerca del centro de la plataforma tocas: 500 en el centro, 0 en la orilla | 500 |
| Combustible | Lo que te sobra, como fracción del combustible inicial del nivel | 300 |
| Tiempo | 200 menos 1 punto por cada 4 pasos de física (1/15 s) desde el inicio | 200 |

**Misiones, niveles 7 a 10** (máximo 1000 más las cápsulas):

| Parte | Cómo se calcula | Máximo |
|---|---|---|
| Entrega | Por entregar el paquete | 400 |
| Precisión | Qué tan cerca del centro de B tocas | 200 |
| Combustible | Lo que te sobra, como fracción del combustible inicial | 200 |
| Tiempo | 200 menos 1 punto por cada 8 pasos de física (2/15 s) | 200 |
| Cápsulas | Suma de los puntos de las cápsulas que tomaste | — |

La pantalla de éxito muestra el desglose y si es récord. El **Total** del HUD es la suma de tu mejor puntaje en cada nivel.

## Guardado

Se guardan en el navegador el nivel más alto desbloqueado y el mejor puntaje de cada nivel. Si el navegador no deja guardar, el juego funciona igual, solo que no recuerda nada al recargar.

## Progresión

- Ganas → pasas al siguiente nivel (la pantalla dice cuál).
- Chocas → reintentas el mismo nivel, sin límite.
- Ganas el nivel 10 → "¡Misión completa!" con el total de campaña; R o Espacio vuelve a empezar desde la Luna.

Todo sin recargar la página.

## Controles

| Tecla | Acción |
|---|---|
| ↑ | Propulsor (también para despegar de una plataforma) |
| ← / → | Girar la nave (estacionada no gira) |
| R o Espacio | En la pantalla final: continuar, reintentar o volver a empezar |

## Cómo se aterriza bien

Toca la plataforma con las tres lecturas en verde en el HUD:
- velocidad vertical de 15 o menos,
- velocidad horizontal de 10 o menos (en el Asteroide se mide relativa a la plataforma),
- ángulo de 10° o menos.

Los límites son los mismos en todos los niveles. Si tocas el suelo fuera de una plataforma, te pasas de algún límite o sales de la pantalla, chocas.

## Pruebas automáticas

Desde la carpeta `moon/`:

```
node --test "src/tests/*.test.js"
```

Solo necesitas Node, sin dependencias ni `package.json`. Cubren la física, los niveles, las mecánicas, la misión, las cápsulas, una secuencia fija que gana cada nivel, el puntaje y el guardado (criterios de `proyecto/criterios.md`). `tests/campaign.test.js` compara los niveles 1 a 3 con `entregables/v2/`, y `tests/mission.test.js` compara los niveles 1 a 6 con `entregables/v3/`.

### Piloto automático (solo para pruebas)

`tests/autopilot.js` busca secuencias de teclas que ganan una misión. Con él se generaron las secuencias de los niveles 8 a 10, que las pruebas guardan como listas fijas (no corren el piloto). El juego nunca lo carga. Para usarlo:

```
node src/tests/autopilot.js 8 '{"dir":-1,"turn":20}'
```

## Archivos

- `index.html`: página de entrada, con el HUD y la pantalla final en HTML/CSS. Carga Phaser → `physics.js` → `levels.js` → `mission.js` → `score.js` → `save.js` → `sprites.js` → `game.js`.
- `js/physics.js`: lógica pura (paso fijo de 1/60 s). Recibe el nivel y el número de paso como argumentos opcionales. Incluye `windAt` para las ráfagas y un factor de empuje opcional (`thrustFactor`).
- `js/levels.js`: los 10 niveles como datos y la regla de progresión. Las mecánicas son campos opcionales: `fuelRate`, `gusts`, `start.vx`/`start.vy`, `pickup` (misión), `cargoThrust` (carga pesada) y `capsules`.
- `js/mission.js`: estado de misión (paquete, estacionamiento, cápsulas y entrega) alrededor de la física, sin cambiarla.
- `js/score.js`: puntaje (funciones puras).
- `js/save.js`: guardado (lectura y escritura protegidas con try/catch) y elección del nivel inicial.
- `js/sprites.js`: pixel art en código (nave, paquete, cápsulas y una paleta por mundo), sin archivos de imagen.
- `js/game.js`: escenas de Phaser, controles, HUD, puntaje y guardado.
- `tests/physics.test.js`: pruebas de la primera versión (no se modifican).
- `tests/levels.test.js` y `tests/worlds.test.js`: pruebas de v2.
- `tests/campaign.test.js` y `tests/score.test.js`: pruebas de v3.
- `tests/mission.test.js` y `tests/sequences.test.js`: pruebas de v4.
- `tests/autopilot.js`: piloto automático (solo pruebas).
