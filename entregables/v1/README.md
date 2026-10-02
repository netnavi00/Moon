# Mensajero Orbital

Aterriza la nave de carga en la plataforma lunar sin chocar.

## Cómo abrirlo

Abre `index.html` con doble clic. **Necesitas internet**, porque Phaser 3.80.1 se carga desde el CDN de jsDelivr. No hay que instalar nada.

### Aviso conocido en la consola

Al abrirlo con doble clic, la consola del navegador puede mostrar:

```
Unsafe attempt to load URL file:///.../src/index.html from frame with URL file:///.../src/index.html. 'file:' URLs are treated as unique security origins.
```

Es un aviso del navegador por abrir la página desde `file://`, no un error del juego, y no tiene consecuencias: el juego carga y se juega normal.

## Controles

| Tecla | Acción |
|---|---|
| ↑ | Propulsor |
| ← / → | Girar la nave |
| R o Espacio | Reintentar (solo en la pantalla final) |

## Cómo se gana

Toca la plataforma amarilla con las tres lecturas en verde en el HUD:
- velocidad vertical de 15 o menos,
- velocidad horizontal de 10 o menos,
- ángulo de 10° o menos.

Si tocas el suelo fuera de la plataforma, te pasas de algún límite o sales de la pantalla, chocas. El combustible se acaba en 5 segundos de propulsor.

## Pruebas automáticas

Desde la carpeta `moon/`:

```
node --test "src/tests/*.test.js"
```

Solo necesitas Node, sin dependencias ni `package.json`. Las pruebas cubren la física y la evaluación del aterrizaje (criterios C-01 a C-14 de `proyecto/criterios.md`).

## Archivos

- `index.html`: página de entrada; tiene el HUD y la pantalla final en HTML/CSS.
- `js/physics.js`: lógica pura (paso fijo de 1/60 s). Funciona en el navegador y en Node.
- `js/sprites.js`: pixel art definido en código, sin archivos de imagen.
- `js/game.js`: escenas de Phaser, controles y bucle del juego.
- `tests/physics.test.js`: pruebas con `node:test`.
