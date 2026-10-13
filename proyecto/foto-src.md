# Foto de src/ (v4)

Uso exclusivo del coordinador para comprobar que la revisión no modifica `src/`. **No se le pasa al revisor** (salvo el sha256 del test de v1 y los de los entregables usados como referencia, que van en el traspaso). La foto de v3 está en `proyecto/v3/foto-src.md`.

## Antes de T08 (2026-10-11)

| Archivo | sha256 |
|---|---|
| `src/README.md` | `8a219b6b5ef23fd78c237e63b8f17a17ba179fb9990daa0e1d44642550e9469c` |
| `src/index.html` | `fc6bd708ac05b0ab3500959314e180c7e55a19110fe0f7a743089b0eb9775b0e` |
| `src/js/game.js` | `0bc14ff1f647a4c4e038e55a0cc28187cc9ba491635fe77a38e16db66179c41d` |
| `src/js/levels.js` | `417068c9546fd848f883ba6764710a8cd3341a0a6b1ba69676e253bef8a2b855` |
| `src/js/mission.js` | `9bfa457d1138841d7816d24251d29aeb3fff263d3653e929804752ee9f11d695` |
| `src/js/physics.js` | `cef7931863f5e2a15f8f2b971bc50c5b1401ebf61e1fe17b288d6efcb9c27610` |
| `src/js/save.js` | `cfaf21ab96d3bd473333a03f664b7d24cb4553e6b0a7bf812160d0bd90011d04` |
| `src/js/score.js` | `a216e1ea1f3c98de96b4d9998e3ee8f958a44ee7095349b7e9ea0e042ecdc098` |
| `src/js/sprites.js` | `fb600cacc225a839df60af55307151fd2c30038184568af27fa25081d999d60e` |
| `src/tests/autopilot.js` | `74ec8d0d9b5dda2fbbd9b9bba5e8b51469664a09b404f6f888c3bbc7e271f159` |
| `src/tests/campaign.test.js` | `49052d03ac2b7a1b055c7b56435bbee4df53fba0a337876ebcadb4268bf00424` |
| `src/tests/levels.test.js` | `65322b8c4ee340170a5ca93fefc9bbb9c40028adb31181cb3cbe0d55d0b8c220` |
| `src/tests/mission.test.js` | `56b9cf88b306ba2f6c3c05a4d82ed30337cd44c95ff7286304381b146250246e` |
| `src/tests/physics.test.js` | `5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a` |
| `src/tests/score.test.js` | `87cc69fdd6f46eed223e7c44570db40990d2e365b2892721645d7813067f1603` |
| `src/tests/sequences.test.js` | `3c0898f95e3e37493be6458530320b01ab3f219a7ee6f8b64c0b78d5e10e2961` |
| `src/tests/worlds.test.js` | `37ecc391177efc987918dc5ce19e0d5467d798ab4ad8f35ed3988805aceaf986` |

Entregables anteriores en ese momento: `entregables/v3/` da los mismos 13 sha256 que su foto de cierre (`proyecto/v3/foto-src.md`); `entregables/v1/` (6 archivos) y `entregables/v2/` (9) sin cambios según git. Valores de referencia:

| Archivo | sha256 |
|---|---|
| `entregables/v1/README.md` | `493f022b077e93a699d192cab9919a0b69ab421d8bb09041b8b99982385f685b` |
| `entregables/v1/index.html` | `e45c6b3877a5ec09bb2bce205699870db2c14fd9b351d0779aaee429555826a1` |
| `entregables/v1/js/game.js` | `bc77a7ff69e7a3ddadcb79b6606b7ff58a49bebf987e0bc01b7d025f3ce16db9` |
| `entregables/v1/js/physics.js` | `0ee6dd99d7f9ea768abd3becb004dfa0eb1dce582b56399f4af98c40fa940aff` |
| `entregables/v1/js/sprites.js` | `649aae9ace991cd35415ed1f8609f9f5f991ccb20dc6bb44af072470eef37566` |
| `entregables/v1/tests/physics.test.js` | `5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a` |
| `entregables/v2/README.md` | `7e6c0bb37988fea861062e7016fe988462ac2465f62c963b7c80d2755aed9f47` |
| `entregables/v2/index.html` | `e4a739e15ab5754b525aff8727341532379f71676e876c2ef5b33707f3fb4316` |
| `entregables/v2/js/game.js` | `605be9211851e88c8ebf6e8e5fc6328c86842177122fd6611d9c9c920492f64c` |
| `entregables/v2/js/levels.js` | `80a936c73438bc24c6f010e1197baadcbe59784d4d9dd5cc92d9de12df800234` |
| `entregables/v2/js/physics.js` | `1169f037ff5b0f94ae82fea03e1f1286c51d2272524f33f25bcf19874513717a` |
| `entregables/v2/js/sprites.js` | `7970b6ea8542c9c3b5dc7beb9dded8c7461baecf1dd1491a649bdec7dbbf9bb8` |
| `entregables/v2/tests/levels.test.js` | `5775f8bb5b543a06b8d46f7bf65b3431726c29ecccb29d2f1d76669f2f583198` |
| `entregables/v2/tests/physics.test.js` | `5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a` |
| `entregables/v2/tests/worlds.test.js` | `37ecc391177efc987918dc5ce19e0d5467d798ab4ad8f35ed3988805aceaf986` |
| `entregables/v3/js/levels.js` | `3d52b97b709eb9f005d175eb54d65df69eb9880dc5830bfa6c1fd05fe4eb4161` |
| `entregables/v3/js/physics.js` | `5b341083989cc16d900d7d89765cda8960a4bb3df8e3ba44bd326d536e7318df` |

