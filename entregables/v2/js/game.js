// Escenas de Mensajero Orbital: vuelo (física de paso fijo, entrada, HUD) y pantalla final.
// Depende de los globales Phaser, MoonPhysics, MoonLevels y MoonSprites (cargados antes en index.html).
// Campaña: aterrizar avanza de nivel, chocar repite (regla en MoonLevels.nextLevel).
// El HUD y los textos finales son elementos HTML encima del canvas (#hud, #end) para que se lean nítidos.
(function () {
  'use strict';

  const { CONFIG, createState, step, platformAt } = MoonPhysics;
  const { LEVELS, nextLevel } = MoonLevels;
  const KEYS = MoonSprites.KEYS;

  const MAX_STEPS_PER_FRAME = 5;
  const MAX_FRAME_DELTA_MS = 250;
  // Niveles de la barra de combustible, como fracción del combustible inicial del nivel.
  const FUEL_MID = 0.5;
  const FUEL_LOW = 0.25;

  const CRASH_MESSAGES = {
    speed_v: 'Bajaste demasiado rápido',
    speed_h: 'Ibas muy de lado',
    angle: 'La nave estaba muy inclinada',
    off_platform: 'Fuera de la plataforma',
    out_of_bounds: 'Te saliste de la pantalla',
  };

  // Ayuda de prueba: ?nivel=N arranca en ese nivel; si N no es válido, en el 1.
  function startLevelFromUrl() {
    const n = Number(new URLSearchParams(window.location.search).get('nivel'));
    return Number.isInteger(n) && n >= 1 && n <= LEVELS.length ? n : 1;
  }
  const START_LEVEL = startLevelFromUrl();

  const stageEl = document.getElementById('stage');
  const hud = {
    level: document.getElementById('level-val'),
    windRow: document.getElementById('wind-row'),
    wind: document.getElementById('wind-val'),
    fuelRow: document.getElementById('fuel-row'),
    fuelFill: document.getElementById('fuel-fill'),
    fuelVal: document.getElementById('fuel-val'),
    vy: document.getElementById('vy-val'),
    vx: document.getElementById('vx-val'),
    angleRow: document.getElementById('angle-row'),
    angleIcon: document.getElementById('angle-icon'),
    angleVal: document.getElementById('angle-val'),
  };
  const endEl = document.getElementById('end');
  const endTitleEl = document.getElementById('end-title');
  const endReasonEl = document.getElementById('end-reason');
  const endHintEl = document.getElementById('end-hint');

  // Escala entera en píxeles físicos cuando cabe (píxeles parejos aun con escala de Windows
  // al 125 % o 150 %); si la ventana es más chica que 320×180, se ajusta sin ser entera.
  function computeZoom() {
    const dpr = window.devicePixelRatio || 1;
    const fit = Math.min(window.innerWidth / CONFIG.WIDTH, window.innerHeight / CONFIG.HEIGHT);
    const devicePixels = Math.floor(fit * dpr);
    return devicePixels >= 1 ? devicePixels / dpr : fit;
  }

  function sizeStage(zoom) {
    stageEl.style.width = CONFIG.WIDTH * zoom + 'px';
    stageEl.style.height = CONFIG.HEIGHT * zoom + 'px';
  }

  // next = lo que regresó nextLevel: el mismo nivel (choque), el siguiente o null (misión completa).
  function showEnd(status, crashReason, next) {
    const landed = status === 'landed';
    endEl.className = 'overlay-text ' + (landed ? 'landed' : 'crashed');
    if (!landed) {
      endTitleEl.textContent = '¡Choque!';
      endReasonEl.textContent = CRASH_MESSAGES[crashReason] || '';
      endHintEl.textContent = 'R o Espacio para reintentar';
    } else if (next === null) {
      endTitleEl.textContent = '¡Misión completa!';
      endReasonEl.textContent = '';
      endHintEl.textContent = 'R o Espacio para volver a la ' + LEVELS[0].name;
    } else {
      endTitleEl.textContent = '¡Aterrizaje exitoso!';
      endReasonEl.textContent = 'Siguiente: ' + LEVELS[next - 1].name;
      endHintEl.textContent = 'R o Espacio para continuar';
    }
    endReasonEl.hidden = endReasonEl.textContent === '';
    endEl.hidden = false;
  }

  function hideEnd() {
    endEl.hidden = true;
  }

  // Verde dentro del límite de aterrizaje, rojo fuera; los límites salen de CONFIG.
  function setLimitColor(el, value, max) {
    const ok = Math.abs(value) <= max;
    el.classList.toggle('ok', ok);
    el.classList.toggle('bad', !ok);
  }

  // Datos fijos del nivel en el HUD: "NIVEL N/3 · NOMBRE" y el viento, solo si el nivel tiene.
  function setupHud(n, level) {
    hud.level.textContent = 'Nivel ' + n + '/' + LEVELS.length + ' · ' + level.name;
    hud.windRow.hidden = level.wind === 0;
    hud.wind.textContent = (level.wind < 0 ? '← ' : '→ ') + Math.abs(level.wind);
  }

  // platformVx: la velocidad horizontal se muestra y colorea relativa a la plataforma.
  function updateHud(s, fuelStart, platformVx) {
    const fuelFraction = s.fuel / fuelStart;
    hud.fuelFill.style.width = (fuelFraction * 100).toFixed(1) + '%';
    hud.fuelVal.textContent = s.fuel.toFixed(0);
    hud.fuelRow.classList.toggle('fuel-high', fuelFraction > FUEL_MID);
    hud.fuelRow.classList.toggle('fuel-mid', fuelFraction <= FUEL_MID && fuelFraction > FUEL_LOW);
    hud.fuelRow.classList.toggle('fuel-low', fuelFraction <= FUEL_LOW);

    hud.vy.textContent = s.vy.toFixed(1);
    const vxRel = s.vx - platformVx;
    hud.vx.textContent = vxRel.toFixed(1);
    setLimitColor(hud.vy, s.vy, CONFIG.MAX_LAND_VY);
    setLimitColor(hud.vx, vxRel, CONFIG.MAX_LAND_VX);

    hud.angleVal.textContent = s.angle.toFixed(0) + '°';
    hud.angleIcon.style.transform = 'rotate(' + s.angle + 'deg)';
    setLimitColor(hud.angleRow, s.angle, CONFIG.MAX_LAND_ANGLE);
  }

  class FlightScene extends Phaser.Scene {
    constructor() {
      super('FlightScene');
    }

    // data.level: número de nivel (1 a LEVELS.length); sin él, el de la URL.
    create(data) {
      this.levelNumber = data && data.level ? data.level : START_LEVEL;
      this.level = LEVELS[this.levelNumber - 1];
      const keys = MoonSprites.generateLevel(this.textures, this.level);
      hideEnd();
      setupHud(this.levelNumber, this.level);

      this.state = createState(this.level);
      this.acc = 0;
      this.stepCount = 0;
      this.ended = false;

      this.add.image(0, 0, keys.background).setOrigin(0, 0);
      this.add.image(0, CONFIG.GROUND_Y, keys.ground).setOrigin(0, 0);
      this.platform = this.add.image(platformAt(this.level, 0).x1, CONFIG.GROUND_Y, keys.platform).setOrigin(0, 0);

      // La llama cuelga de la tobera (borde inferior de la nave) y gira con ella.
      this.flame = this.add.image(0, CONFIG.SHIP_HALF + 2, KEYS.FLAME_A).setVisible(false);
      this.shipImage = this.add.image(0, 0, KEYS.SHIP);
      this.ship = this.add.container(this.state.x, this.state.y, [this.flame, this.shipImage]);

      this.cursors = this.input.keyboard.createCursorKeys();
      // Espacio sirve para reintentar; se captura para que nunca haga scroll en la página.
      this.input.keyboard.addCapture('SPACE');
      this.render(false);
    }

    readInput() {
      return {
        thrust: this.cursors.up.isDown,
        left: this.cursors.left.isDown,
        right: this.cursors.right.isDown,
      };
    }

    update(time, delta) {
      if (this.ended) return;

      // Paso fijo: el delta real solo alimenta el acumulador, nunca a la física.
      const input = this.readInput();
      this.acc += Math.min(delta, MAX_FRAME_DELTA_MS) / 1000;
      let steps = 0;
      while (this.acc >= CONFIG.DT && steps < MAX_STEPS_PER_FRAME) {
        // stepCount = pasos dados antes de este; la física lo usa para la plataforma móvil.
        this.state = step(this.state, input, this.level, this.stepCount);
        this.stepCount++;
        this.acc -= CONFIG.DT;
        steps++;
        if (this.state.status !== 'flying') break;
      }
      if (steps === MAX_STEPS_PER_FRAME) this.acc = 0;

      const thrusting = input.thrust && this.state.fuel > 0 && this.state.status === 'flying';
      this.render(thrusting);

      if (this.state.status !== 'flying') this.finish();
    }

    render(thrusting) {
      const s = this.state;
      const platform = platformAt(this.level, this.stepCount);
      this.platform.setX(platform.x1);
      this.ship.setPosition(s.x, s.y);
      this.ship.setAngle(s.angle);
      this.flame.setVisible(thrusting);
      this.flame.setTexture(Math.floor(this.stepCount / 4) % 2 === 0 ? KEYS.FLAME_A : KEYS.FLAME_B);

      updateHud(s, this.level.fuel, platform.vx);
    }

    finish() {
      this.ended = true;
      this.flame.setVisible(false);
      if (this.state.status === 'crashed') this.shipImage.setTint(0xff5555);
      this.scene.launch('EndScene', {
        status: this.state.status,
        crashReason: this.state.crashReason,
        level: this.levelNumber,
      });
    }
  }

  // Muestra el panel final (HTML) y espera R o Espacio para continuar, reintentar o volver a empezar.
  class EndScene extends Phaser.Scene {
    constructor() {
      super('EndScene');
    }

    create(data) {
      const next = nextLevel(data.level, data.status);
      showEnd(data.status, data.crashReason, next);

      // Reinicia la escena de vuelo (que vuelve a llamar a createState) sin recargar la página.
      // Tras la misión completa (next === null) vuelve al nivel 1.
      let restarting = false;
      const restart = () => {
        if (restarting) return;
        restarting = true;
        hideEnd();
        this.scene.stop();
        this.scene.get('FlightScene').scene.restart({ level: next === null ? 1 : next });
      };
      this.input.keyboard.once('keydown-R', restart);
      this.input.keyboard.once('keydown-SPACE', restart);
    }
  }

  const zoom = computeZoom();
  sizeStage(zoom);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'stage',
    width: CONFIG.WIDTH,
    height: CONFIG.HEIGHT,
    backgroundColor: '#0b0e1f',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.NONE,
      zoom: zoom,
    },
    // Solo se usa teclado. Sin esto, Phaser registra listeners de mouse/touch en window.top,
    // y con file:// Chrome lo marca como "Unsafe attempt to load URL".
    input: {
      windowEvents: false,
    },
    scene: [FlightScene, EndScene],
  });

  window.addEventListener('resize', function () {
    const z = computeZoom();
    sizeStage(z);
    game.scale.setZoom(z);
  });
})();
