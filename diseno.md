# Sistema multiagente genérico: estructura completa

Oct 1, 2026 · @Nanni

## 1. Capa de agentes

El intake y el coordinador dirigen el trabajo, el bloque de ejecución cambia según el tipo de proyecto y la capa de calidad es igual en todos.

- **Intake (agente):** platica contigo, afina la idea y la entrega ya acordada al coordinador.
- **Coordinador (agente):** arma el plan, reparte el trabajo, decide el orden, integra entregas y te avisa si algo se atora.
- **Ejecución** (ejemplo: videojuego)
  - **Agente de diseño:** subagente de mecánicas y subagente de narrativa.
  - **Agente de programación:** subagentes de lógica del juego, interfaz y pruebas técnicas.
  - **Agente de arte:** subagentes de personajes y escenarios.
  - **Agente de sonido:** música y efectos, sin subagentes por ahora.
- **Calidad** (igual en todos los proyectos)
  - **Agente revisor (detecta):** subagente de requisitos (¿cumple lo acordado?) y subagente de calidad técnica (¿funciona sin fallas?).
  - **Agente diagnosticador (encuentra el origen):** clasifica la falla como de ejecución, de integración o de requisito. No arregla nada.
  - **Agente reparador (corrige):** hace el arreglo más pequeño posible según el diagnóstico.

Un agente carga el hilo de toda una fase y vive todo el proyecto. Un subagente hace un trabajo puntual y autocontenido, en su propio contexto, y solo devuelve su resultado.

## 2. Capa de skills

Un skill es una capacidad que vive independiente de los agentes: varios agentes pueden usar el mismo sin duplicarlo.

| Grupo | Skills |
| --- | --- |
| Transversales (casi todos los usan) | Leer el brief, escribir documentación, reportar al coordinador, buscar en la web, leer y escribir archivos del proyecto |
| Intake | Entrevistar y hacer preguntas de aclaración, detectar tipo de proyecto, armar el brief con criterios de aceptación medibles |
| Coordinación | Descomponer en fases y tareas, elegir agente por tarea, seguir el avance y detectar bloqueos, integrar entregas, escalar decisiones a ti |
| Ejecución: diseño | Definir mecánicas y reglas, escribir narrativa y diálogos, diseñar niveles |
| Ejecución: programación | Generar código, depurar, armar interfaz, escribir pruebas automatizadas |
| Ejecución: arte y sonido | Definir estilo visual, generar assets, generar o seleccionar música y efectos |
| Calidad | Comparar entrega contra requisitos, ejecutar pruebas y leer resultados, rastrear el origen de una falla, clasificar la falla, aplicar un arreglo mínimo, registrar la lección aprendida |

**Cómo se asignan.** Cada agente declara su lista de skills y recibe solo los que necesita, más los transversales. El skill no sabe quién lo usa, así que si quieres cambiar lo que puede hacer un agente editas su lista y no tocas el skill. Cada skill trae una descripción corta de cuándo aplica, y el agente carga el detalle completo solo cuando la tarea lo requiere.

**Cómo saber si un skill está bien definido.** Hace una sola cosa, se puede probar solo y se puede asignar a más de un agente sin cambiarlo.

**Cómo ajustar.** Si un agente se traba pidiendo algo que no tiene, le falta un skill. Si un skill casi no se usa o confunde, sobra o hay que renombrarlo.

## 3. Documentos (estilo SDD)

Del SDD se adoptan solo spec, plan y tareas; no hace falta usarlo completo. La especificación es la fuente de verdad: si algo sale mal se corrige la spec y no el código, y el revisor juzga contra ella.

| Nivel | Documento | Para qué sirve |
| --- | --- | --- |
| Global | Reglas | Límites para todos los agentes: qué nunca hacer y qué requiere tu aprobación |
| Global | Catálogo | Tabla de agentes contra skills; el coordinador la consulta para delegar |
| Global | Plantilla de brief | Formato fijo que llena el intake |
| Global | Plantillas por tipo de proyecto | Arranque ya armado para videojuego, app o documento |
| Por proyecto | Brief | La idea acordada: objetivo, alcance, entregables, restricciones y qué NO incluye |
| Por proyecto | Plan | Fases, orden y puntos de revisión |
| Por proyecto | Tareas | El plan desglosado en pasos pequeños y verificables |
| Por proyecto | Criterios | Qué debe cumplir cada entrega, de forma medible |
| Por proyecto | Estado | Avance, rechazos y pendientes; permite retomar si algo falla a la mitad |
| Por proyecto | Bitácora | Qué hizo cada agente, con qué entrada y qué salida |
| Por proyecto | Entregables | Carpeta de salidas finales, separada de los archivos de trabajo |
| Memoria | Preferencias | Cómo quieres que trabajen siempre |
| Memoria | Lecciones | Errores y aprendizajes que valen la pena reutilizar |

**Regla clave.** El estado pertenece a un proyecto y termina con él. La memoria vive por encima de los proyectos. Al cerrar uno, el coordinador pasa a lecciones solo lo que vale la pena reutilizar y archiva lo demás, para que el siguiente proyecto no cargue contexto viejo.

## 4. Flujo de un proyecto

La idea pasa de ti al intake, de ahí al coordinador, a los agentes de ejecución y por la capa de calidad hasta el cierre.

1. Tú e intake acuerdan la idea y se genera el brief.
2. El coordinador arma plan, tareas y criterios, y te los confirma.
3. Arranca con diseño.
4. Programación y arte trabajan en paralelo.
5. Cada entrega pasa por el revisor.
6. Si hay falla, el diagnosticador la clasifica y la manda según su origen:
   - **Ejecución:** regresa al agente que la produjo.
   - **Integración:** la atiende el coordinador.
   - **Requisito:** sube a ti, porque ahí lo que se corrige es la idea.
