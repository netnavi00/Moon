# Brief: Mensajero Orbital v2

> Estado: **aprobado por Nanni el 2026-10-02.** Armado por intake el 2026-10-01; respuestas de Nanni incorporadas el 2026-10-02.
> Documentos de v1 archivados en `proyecto/v1/`. Entregable de v1 en `entregables/v1/`.

## Resumen
Segunda versión del juego web en pixel art 16 bits de la nave de carga que aterriza en plataformas. Pasa de un nivel a una campaña corta de 3 mundos con dificultad creciente. Para Nanni como jugador y evaluador.

## Objetivo
Entregar una campaña jugable de principio a fin: Luna → Marte → Asteroide. Aterrizar avanza al siguiente nivel y chocar reintenta el mismo. Los niveles se definen como datos y no como código escrito a mano para cada uno, y la Luna se comporta idéntica a v1.

## Alcance (versión v2)
- Incluye:
  - Niveles definidos como datos: cada nivel es una entrada con sus valores (gravedad, combustible, plataforma, posición inicial, viento, movimiento de la plataforma, etc.), y el mismo código de física y dibujo sirve para todos.
  - Las medidas de las texturas (suelo, plataforma, fondo) salen de `CONFIG` y de los datos del nivel, no de números escritos a mano en `sprites.js`.
  - 3 niveles:
    1. **Luna**: igual que v1.
    2. **Marte**: con viento lateral constante.
    3. **Asteroide**: gravedad mínima y plataforma móvil que va y viene.
  - Progresión: aterrizar pasa al siguiente nivel, chocar reintenta el mismo y aterrizar en el último nivel termina la campaña.
  - Dificultad que sube por nivel.
  - Pantalla de "misión completa" al terminar la campaña.
  - El HUD muestra el nivel actual.
  - Ayuda de prueba `?nivel=N` en la URL.
  - Lo de v1 se mantiene: controles, combustible limitado, HUD, pantallas de éxito y choque, y reinicio sin recargar.
  - En Marte, el HUD muestra un indicador de la dirección y fuerza del viento.
- No incluye (queda para v3):
  - Puntaje.
  - Sonido.
  - Menú.
  - Luna gigante.
  - Cinturón de rocas.
- Tampoco incluye:
  - Vidas o límite de reintentos.
  - Igual que v1: guardar el progreso entre sesiones, controles táctiles o de gamepad, ni publicar en internet.

## Requisitos

### Base y regresión
1. Todo lo de v1 que no cambie este brief sigue vigente (`proyecto/v1/brief.md`, requisitos 1 a 13).
2. **Regresión:** las pruebas de v1 siguen pasando y la Luna se comporta idéntica.
3. `src/tests/physics.test.js` de v1 se queda **sin cambios** (mismo sha256 que en `entregables/v1/`) y pasa completo. Por eso:
   - `createState()` sin argumentos regresa el estado de Luna con la misma forma de v1 (los mismos 8 campos, nada extra).
   - `step` sigue teniendo 2 parámetros obligatorios.
   - `CONFIG` conserva los nombres y valores que usan las pruebas.
   - Las pruebas nuevas van en archivos aparte.
   - Si el diseño para pasar el nivel a la física se vuelve retorcido, **no se edita el test de v1**: la decisión se escala a Nanni.
4. `evaluateLanding` recibe como segundo parámetro opcional un objeto de plataforma `{ x1, x2, vx }` (extremos de la plataforma y su velocidad horizontal en ese paso), con los valores de la Luna por defecto (`x1 = 120`, `x2 = 200`, `vx = 0`), para que las pruebas de v1 pasen sin cambios.

### Niveles como datos
5. Los niveles son datos: agregar o ajustar un nivel no requiere escribir lógica nueva, solo editar su entrada de datos.
6. Los datos de los niveles viven en un script clásico (sin `type="module"`) que funciona abriendo `index.html` con doble clic y también con `require` en Node. Se carga en `index.html` antes de los scripts que lo usan; el orden exacto se fija en `criterios.md`.
7. La regla de progresión vive en una función pura junto a los datos de los niveles y se prueba con Node. La regla: aterrizar pasa al siguiente nivel, chocar reintenta el mismo y aterrizar en el último nivel termina la campaña.
8. Las medidas de las texturas de suelo, plataforma y fondo se calculan desde `CONFIG` y los datos del nivel.

