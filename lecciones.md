# Lecciones

Una línea por lección. Sirven para cualquier proyecto.

- 2026-10-01 (Mensajero Orbital): el texto pequeño dibujado sobre un lienzo de baja resolución (8 px en 320×180) se ve borroso y deforme al escalar. El HUD y los textos van en HTML encima del canvas desde el diseño.
- 2026-10-01 (Mensajero Orbital): Restringir un agente por herramientas es más seguro que por hooks; un hook que falla abierto da falsa seguridad. Todo blindaje se prueba con el agente real.
- 2026-10-01 (Mensajero Orbital): las definiciones de `.claude/agents/` se cargan al iniciar la sesión; después de editarlas, reinicia y comprueba con el agente qué herramientas tiene antes de confiar en el cambio.
- 2026-10-01 (Mensajero Orbital): una verificación manual de la consola debe decir cuál consola (la del navegador, no la de VS Code); el aviso de `file://` se dio por resuelto viendo la equivocada.

## Ideas para versiones futuras

No entran en el alcance actual; se evalúan al armar el brief de una versión nueva.

- Mensajero Orbital: dificultad creciente conforme se agreguen mundos.
- Mensajero Orbital (pendiente para más mundos): las medidas de las texturas en `src/js/sprites.js` (suelo 320×20, plataforma de 80, fondo 320×180) están escritas a mano y deberían salir de `CONFIG`.
