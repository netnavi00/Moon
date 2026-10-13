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
- 2026-10-11 (Mensajero Orbital v4): cuando una regla prohíbe cambiar un estado (el de 8 campos y que `step` no "reviva"), envolverlo en un estado aparte que llama a la misma función pura deja la regresión exacta y comprobable paso a paso contra el entregable anterior.
- 2026-10-11 (Mensajero Orbital v4): un piloto que busca por "más combustible" encuentra trampas legales (aterrizar en la orilla, tocar y rebotar); hay que agregarle restricciones de cómo se juega antes de confiar en sus secuencias.
- 2026-10-11 (Mensajero Orbital v4): validar el piloto con su simulador sobre la secuencia calculada a mano (fila por fila) separa los errores del simulador de los de la búsqueda.
- 2026-10-11 (Mensajero Orbital v4): la regla de redirecciones se volvió a romper (heredoc `>>` hacia `src/` y `cat > nombre` sin ruta explícita); la única forma segura fue dejar de usar redirecciones y escribir archivos solo con Write/Edit.
- 2026-10-11 (Mensajero Orbital v4): un criterio con un valor de prueba sintético (y = 153.9) debe calcularse antes de escribirse; si la prueba se corrige, el criterio se corrige en el mismo momento.
- 2026-10-11 (Mensajero Orbital v4): la regla "cada nivel estrena como máximo una mecánica" admite excepciones aprobadas por Nanni cuando una mecánica alivia a otra (el nivel 8 estrena carga pesada y cápsula: la cápsula compensa la carga). La excepción se registra por nivel en el criterio y en la prueba; la regla no se borra.
- 2026-10-11 (Mensajero Orbital v4): el margen de combustible de una secuencia de referencia se mide como proporción del combustible inicial, no como unidades fijas, porque una persona gasta mucho más que el piloto. Con 10 unidades el nivel 8 se sentía imposible; con ≥ 30 % (feedback de Nanni) quedó bien.
- 2026-10-13 (Mensajero Orbital v4): el feedback de jugar encontró lo que los cálculos no: los 10 niveles cumplían la regla de margen, pero solo el 8 se sentía injusto. Se arregló con un cambio de datos aislado (una cápsula), probado con huellas de que lo demás no cambió.
- 2026-10-11 (Mensajero Orbital v4): antes de cambiar un nivel, congelar con huellas sha256 los datos y las secuencias de los demás permite probar que el cambio quedó aislado.
- 2026-10-11 (Mensajero Orbital v4): buscar la raíz del proyecto hacia arriba (la carpeta con `CLAUDE.md`) deja que las pruebas que comparan contra `entregables/` corran igual desde `src/` y desde la copia del entregable.

## Fuera de alcance (pendiente para v5)

v4 se cerró el 2026-10-13. Resolvió: los niveles 7 a 10 (misiones, carga pesada y cápsulas), la ruta de las pruebas nuevas hacia `entregables/v3/` resuelta desde la raíz, y los sha256 de los entregables anteriores en `proyecto/foto-src.md`. Nanni aprobó la dificultad de los 10 niveles, el estacionamiento que endereza la nave y el puntaje de misión. Al armar el brief de v5 se evalúa lo siguiente:

- Mensajero Orbital: rocas.
- Mensajero Orbital: niebla.
- Mensajero Orbital: ráfagas nuevas.
- Mensajero Orbital: sonido.
- Mensajero Orbital: menú.
- Mensajero Orbital: arreglar la ruta relativa de `campaign.test.js` (busca `../../entregables/v2/`, así que solo corre desde `src/`; dentro de `entregables/v4/` da 61/62).
- Mensajero Orbital (abierto desde v3, sin decisión): Tormenta se puede ganar solo esperando el momento; decidir si así se queda.
