# Foto de src/ (v3)

Uso exclusivo del coordinador para comprobar que la revisión no modifica `src/`. **No se le pasa al revisor.** La foto de v2 está en `proyecto/v2/foto-src.md`.

## Antes de T08 (2026-10-11)

| Archivo | sha256 | Modificado |
|---|---|---|
| `src/README.md` | `b6169d78b4f32dabbcf05f21304e1a28797a4d9ada058d5bddcb3cc6c2de48ec` | 2026-10-11 18:07:40 |
| `src/index.html` | `540f41f4bc7ea366fec7298df200171bf72db84359eed40958678f970e219fbf` | 2026-10-11 18:06:45 |
| `src/js/game.js` | `ad36d52e4324e1c5d1c6671df923d19f5c87bc5b2f21ef0bf66def0093dc8856` | 2026-10-11 18:06:37 |
| `src/js/levels.js` | `3d52b97b709eb9f005d175eb54d65df69eb9880dc5830bfa6c1fd05fe4eb4161` | 2026-10-11 18:03:58 |
| `src/js/physics.js` | `5b341083989cc16d900d7d89765cda8960a4bb3df8e3ba44bd326d536e7318df` | 2026-10-11 18:04:11 |
| `src/js/save.js` | `cfaf21ab96d3bd473333a03f664b7d24cb4553e6b0a7bf812160d0bd90011d04` | 2026-10-11 18:04:58 |
| `src/js/score.js` | `968723971cd0df59ba801c4970d49a46be7a7fbca81f9cdd7effe097aa06a05f` | 2026-10-11 18:04:57 |
| `src/js/sprites.js` | `ad9ca1413ad7ab5bd46cd4ec33c24bca05eea2cd15580497fe0c82a1adf3f230` | 2026-10-11 18:05:23 |
| `src/tests/campaign.test.js` | `d22cb931b62e320965f9d09e0b699a4ad6cbe32ee2495f5747f7e0fdf6f5c198` | 2026-10-11 18:03:03 |
| `src/tests/levels.test.js` | `1824f288ac24b5ce7d6e66699f073f0cf07264e8f1ed4fa90fd1f3a3d69f0c8b` | 2026-10-11 18:04:37 |
| `src/tests/physics.test.js` | `5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a` | 2026-10-01 20:15:39 |
| `src/tests/score.test.js` | `556f3d4918165a34e33c50a10a64764ae029cc88ff1fbe4479fc2758e963ea26` | 2026-10-11 18:03:30 |
| `src/tests/worlds.test.js` | `37ecc391177efc987918dc5ce19e0d5467d798ab4ad8f35ed3988805aceaf986` | 2026-10-02 01:37:21 |

## Después de T08 (2026-10-11)

Recalculada después de la revisión: **idéntica** a la de antes (sha256 y fecha de los 13 archivos; `diff` sin diferencias).

Además, `entregables/v2/` da los mismos 9 sha256 que la foto de cierre de v2 (`proyecto/v2/foto-src.md`) y `git status` no muestra cambios en `entregables/`.

## Cierre T11: copia a entregables/v3/ (2026-10-11)

Antes de copiar, `src/` coincidió con la foto de antes de T08 (13 de 13). Después de copiar, `src/` y `entregables/v3/` dan los mismos valores, y `entregables/v1/` y `entregables/v2/` (15 archivos) dieron los mismos sha256 antes y después.

| Archivo (relativo a `src/` y a `entregables/v3/`) | sha256 en ambos |
|---|---|
| `README.md` | `b6169d78b4f32dabbcf05f21304e1a28797a4d9ada058d5bddcb3cc6c2de48ec` |
| `index.html` | `540f41f4bc7ea366fec7298df200171bf72db84359eed40958678f970e219fbf` |
| `js/game.js` | `ad36d52e4324e1c5d1c6671df923d19f5c87bc5b2f21ef0bf66def0093dc8856` |
| `js/levels.js` | `3d52b97b709eb9f005d175eb54d65df69eb9880dc5830bfa6c1fd05fe4eb4161` |
| `js/physics.js` | `5b341083989cc16d900d7d89765cda8960a4bb3df8e3ba44bd326d536e7318df` |
| `js/save.js` | `cfaf21ab96d3bd473333a03f664b7d24cb4553e6b0a7bf812160d0bd90011d04` |
| `js/score.js` | `968723971cd0df59ba801c4970d49a46be7a7fbca81f9cdd7effe097aa06a05f` |
| `js/sprites.js` | `ad9ca1413ad7ab5bd46cd4ec33c24bca05eea2cd15580497fe0c82a1adf3f230` |
| `tests/campaign.test.js` | `d22cb931b62e320965f9d09e0b699a4ad6cbe32ee2495f5747f7e0fdf6f5c198` |
| `tests/levels.test.js` | `1824f288ac24b5ce7d6e66699f073f0cf07264e8f1ed4fa90fd1f3a3d69f0c8b` |
| `tests/physics.test.js` | `5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a` |
| `tests/score.test.js` | `556f3d4918165a34e33c50a10a64764ae029cc88ff1fbe4479fc2758e963ea26` |
| `tests/worlds.test.js` | `37ecc391177efc987918dc5ce19e0d5467d798ab4ad8f35ed3988805aceaf986` |