7. El reparador corrige y el revisor valida otra vez, máximo 2 o 3 ciclos.
8. Si no pasa, el coordinador te avisa.
9. Con todo aprobado, el coordinador integra y cierra.
10. Se pasan a memoria solo las lecciones útiles y el resto se archiva.

## 5. Qué se pasan entre sí los agentes

Cada agente recibe el mínimo contexto necesario y entrega en un formato fijo; así hay menos ruido y menos errores que se arrastran de uno a otro.

| De | A | Qué se pasa |
| --- | --- | --- |
| Intake | Coordinador | La idea acordada contigo en formato fijo: objetivo, alcance, entregables, restricciones y criterios de aceptación medibles |
| Coordinador | Cada agente | La tarea concreta, la parte del brief que le toca y los criterios con los que se revisará |
| Cada agente | Coordinador | Un reporte corto y siempre igual: qué hice, qué entregué, qué falta, qué dudas tengo |
| Agente | Revisor | La entrega y los criterios, sin su razonamiento, para que el revisor juzgue el resultado y no se contagie de su lógica |
| Revisor | Diagnosticador | La falla con evidencia: qué se esperaba y qué se obtuvo |
| Diagnosticador | Reparador | El origen clasificado y lo mínimo que hay que cambiar |

## 6. Capas de soporte

Las cinco primeras son las que hacen falta para que el sistema corra; las demás se agregan cuando se note dónde se atora.

| Prioridad | Capa | Qué resuelve |
| --- | --- | --- |
| Esencial | Herramientas y conexiones | Con qué toca el mundo real cada agente: archivos, ejecución de código, web, APIs. Los servidores MCP entran aquí |
| Esencial | Motor de ejecución | Quién corre todo: el SDK de agentes, una herramienta ya hecha o n8n |
| Esencial | Reglas y permisos | Qué hace cada agente solo, qué pide aprobación y qué nunca hace (borrar, gastar, publicar, mandar mensajes) |
| Esencial | Puntos de aprobación contigo | Idea acordada, plan, entregas grandes y fallas de requisito |
| Esencial | Estado del proyecto | Dónde queda el avance si algo falla a la mitad |
| Importante | Memoria entre proyectos | Preferencias y lecciones, separadas del estado |
| Importante | Bitácora | Qué hizo cada agente, para encontrar por qué algo salió raro |
| Importante | Manejo de errores | Reintentos limitados, tiempo máximo y a quién avisa si un agente se traba o se cicla |
| Importante | Control de costos | Tope de tokens o dinero por proyecto y por agente |
| Importante | Versiones | Guardar cada entrega para poder regresar si algo se rompe |
| Después | Pruebas de los propios agentes | Casos de prueba antes de confiarles proyectos reales |
| Después | Modelo por agente | Uno potente en coordinador y revisor, uno más barato en tareas simples |
| Después | Catálogo y plantillas | Tabla de agentes contra skills y arranques por tipo de proyecto |

**SDK y MCP.** El SDK sirve para construir el agente y su orquestación (ciclo de razonamiento, herramientas, subagentes). El MCP es el estándar para conectar al agente con sistemas externos como Drive o una base de datos. No compiten: con el SDK armas a los agentes y con MCP les conectas lo que necesitan.

**Motor de ejecución, tres caminos.** Flujo visual (n8n): va bien para flujos fijos y predecibles. SDK de agentes en código: da control total y soporta subagentes y enrutamiento dinámico, pero tú mantienes la orquestación. Herramienta ya hecha tipo Claude Code: arranca rápido y trae permisos y manejo de contexto, pero depende de lo que soporte hoy. Para validar la estructura conviene empezar por la herramienta ya hecha y migrar a código propio si se queda corta.

## 7. Reutilización entre proyectos

Los agentes se definen por habilidad y no por proyecto, así que el mismo equipo sirve para cualquier proyecto: cada uno recibe su contexto y sus criterios en el momento.

**Se queda igual:** intake, coordinador, toda la capa de calidad, los skills transversales y los documentos globales.

**Cambia solo el bloque de ejecución:**

| Tipo de proyecto | Agentes de ejecución |
| --- | --- |
| Videojuego | Diseño, programación, arte, sonido |
| App | Análisis de requisitos, programación, base de datos |
| Documento | Investigación, redacción, formato |

## 8. Orden para construirlo y notas

Se construye de adentro hacia afuera: primero lo mínimo para correr un proyecto chico y lo demás cuando se vea dónde se atora.

1. Definir el formato del brief, porque todo lo demás depende de él.
2. Armar un programador y un revisor.
3. Agregar un coordinador simple.
4. Probar con un proyecto chico, por ejemplo un script que calcule el OEE a partir de un Excel de paros.
5. Agregar herramientas, permisos, estado y bitácora.
6. Sumar diagnosticador y reparador.
7. Agregar el intake conversacional.
8. Por último, memoria, catálogo y plantillas.

**Pendientes por confirmar**

- [ ] En la documentación del SDK, si un subagente puede lanzar a otros. Si no, aplanar la estructura y que el coordinador lance todos.
- [ ] Los nombres exactos de clases y parámetros del SDK, que cambian entre versiones.
- [ ] Cómo restringir al revisor para que, aunque pueda ejecutar comandos para correr pruebas, no pueda modificar archivos.
- [ ] Dónde va a platicar el intake contigo: chat web propio, una app o la terminal.
