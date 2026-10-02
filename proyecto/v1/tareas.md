# Tareas: Mensajero Orbital (versión mínima)

> Estado: **aprobado por Nanni el 2026-10-01.**

| ID | Tarea | Responsable | Depende de | Entradas | Criterio de listo | Salida |
|---|---|---|---|---|---|---|
| T01 | Plan, tareas y criterios | Coordinador | Brief aprobado | `proyecto/brief.md` | Nanni los aprueba | `proyecto/plan.md`, `tareas.md`, `criterios.md` |
| T02 | Pruebas de física | Programador (pruebas) | T01 | `criterios.md` §1–2, `plan.md` §3–4 | Cubren C-01 a C-14; fallan solo porque falta `physics.js` | `src/tests/physics.test.js` |
| T03 | Lógica de física | Programador (lógica) | T01 | `criterios.md` §1, `plan.md` §3–4 | `node --test "src/tests/*.test.js"` en verde; cumple C-13, C-14 y C-16 | `src/js/physics.js` |
| T04 | Sprites en código | Arte | T01 | `criterios.md` §5, `plan.md` §3 | Genera texturas sin archivos externos (C-17); paleta ≤ 16 colores | `src/js/sprites.js` |
| T05 | Escenas, entrada, HUD y bucle | Programador (interfaz) | T03, T04 | `plan.md` §3–5, `criterios.md` §3 | Cumple C-15 y C-17 a C-21 | `src/index.html`, `src/js/game.js` |
| T06 | README | Programador | T05 | `plan.md` §3 | Cumple C-22 | `src/README.md` |
| T06b | Definir el revisor como agente real | Coordinador | T01 | `plan.md` §7.2, CLAUDE.md §5 | `.claude/agents/revisor.md` existe con herramientas solo de lectura y para correr pruebas | `.claude/agents/revisor.md` |
| T07 | Revisión | Revisor | T02–T06, T06b | `src/`, `brief.md`, `criterios.md` (sin razonamiento del programador) | Reporte con pasa/falla y evidencia por cada criterio A y E | Reporte al coordinador |
| T08 | Diagnóstico y reparación (si hay fallas) | Diagnosticador → Reparador | T07 | Reporte del revisor | Revisor vuelve a validar en verde; máximo 3 ciclos, si no se escala a Nanni | Arreglo mínimo en `src/` |
| T09 | Verificación manual | Nanni | T07 en verde | `src/index.html` | C-M1 a C-M4 aprobados | Visto bueno |
| T10 | Cierre | Coordinador | T09 | `src/` | Nanni aprueba la entrega | `entregables/v1/`, línea en `lecciones.md`, `estado.md` cerrado |


**Paralelo:** T02, T03 y T04 pueden ir al mismo tiempo. T05 espera a T03 y T04.
