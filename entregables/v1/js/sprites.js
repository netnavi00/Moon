// Pixel art de Mensajero Orbital, definido en código (sin archivos de imagen).
// Cada sprite es una matriz de caracteres; cada carácter es un índice de PALETTE ('.' = transparente).
// Las texturas se crean con textures.generate de Phaser 3.80 (canvas, síncrono, no carga archivos).
// Uso desde una escena: MoonSprites.generateAll(this.textures);
(function (root) {
  'use strict';

  // 16 colores como máximo.
  const PALETTE = {
    0: '#0b0e1f', // fondo espacial
    1: '#ffffff', // estrella brillante
    2: '#8a90b8', // estrella tenue
    3: '#a8a8a8', // superficie lunar, borde claro
    4: '#7a7a7a', // superficie lunar
    5: '#555555', // cráter
    6: '#363636', // sombra de cráter / soporte de plataforma
    7: '#f2c230', // plataforma
    8: '#c0392b', // marcas de la plataforma
    9: '#d8dde6', // casco claro
    A: '#8c95a6', // casco sombra
    B: '#3fa7d6', // ventanilla
    C: '#e8702a', // llama exterior
    D: '#ffe066', // llama núcleo
    E: '#2b2f3a', // contorno de la nave
    F: '#b5651d', // franja de carga
  };

  const KEYS = {
    BACKGROUND: 'background',
    GROUND: 'ground',
    PLATFORM: 'platform',
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
    'EA..E55E..AE',
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

  // Plataforma 80×4 (x 120–200, y 160–163), con marcas rojas en los extremos.
  const PLATFORM = [
    '8888' + '7'.repeat(72) + '8888',
    '8888' + '7'.repeat(72) + '8888',
    '6'.repeat(80),
    '6'.repeat(80),
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

  // Fondo 320×180: negro azulado con estrellas fijas sobre el horizonte (y < 160).
  function buildBackground() {
    const rows = grid(320, 180, '0');
    const rnd = seeded(20261001);
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(rnd() * 320);
      const y = Math.floor(rnd() * 156);
      rows[y][x] = rnd() < 0.3 ? '1' : '2';
    }
    return toStrings(rows);
  }

  // Suelo 320×20 (y 160–180): borde claro arriba y cráteres de 1–2 px.
  function buildGround() {
    const rows = grid(320, 20, '4');
    rows[0].fill('3');
    const rnd = seeded(7);
    for (let i = 0; i < 40; i++) {
      const x = 1 + Math.floor(rnd() * 317);
      const y = 3 + Math.floor(rnd() * 15);
      const size = rnd() < 0.5 ? 1 : 2;
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) rows[y + dy][x + dx] = '5';
      }
      rows[y + size][x] = '6';
    }
    return toStrings(rows);
  }

  function generateAll(textures) {
    const defs = [
      [KEYS.BACKGROUND, buildBackground()],
      [KEYS.GROUND, buildGround()],
      [KEYS.PLATFORM, PLATFORM],
      [KEYS.SHIP, SHIP],
      [KEYS.FLAME_A, FLAME_A],
      [KEYS.FLAME_B, FLAME_B],
    ];
    for (const [key, data] of defs) {
      if (!textures.exists(key)) textures.generate(key, { data: data, palette: PALETTE, pixelWidth: 1 });
    }
  }

  root.MoonSprites = { PALETTE, KEYS, generateAll };
})(typeof globalThis !== 'undefined' ? globalThis : this);