### Mundos
9. Hay 3 niveles en este orden: Luna, Marte y Asteroide.
10. Luna usa exactamente los valores de v1.
11. Marte tiene viento lateral constante en dirección y fuerza durante todo el nivel: una aceleración horizontal fija que mueve la nave sin gastar combustible.
12. Asteroide tiene gravedad menor que la de la Luna y una plataforma que se mueve en horizontal a velocidad constante entre dos límites, rebota en los extremos y empieza en una posición fija.
13. En la plataforma móvil, la velocidad horizontal del aterrizaje se mide **relativa a la plataforma**, y el valor y el color verde/rojo de esa velocidad en el HUD usan también el valor relativo.
14. En los 3 niveles la superficie es plana, la posición inicial es fija (viene en los datos del nivel) y salir de la pantalla por cualquier borde es choque, también cuando el viento saca a la nave.
15. La física sigue siendo pura y determinista en los 3 niveles: el viento y la plataforma móvil dependen solo del estado y del número de paso, nunca de `Math.random` ni del reloj.

### Dificultad y progresión
16. La dificultad sube por nivel así:
    - En cada nivel, el combustible inicial y el ancho de la plataforma son menores o iguales que en el anterior, y al menos uno de los dos es estrictamente menor.
    - Cada nivel suma su reto propio (viento o plataforma móvil).
    - Los límites de aterrizaje (velocidad vertical, velocidad horizontal y ángulo) son iguales en los 3 niveles.
17. Cada nivel empieza con su propio combustible inicial; el combustible no pasa de un nivel a otro.
18. Los reintentos son ilimitados.
19. En la pantalla final, R o Espacio continúa: si aterrizaste, pasa al siguiente nivel (la pantalla de éxito dice cuál, por ejemplo "Siguiente: Marte"); si chocaste, reintenta el mismo. En la pantalla de "misión completa", R o Espacio vuelve a empezar desde la Luna.

### Interfaz y pruebas
20. El HUD muestra el nivel actual con el formato "NIVEL N/3 · NOMBRE", por ejemplo "NIVEL 2/3 · MARTE".
21. Agregar `?nivel=N` a la URL (`index.html?nivel=2`) arranca en ese nivel. Es una ayuda de prueba, no un menú, y queda documentada en `src/README.md`.
22. Cada nivel tiene una prueba automática con una secuencia fija de teclas que aterriza con éxito, como C-11 de v1, para garantizar que se puede ganar.
23. Visualmente: Marte tiene suelo rojizo y cielo más cálido, y Asteroide suelo gris oscuro rocoso y más estrellas. La nave es la misma en los 3 niveles, con máximo 16 colores por mundo.

## Criterios de aceptación (medibles)
Los valores numéricos de cada nivel, el orden de los scripts y las secuencias fijas se definen en `proyecto/criterios.md`. Aquí se define qué se mide:
- `node --test "src/tests/*.test.js"` termina con 0 fallas, incluidas las 14 pruebas de v1.
- El sha256 de `src/tests/physics.test.js` es igual al de `entregables/v1/tests/physics.test.js`.
- Los datos de Luna coinciden con los valores de `proyecto/v1/criterios.md`.
- `evaluateLanding` llamada sin el parámetro de plataforma da los mismos resultados que en v1. Con un objeto de plataforma, revisa la posición contra sus `x1` y `x2` y evalúa la velocidad horizontal relativa a su `vx`.
- El archivo de niveles se carga con `require` en Node, y `index.html` lo carga como script clásico en el orden definido. *(Prueba automática + revisión estática.)*
- La función de progresión, probada con Node:
  - Si aterrizas en el nivel N con N < 3, regresa el nivel N+1.
  - Si chocas en el nivel N, regresa N.
  - Si aterrizas en el nivel 3, indica fin de campaña.
- `sprites.js` no tiene medidas de suelo, plataforma ni fondo escritas a mano: todas se derivan de `CONFIG` o de los datos del nivel. *(Revisión estática.)*
- Marte: con controles soltados y la nave derecha, la velocidad horizontal cambia por el viento según el valor definido, y el combustible no baja.
- Asteroide:
  - La gravedad es menor que la de la Luna.
  - La posición de la plataforma en el paso N coincide con el valor calculado, incluido el rebote en los extremos.
