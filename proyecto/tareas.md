# Tareas: Mensajero Orbital v4

> Estado: decididas en modo autónomo el 2026-10-11. El avance está en `estado.md`.

| ID | Tarea | Responsable | Depende de | Criterio de listo | Salida |
|---|---|---|---|---|---|
| T00 | Archivar v3, preguntar herramientas al revisor | Coordinador | Autorización | sha256 iguales; respuesta en bitácora | `proyecto/v3/` |
| T01 | Brief, plan, tareas, criterios; secuencia del nivel 7 a mano | Intake / Coordinador | T00 | Documentos escritos; decisiones registradas | `proyecto/*.md` |
| T02 | Pruebas de misión (fallan primero) | Programador | T01 | C-66 a C-81 escritas; fallan solo por lo que falta | `src/tests/mission.test.js`, `src/tests/sequences.test.js` (nivel 7) |
| T03 | `thrustFactor`, `mission.js`, `scoreRun`, nivel 7 | Programador | T02 | C-66 a C-81 en verde; nivel 7 igual al cálculo a mano | `src/js/*` |
| T04 | Tests de v3 que dependen del número de niveles | Programador | T03 | Solo los que fallan por eso; registrados | tests heredados |
| T05 | Piloto, validación contra el nivel 7, niveles 8 a 10 y sus secuencias | Programador | T03 | C-82 a C-87 en verde; margen ≥ 10; registrado como generado | `src/tests/autopilot.js`, `levels.js`, `sequences.test.js` |
| T06 | Arte | Arte | T05 | C-88 en verde | `src/js/sprites.js` |
| T07 | Juego, HTML, README; prueba de humo en Node | Programador | T05, T06 | C-15, C-18, C-21, C-22, C-43, C-64, C-65, C-89 | `game.js`, `index.html`, `README.md` |
| T08 | Revisión | Revisor | T02–T07 | Reporte; hashes de `src/` iguales antes y después | Reporte |
| T09 | Reparación | Coordinador → Reparador | T08 | Máx. 3 ciclos por problema | Arreglo mínimo |
| T10 | Reporte final | Coordinador → Nanni | T09 | Reporte entregado | Reporte |
| T11 | Cierre | Coordinador | Aprobación de Nanni | — | `entregables/v4/` |
