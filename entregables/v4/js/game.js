// Escenas de Mensajero Orbital: vuelo (física de paso fijo, entrada, HUD) y pantalla final.
// Depende de los globales Phaser, MoonPhysics, MoonLevels, MoonMission, MoonScore, MoonSave y MoonSprites (cargados antes en index.html).
// Campaña: aterrizar avanza de nivel, chocar repite (regla en MoonLevels.nextLevel).
// Puntaje al aterrizar (MoonScore) y guardado del avance y los mejores puntajes (MoonSave).
// v4: cada paso avanza la misión (MoonMission.missionStep), que envuelve a step: paquete, estacionamiento y cápsulas.
// El HUD y los textos finales son elementos HTML encima del canvas (#hud, #end) para que se lean nítidos.
(function () {
  'use strict';

  const { CONFIG, platformAt, windAt } = MoonPhysics;
  const { LEVELS, nextLevel } = MoonLevels;
  const { createMission, missionStep } = MoonMission;
  const { scoreRun, campaignTotal } = MoonScore;
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
    no_fuel: 'Te quedaste sin combustible',
  };

  // El almacenamiento del navegador puede no existir o lanzar al pedirlo (bloqueado o modo privado):
  // en ese caso storage = null y se juega igual, sin guardar.
  function getStorage() {
    try {
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }

  // Arranque: sin parámetros, en el nivel guardado; ?nuevo borra lo guardado;
  // ?nivel=N es ayuda de prueba (arranca en N, en 1 si no es válido) y no escribe nada (persist = false).
  const storage = getStorage();
  let save = MoonSave.loadSave(storage, LEVELS);
  const start = MoonSave.resolveStart(window.location.search, save, LEVELS);
  if (start.reset) {
    MoonSave.clearSave(storage);
    save = MoonSave.emptySave();
  }
  const START_LEVEL = start.level;

  // Anota el aterrizaje en el guardado (en memoria siempre; en el navegador solo si persist).
  // Regresa el mejor puntaje que tenía el nivel antes, o undefined si no tenía.
  function recordScore(n, score) {
    const prevBest = save.best[LEVELS[n - 1].id];
    save = MoonSave.recordLanding(save, n, LEVELS, score);
    if (start.persist) MoonSave.writeSave(storage, save);
    return prevBest;
  }

  const stageEl = document.getElementById('stage');
  const hud = {
    level: document.getElementById('level-val'),
    total: document.getElementById('total-val'),
    windRow: document.getElementById('wind-row'),
    wind: document.getElementById('wind-val'),
    packageRow: document.getElementById('package-row'),
    packageVal: document.getElementById('package-val'),
    capsuleRow: document.getElementById('capsule-row'),
    capsuleVal: document.getElementById('capsule-val'),
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
  const endScoreEl = document.getElementById('end-score');
  const endBestEl = document.getElementById('end-best');
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
  // result = { score, prevBest } si aterrizó; null si chocó (chocar no da ni quita puntos).
  function showEnd(status, crashReason, next, result) {
    const landed = status === 'landed';
    endEl.className = 'overlay-text ' + (landed ? 'landed' : 'crashed');
    if (!landed) {
      endTitleEl.textContent = '¡Choque!';
      endReasonEl.textContent = CRASH_MESSAGES[crashReason] || '';
      endHintEl.textContent = 'R o Espacio para reintentar';
    } else if (next === null) {
      endTitleEl.textContent = '¡Misión completa!';
      endReasonEl.textContent = 'Total de campaña: ' + campaignTotal(save.best, LEVELS);
      endHintEl.textContent = 'R o Espacio para volver a la ' + LEVELS[0].name;
    } else {
      endTitleEl.textContent = '¡Aterrizaje exitoso!';
      endReasonEl.textContent = 'Siguiente: ' + LEVELS[next - 1].name;
      endHintEl.textContent = 'R o Espacio para continuar';
    }
    if (result) {
      const sc = result.score;
      const record = result.prevBest === undefined || sc.total > result.prevBest;
      // En misiones, la entrega va primero; las cápsulas solo si el nivel tiene.
      const parts = [];
      if (sc.delivery !== undefined) parts.push('Entrega ' + sc.delivery);
      parts.push('Precisión ' + sc.precision, 'Combustible ' + sc.fuel, 'Tiempo ' + sc.time);
      if (result.hasCapsules) parts.push('Cápsulas ' + sc.capsules);
      endScoreEl.textContent = parts.join(' · ');
      endBestEl.textContent = 'Puntaje ' + sc.total + ' · ' + (record ? '¡Nuevo récord!' : 'Mejor: ' + result.prevBest);
    } else {
      endScoreEl.textContent = '';
      endBestEl.textContent = '';
    }
    endReasonEl.hidden = endReasonEl.textContent === '';
    endScoreEl.hidden = endScoreEl.textContent === '';
    endBestEl.hidden = endBestEl.textContent === '';
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

  // Total de campaña en el HUD: suma de los mejores puntajes por nivel.
  function updateTotal() {
    hud.total.textContent = campaignTotal(save.best, LEVELS);
  }

  // Datos fijos del nivel en el HUD: "NIVEL N/total · NOMBRE", el total y si hay fila de viento
  // (solo si el nivel tiene viento o ráfagas; lo decide el dato, no el nombre del nivel).
  function setupHud(n, level) {
    hud.level.textContent = 'Nivel ' + n + '/' + LEVELS.length + ' · ' + level.name;
    hud.windRow.hidden = level.wind === 0 && !level.gusts;
    hud.packageRow.hidden = !level.pickup;
    hud.capsuleRow.hidden = !(level.capsules && level.capsules.length > 0);
    updateTotal();
  }

  // Paquete (solo en misiones) y cápsulas tomadas k/total (solo si el nivel tiene).
  function showMission(m, level) {
    if (level.pickup) {
      hud.packageVal.textContent = m.delivered ? 'Entregado' : m.cargo ? 'A bordo' : 'Por recoger';
      hud.packageRow.classList.toggle('ok', m.cargo);
    }
    if (level.capsules && level.capsules.length > 0) {
      hud.capsuleVal.textContent = m.taken.filter(Boolean).length + '/' + level.capsules.length;
    }
  }

  // wind = viento del paso que sigue (con ráfagas cambia con el tiempo).
  function showWind(wind) {
    hud.wind.textContent = wind === 0 ? '0' : (wind < 0 ? '← ' : '→ ') + Math.abs(wind);
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

      // Cada intento empieza de cero: paquete en A, combustible lleno y cápsulas en su lugar.
      this.mission = createMission(this.level);
      this.acc = 0;
      this.ended = false;

      this.add.image(0, 0, keys.background).setOrigin(0, 0);
      this.add.image(0, CONFIG.GROUND_Y, keys.ground).setOrigin(0, 0);
      this.platform = this.add.image(platformAt(this.level, 0).x1, CONFIG.GROUND_Y, keys.platform).setOrigin(0, 0);

      // Misión: plataforma A con el paquete encima (se oculta al recogerlo).
      this.packageImage = null;
      if (this.level.pickup) {
        const a = this.level.pickup;
        this.add.image(a.x1, CONFIG.GROUND_Y, keys.pickup).setOrigin(0, 0);
        this.packageImage = this.add.image((a.x1 + a.x2) / 2, CONFIG.GROUND_Y, keys.package).setOrigin(0.5, 1);
      }
      // Cápsulas centradas en su posición (se ocultan al tomarlas).
      this.capsuleImages = (this.level.capsules || []).map((c, i) => this.add.image(c.x, c.y, keys.capsules[i]));

      // La llama cuelga de la tobera (borde inferior de la nave) y gira con ella.
      this.flame = this.add.image(0, CONFIG.SHIP_HALF + 2, KEYS.FLAME_A).setVisible(false);
      this.shipImage = this.add.image(0, 0, KEYS.SHIP);
      this.ship = this.add.container(this.mission.ship.x, this.mission.ship.y, [this.flame, this.shipImage]);

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
        // La misión lleva la cuenta de pasos (n), que usan la plataforma móvil y las ráfagas.
        this.mission = missionStep(this.mission, input, this.level);
        this.acc -= CONFIG.DT;
        steps++;
        if (this.mission.status !== 'flying') break;
      }
      if (steps === MAX_STEPS_PER_FRAME) this.acc = 0;

      // Estacionada sin ↑ no hay llama; con ↑ despega y sí.
      const m = this.mission;
      const thrusting = input.thrust && m.ship.fuel > 0 && m.status === 'flying';
      this.render(thrusting);

      if (m.status !== 'flying') this.finish();
    }

    render(thrusting) {
      const m = this.mission;
      const s = m.ship;
      const platform = platformAt(this.level, m.n);
      this.platform.setX(platform.x1);
      this.ship.setPosition(s.x, s.y);
      this.ship.setAngle(s.angle);
      this.flame.setVisible(thrusting);
      this.flame.setTexture(Math.floor(m.n / 4) % 2 === 0 ? KEYS.FLAME_A : KEYS.FLAME_B);
      if (this.packageImage) this.packageImage.setVisible(!m.cargo);
      this.capsuleImages.forEach((img, i) => img.setVisible(!m.taken[i]));

      updateHud(s, this.level.fuel, platform.vx);
      showWind(windAt(this.level, m.n));
      showMission(m, this.level);
    }

    // Al ganar: puntaje con la plataforma del paso final y los pasos del intento (scoreRun).
    finish() {
      const m = this.mission;
      this.ended = true;
      this.flame.setVisible(false);
      if (m.status === 'crashed') this.shipImage.setTint(0xff5555);
      let result = null;
      if (m.status === 'landed') {
        const score = scoreRun(m, this.level, platformAt(this.level, m.n));
        result = {
          score: score,
          prevBest: recordScore(this.levelNumber, score),
          hasCapsules: !!(this.level.capsules && this.level.capsules.length > 0),
        };
        updateTotal();
      }
      this.scene.launch('EndScene', {
        status: m.status,
        crashReason: m.reason,
        level: this.levelNumber,
        result: result,
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
      showEnd(data.status, data.crashReason, next, data.result);

      // Reinicia la escena de vuelo (que vuelve a llamar a createMission: el nivel completo) sin recargar la página.
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
