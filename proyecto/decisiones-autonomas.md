# Decisiones autónomas: Mensajero Orbital v4

Decisiones que tomé por Nanni bajo `proyecto/autorizacion-v4.md`. Una por bloque: qué, alternativas, por qué y cómo se revierte. Las de v3 están en `proyecto/v3/decisiones-autonomas.md`.

## D-01. Archivar v3 copiando, no moviendo
- **Qué:** 10 documentos de v3 (incluida `autorizacion-v3.md`) copiados a `proyecto/v3/`; los de la raíz se reemplazan por los de v4. `autorizacion-v3.md` también se queda en la raíz porque v4 la cita como vigente.
- **Alternativas:** mover.
- **Por qué:** lo pidió Nanni; mover borraría fuera de `src/`.
- **Cómo se revierte:** con aprobación, borrar de la raíz lo que siga igual a `proyecto/v3/`.

## D-02. Estado de misión aparte (`mission.js`), `step` sin tocar su forma
- **Qué:** la misión (paquete, estacionamiento, cápsulas, entrega) vive en un objeto propio que envuelve el estado de 8 campos. Tras aterrizar en A no se "revive" el estado de `step`: se crea uno nuevo en reposo con `status: 'flying'`.
- **Alternativas:** que `step` regrese a `'flying'` (prohibido por la regla 2); agregar campos al estado (rompe el test de v1).
- **Por qué:** cumple la regla 2 sin tocar el test de v1; los niveles 1 a 6 pasan por la misma `step` con los mismos argumentos.
- **Cómo se revierte:** quitar `mission.js` y volver a llamar `step` en `game.js`.

## D-03. Plataforma bajo la nave con `evaluateLanding`
- **Qué:** en misiones, `step` se llama con el nivel tal cual (B como `platform`) y, si la nave tocó el suelo, la misión reevalúa el contacto con la plataforma que tiene debajo (A o B) usando la misma `evaluateLanding`.
- **Alternativas:** cambiar `step` para que acepte varias plataformas; pasar un nivel distinto según la fase.
- **Por qué:** `evaluateLanding` es pura y es lo último que hace `step` al tocar el suelo, así que el resultado es igual al de `step` con esa plataforma, sin tocar la física.
- **Cómo se revierte:** en `missionStep`, paso 5.

## D-04. Aterrizar en la plataforma "equivocada" estaciona, no choca
- **Qué:** B sin paquete o A con paquete: aterrizaje bueno → la nave se estaciona y puede despegar.
- **Alternativas:** contarlo como choque.
- **Por qué:** es una plataforma real y el aterrizaje fue bueno; castigarlo se siente injusto. No da ventaja: no avanza la misión y gasta combustible.
- **Cómo se revierte:** en el paso 8 de `missionStep`, cambiar "estaciona" por `crashed`.

## D-05. Estacionar endereza la nave
- **Qué:** al estacionar: y = 154, velocidades 0 y ángulo 0. Sin ↑ la nave no se mueve (ni gira); con ↑ despega desde el reposo.
- **Alternativas:** conservar el ángulo del aterrizaje (hasta 10°); permitir girar estacionado.
- **Por qué:** simple, determinista y fácil de calcular a mano; evita que la gravedad la "re-aterrice" cada paso.
- **Cómo se revierte:** `park()` en `mission.js`. Se pide feedback a Nanni.

## D-06. Estacionado sin combustible = "sin combustible" (reinicia)
- **Qué:** si la nave se estaciona con `fuel ≤ 0` antes de entregar, la misión termina como choque con `reason: 'no_fuel'`.
- **Alternativas:** dejarla atorada para siempre.
- **Por qué:** sin esto no hay forma de terminar el intento; reiniciar es lo que pide la regla de choque.
- **Cómo se revierte:** paso 8 de `missionStep`.

