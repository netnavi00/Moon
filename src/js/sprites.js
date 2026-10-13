// Pixel art de Mensajero Orbital, definido en código (sin archivos de imagen).
// Cada sprite es una matriz de caracteres; cada carácter es un índice de la paleta ('.' = transparente).
// Las texturas se crean con textures.generate de Phaser 3.80 (canvas, síncrono, no carga archivos).
// Las medidas de fondo, suelo y plataforma salen de CONFIG (MoonPhysics) y de los datos del nivel.
// Uso desde una escena: const keys = MoonSprites.generateLevel(this.textures, level);
(function (root) {
  'use strict';

  const CONFIG = root.MoonPhysics.CONFIG;

  // Colores de la nave y la llama: iguales en todos los mundos (índices 9–F).
  const SHIP_COLORS = {
    9: '#d8dde6', // casco claro
    A: '#8c95a6', // casco sombra
    B: '#3fa7d6', // ventanilla
    C: '#e8702a', // llama exterior
    D: '#ffe066', // llama núcleo
    E: '#2b2f3a', // contorno de la nave
    F: '#b5651d', // franja de carga
  };

  // Un tema por mundo: 9 colores propios (índices 0–8) + los 7 de la nave = 16 como máximo.
  // stars, craters y maxCrater son cantidades del dibujo; las semillas son fijas.
  const THEMES = {
    luna: {
      colors: {
        0: '#0b0e1f', // fondo espacial
        1: '#ffffff', // estrella brillante
        2: '#8a90b8', // estrella tenue
        3: '#a8a8a8', // superficie, borde claro
        4: '#7a7a7a', // superficie
        5: '#555555', // cráter
        6: '#363636', // sombra de cráter / soporte de plataforma
        7: '#f2c230', // plataforma
        8: '#c0392b', // marcas de la plataforma
      },
      stars: 70, starSeed: 20261001,
      craters: 40, maxCrater: 2, craterSeed: 7,
    },
    marte: {
      colors: {
        0: '#2a1020', // cielo cálido, granate oscuro
        1: '#fff1dc', // estrella brillante
        2: '#b48a8a', // estrella tenue
        3: '#e0874a', // superficie, borde claro
        4: '#b0502c', // superficie rojiza
        5: '#82341d', // cráter
        6: '#4e1d12', // sombra de cráter / soporte de plataforma
        7: '#4fd8e8', // plataforma (cian, contrasta con el rojo)
        8: '#f2f2f2', // marcas de la plataforma
      },
      stars: 45, starSeed: 20261002,
      craters: 35, maxCrater: 2, craterSeed: 11,
    },
    asteroide: {
      colors: {
        0: '#05060f', // fondo espacial profundo
        1: '#ffffff', // estrella brillante
        2: '#7c84b0', // estrella tenue
        3: '#5c5c66', // roca, borde claro
        4: '#3a3a42', // roca gris oscuro
        5: '#26262c', // hueco
        6: '#151518', // sombra / soporte de plataforma
        7: '#f2c230', // plataforma
        8: '#c0392b', // marcas de la plataforma
      },
      stars: 150, starSeed: 20261003,
      craters: 90, maxCrater: 3, craterSeed: 13,
    },
    gigante: {
      colors: {
        0: '#140b24', // cielo violeta oscuro
        1: '#fff6e0', // estrella brillante
        2: '#9a86c0', // estrella tenue
        3: '#c9a46a', // superficie, borde claro ocre
        4: '#94703e', // superficie parda, pesada
        5: '#6b4c26', // cráter
        6: '#3d2a14', // sombra de cráter / soporte de plataforma
        7: '#4fd8e8', // plataforma (cian, contrasta con el pardo)
        8: '#f2f2f2', // marcas de la plataforma
      },
      stars: 60, starSeed: 20261004,
      craters: 30, maxCrater: 3, craterSeed: 17,
    },
    tormenta: {
      colors: {
        0: '#1a2230', // cielo gris azulado de tormenta
        1: '#dfe8f5', // estrella brillante (pocas, entre nubes)
        2: '#5d6f88', // estrella tenue
        3: '#7f8fa3', // superficie, borde claro
        4: '#566477', // superficie pizarra
        5: '#3c4757', // cráter
        6: '#232a35', // sombra de cráter / soporte de plataforma
        7: '#f2c230', // plataforma (amarilla, contrasta con el azul)
        8: '#c0392b', // marcas de la plataforma
      },
      stars: 20, starSeed: 20261005,
      craters: 35, maxCrater: 2, craterSeed: 19,
    },
    aproximacion: {
      colors: {
        0: '#03040a', // espacio profundo
        1: '#ffffff', // estrella brillante
        2: '#6e78a8', // estrella tenue
        3: '#b8c0cc', // cubierta metálica, borde claro
        4: '#7d8794', // cubierta metálica
        5: '#5a636e', // remaches y paneles
        6: '#2e343c', // sombra / soporte de plataforma
        7: '#4fd8e8', // plataforma (cian)
        8: '#ff9f1c', // marcas de la plataforma (naranja)
      },
      stars: 110, starSeed: 20261006,
      craters: 60, maxCrater: 1, craterSeed: 23,
    },
    entrega: {
      colors: {
        0: '#0a1424', // cielo azul marino
        1: '#ffffff', // estrella brillante
        2: '#7f9cc0', // estrella tenue
        3: '#9fb3a8', // superficie, borde claro (verde salvia)
        4: '#6f8577', // superficie
        5: '#4e6155', // cráter
        6: '#2c3830', // sombra de cráter / soporte de plataforma
        7: '#f2c230', // plataforma (amarilla)
        8: '#c0392b', // marcas de la plataforma
      },
      stars: 80, starSeed: 20261007,
      craters: 40, maxCrater: 2, craterSeed: 29,
    },
    carga: {
      colors: {
        0: '#1b1110', // cielo de mina, casi negro rojizo
        1: '#ffe9d6', // estrella brillante
        2: '#9a7b70', // estrella tenue
        3: '#a0603c', // superficie, borde claro (óxido)
        4: '#6e3b22', // superficie de hierro
        5: '#4a2414', // cráter
        6: '#2a140b', // sombra de cráter / soporte de plataforma
        7: '#4fd8e8', // plataforma (cian, contrasta con el óxido)
        8: '#f2f2f2', // marcas de la plataforma
      },
      stars: 40, starSeed: 20261008,
      craters: 50, maxCrater: 3, craterSeed: 31,
    },
    capsulas: {
      colors: {
        0: '#120a26', // cielo de nebulosa violeta
        1: '#ffffff', // estrella brillante
        2: '#b48ae0', // estrella tenue lila
        3: '#6fb7a8', // superficie, borde claro (verde agua)
        4: '#3f7f73', // superficie
        5: '#2a5a51', // cráter
        6: '#173530', // sombra de cráter / soporte de plataforma
        7: '#ff9f1c', // plataforma (naranja)
        8: '#f2f2f2', // marcas de la plataforma
      },
      stars: 130, starSeed: 20261009,
      craters: 35, maxCrater: 2, craterSeed: 37,
    },
    final: {
      colors: {
        0: '#200818', // cielo de atardecer carmesí
        1: '#fff3c4', // estrella brillante
        2: '#c07aa0', // estrella tenue
        3: '#d9c7a0', // superficie, borde claro (arena)
        4: '#a3906a', // superficie
        5: '#76654a', // cráter
        6: '#43392a', // sombra de cráter / soporte de plataforma
        7: '#4fd8e8', // plataforma (cian)
        8: '#ff4d6d', // marcas de la plataforma (rosa)
      },
      stars: 90, starSeed: 20261010,
      craters: 45, maxCrater: 2, craterSeed: 41,
    },
  };

  // Partes fijas de la plataforma (en px): marcas en cada extremo y grosor de cada franja.
  const PLATFORM_MARK = 4;
  const PLATFORM_BAND = 2;
  // Las estrellas se quedan este margen arriba del suelo.
  const STAR_MARGIN = 4;

  const KEYS = {
    SHIP: 'ship',
    FLAME_A: 'flame_a',
    FLAME_B: 'flame_b',
  };

  // Nave de carga 12×12, punta hacia arriba (centro = posición de la física).
  const SHIP = [
    '.....EE.....',
    '....E99E....',
    '....E9BE....',
    '...E99BBE...',
    '...E9999E...',
    '..EFFFFFFE..',
    '..EF9FF9FE..',
    '..EFFFFFFE..',
    '..E9AAAA9E..',
    '.EA9AAAA9AE.',
    'EA..EAAE..AE',
    'E...EEEE...E',
  ];

  // Llama 4×4, dos cuadros para parpadeo; va justo debajo de la tobera.
  const FLAME_A = [
    'CDDC',
    'CDDC',
    '.CC.',
    '.CC.',
  ];
  const FLAME_B = [
    'CDDC',
    '.DD.',
    '.CC.',
    '....',
  ];

  // Paquete (v4) 8×7 y cápsulas 8×8 (miden lo mismo que su caja de contacto, 2·CAPSULE_HALF en mission.js).
  // Solo usan los colores fijos 9–F, así se ven igual en todos los mundos.
  // Cápsula azul = combustible; amarilla = puntos; mitad y mitad = ambos.
  const SPRITES = {
    PACKAGE: [
      'EEEEEEEE',
      'EF9FF9FE',
      'EFFFFFFE',
      'E999999E',
      'EFFFFFFE',
      'EF9FF9FE',
      'EEEEEEEE',
    ],
    CAPSULE_FUEL: [
      '..EEEE..',
      '.EBBBBE.',
      'EBB99BBE',
      'EB9999BE',
      'EB9999BE',
      'EBB99BBE',
      '.EBBBBE.',
      '..EEEE..',
    ],
    CAPSULE_POINTS: [
      '..EEEE..',
      '.EDDDDE.',
      'EDDCCDDE',
      'EDCCCCDE',
      'EDCCCCDE',
      'EDDCCDDE',
      '.EDDDDE.',
      '..EEEE..',
    ],
    CAPSULE_BOTH: [
      '..EEEE..',
      '.EBBBBE.',
      'EBB99BBE',
      'EB9999BE',
      'EDCCCCDE',
      'EDDCCDDE',
      '.EDDDDE.',
      '..EEEE..',
    ],
  };

  // Generador con semilla fija: mismas estrellas y cráteres en cada carga.
  function seeded(seed) {
    let s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function grid(width, height, fill) {
    const rows = [];
    for (let y = 0; y < height; y++) rows.push(new Array(width).fill(fill));
    return rows;
  }

  function toStrings(rows) {
    return rows.map(function (r) { return r.join(''); });
  }

  // Plataforma de (x2 − x1) px de ancho: franja de color con marcas en los extremos, y debajo el soporte.
  // pickup = plataforma de recogida A (v4): mismos colores con las marcas invertidas, para distinguirla de B.
  function buildPlatform(width, pickup) {
    const mark = pickup ? '7' : '8';
    const body = pickup ? '8' : '7';
    const top = mark.repeat(PLATFORM_MARK) + body.repeat(width - 2 * PLATFORM_MARK) + mark.repeat(PLATFORM_MARK);
    const rows = [];
    for (let i = 0; i < PLATFORM_BAND; i++) rows.push(top);
    for (let i = 0; i < PLATFORM_BAND; i++) rows.push('6'.repeat(width));
    return rows;
  }

  // Fondo WIDTH × HEIGHT con estrellas fijas sobre el horizonte.
  function buildBackground(theme) {
    const rows = grid(CONFIG.WIDTH, CONFIG.HEIGHT, '0');
    const rnd = seeded(theme.starSeed);
    for (let i = 0; i < theme.stars; i++) {
      const x = Math.floor(rnd() * CONFIG.WIDTH);
      const y = Math.floor(rnd() * (CONFIG.GROUND_Y - STAR_MARGIN));
      rows[y][x] = rnd() < 0.3 ? '1' : '2';
    }
    return toStrings(rows);
  }

  // Suelo WIDTH × (HEIGHT − GROUND_Y): borde claro arriba y cráteres de 1 a maxCrater px con su sombra.
  function buildGround(theme) {
    const height = CONFIG.HEIGHT - CONFIG.GROUND_Y;
    const rows = grid(CONFIG.WIDTH, height, '4');
    rows[0].fill('3');
    const rnd = seeded(theme.craterSeed);
    for (let i = 0; i < theme.craters; i++) {
      const x = 1 + Math.floor(rnd() * (CONFIG.WIDTH - 1 - theme.maxCrater));
      const y = 3 + Math.floor(rnd() * (height - 3 - theme.maxCrater));
      const size = 1 + Math.floor(rnd() * theme.maxCrater);
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) rows[y + dy][x + dx] = '5';
      }
      rows[y + size][x] = '6';
    }
    return toStrings(rows);
  }

  function generate(textures, key, data, palette) {
    if (!textures.exists(key)) textures.generate(key, { data: data, palette: palette, pixelWidth: 1 });
  }

  // Sprite de cada cápsula según lo que da: combustible, puntos o ambos.
  function capsuleSprite(c) {
    if (c.fuel > 0 && c.points > 0) return 'CAPSULE_BOTH';
    return c.fuel > 0 ? 'CAPSULE_FUEL' : 'CAPSULE_POINTS';
  }

  // Genera las texturas del nivel (llaves por tema; la plataforma también por ancho) y las de la nave.
  // Regresa { background, ground, platform } con las llaves que debe usar la escena; en misiones agrega
  // pickup y package, y si hay cápsulas, capsules = [llave de cada una].
  function generateLevel(textures, level) {
    const theme = THEMES[level.theme];
    const palette = Object.assign({}, theme.colors, SHIP_COLORS);
    const width = level.platform.x2 - level.platform.x1;
    const keys = {
      background: 'background_' + level.theme,
      ground: 'ground_' + level.theme,
      platform: 'platform_' + level.theme + '_' + width,
    };
    generate(textures, keys.background, buildBackground(theme), palette);
    generate(textures, keys.ground, buildGround(theme), palette);
    generate(textures, keys.platform, buildPlatform(width), palette);
    generate(textures, KEYS.SHIP, SHIP, palette);
    generate(textures, KEYS.FLAME_A, FLAME_A, palette);
    generate(textures, KEYS.FLAME_B, FLAME_B, palette);
    if (level.pickup) {
      const pickupWidth = level.pickup.x2 - level.pickup.x1;
      keys.pickup = 'pickup_' + level.theme + '_' + pickupWidth;
      keys.package = 'package';
      generate(textures, keys.pickup, buildPlatform(pickupWidth, true), palette);
      generate(textures, keys.package, SPRITES.PACKAGE, palette);
    }
    if (level.capsules) {
      keys.capsules = level.capsules.map(function (c) {
        const name = capsuleSprite(c);
        const key = name.toLowerCase();
        generate(textures, key, SPRITES[name], palette);
        return key;
      });
    }
    return keys;
  }

  root.MoonSprites = { THEMES, SHIP_COLORS, SPRITES, KEYS, generateLevel };
})(typeof globalThis !== 'undefined' ? globalThis : this);