(Los otros 11 de `entregables/v3/` están en `proyecto/v3/foto-src.md` y coinciden.)

## Después de T08 (2026-10-11)

Recalculada después de la revisión completa: **idéntica** a la de antes (17 de 17 sha256). git sin cambios en `entregables/`.

## T09 y revalidación (2026-10-11)

Único cambio en `src/` después de la revisión: `src/tests/sequences.test.js` (aserción del contacto con A en C-81), nuevo sha256 `d2602ad6404a6ee76039065f2a6d2d788314f2d3e94cc129300ecd99f6b29b51`; los otros 16 siguen iguales a la tabla de arriba. Huella de los 17 juntos (`sha256sum` de la lista) antes y después de la revalidación acotada: `e9a0227486d13b53643aa030e2159eecb88603ed5baef12acf3c1c4134b59d80` en ambas, **sin cambios**.

## D-14 (nivel 8 con cápsula): antes de la revisión acotada (2026-10-11)

Al empezar el cambio, `src/` daba la huella `e9a02274…9d80` (sin cambios desde la revalidación). Después del cambio, cambiaron solo 4 archivos; los otros 13 siguen iguales a las tablas de arriba (incluidos `physics.js` `cef79318…7610`, `physics.test.js` `5e97cdb8…742a`, `mission.js` `9bfa457d…d695` y `score.js` `a216e1ea…c098`).

| Archivo | sha256 |
|---|---|
| `src/README.md` | `2ebbdbeaf7bce73301e6e00d8c1d85141a3c8a840750aa1ce7c404807962c8b7` |
| `src/js/levels.js` | `8815f8666399060ccd6a39a33cbabfffe7874989b8a437c75473f71b49a4a073` |
| `src/tests/mission.test.js` | `8ad9b3f234fafcfebb8c4aae06e3a6887ff6363947b2d0c422aad58a830215d6` |
| `src/tests/sequences.test.js` | `750bb10e5c0159c0002778450ba482a4dbb4013632c6f2c38ac25b15e5a8e4a4` |

Huella de los 17: `7e822d481c0f086e115de8c0ca7da1cd9e46be798bb003866a013c6e03270b47`. git sin cambios en `entregables/`.

## D-14: huellas de referencia de C-90 (tomadas antes de tocar el nivel 8)

`sha256(JSON.stringify(...))` calculado el 2026-10-11 con `levels.js` = `417068c9…b855` (antes del cambio):

| Nivel / lista | Huella |
|---|---|
| luna | `4ffcd5fd6165776d22a29eeb346f3be87173e68bbc418a54e08e69340a5d046a` |
| marte | `2c0550cba8feb8b8363e6483311c1ca0fb990ad4e1efad631a6021d7a298b0ae` |
| asteroide | `b6666fd544bd12c1e9aad04feb10e12cbb2775956f38a8216d614fc8e61ac6e2` |
| gigante | `a790642937f63b8f3e92aa15a0c26d4685836f8394f0abbf96171469aa4357e0` |
| tormenta | `0c5997d3e7180783affcc2c6aaffabd5db6a1dab00a5a8d25784a3a95517b129` |
| aproximacion | `52ba118b4c0273d5dbd3c8f01254e6e9c331efb2b4f8cc30e4edfa29ba275040` |
| entrega | `c6ed255fb8692718f5a88224053e66086b2e56b4f598ed7b76db1fb1e0d15fdc` |
| carga (la anterior, la única que cambia) | `283e9a184e183ef8ecfdc299c0f088412f2a997b8d083cdbd75bf9f5244cf518` |
| capsulas | `ca039fc33b6e522a45db7d53b60f9a7d1e83453182f5fbd747be620383d70401` |
| final | `b781b80b60a3ca174b11629c45630d635c966bea4f07e1c5934ce0f9ef0a6c86` |
| lista del nivel 7 | `04c1a0e27bb5d9e01b1a86e6ce93ae79ab25aa770ea1591cf753f58142540414` |
| lista del nivel 9 | `a27a12bc52314bdc2aaf0cfbfee1d84cde732f87d4e06c198b1ff62157fc18d5` |
| lista del nivel 10 | `446fcedc3f705797cd0972d52957891265bc5f22fa1861e81cb40ae3ba278344` |

