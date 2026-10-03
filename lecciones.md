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

## Fuera de alcance (pendiente para v3)

No entran en v2; se evalúan al armar el brief de la siguiente versión.

- Mensajero Orbital: puntaje.
- Mensajero Orbital: sonido.
- Mensajero Orbital: menú.
- Mensajero Orbital: Luna gigante.
- Mensajero Orbital: cinturón de rocas.
- Mensajero Orbital: ráfagas de viento (en v2 el viento es constante).
