# Tareas: Mensajero Orbital v2

> Estado: **aprobado por Nanni el 2026-10-02.** Todas las tareas cerradas el 2026-10-02 (ver `estado.md` y `bitacora.md`).

| ID | Tarea | Responsable | Depende de | Entradas | Criterio de listo | Salida |
|---|---|---|---|---|---|---|
| T01 | Plan, tareas y criterios de v2 | Coordinador | Brief aprobado | `proyecto/brief.md`, `proyecto/v1/` | Nanni los aprueba | `proyecto/plan.md`, `tareas.md`, `criterios.md`, `regresion-v1.md` |
| T02 | Pruebas nuevas | Programador (pruebas) | T01 | `criterios.md` §1–2, `plan.md` §3–4 | Cubren C-26 a C-41; fallan solo porque faltan `levels.js` y lo nuevo de `physics.js`; las 14 de v1 siguen pasando; `physics.test.js` no se toca | `src/tests/levels.test.js`, `src/tests/worlds.test.js` |
| T03 | Datos de niveles y progresión | Programador (lógica) | T01 | `criterios.md` §1.2–1.5, `plan.md` §4 | C-26, C-28 (datos), C-36, C-37 en verde; cumple C-16 | `src/js/levels.js` |
| T04 | Física con nivel y número de paso | Programador (lógica) | T01 | `criterios.md` §1.4–1.5, `plan.md` §3 | `node --test "src/tests/*.test.js"` en verde completo (C-01 a C-14 y C-26 a C-41); cumple C-16 | `src/js/physics.js` |
| T05 | Paletas por mundo y medidas desde `CONFIG` | Arte | T03, T04 (solo la forma de los datos) | `criterios.md` C-25 (v2), `plan.md` §6 | Cumple C-17 y C-25 (v2) | `src/js/sprites.js` |
| T06 | Campaña, HUD y pantallas | Programador (interfaz) | T04, T05 | `plan.md` §5 y §7, `criterios.md` §1.6 y §3 | Cumple C-15, C-18 a C-21 (v2), C-42, C-43 | `src/index.html`, `src/js/game.js` |
| T07 | README | Programador | T06 | `plan.md` §7 | Cumple C-22 (v2) | `src/README.md` |
| T07b | Revisor al día para v2 | Coordinador | T01 | `.claude/agents/revisor.md`, `criterios.md` | El procedimiento cita los IDs de v2 (A: C-01–C-14, C-26–C-41; E: C-15–C-25, C-42, C-43); herramientas siguen siendo solo Read, Grep y Glob; sesión reiniciada y herramientas comprobadas con el agente real | `.claude/agents/revisor.md` |
| T08 | Revisión | Revisor | T02–T07, T07b | `src/`, `brief.md`, `criterios.md`, salida completa de las pruebas y de `sha256sum src/tests/physics.test.js` que pasa el coordinador (sin razonamiento del programador) | Reporte con pasa/falla y evidencia por cada criterio A y E | Reporte al coordinador |
| T09 | Diagnóstico y reparación (si hay fallas) | Diagnosticador → Reparador | T08 | Reporte del revisor | Revisor revalida en verde; máximo 3 ciclos, si no se escala a Nanni. Si falla una secuencia fija, se diagnostica, no se ajusta la prueba | Arreglo mínimo en `src/` |
| T10 | Verificación manual | Nanni | T08 en verde | `src/index.html` | C-M1 a C-M6 aprobados | Visto bueno |
| T11 | Cierre | Coordinador | T10 | `src/` | Nanni aprueba la entrega | `entregables/v2/` (sin tocar `entregables/v1/`), línea en `lecciones.md`, `estado.md` cerrado |

**Paralelo:** T02, T03 y T04 pueden ir juntas (T02 primero si se quiere ver fallar). T05 empieza en cuanto esté fija la forma de los datos de nivel (ya está en `criterios.md` §1.2). T06 espera a T04 y T05. T07b puede ir en cualquier momento antes de T08.

**Antes de T08:** el coordinador toma una foto con sha256 completo de `src/` (como en v1) para comprobar después que la revisión no modificó nada. No se le pasa al revisor.
