Arranca Mensajero Orbital v4 en modo autónomo. Autorización de Nanni: toma tú las decisiones de brief, plan, criterios, valores y secuencias de referencia, y avanza hasta dejar todo listo para que yo pruebe y te dé feedback. No te detengas a pedir aprobación de brief, plan o criterios: regístralas. Lee CLAUDE.md, lecciones.md y proyecto/autorizacion-v3.md (las reglas siguen vigentes salvo lo que diga este mensaje). Guarda este mensaje completo, textual, en proyecto/autorizacion-v4.md.

ANTES DE EMPEZAR
1. Copia (no muevas) los documentos de v3 a proyecto/v3/ sin cambiarles el contenido y comprueba los sha256. Los de la raíz de proyecto/ se reemplazan por los de v4.
2. Pregúntale al revisor qué herramientas tiene (debe ser Read, Grep, Glob y el canal de regreso del subagente) y anótalo en la bitácora.
3. Si todo está bien, continúa sin pausas.

ALCANCE v4 (llega a 10 niveles)
- Misión de entrega: los niveles de misión tienen una plataforma de recogida (A) y una de entrega (B). Aterrizar bien en A recoge el paquete y el nivel NO termina; despegas y aterrizas bien en B para entregar y ganar el nivel. El combustible es compartido en todo el nivel. Chocar reinicia el nivel completo.
- Carga pesada: dato opcional, un factor del empuje con el paquete a bordo (por defecto 1).
- Cápsulas: objetos que se recogen en vuelo y dan combustible, puntos o ambos (dato opcional por nivel, lista vacía por defecto). Detección de contacto como función pura y determinista.
- Niveles 7 a 10: 7, una entrega simple; 8, con carga pesada; 9, con cápsulas; 10, el final, que combina lo anterior. El orden y los valores los decides tú. Cada nivel estrena como máximo una mecánica, salvo el 10. Todo mecanismo nuevo entra como dato opcional con valor por defecto que deja iguales los niveles anteriores.
- Los niveles 1 a 6 quedan idénticos a v3, con una prueba que lo compare paso a paso contra entregables/v3/.
- Puntaje: adáptalo a las misiones (entrega, combustible, tiempo en pasos y cápsulas); los números los propones tú.
- HUD: paquete a bordo o entregado, cápsulas recogidas y "NIVEL N/total" tomado de los datos. Guardado: igual que v3, por id de nivel.
- Temas visuales: máximo 16 colores por tema, la nave igual en todos (solo índices 9 a F). Sprites nuevos de paquete y cápsula, hechos en código.
- Fuera de alcance (v5): rocas, niebla, ráfagas nuevas, sonido y menú.

REGLAS
1. Todas las reglas de autorizacion-v3.md siguen vigentes: no editar src/tests/physics.test.js de v1 ni entregables/v1/, v2/ y v3/; pruebas antes que código; no ajustar una prueba para que pase; revisor de solo lectura con foto de hashes completos antes y después; tope de 3 ciclos por problema (si no se resuelve, déjalo marcado como pendiente y sigue); nada fuera de moon/, sin instalar dependencias, sin cambiar Phaser, sin commits y sin copiar a entregables/v4/ hasta que yo apruebe el cierre.
2. Si la misión te obliga a que step regrese a 'flying' tras aterrizar en A, o a cambiar el estado de 8 campos, resuélvelo con un estado de misión aparte o con parámetros opcionales. No edites el test de v1; si no hay forma, escálame la decisión en el reporte final y deja esa parte fuera.
3. Los tests de v3 solo se pueden cambiar donde dependan del número de niveles, y solo después de ver que fallan por eso.
4. Secuencias de referencia: calcula a mano la del nivel 7 y úsala para validar un piloto automático que vive solo en src/tests/ y nunca en el juego. El piloto genera las secuencias de los niveles 8 a 10. Guárdalas como listas fijas de teclas en las pruebas (el test repite la lista, no corre el piloto) y registra en decisiones-autonomas.md que fueron generadas. Cada secuencia deja al menos 10 unidades de combustible de margen. El revisor comprueba que el piloto no se usa en el juego.
5. Ningún comando con redirección sin ruta explícita dentro de proyecto/ o de la carpeta temporal de la sesión.
6. Registra cada decisión en proyecto/decisiones-autonomas.md y mantén estado.md y bitacora.md al día para poder reanudar. Si el contexto se satura, detente en un punto de corte y pídeme reiniciar.

AL TERMINAR
Deja src/ listo y entrégame un reporte final con: cómo abrirlo, qué debo probar a mano (C-M), los niveles con sus valores, las decisiones tomadas, lo pendiente y el feedback que necesitas de mí.
