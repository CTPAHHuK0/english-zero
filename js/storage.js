'use strict';
// All learner state lives in one versioned JSON object in localStorage.
(function (A) {
  const KEY = 'english-zero-state-v1';
  const VERSION = 1;

  function defaults() {
    return {
      v: VERSION,
      created: Date.now(),
      onboarded: false,
      settings: {
        goal: 40,            // XP per day
        voiceURI: '',        // '' = choose automatically
        rate: 0.95,
        mic: true,
        sfx: true,
        vibrate: true,
        theme: 'system',
        openAll: false,
        plan: { when: '', custom: '' }
      },
      lessons: {},           // 'u01:0' -> { at, acc }
      items: {},             // item id -> FSRS card
      stats: {
        xp: 0, days: {}, streak: 0, best: 0, last: '', freezes: 0,
        answered: 0, correct: 0, reviews: 0, spoken: 0, stories: 0, perfect: 0, seconds: 0
      },
      badges: {}
    };
  }

  // Fill in keys added in newer versions without touching existing values
  function fill(target, def) {
    for (const k in def) {
      if (!(k in target)) target[k] = def[k];
      else if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k]) && target[k] && typeof target[k] === 'object') fill(target[k], def[k]);
    }
    return target;
  }

  function migrate(s) {
    if (!s || typeof s !== 'object') return defaults();
    fill(s, defaults());
    s.v = VERSION;
    return s;
  }

  let state = defaults();
  let storageOk = true;

  const Store = A.Store = {
    get state() { return state; },
    get persistent() { return storageOk; },
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        state = raw ? migrate(JSON.parse(raw)) : defaults();
      } catch (e) {
        storageOk = false;
        state = defaults();
      }
      return state;
    },
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); storageOk = true; } catch (e) { storageOk = false; }
    },
    reset() {
      const keep = state.settings;
      state = defaults();
      state.settings = keep;
      state.onboarded = true;
      Store.save();
    },
    exportJSON() {
      return JSON.stringify({ app: 'english-zero', exported: new Date().toISOString(), state });
    },
    importJSON(text) {
      const obj = JSON.parse(text);
      const s = obj && obj.app === 'english-zero' ? obj.state : obj;
      if (!s || typeof s !== 'object' || !s.items || !s.stats) throw new Error('Это не файл прогресса приложения');
      state = migrate(s);
      Store.save();
    }
  };
  Store.saveSoon = A.U.debounce(Store.save, 400);
})(window.A);
