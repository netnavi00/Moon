# Decisiones autónomas: Mensajero Orbital v3

Decisiones que tomé por Nanni bajo `proyecto/autorizacion-v3.md`. Una por bloque: qué, alternativas, por qué y cómo se revierte.

## D-01. Archivar v2 copiando, no moviendo
- **Qué:** los 8 documentos de v2 se copiaron a `proyecto/v2/`; los de la raíz se irán sobrescribiendo con los de v3.
- **Alternativas:** mover (como se hizo con v1).
- **Por qué:** mover borra archivos fuera de `src/`, y eso requiere aprobación (CLAUDE.md §5; regla 7 de la autorización).
- **Cómo se revierte:** con aprobación de Nanni, borrar de la raíz los que sigan siendo idénticos a `proyecto/v2/`.

## D-02. Revisor genérico por criterios vigentes
- **Qué:** `revisor.md` arma su lista de IDs leyendo `proyecto/criterios.md`; si un criterio remite a documentos archivados, los lee solo para ese criterio; acepta revisión acotada a IDs.
- **Alternativas:** lista fija de IDs de v3 (habría que editarlo otra vez en v4).
- **Por qué:** lo pidió Nanni para que sirva a v3 y v4.
- **Cómo se revierte:** `proyecto/v2/` no guarda el `.md` del agente; la versión de v2 está en git (`HEAD:.claude/agents/revisor.md`).

## D-03. Mecánicas como campos opcionales con valor por defecto
- **Qué:** `fuelRate` (consumo), `gusts` (ráfagas que se suman a `wind`) y `start.vx`/`start.vy` (velocidad inicial); sin ellos se usa el valor de la Luna. Nueva función pura `windAt(level, n)` en `physics.js`.
- **Alternativas:** un campo `mechanics` con tipo; o cambiar `wind` a función; o campos nuevos obligatorios en todos los niveles.
- **Por qué:** los niveles 1 a 3 quedan con los mismos datos de v2 (C-44) y la física hace las mismas operaciones (C-45). Es lo que pidió Nanni ("dato opcional con valor por defecto de la Luna").
- **Cómo se revierte:** quitar los campos de los niveles 4 a 6 y las dos líneas de `step`/`createState`.

## D-04. Orden de los niveles nuevos: 4 Luna gigante, 5 Tormenta, 6 Aproximación
- **Qué:** después del Asteroide van Luna gigante, Tormenta y Aproximación.
- **Alternativas:** Tormenta primero (sigue a Marte), o Aproximación antes de Tormenta.
- **Por qué:** Luna gigante solo endurece el control que ya conoces (vertical); Tormenta extiende el viento de Marte pero cambiante; Aproximación es la más distinta (sin gravedad, hay que girar y frenar en diagonal).
- **Cómo se revierte:** reordenar las entradas en `LEVELS` (y C-26/C-37/C-46 en las pruebas).

## D-05. Valores de los niveles 4 a 6
- **Qué:** Luna gigante: g 30, consumo 30/s, combustible 90, plataforma 150–190 (40 px), inicio 170,30. Tormenta: g 20, ráfagas +15 (60 pasos) / −15 (120) / +15 (60), ciclo de 4 s con deriva media cero, combustible 50, plataforma 136–184 (48), inicio 152,30. Aproximación: g 0, entra a (24,24) con velocidad (32, 28), combustible 30, plataforma 124–164 (40).
- **Alternativas:** g 35 en Luna gigante (descartado: la ventana para empezar a frenar era de 1 paso); ráfagas ±15 cada 90 pasos (descartado: deriva a la derecha sin fin); Aproximación con velocidad (30, 20) (descartado: tardaba más de 15 s en llegar).
- **Por qué:** cada referencia deja 15 o más de combustible (21, 18.7 y 15.3), más del margen de 10 exigido, con tiempos de 4 a 6.5 s.
- **Cómo se revierte:** editar los datos en `levels.js` y recalcular las secuencias en `criterios.md` §2.3.

## D-06. Qué cuenta como "mecánica" para la regla de dificultad
- **Qué:** las mecánicas son viento, plataforma móvil, consumo propio, ráfagas y velocidad inicial. Cambiar el valor de un campo base (gravedad, combustible, ancho, inicio) no cuenta; por eso "sin gravedad" es un valor y la mecánica de Aproximación es la velocidad inicial.
- **Alternativas:** contar la gravedad 0 como mecánica (Aproximación estrenaría dos).
- **Por qué:** se puede probar contra los datos sin interpretación; coincide con "cada mecánica nueva entra como dato opcional".
- **Cómo se revierte:** cambiar la lista en `criterios.md` §1.5 y en C-47.

## D-07. Puntaje: 500 precisión + 300 combustible + 200 tiempo; total = suma de mejores
- **Qué:** precisión `round(500·(1 − |x − centro|/(ancho/2)))`; combustible `round(300·sobrante/inicial)`; tiempo `max(0, 200 − floor(pasos/4))`. Total de campaña = suma del mejor puntaje de cada nivel (guardado).
- **Alternativas:** total = suma de la partida actual (se reinicia al recargar y no tendría sentido al arrancar desde un nivel guardado); combustible en unidades absolutas (castigaría niveles con poco combustible).
- **Por qué:** todo entero, determinista, comparable entre niveles y máximo 1000 por nivel; chocar no resta porque no toca los mejores.
- **Cómo se revierte:** constantes en `SCORE` de `score.js` y la función `campaignTotal`.

## D-08. Guardado: llave `mensajero-orbital`, mejor por `id` de nivel
- **Qué:** `{ unlocked, best: { id: puntaje } }` en `localStorage`; llaves por `id` y no por número.
- **Alternativas:** arreglo por número de nivel; llave con versión (`…-v3`).
- **Por qué:** si en v4 se agregan niveles al final, lo guardado sigue sirviendo; un `id` desconocido se descarta al leer.
- **Cómo se revierte:** cambiar `STORAGE_KEY` (lo anterior queda ignorado).

## D-09. `?nivel=N` y `?nuevo` juntos
- **Qué:** `?nuevo` borra; `?nivel=N` elige el nivel y desactiva la escritura. Juntos: borra y no escribe. `?nivel` inválido arranca en el 1 (como v2) y tampoco escribe.
- **Alternativas:** que `?nivel` inválido se ignore y use el guardado.
- **Por qué:** conserva el comportamiento de v2 y la regla "no modifica lo guardado".
- **Cómo se revierte:** `resolveStart` en `save.js`.

## D-10. Tests de v2 que dependen de 3 niveles
- **Qué:** se prevé ajustar solo C-26 (longitud e ids), C-28 (el estado inicial con vx = vy = 0 se acota a los niveles 1 a 3), C-36 (la regla de v2 se acota a los niveles 1 a 3) y C-37 (el último nivel ahora es el 6). Solo se tocan si fallan por eso al correr; si alguno no falla, no se toca.
- **Alternativas:** dejar C-36 sobre los 6 niveles (fallaría por diseño, porque Nanni reemplazó esa regla).
- **Por qué:** regla 2 de la autorización.
- **Cómo se revierte:** `git checkout src/tests/levels.test.js` (versión de v2 en `entregables/v2/tests/`).
