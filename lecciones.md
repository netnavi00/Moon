# Lecciones

Una línea por lección. Sirven para cualquier proyecto.

- 2026-10-01 (Mensajero Orbital): el texto pequeño dibujado sobre un lienzo de baja resolución (8 px en 320×180) se ve borroso y deforme al escalar. El HUD y los textos van en HTML encima del canvas desde el diseño.
- 2026-10-01 (Mensajero Orbital): Restringir un agente por herramientas es más seguro que por hooks; un hook que falla abierto da falsa seguridad. Todo blindaje se prueba con el agente real.
- 2026-10-01 (Mensajero Orbital): las definiciones de `.claude/agents/` se cargan al iniciar la sesión; después de editarlas, reinicia y comprueba con el agente qué herramientas tiene antes de confiar en el cambio.
- 2026-10-01 (Mensajero Orbital): una verificación manual de la consola debe decir cuál consola (la del navegador, no la de VS Code); el aviso de `file://` se dio por resuelto viendo la equivocada.
- 2026-10-02 (Mensajero Orbital v2): el revisor tiene Read, Grep y Glob más el canal obligatorio `SubagentHandback` (por ahí regresa su reporte; que no escribe archivos ni corre comandos se sabe por cómo funciona el entorno, no se verificó con el agente).
- 2026-10-02 (Mensajero Orbital v2): la lista real de herramientas de un agente se comprueba preguntándole al agente, no leyendo su `.md`; la garantía de que no modifica nada es la comparación de hashes de `src/` antes y después de cada revisión, y si un hash cambia durante una revisión se reabre este tema.
- 2026-10-02 (Mensajero Orbital v2): un elemento compartido entre mundos (como la nave) no debe usar índices de paleta que cambian por mundo.
- 2026-10-02 (Mensajero Orbital v2): la dificultad se verifica jugando, no solo con cálculos: el Asteroide cumplía la regla de dificultad en los datos pero salió más fácil que Marte, y se corrigió cambiando datos.
- 2026-10-02 (Mensajero Orbital v2): calcular a mano las secuencias fijas antes de construir sirvió: coincidieron exactamente en la primera corrida y dieron una referencia independiente del código.
- 2026-10-02 (Mensajero Orbital v2): al cambiar un valor, primero se actualizan las pruebas y se comprueba que fallen solo las afectadas; luego se cambian los datos.
- 2026-10-02 (Mensajero Orbital v2): Los archivos temporales van en la carpeta temporal de la sesión o dentro de moon/, nunca fuera sin aprobación. Si hace falta guardar algo para comparar después, va en un archivo de proyecto/, no en temporales.
- 2026-10-11 (Mensajero Orbital v3): Ningún comando con redirección sin ruta explícita dentro de proyecto/ o de la carpeta temporal de la sesión; revisa el comando completo antes de correrlo. Esta falta se repitió en v1 y v3.
- 2026-10-11 (Mensajero Orbital v3): meter cada mecánica nueva como campo opcional con el valor por defecto del nivel base deja los niveles viejos con los mismos datos y las mismas operaciones; una prueba paso a paso contra la física del entregable anterior lo demuestra (C-45).
- 2026-10-11 (Mensajero Orbital v3): las secuencias de referencia calculadas a mano con fórmulas cerradas por fase volvieron a coincidir en la primera corrida (3 de 3); al buscarlas, la sensibilidad al paso de corte sirve para medir la dificultad (gravedad 35 dejaba una ventana de 1 paso y se descartó).
- 2026-10-11 (Mensajero Orbital v3): un test que referencia otra carpeta con ruta relativa (`../../entregables/v2/`) deja de correr en la copia del entregable; las referencias externas de las pruebas deben resolverse desde la raíz del proyecto o tener una copia propia.
- 2026-10-11 (Mensajero Orbital v3): cambiar un test heredado solo después de verlo fallar, y anotar la falla exacta en la bitácora, deja trazable por qué se tocó cada aserción (4 cambios en `levels.test.js`, cada uno con su motivo).
- 2026-10-11 (Mensajero Orbital v3): el almacenamiento del navegador se pasa como argumento a funciones puras con try/catch; así se prueba en Node con un almacenamiento falso que lanza, sin navegador.
- 2026-10-11 (Mensajero Orbital v3): una prueba de humo de `game.js` en Node con Phaser y DOM falsos verificó la integración (arranque, guardado, puntaje, HUD) sin navegador; no sustituye la prueba manual, pero la reduce a lo visual.
- 2026-10-11 (Mensajero Orbital v3): el revisor debe recibir también los hashes de los entregables anteriores cuando las pruebas los usan como referencia; si no, puede que alguien los cambie y las pruebas sigan pasando sin avisar.

## Fuera de alcance (pendiente para v4)

Resuelto en v3: puntaje, Luna gigante y ráfagas de viento. Se evalúa lo siguiente al armar el brief de v4.

- Mensajero Orbital: niveles 7 a 10 (ola 2), agregados solo como datos; el HUD ya toma el total de `LEVELS.length`.
- Mensajero Orbital: cinturón de rocas.
- Mensajero Orbital: sonido.
- Mensajero Orbital: menú.
- Mensajero Orbital: afinar la dificultad de los niveles 4 a 6 y los números de puntaje (500/300/200, 1 punto por cada 4 pasos) con el feedback de Nanni; en v3 aprobó C-M1 a C-M9 sin pedir cambios.
- Mensajero Orbital: Tormenta se puede ganar solo esperando el momento, sin compensar el viento; decidir si así se queda.
- Mensajero Orbital: que `campaign.test.js` encuentre `entregables/v2/` también desde la copia del entregable (hoy solo corre desde `src/`).
- Mensajero Orbital: un criterio con sha256 de `entregables/v2/` (y de v3) como referencia de regresión, como `regresion-v1.md`.