## D-14: después de la revisión acotada

Huella de los 17 archivos de `src/` después de la revisión: `7e822d48…0b47`, **igual** a la de antes. git sin cambios en `entregables/`; sin commits (último sigue siendo `0a384bb`).

## Cierre T11: copia a entregables/v4/ (2026-10-13)

- Antes de copiar, los 17 sha256 de `src/` eran iguales, archivo por archivo, a la última foto (huella `7e822d48…0b47`). `src/` tiene exactamente esos 17 archivos.
- `entregables/v4/` no existía. Después de copiar, los 17 archivos dan los mismos sha256 en `src/` y en `entregables/v4/` (`diff` sin diferencias; huella relativa de los 17: `56ca6423165182511bc66f8a1d834a0991af5ebc2b1ac5738019295c1f93a9f4` en ambos). La huella siguió igual después de correr las pruebas dentro de la copia.
- `entregables/v1/`, `v2/` y `v3/` (28 archivos) dieron la misma huella antes y después: `4dda60996807b587954da77f756a2596f1cc923bdeb66f33700dcdc108d76851`. git solo muestra `entregables/v4/` como nuevo.

| Archivo (relativo a `src/` y a `entregables/v4/`) | sha256 en ambos |
|---|---|
| `README.md` | `2ebbdbeaf7bce73301e6e00d8c1d85141a3c8a840750aa1ce7c404807962c8b7` |
| `index.html` | `fc6bd708ac05b0ab3500959314e180c7e55a19110fe0f7a743089b0eb9775b0e` |
| `js/game.js` | `0bc14ff1f647a4c4e038e55a0cc28187cc9ba491635fe77a38e16db66179c41d` |
| `js/levels.js` | `8815f8666399060ccd6a39a33cbabfffe7874989b8a437c75473f71b49a4a073` |
| `js/mission.js` | `9bfa457d1138841d7816d24251d29aeb3fff263d3653e929804752ee9f11d695` |
| `js/physics.js` | `cef7931863f5e2a15f8f2b971bc50c5b1401ebf61e1fe17b288d6efcb9c27610` |
| `js/save.js` | `cfaf21ab96d3bd473333a03f664b7d24cb4553e6b0a7bf812160d0bd90011d04` |
| `js/score.js` | `a216e1ea1f3c98de96b4d9998e3ee8f958a44ee7095349b7e9ea0e042ecdc098` |
| `js/sprites.js` | `fb600cacc225a839df60af55307151fd2c30038184568af27fa25081d999d60e` |
| `tests/autopilot.js` | `74ec8d0d9b5dda2fbbd9b9bba5e8b51469664a09b404f6f888c3bbc7e271f159` |
| `tests/campaign.test.js` | `49052d03ac2b7a1b055c7b56435bbee4df53fba0a337876ebcadb4268bf00424` |
| `tests/levels.test.js` | `65322b8c4ee340170a5ca93fefc9bbb9c40028adb31181cb3cbe0d55d0b8c220` |
| `tests/mission.test.js` | `8ad9b3f234fafcfebb8c4aae06e3a6887ff6363947b2d0c422aad58a830215d6` |
| `tests/physics.test.js` | `5e97cdb810ebca8e51511ea75ceb5b18aaa9183a53ef9c0a545e985da154742a` |
| `tests/score.test.js` | `87cc69fdd6f46eed223e7c44570db40990d2e365b2892721645d7813067f1603` |
| `tests/sequences.test.js` | `750bb10e5c0159c0002778450ba482a4dbb4013632c6f2c38ac25b15e5a8e4a4` |
| `tests/worlds.test.js` | `37ecc391177efc987918dc5ce19e0d5467d798ab4ad8f35ed3988805aceaf986` |