## D-07. Carga pesada como `thrustFactor` interno en `physics.js`
- **Qué:** una línea en `step`: `CONFIG.THRUST * (level.thrustFactor ?? 1)`. El nivel guarda `cargoThrust`; la misión pone `thrustFactor` solo con el paquete a bordo.
- **Alternativas:** simular la carga cambiando la gravedad (no es lo mismo: afectaría la caída).
- **Por qué:** multiplicar por 1 es exacto en IEEE 754, así que los niveles 1 a 6 dan los mismos bits (C-68 lo comprueba contra v3); la física no sabe qué es un paquete.
- **Cómo se revierte:** quitar el factor (una línea).

## D-08. Cápsulas: caja contra caja, combustible con tope
- **Qué:** contacto si `|dx| ≤ 10` y `|dy| ≤ 10` (caja de nave 6 + cápsula 4); el combustible no pasa del inicial del nivel; se revisan después de cada paso que no choca, también estacionado.
- **Alternativas:** círculo; sin tope.
- **Por qué:** la física ya usa caja que no gira; el tope mantiene la barra del HUD en 0–100 %.
- **Cómo se revierte:** `MISSION.CAPSULE_HALF` y el `Math.min` en `mission.js`.

## D-09. Secuencias: nivel 7 a mano, 8 a 10 generadas por el piloto
- **Qué:** la del nivel 7 se calculó a mano (fórmulas cerradas, criterios §2.4). Las de 8 a 10 las **generó el piloto automático** (`src/tests/autopilot.js`) y se copiaron como listas fijas a `src/tests/sequences.test.js`; las pruebas las repiten sin correr el piloto.
- **Alternativas:** calcular todas a mano.
- **Por qué:** lo pidió Nanni (regla 4).
- **Cómo se revierte:** regenerar con el piloto y reemplazar las listas.

## D-10. Puntaje de misión
- **Qué:** entrega 400 + precisión en B hasta 200 + combustible hasta 200 + tiempo `200 − floor(pasos/8)` + puntos de cápsulas. Niveles sin misión: igual que v3 más cápsulas (0 en 1 a 6, así que sus puntajes no cambian).
- **Alternativas:** usar la fórmula de v3 (500/300/200) también en misiones; el tiempo con 1 punto cada 4 pasos dejaría casi siempre 0 en misiones de 500+ pasos.
- **Por qué:** una entrega es el logro principal; las misiones duran el doble, así que el tiempo baja a la mitad de rápido; el máximo sin cápsulas sigue siendo 1000.
- **Cómo se revierte:** `MISSION_SCORE` en `score.js`.

## D-11. Valores del nivel 7
- **Qué:** g 20, combustible 110, inicio (70, 30) justo arriba de A = 40–100, B = 160–220 (60 px las dos, 120 px entre centros).
- **Alternativas:** B a 150 px (el salto gastaba casi todo el combustible: 3 de 110 en la búsqueda a mano).
- **Por qué:** misión simple sin otras mecánicas; la referencia deja 25.7 de combustible.
- **Cómo se revierte:** datos en `levels.js` y tabla §2.4.

## D-12. Valores de los niveles 8 a 10 (probados con el piloto)
- **Qué:** 8 · Carga pesada: g 20, fuel 150, `cargoThrust` 0.6, A 210–270 (inicio 240), B 90–150 (salto a la izquierda). 9 · Cápsulas: g 20, fuel 80, A 30–90, B 210–260; dos cápsulas de +25 de combustible y 50 puntos en la ruta, más una de 150 puntos arriba. 10 · Gran entrega: g 22, fuel 110, `cargoThrust` 0.7, A 240–290, B 50–94 (44 px, a la izquierda), dos cápsulas de +30 y 50 puntos y una de +10 y 100 puntos arriba.
- **Alternativas:** nivel 8 con A a 130 px de B (gastaba 129 de combustible; se acortó a 120 px); cápsulas justo en la ruta baja (se toman sin querer: no son un reto).
- **Por qué:** el 8 se siente pesado (empuje neto con paquete 10 en vez de 30); en el 9 el combustible inicial no alcanza sin las cápsulas (el piloto no encuentra plan sin ellas), así que son parte del reto; el 10 es el más largo y con la B más chica. Los márgenes de las referencias quedan entre 25.7 y 36.3, parecidos a los de v3 (15 a 21) más holgura porque la misión es más larga.
- **Cómo se revierte:** datos en `levels.js`, tabla §1.3b y regenerar las listas con el piloto.

