# CLAUDE.md — Reglas del sistema (proyecto: moon)

Este archivo se lee al arrancar cada sesión. Son las reglas globales. Si algo aquí choca con una instrucción suelta en el chat, avisa antes de actuar.

## 1. Qué es este proyecto

Sistema multiagente para ejecutar proyectos a partir de un brief. El primer proyecto de prueba es **Mensajero Orbital**: videojuego web en pixel art 16 bits, una nave de carga que debe aterrizar en plataformas. Versión mínima: un solo mundo (Luna), una plataforma, combustible limitado y pantalla de éxito o choque.

Contexto completo de la arquitectura: `diseno.md` (léelo cuando necesites entender roles, flujo o traspasos).

## 2. Idioma y estilo

- Responde y documenta en español mexicano informal.
- Código, nombres de archivos y variables en inglés o español, pero consistentes en todo el proyecto.
- Respuestas cortas y directas. Explica el porqué solo cuando haya una decisión de por medio.

## 3. Estructura de carpetas

```
moon/
├── CLAUDE.md              # estas reglas
├── diseno.md              # arquitectura del sistema (referencia)
├── .claude/
│   ├── agents/            # definición de agentes (uno .md por agente)
│   └── skills/            # skills reutilizables
├── proyecto/
│   ├── brief.md           # qué se quiere (acordado con Nanni)
│   ├── plan.md            # cómo se hará (lo arma el coordinador)
│   ├── tareas.md          # lista de tareas con responsable
│   ├── criterios.md       # criterios de aceptación medibles
│   ├── estado.md          # en qué va el proyecto ahorita
│   └── bitacora.md        # registro de decisiones y eventos
├── src/                   # código del entregable
└── entregables/           # versiones cerradas
```

## 4. Reglas de trabajo

1. **Nada se construye sin brief.** Si no existe `proyecto/brief.md` aprobado, lo primero es armarlo.
2. **Un agente, una responsabilidad.** Cada agente hace lo suyo y no invade el trabajo de otro.
3. **Mínimo contexto en cada traspaso.** Pasa solo lo necesario, en el formato fijo de la sección 7.
4. **El revisor no ve el razonamiento del que construyó.** Solo recibe el entregable, el brief y los criterios.
5. **Prefiere verificaciones deterministas.** Si algo se puede comprobar corriendo código o comparando contra un valor calculado, se hace así, no "a ojo".
6. **Arreglo mínimo.** El reparador corrige solo lo que falló, sin reescribir de más.
7. **Límite de ciclos.** Máximo 3 ciclos de revisión → diagnóstico → reparación. Si no pasa, se escala a Nanni con un resumen de lo intentado.
8. **Si hay duda sobre un requisito, se pregunta.** No se inventa un requisito para "avanzar".

## 5. Permisos

| Agente | Puede leer | Puede escribir | Puede correr comandos |
|---|---|---|---|
| Intake | todo | `proyecto/brief.md` | no |
| Coordinador | todo | `proyecto/` (plan, tareas, criterios, estado, bitácora), `.claude/` y `lecciones.md`; al cierre y con aprobación de Nanni, copia `src/` a `entregables/vN/` | solo lectura, más `node --test "src/tests/*.test.js"` para pasarle la salida completa al revisor |
| Programador | todo | `src/` | pruebas y servidor local |
| Arte | todo | solo `src/js/sprites.js` | no |
| Revisor | todo (solo Read, Grep, Glob) | **nada** | **no** (recibe del coordinador la salida de las pruebas) |
| Diagnosticador | todo | **nada** (solo reporta) | solo lectura |
| Reparador | todo | `src/` (solo lo que indique el diagnóstico) | pruebas |

Nunca, sin aprobación explícita de Nanni:
- Borrar archivos fuera de `src/`.
- Instalar dependencias nuevas.
- Salir de la carpeta `moon/`.
- Hacer commits, push o publicar algo.
- Gastar en servicios externos de pago.

## 6. Puntos de aprobación humana

Nanni aprueba:
- El `brief.md` antes de que el coordinador arme el plan.
- El `plan.md` y `criterios.md` antes de ejecutar.
- Cualquier cambio de requisito durante el proyecto.
- El cierre y la entrega final.

## 7. Formato de traspaso entre agentes

Todo traspaso lleva estos cuatro campos y nada más:

```
OBJETIVO: qué se pide, en una o dos líneas.
ENTRADAS: archivos o datos que debe usar (rutas exactas).
CRITERIO DE LISTO: cómo sabremos que terminó bien.
SALIDA ESPERADA: qué debe entregar y dónde lo deja.
```

Cuando un agente regresa trabajo, reporta: qué hizo, qué archivos tocó, qué no pudo hacer y qué dudas quedaron.

## 8. Estado y bitácora

- `estado.md` se actualiza al terminar cada tarea: fase actual, tareas hechas, tareas pendientes, bloqueos.
- `bitacora.md` se llena con una línea por evento: fecha, agente, qué pasó, por qué. Debe alcanzar para que alguien ajeno reconstruya qué se decidió y por qué.
- Cuando algo se aprende y sirve para otros proyectos, se agrega una línea a `lecciones.md` (una línea por lección).

## 9. Plantilla de brief

Copia esto a `proyecto/brief.md` y llénalo. Debe ser preciso y medible, no necesariamente largo.

```markdown
# Brief: [nombre del proyecto]

## Resumen
Una o dos frases: qué es y para quién.

## Objetivo
Qué debe lograr el entregable.

## Alcance (versión mínima)
- Incluye: ...
- No incluye: ...

## Requisitos
1. [Requisito concreto y verificable]
2. ...

## Criterios de aceptación (medibles)
- [Ej.: la nave aterriza con velocidad vertical menor a X y ángulo menor a Y grados]
- ...

## Restricciones
Tecnología, tiempo, presupuesto, estilo.

## Entregables
Qué archivos o formato se entregan y dónde.

## Puntos que requieren aprobación de Nanni
Decisiones que no se toman sin preguntar.

## Dudas abiertas
Lo que falta definir.
```

## 10. Primer proyecto: Mensajero Orbital (versión mínima)

Punto de partida para el brief:
- Web, JavaScript en el navegador, librería tipo Phaser.
- Un mundo: Luna (gravedad baja, plataforma grande).
- Controles: propulsor hacia arriba y giro izquierda/derecha.
- Combustible limitado.
- Aterrizaje exitoso: velocidad baja y nave casi derecha sobre la plataforma. Si no, choque.
- Pantallas de éxito y de choque.
- Los valores exactos (velocidad máxima, ángulo máximo, consumo de combustible) se definen en `criterios.md`.
