// Guardado de Mensajero Orbital: nivel más alto desbloqueado y mejor puntaje por nivel.
// Script clásico: en el navegador queda como MoonSave global; en Node se carga con require.
// No toca el almacenamiento global: quien llama pasa `storage` (o null). Todo acceso va en try/catch,
// así que si el navegador bloquea el almacenamiento el juego sigue igual, solo que sin guardar.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MoonSave = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'mensajero-orbital';

  // unlocked = número del nivel más alto desbloqueado (desde 1); best = { [id del nivel]: puntaje }.
  function emptySave() {
    return { unlocked: 1, best: {} };
  }

  // Valida lo leído: cualquier cosa rara se descarta en lugar de romper el juego.
  function parseSave(text, levels) {
    let raw;
    try {
      raw = JSON.parse(text);
    } catch (e) {
      return emptySave();
    }
    if (!raw || typeof raw !== 'object') return emptySave();

    const save = emptySave();
    if (Number.isInteger(raw.unlocked) && raw.unlocked >= 1) save.unlocked = Math.min(raw.unlocked, levels.length);
    if (raw.best && typeof raw.best === 'object') {
      for (const level of levels) {
        const v = raw.best[level.id];
        if (Number.isInteger(v) && v >= 0) save.best[level.id] = v;
      }
    }
    return save;
  }

  // Guardado nuevo tras aterrizar en el nivel n (no modifica el recibido).
  function recordLanding(save, n, levels, score) {
    const id = levels[n - 1].id;
    const best = Object.assign({}, save.best);
    best[id] = Math.max(best[id] || 0, score.total);
    return { unlocked: Math.max(save.unlocked, Math.min(n + 1, levels.length)), best: best };
  }

  function loadSave(storage, levels) {
    try {
      return parseSave(storage.getItem(STORAGE_KEY), levels);
    } catch (e) {
      return emptySave();
    }
  }

  function writeSave(storage, save) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(save));
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearSave(storage) {
    try {
      storage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  // search = la parte "?…" de la URL. ?nuevo borra lo guardado; ?nivel=N es ayuda de prueba:
  // arranca en N (en 1 si N no es válido) y no escribe nada.
  function resolveStart(search, save, levels) {
    const params = new URLSearchParams(search);
    const reset = params.has('nuevo');
    if (params.has('nivel')) {
      const n = Number(params.get('nivel'));
      const level = Number.isInteger(n) && n >= 1 && n <= levels.length ? n : 1;
      return { level: level, persist: false, reset: reset };
    }
    return { level: reset ? 1 : save.unlocked, persist: true, reset: reset };
  }

  return { STORAGE_KEY, emptySave, parseSave, recordLanding, loadSave, writeSave, clearSave, resolveStart };
});
