# Tareas: Mensajero Orbital v3

> Estado: decididas en modo autónomo el 2026-10-11. El avance está en `estado.md`.

| ID | Tarea | Responsable | Depende de | Entradas | Criterio de listo | Salida |
|---|---|---|---|---|---|---|
| T01 | Brief, plan, tareas, criterios y secuencias a mano | Intake / Coordinador | Autorización | `autorizacion-v3.md`, `proyecto/v2/` | Documentos escritos; decisiones en `decisiones-autonomas.md` | `proyecto/*.md` |
| T02 | Pruebas nuevas | Programador | T01 | `criterios.md` §1–2 | Cubren C-44 a C-63; fallan solo por lo que falta | `src/tests/campaign.test.js`, `src/tests/score.test.js` |
| T03 | Datos y física | Programador | T02 | `criterios.md` §1.3–1.5, `plan.md` §3 | C-44 a C-56 en verde; secuencias comparadas con el cálculo a mano | `src/js/levels.js`, `src/js/physics.js` |
| T04 | Tests de v2 que dependan de 3 niveles | Programador | T03 | Salida de las pruebas | Solo C-26, C-28, C-36 y C-37, después de ver que fallan por eso; registrado en la bitácora | `src/tests/levels.test.js` |
| T05 | Puntaje y guardado | Programador | T02 | `criterios.md` §1.6–1.7 | C-57 a C-61 y C-63 en verde | `src/js/score.js`, `src/js/save.js` |
| T06 | Temas nuevos | Arte | T03 | `criterios.md` C-25 (v3), C-62 | C-62 en verde | `src/js/sprites.js` |
| T07 | Juego, HTML y README | Programador | T03, T05, T06 | `plan.md` §5, `criterios.md` §3 | C-15 a C-25 (v3), C-42, C-43, C-64, C-65 | `src/js/game.js`, `src/index.html`, `src/README.md` |
| T08 | Revisión | Revisor | T02–T07 | `src/`, `brief.md`, `criterios.md`, salida de las pruebas y sha256 del test de v1 | Reporte pasa/falla por criterio A y E; hashes de `src/` iguales antes y después | Reporte |
| T09 | Diagnóstico y reparación | Coordinador → Reparador | T08 | Reporte | Revalidado; máx. 3 ciclos por problema, si no, queda pendiente en `estado.md` | Arreglo mínimo en `src/` |
| T10 | Reporte final y prueba manual | Coordinador → Nanni | T09 | `src/` | Reporte entregado; C-M1 a C-M9 a cargo de Nanni | Reporte |
| T11 | Cierre | Coordinador | Aprobación de Nanni | `src/` | Nanni aprueba | `entregables/v3/` |