## D-13. Filtros del piloto: orillas de B y sin rebotes
- **Qué:** el piloto exige tocar B a 10 px o más de sus orillas y descarta planes donde la nave se estaciona a media fase y el ↑ la vuelve a despegar.
- **Alternativas:** aceptar lo que dé el criterio de combustible (daba aterrizajes a 1 px de la orilla y toques dobles en A).
- **Por qué:** las referencias deben parecerse a cómo se juega y no depender de rebotes.
- **Cómo se revierte:** opción `edge` y la marca `bounced` en `autopilot.js`.

## D-14. Nivel 8 con una cápsula (feedback de Nanni, 2026-10-11)
- **Origen:** Nanni probó los 10 niveles. Todos bien salvo el 8, demasiado difícil; pidió una cápsula en la ruta de A a B con un desvío chico, sin subir solo el combustible. Pidió también un margen de referencia ≥ 30 % del combustible inicial y que los demás niveles no cambien.
- **Qué:** una cápsula en (180, 125) que da +30 de combustible y 50 puntos. El combustible inicial se queda en 150.
- **Excepción a la regla:** con esto el nivel 8 estrena **dos** mecánicas (carga pesada y cápsulas). La regla "una mecánica nueva por nivel" queda con esta excepción aprobada (`criterios.md` §1.6, C-79). Las cápsulas ya no se estrenan en el 9.
- **Dónde va la cápsula:** la referencia anterior iba rozando el suelo (y 142 a 154 entre x 150 y 230). La cápsula queda a mitad del salto (x 180), unos 15 a 20 px arriba de esa ruta. Su caja de contacto es de ±10 px, así que basta con volar un poco más alto, como lo haría una persona.
- **Valores probados con el piloto** (cápsula obligatoria, combustible 150):
  - (180, 128) con +25 / 50: margen 48.7, apenas 3.7 arriba del mínimo de 45.
  - **(180, 125) con +30 / 50: margen 54.3 (36 %).**
- **Por qué +30 y no +25:** la persona gasta más que el piloto y +25 dejaba el margen justo en la orilla. +30 está en la escala de los niveles 9 (+25) y 10 (+30). No hizo falta tocar el combustible inicial.
- **Sin la cápsula:** el nivel se sigue pudiendo ganar (la mejor referencia anterior deja 25.7). La cápsula no es obligatoria, pero ahí está el margen del 30 %.
- **Secuencia:** **regenerada por el piloto** (D-09) con las opciones de `criterios.md` §2.5, sin tocar los bordes de los rangos de búsqueda. Gana en el paso 662, toma la cápsula en el paso 480 en (189.9, 134.6) y deja 54.333. Puntaje: 400 + 68 + 72 + 118 + 50 = 708 (antes 626).
- **Margen ≥ 30 % solo en el nivel 8:** así lo pidió Nanni, y los demás niveles no cambian. Para que lo sepa: con esa vara, el 7 (23 %) y el 10 (25 %) no llegarían; el 9 sí (45 %).
- **Sin cambios:**
  - niveles 1 a 7, 9 y 10 (datos y secuencias, comprobado con huellas en C-90);
  - `physics.js`, `mission.js`, `score.js` y el test de v1.
- **Cómo se revierte:** quitar `capsules` del nivel 8 en `levels.js`, restaurar la lista y los valores anteriores de C-83 (en `proyecto/bitacora.md`) y quitar la excepción de C-79.
