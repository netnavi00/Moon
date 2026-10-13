# Brief: Mensajero Orbital v4

> Estado: **decidido en modo autónomo** el 2026-10-11 bajo `proyecto/autorizacion-v4.md` (Nanni autorizó decidir brief, plan, criterios, valores y secuencias sin pedir aprobación). Cada decisión está en `proyecto/decisiones-autonomas.md`.
> Documentos de v3 archivados en `proyecto/v3/`; entregable de v3 en `entregables/v3/`. v4 es la ola 2: la campaña llega a 10 niveles.

## Resumen
Cuarta versión del juego web en pixel art 16 bits de la nave de carga. Se agregan misiones de entrega (recoger un paquete en A y llevarlo a B), carga pesada y cápsulas que se recogen en vuelo. La campaña pasa de 6 a 10 niveles. Para Nanni como jugador y evaluador.

## Objetivo
Entregar una campaña de 10 niveles jugable de principio a fin. Los niveles 1 a 6 quedan idénticos a v3 y las mecánicas nuevas entran como datos opcionales.

## Alcance (versión v4)
- Incluye:
  - **Misión de entrega** (`pickup`): el nivel tiene una plataforma de recogida A y la de entrega B (`platform`). Aterrizar bien en A recoge el paquete y el nivel sigue; despegas y aterrizas bien en B para ganar. Combustible compartido en todo el nivel. Chocar reinicia el nivel completo.
  - **Carga pesada** (`cargoThrust`): factor del empuje con el paquete a bordo; por defecto 1.
  - **Cápsulas** (`capsules`): objetos fijos que se recogen al tocarlos en vuelo; dan combustible, puntos o ambos. Por defecto, lista vacía.
  - Niveles **7 · Primera entrega**, **8 · Carga pesada**, **9 · Cápsulas** y **10 · Gran entrega** (combina las tres).
  - Puntaje de misión (entrega, precisión en B, combustible, tiempo en pasos y cápsulas).
  - HUD con paquete (por recoger / a bordo / entregado), cápsulas recogidas y "NIVEL N/total".
  - Cuatro temas nuevos y sprites de paquete y cápsula hechos en código.
- No incluye (v5): rocas, niebla, ráfagas nuevas, sonido y menú. Tampoco plataformas móviles en misiones, vidas, controles táctiles ni publicar.

## Requisitos

### Base y regresión
1. Sigue vigente todo lo de v3 que este brief no cambie (`proyecto/v3/brief.md`).
2. `src/tests/physics.test.js` de v1 no se edita (mismo sha256); `entregables/v1/`, `v2/` y `v3/` no se tocan.
3. Los niveles 1 a 6 son idénticos a v3: misma data y, paso a paso, los mismos estados que la física de `entregables/v3/`, también pasando por la capa de misión.
4. Los tests de v3 solo se cambian donde dependan del número de niveles, después de verlos fallar por eso; cada cambio se registra en la bitácora.

### Misión
5. `step` de `physics.js` no cambia de forma: sigue regresando los mismos 8 campos, `step.length === 2` y nunca regresa de `'landed'` a `'flying'`. El despegue desde A y el estado del paquete viven en un **estado de misión aparte** (`src/js/mission.js`).
6. Aterrizar bien (mismos límites de siempre) en A sin paquete lo recoge. La nave queda estacionada en A y despega al presionar ↑. Aterrizar bien en B con el paquete gana el nivel. Aterrizar bien en una plataforma que no avanza la misión (B sin paquete, A con él) solo estaciona la nave.
7. Tocar el suelo fuera de A y B, pasarse de un límite o salir de la pantalla es choque y reinicia el nivel completo (paquete, combustible y cápsulas). Quedar estacionado sin combustible antes de entregar también reinicia ("sin combustible").
8. Carga pesada: con el paquete a bordo, el empuje se multiplica por `cargoThrust`. Sin el campo, por 1.
9. Cápsulas: cada una es `{ x, y, fuel, points }`. Se recoge cuando la caja de la nave toca la de la cápsula, con una función pura y determinista. El combustible que da se suma sin pasar del combustible inicial del nivel.

### Niveles y dificultad
10. Cada nivel estrena como máximo una mecánica (el 10 no estrena ninguna, combina las tres). **Excepción aprobada por Nanni tras probar v4:** el nivel 8 estrena carga pesada y cápsulas, y su secuencia de referencia deja al menos el 30 % de su combustible inicial (D-14). Todo mecanismo nuevo es un dato opcional cuyo valor por defecto deja iguales los niveles anteriores.
11. La secuencia de referencia del nivel 7 se calcula a mano. Un piloto automático, que vive solo en `src/tests/`, se valida contra ella y genera las de los niveles 8 a 10. Las pruebas repiten listas fijas de teclas (no corren el piloto). Cada secuencia deja al menos 10 unidades de combustible.

### Puntaje, HUD y guardado
12. Puntaje de misión, función pura: entrega + precisión en B + combustible + tiempo en pasos + cápsulas. Los niveles sin misión puntúan como v3 más los puntos de cápsulas (0 en los niveles 1 a 6).
13. HUD: "NIVEL N/total · NOMBRE" (total de los datos), paquete por recoger / a bordo / entregado (solo en misiones) y cápsulas recogidas k/total (solo si el nivel tiene).
14. Guardado igual que v3, por `id` de nivel.

### Arte
15. Un tema por mundo nuevo, máximo 16 colores por tema; la nave igual en todos (solo índices 9 a F). Paquete y cápsula hechos en código con los colores fijos 9 a F.

## Criterios de aceptación (medibles)
Los valores, las secuencias y los IDs están en `proyecto/criterios.md`. En resumen: `node --test "src/tests/*.test.js"` con 0 fallas; sha256 del test de v1 igual; niveles 1 a 6 iguales a `entregables/v3/` en datos y paso a paso; pruebas de misión, carga, cápsulas, puntaje y secuencias; revisión estática (incluido que el piloto no se usa en el juego); prueba manual de Nanni.

## Restricciones
Igual que v3: HTML + JavaScript, Phaser 3.80.1 por CDN, Node sin dependencias, $0, todo dentro de `moon/`, lienzo 320×180, HUD en HTML, arte en código.

## Entregables
`src/` con `README.md` actualizado. `entregables/v4/` solo cuando Nanni apruebe el cierre.

## Puntos que requieren aprobación de Nanni
El cierre y la copia a `entregables/v4/`; lo prohibido en la regla 1 de `autorizacion-v4.md`; afinar números de puntaje y dificultad con su feedback.

## Dudas abiertas
Ninguna que bloquee. Se piden en el reporte final: si el estacionamiento automático (la nave se endereza al aterrizar en A) se siente bien, y los números de puntaje de misión.
