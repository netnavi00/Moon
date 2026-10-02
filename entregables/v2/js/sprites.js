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
  function buildPlatform(width) {
    const top = '8'.repeat(PLATFORM_MARK) + '7'.repeat(width - 2 * PLATFORM_MARK) + '8'.repeat(PLATFORM_MARK);
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

  // Genera las texturas del nivel (llaves por tema; la plataforma también por ancho) y las de la nave.
  // Regresa { background, ground, platform } con las llaves que debe usar la escena.
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
    return keys;
  }

  root.MoonSprites = { THEMES, SHIP_COLORS, KEYS, generateLevel };
})(typeof globalThis !== 'undefined' ? globalThis : this);
