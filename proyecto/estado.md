# Estado: Mensajero Orbital v4

**Fase actual:** **CERRADA** el 2026-10-13 con la aprobación de Nanni. Probó los 10 niveles, incluido el 8 con su cápsula, y aprobó el estacionamiento que endereza la nave y el puntaje de misión.

**Entregable:** `entregables/v4/`, copia idéntica de `src/` (17 archivos; sha256 en `proyecto/foto-src.md`, sección "Cierre T11"). `entregables/v1/`, `v2/` y `v3/` sin cambios.

**Hechas:** T00 a T11 y el ajuste D-14 (cápsula del nivel 8).
- Revisión completa: 89 de 89 criterios automáticos y estáticos pasan tras 1 ciclo de aclaraciones, sin fallas.
- Revisión acotada de D-14: 6 de 6 pasan.

**Pruebas finales (2026-10-13):**
- `node --test "src/tests/*.test.js"` desde `moon/`: 74 tests, 74 pass, 0 fail.
- Dentro de `entregables/v4/`: 61 de 62. Solo falla `campaign.test.js` de v3, porque busca `entregables/v2/` con ruta relativa. Es el pendiente conocido para v5; las pruebas nuevas de v4 sí corren desde la copia.

**Pendientes de v4:** ninguno. Los de v5 están en `lecciones.md` → "Fuera de alcance (pendiente para v5)".

**Commits:** ninguno; quedan a decisión de Nanni.
