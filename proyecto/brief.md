# Brief: Mensajero Orbital (versión mínima)

> Estado: **aprobado por Nanni el 2026-10-01.**

## Resumen
Videojuego web en pixel art estilo 16 bits donde el jugador pilotea una nave de carga y debe aterrizarla con cuidado sobre una plataforma en la Luna. Es el primer proyecto de prueba del sistema multiagente, para Nanni como jugador y evaluador.

## Objetivo
Entregar un nivel jugable de principio a fin en el navegador: la nave aparece, el jugador controla propulsor y giro con combustible limitado, y la partida termina en pantalla de éxito o de choque según cómo toque la superficie.

## Alcance (versión mínima)
- Incluye:
  - Un solo mundo: Luna (gravedad baja).
  - Una sola plataforma de aterrizaje, grande.
  - Una nave con propulsor principal y giro izquierda/derecha.
  - Combustible limitado que se gasta al usar el propulsor.
  - Detección de aterrizaje exitoso vs. choque.
  - Pantalla de éxito y pantalla de choque.
  - HUD mínimo: combustible, velocidad vertical, velocidad horizontal y ángulo.
  - Reintentar desde las pantallas finales con una tecla.
- No incluye:
  - Otros mundos, varios niveles o plataformas múltiples.
  - Menú principal, puntaje, récords o guardado de progreso.
  - Historia, diálogos o narrativa.
  - Música y efectos de sonido.
  - Controles táctiles o de gamepad.
  - Publicar el juego en internet.

## Requisitos
1. El juego corre en un navegador de escritorio abriendo una página local, con JavaScript y Phaser.
2. La nave arranca siempre en la misma posición fija en el aire, arriba de la superficie, y la gravedad la jala hacia abajo de forma constante.
3. Mientras se presiona el propulsor, la nave acelera en la dirección a la que apunta su punta.
4. Las teclas de giro rotan la nave a la izquierda o a la derecha.
5. Usar el propulsor resta combustible; con combustible en 0 el propulsor deja de funcionar.
6. Al tocar la plataforma, el aterrizaje es exitoso solo si se cumplen a la vez: velocidad vertical bajo el límite, velocidad horizontal bajo el límite y ángulo dentro del rango permitido.
7. Si toca la plataforma sin cumplir los tres límites, o toca el suelo fuera de la plataforma, es choque.
8. Al terminar (éxito o choque) la nave deja de responder a controles y se muestra la pantalla correspondiente.
9. Gráficos en pixel art estilo 16 bits (nave, superficie lunar, plataforma, fondo).
10. La superficie lunar es plana, con la plataforma marcada visualmente.
11. La lógica de física y de evaluación del aterrizaje vive separada del dibujo y se puede probar con pruebas automáticas desde la terminal con Node.
12. Controles: flecha arriba = propulsor, flechas izquierda/derecha = giro, R o Espacio = reintentar (solo en la pantalla final). Espacio no debe hacer scroll en la página. *(Cambio de requisito aprobado por Nanni el 2026-10-01; antes era R o Enter.)*
13. Si la nave sale de la pantalla por cualquier borde (arriba, abajo, izquierda o derecha), es choque.

## Criterios de aceptación (medibles)
Los valores numéricos exactos (gravedad, empuje, consumo, combustible inicial, velocidad máxima de aterrizaje, ángulo máximo) se fijan en `proyecto/criterios.md`. Aquí se define qué se mide:
- Con controles soltados, la velocidad vertical de la nave aumenta hacia abajo cada cuadro según la gravedad definida.
- El empuje del propulsor es mayor que la gravedad: con propulsor activo y nave derecha, la aceleración vertical neta es hacia arriba.
- Con propulsor activo, el combustible baja según el consumo definido; con combustible en 0, el propulsor no cambia la velocidad.
- Tocar la plataforma con velocidades y ángulo dentro de límites → pantalla de éxito, 100% de las veces en las pruebas.
- Tocar la plataforma excediendo cualquiera de los límites → pantalla de choque, 100% de las veces.
- Tocar el suelo fuera de la plataforma → pantalla de choque.
- Salir de la pantalla por cualquiera de los cuatro bordes → pantalla de choque.
- Una prueba automática reproduce una secuencia fija de teclas (definida en `criterios.md`) desde la posición inicial fija y termina en aterrizaje exitoso.
- Desde cualquier pantalla final se puede reiniciar sin recargar la página.
- El juego carga y se juega sin errores en la consola del navegador. *(Verificación manual de Nanni.)*
- Se puede completar un aterrizaje exitoso jugando a mano con el combustible inicial definido (no es imposible de ganar). *(Verificación manual de Nanni.)*

## Restricciones
- Tecnología: HTML + JavaScript en navegador, librería Phaser.
- Phaser se carga desde CDN con versión fija: `https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js`. Cambiar de versión o pasar a copia local/npm requiere aprobación de Nanni.
- Pruebas automáticas: se corren desde la terminal con Node (v25.9.0, ya instalado).
- Arte: pixel art 16 bits, con sprites hechos por el agente de arte (dibujados en código o PNG pequeños), sin assets de pago ni de terceros.
- Resolución: lienzo base de baja resolución (ej. 320×180 o 400×300) escalado con píxeles nítidos.
- Presupuesto: $0, sin servicios de pago.
- Todo el trabajo queda dentro de la carpeta `moon/`.

## Entregables
- Código del juego en `src/` (página HTML de entrada + scripts + assets).
- Pruebas automáticas de la lógica de física y aterrizaje en `src/`, ejecutables con Node desde la terminal.
- Versión cerrada copiada a `entregables/` al aprobarse el cierre.
- Instrucciones cortas de cómo abrir, jugar y correr las pruebas (en `src/README.md` o equivalente).

## Puntos que requieren aprobación de Nanni
- Este brief, antes de que el coordinador arme el plan.
- `plan.md` y `criterios.md` (incluidos todos los valores numéricos y la secuencia fija de teclas).
- Instalar cualquier dependencia o herramienta (Phaser local, servidor, librería de pruebas).
- Agregar sonido, más mundos o cualquier cosa del "No incluye".
- El cierre y la entrega final.

## Dudas abiertas
Ninguna.

## Decisiones tomadas (2026-10-01)
- Sin sonido en esta versión.
- Phaser por CDN, versión fija 3.80.1.
- Controles: flechas para volar, R o Espacio para reintentar (cambiado de Enter a Espacio, aprobado por Nanni).
- Posición inicial de la nave fija.
- Superficie plana con plataforma marcada.
- Se confirman: HUD mínimo, reintentar sin recargar, lógica separada del dibujo, arte propio del agente de arte y resolución baja escalada.
- Node v25.9.0 ya está instalado; las pruebas automáticas se corren con Node desde la terminal, sin instalar nada.
- Salir de la pantalla por cualquier borde cuenta como choque.
