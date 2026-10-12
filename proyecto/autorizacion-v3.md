Arranca Mensajero Orbital v3 en modo autónomo. Autorización de Nanni: toma tú las decisiones de brief, plan, criterios, valores y secuencias de referencia, y avanza hasta dejar todo listo para que yo pruebe y te dé feedback. No te detengas a pedir aprobación de brief, plan o criterios: regístralas. Guarda este mensaje completo, textual, en proyecto/autorizacion-v3.md.

ALCANCE v3 (ola 1 de 2; la ola 2 con niveles 7 a 10 será v4)
- Niveles nuevos 4, 5 y 6, en el orden que tú decidas para que la curva de dificultad tenga sentido: (a) Luna gigante: gravedad fuerte, el combustible rinde menos (consumo por nivel), plataforma chica; (b) Tormenta: ráfagas, el viento cambia de dirección en ciclos fijos calculados según el número de paso, determinista; (c) Aproximación: sin gravedad, entras con velocidad inicial y hay que frenar. Cada mecánica nueva entra como dato opcional con valor por defecto de la Luna.
- Los niveles 1 a 3 quedan idénticos a v2, con una prueba que lo compruebe contra los datos de v2.
- Puntaje: función pura probada con Node, sin tocar physics.js. Suma precisión al centro de la plataforma, combustible sobrante y tiempo medido en pasos de física (determinista). Hay puntaje por nivel y total de campaña; chocar no resta. Desglose en la pantalla de éxito y total en el HUD. Los números los propones tú y se afinan con mi feedback.
- Guardado: nivel más alto desbloqueado y mejor puntaje por nivel, en almacenamiento del navegador envuelto en try/catch (si falla, el juego funciona igual). Arranca en el nivel guardado; ?nuevo borra lo guardado; ?nivel=N sigue como ayuda de prueba y no modifica lo guardado.
- El HUD muestra "NIVEL N/total" con el total tomado de los datos, para que la ola 2 no requiera cambiar código.
- Temas visuales: máximo 16 colores por tema; la nave igual en todos (solo índices 9 a F); sin sonido; sin menú.
- Reemplaza la regla de dificultad de v2 (req. 16) por: cada nivel estrena como máximo una mecánica, la secuencia de referencia de cada nivel deja al menos 10 unidades de combustible de margen, y la dificultad final se confirma jugando.

REGLAS QUE NO SE NEGOCIAN
1. Nunca edites src/tests/physics.test.js de v1 ni entregables/v1/ ni entregables/v2/. Si una función te obliga a tocarlos, elige otro diseño o deja esa función fuera y regístralo.
2. Los tests de v2 solo se pueden cambiar donde dependan de que haya 3 niveles, y solo después de ver que fallan por eso. Los valores de los niveles 1 a 3 no cambian.
3. Pruebas antes que código. Si una prueba falla, no la ajustes para que pase: diagnostica el origen.
4. Calcula a mano las secuencias de referencia de los niveles 4, 5 y 6 antes de construir y compáralas con la primera corrida.
5. Revisor de solo lectura, con la foto de hashes completos de src/ antes y después de cada revisión y la salida de las pruebas completa.
6. Máximo 3 ciclos por problema. Si no se resuelve, NO te detengas: déjalo marcado como pendiente en estado.md con la evidencia y sigue con lo demás.
7. Prohibido sin aprobación mía: salir de moon/ (temporales en proyecto/ o en la carpeta temporal de la sesión), instalar dependencias, cambiar la versión de Phaser, hacer commits o push, borrar fuera de lo permitido en CLAUDE.md §5, agregar sonido, menú o cualquier cosa de v4.
8. No copies a entregables/v3/ hasta que yo apruebe el cierre.

REGISTRO
- Guarda cada decisión que tomes por mí en proyecto/decisiones-autonomas.md: qué decidiste, qué alternativas había, por qué y cómo se revierte.
- Mantén estado.md y bitacora.md al día después de cada tarea, de modo que si la sesión se corta se pueda reanudar desde ahí. Si notas que el contexto se satura (repites cosas o dudas de decisiones ya tomadas), detente en un punto de corte, deja un punto de reanudación en estado.md y dime que reinicie la sesión.

PASO 0 (hazlo primero y luego detente)
Archiva los documentos de v2 en proyecto/v2/ sin cambiarles el contenido y comprueba los hashes. Actualiza .claude/agents/revisor.md para que sirva a v3 y v4: que lea los criterios vigentes de proyecto/criterios.md en lugar de una lista fija de IDs, con herramientas solo Read, Grep y Glob. No definas más agentes. Luego dime que reinicie la sesión para cargarlo y espera a que yo escriba "sigue". Es la única pausa que necesito.

DESPUÉS DEL "SIGUE"
Haz de punta a punta: brief (como intake), plan, tareas y criterios (como coordinador), pruebas, datos, física, arte, juego, README, revisión y reparaciones. Al terminar deja src/ listo y entrégame un reporte final con: cómo abrirlo (incluidas las URLs ?nivel=N y ?nuevo), qué debo probar a mano y qué criterios manuales (C-M), el orden y los valores de los niveles, las decisiones tomadas (resumen de decisiones-autonomas.md), lo que quedó pendiente y qué feedback necesitas de mí.
