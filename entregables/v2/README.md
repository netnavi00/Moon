# Mensajero Orbital

Campaña corta de 3 mundos: aterriza la nave de carga en la plataforma de cada uno sin chocar.

## Cómo abrirlo

Abre `index.html` con doble clic. **Necesitas internet**, porque Phaser 3.80.1 se carga desde el CDN de jsDelivr. No hay que instalar nada.

### Empezar en otro nivel (ayuda de prueba)

Agrega `?nivel=N` al final de la dirección en la barra del navegador y presiona Enter:

- `…/src/index.html?nivel=2` → arranca en Marte.
- `…/src/index.html?nivel=3` → arranca en el Asteroide.

Si `N` no es 1, 2 o 3, arranca en la Luna. No es un menú: es solo para probar.

### Aviso conocido en la consola

Al abrirlo con doble clic, la consola del navegador puede mostrar:

```
Unsafe attempt to load URL file:///.../src/index.html from frame with URL file:///.../src/index.html. 'file:' URLs are treated as unique security origins.
```

Es un aviso del navegador por abrir la página desde `file://`, no un error del juego, y no tiene consecuencias: el juego carga y se juega normal.

## Niveles

| # | Mundo | Qué cambia |
|---|---|---|
| 1 | Luna | Igual que la primera versión: gravedad 20, 100 de combustible, plataforma de 80 px |
| 2 | Marte | Viento constante hacia la izquierda (el HUD muestra su dirección y fuerza); 80 de combustible, plataforma de 64 px |
| 3 | Asteroide | Gravedad muy baja (8) y plataforma de 48 px que va y viene a 15 px/s, más rápido que el límite horizontal: hay que inclinar la nave para ir a su velocidad; 45 de combustible |

Cada nivel empieza con su propio combustible; no pasa de un nivel a otro.

## Progresión

- Aterrizas → pasas al siguiente nivel (la pantalla dice cuál).
- Chocas → reintentas el mismo nivel, sin límite.
- Aterrizas en el Asteroide → "¡Misión completa!"; R o Espacio vuelve a empezar desde la Luna.

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
- velocidad horizontal de 10 o menos (en el Asteroide se mide **relativa a la plataforma**, y así la muestra el HUD),
- ángulo de 10° o menos.

Los límites son los mismos en los 3 niveles. Si tocas el suelo fuera de la plataforma, te pasas de algún límite o sales de la pantalla (también si el viento te saca), chocas.

## Pruebas automáticas

Desde la carpeta `moon/`:

```
node --test "src/tests/*.test.js"
```

Solo necesitas Node, sin dependencias ni `package.json`. Cubren la física, los niveles, la progresión y una secuencia fija de teclas que gana cada nivel (criterios de `proyecto/criterios.md`).

## Archivos

- `index.html`: página de entrada; tiene el HUD y la pantalla final en HTML/CSS. Carga Phaser → `physics.js` → `levels.js` → `sprites.js` → `game.js`.
- `js/physics.js`: lógica pura (paso fijo de 1/60 s), con el nivel y el número de paso como argumentos opcionales. Funciona en el navegador y en Node.
- `js/levels.js`: los 3 niveles como datos y la regla de progresión. Funciona en el navegador y en Node.
- `js/sprites.js`: pixel art definido en código, una paleta por mundo, sin archivos de imagen.
- `js/game.js`: escenas de Phaser, controles, HUD y campaña.
- `tests/physics.test.js`: pruebas de la primera versión (no se modifican).
- `tests/levels.test.js` y `tests/worlds.test.js`: pruebas de los niveles y los mundos.