- La regla de dificultad del requisito 16 se cumple, comprobada contra los datos.
- Para cada nivel, una secuencia fija de teclas aterriza con éxito y el resultado es determinista (dos corridas dan el mismo estado final).
- El HUD muestra "NIVEL N/3 · NOMBRE" y, en Asteroide, la velocidad horizontal relativa con su color. *(Revisión estática.)*
- Verificaciones manuales de Nanni:
  - Cada nivel se puede ganar jugando a mano, y la campaña se completa de principio a fin sin recargar la página.
  - Abriendo `index.html?nivel=2` con doble clic (`file://`), el juego arranca en Marte.
  - El juego carga y se juega sin errores en la **consola del navegador** (no la de VS Code). Se acepta el aviso conocido de `file://`.

## Restricciones
- Igual que v1: HTML + JavaScript, Phaser 3.80.1 por CDN con versión fija, pruebas con Node v25.9.0 sin instalar nada, sin `package.json` ni dependencias, presupuesto $0 y todo dentro de `moon/`.
- Lienzo base de 320×180 escalado con píxeles nítidos, igual que v1.
- El HUD y los textos van en HTML encima del canvas, igual que v1 (lección de v1).
- Arte propio del agente de arte, generado en código, sin imágenes externas y con máximo 16 colores por mundo.
- Se aplican las lecciones de `lecciones.md`: el revisor sigue restringido por herramientas, y toda verificación manual dice qué consola usar.

## Entregables
- Código en `src/`, con `src/tests/physics.test.js` de v1 intacto más los archivos de pruebas nuevos.
- `src/README.md` actualizado: niveles, progresión, ayuda `?nivel=N` y comando de pruebas.
- Versión cerrada copiada a `entregables/v2/` al aprobarse el cierre. `entregables/v1/` no se toca.

## Puntos que requieren aprobación de Nanni
- Este brief, antes de que el coordinador arme el plan.
- `plan.md` y `criterios.md` (valores por nivel, orden de scripts y secuencias fijas).
- Cualquier cambio a `src/tests/physics.test.js` o al comportamiento de la Luna, incluido cualquier diseño que se complique por mantenerlos intactos.
- Agregar cualquier cosa de la lista de v3 (puntaje, sonido, menú, Luna gigante, cinturón de rocas).
- Instalar dependencias o cambiar la versión de Phaser.
- El cierre y la entrega final.

## Dudas abiertas
Ninguna.

## Decisiones tomadas (2026-10-02, Nanni)
- **Dificultad:** se aceptó la regla de intake (requisito 16).
- **Fin de campaña:** pantalla de "misión completa"; R o Espacio vuelve a la Luna.
- **Viento:** constante en dirección y fuerza, sin gastar combustible. Las ráfagas quedan para v3.
- **Plataforma móvil:** va y viene en horizontal a velocidad constante y rebota en los extremos.
- **Aterrizaje en la plataforma móvil:** la velocidad horizontal es relativa a la plataforma, también en el valor y el color del HUD.
- **Reintentos:** ilimitados, sin vidas. El combustible no pasa de un nivel a otro.
- **Teclas:** R o Espacio continúa (avanza si aterrizaste, reintenta si chocaste).
- **Superficie y bordes:** superficie plana y posición inicial fija por nivel; salir de la pantalla es choque en todos los niveles.
- **Arte:** Marte rojizo, Asteroide gris oscuro con más estrellas, la misma nave y máximo 16 colores por mundo.
- **Prueba de v1:** `physics.test.js` se queda intacto. Si el diseño se complica por eso, se escala a Nanni y no se toca el test.
- **`?nivel=N`:** se queda como ayuda de prueba, documentada en el README y verificada a mano con doble clic.
- **Requisitos agregados por Nanni:**
  - Una prueba con secuencia fija por nivel.
  - Los niveles como script clásico, compatible con doble clic y con `require`.
  - La progresión en una función pura.
  - `evaluateLanding` con un parámetro opcional de plataforma, con Luna por defecto.
  - "NIVEL N/3 · NOMBRE" en el HUD como requisito.

## Decisiones tomadas (2026-10-02, aprobación del brief, Nanni)
- Se aceptan las 4 propuestas: indicador de viento en el HUD de Marte, lo que "tampoco incluye", física determinista (requisito 15) y lienzo de 320×180.
- **Plataforma en `evaluateLanding`:** parámetro opcional `{ x1, x2, vx }` con los valores de la Luna por defecto (requisito 4).
