# Brief: Mensajero Orbital v3

> Estado: **decidido en modo autónomo** el 2026-10-11 bajo `proyecto/autorizacion-v3.md` (Nanni autorizó tomar las decisiones de brief, plan y criterios sin pedir aprobación). Cada decisión tomada por Nanni está en `proyecto/decisiones-autonomas.md`.
> Documentos de v2 archivados en `proyecto/v2/`; entregable de v2 en `entregables/v2/`. v3 es la ola 1 de 2; la ola 2 (niveles 7 a 10) será v4.

## Resumen
Tercera versión del juego web en pixel art 16 bits de la nave de carga. La campaña pasa de 3 a 6 niveles, con puntaje por aterrizaje y guardado del avance en el navegador. Para Nanni como jugador y evaluador.

## Objetivo
Entregar una campaña de 6 niveles jugable de principio a fin, con puntaje determinista y progreso guardado. Los niveles 1 a 3 quedan idénticos a v2 y los niveles nuevos se agregan solo como datos más mecánicas opcionales.

## Alcance (versión v3)
- Incluye:
  - 3 niveles nuevos, en este orden después del Asteroide: **4 · Luna gigante**, **5 · Tormenta** y **6 · Aproximación** (orden decidido en D-04).
  - Tres mecánicas nuevas, cada una como **dato opcional** del nivel con el valor de la Luna por defecto:
    - consumo de combustible por nivel (`fuelRate`),
    - ráfagas de viento en ciclos fijos (`gusts`),
    - velocidad inicial (`start.vx`, `start.vy`).
  - Puntaje por aterrizaje y total de campaña.
  - Guardado del nivel más alto desbloqueado y del mejor puntaje por nivel.
  - HUD con "NIVEL N/total" (el total sale de los datos), total de puntaje y viento actual.
  - Un tema visual por mundo nuevo.
- No incluye: sonido, menú, niveles 7 a 10 ni cualquier otra cosa de v4. Tampoco vidas, controles táctiles o de gamepad, ni publicar en internet.

## Requisitos

### Base y regresión
1. Sigue vigente todo lo de v2 que este brief no cambie (`proyecto/v2/brief.md`). El requisito 16 de v2 (dificultad) se reemplaza por el requisito 10 de aquí.
2. `src/tests/physics.test.js` de v1 no se edita (mismo sha256), y `entregables/v1/` y `entregables/v2/` no se tocan.
3. Los niveles 1 a 3 son idénticos a v2. Una prueba lo comprueba contra los datos y la física de `entregables/v2/`.
4. Los tests de v2 solo se cambian donde dependan de que haya 3 niveles, y solo después de ver que fallan por eso. Cada cambio se registra en la bitácora.

### Niveles y mecánicas
5. **Luna gigante:** gravedad fuerte, el combustible rinde menos (consumo propio del nivel) y la plataforma es chica.
6. **Tormenta:** ráfagas de viento que cambian de dirección en ciclos fijos. El viento de cada paso se calcula con el número de paso, de forma determinista.
7. **Aproximación:** sin gravedad. La nave entra con velocidad inicial y hay que frenar.
8. Cada mecánica es un dato opcional: si un nivel no lo trae, se usa el valor de la Luna (consumo `CONFIG.FUEL_RATE`, sin ráfagas, velocidad inicial 0). Con eso, los datos de los niveles 1 a 3 no cambian.
9. La física sigue pura y determinista. `createState(level)` sigue regresando los 8 campos de v1 en todos los niveles, y `step.length === 2`.
10. **Dificultad (reemplaza el req. 16 de v2):** cada nivel estrena como máximo una mecánica; la secuencia de referencia de cada nivel deja al menos 10 unidades de combustible de margen; y la dificultad final se confirma jugando.
11. Cada nivel nuevo tiene una secuencia fija de teclas, calculada a mano antes de construir, que aterriza con éxito. Se compara contra la primera corrida.

### Puntaje
12. El puntaje es una función pura, probada con Node, y vive fuera de `physics.js`. Suma tres partes:
    - precisión respecto al centro de la plataforma,
    - combustible sobrante,
    - tiempo medido en pasos de física.
13. Hay puntaje por nivel y total de campaña. Chocar no resta. La pantalla de éxito muestra el desglose y el HUD muestra el total.

### Guardado
14. Se guardan el nivel más alto desbloqueado y el mejor puntaje por nivel en el almacenamiento del navegador. Todo acceso va envuelto en try/catch: si falla, el juego funciona igual.
15. El juego arranca en el nivel guardado. `?nuevo` borra lo guardado, y `?nivel=N` sigue como ayuda de prueba y no modifica lo guardado.

### Interfaz y arte
16. El HUD muestra "NIVEL N/total · NOMBRE" con el total tomado de los datos, para que la ola 2 no requiera cambiar código.
17. Hay un tema por mundo, con máximo 16 colores cada uno. La nave es igual en todos (usa solo los índices 9 a F). Sin sonido ni menú.

## Criterios de aceptación (medibles)
Los valores, las secuencias y los IDs están en `proyecto/criterios.md`. En resumen:
- `node --test "src/tests/*.test.js"` termina con 0 fallas, incluidas las 14 pruebas de v1 y las de v2.
- El sha256 de `src/tests/physics.test.js` es igual al de v1.
- Los niveles 1 a 3 coinciden con `entregables/v2/` en datos y paso a paso en física.
- Hay pruebas de cada mecánica, de las secuencias de referencia (con margen de combustible de 10 o más), de la regla de "una mecánica por nivel", del puntaje, del guardado con almacenamiento que falla y de la elección del nivel inicial (`?nuevo`, `?nivel=N`).
- Revisión estática de los scripts, el HUD, las pantallas y el arte.
- Verificación manual de Nanni: jugar los 6 niveles, la curva de dificultad, el guardado al recargar, `?nuevo` y `?nivel=N`, y la consola del navegador sin errores.

## Restricciones
- Igual que v2: HTML + JavaScript, Phaser 3.80.1 por CDN (sin cambiar la versión), Node sin dependencias ni `package.json`, presupuesto $0 y todo dentro de `moon/`.
- Lienzo de 320×180, HUD en HTML y arte generado en código.

## Entregables
- Código en `src/` y `src/README.md` actualizado: niveles, puntaje, guardado, `?nivel=N`, `?nuevo` y comando de pruebas.
- `entregables/v3/` solo cuando Nanni apruebe el cierre.

## Puntos que requieren aprobación de Nanni
- El cierre y la copia a `entregables/v3/`.
- Todo lo que prohíbe la regla 7 de `autorizacion-v3.md`.
- Afinar los números de puntaje y dificultad con su feedback.

## Dudas abiertas
Ninguna que bloquee. Los números de puntaje y dificultad se afinan con el feedback de Nanni.
