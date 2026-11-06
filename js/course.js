'use strict';
// Builds the course: resolves item references, assigns each item to the unit where it first
// appears, and splits units into lessons.
(function (A) {
  const D = A.DATA;
  const C = A.Course = { items: {}, list: [], units: [], unitIndex: {}, lessonByKey: {} };

  C.LINES = {
    read: { name: 'Чтение', color: 'var(--read)' },
    talk: { name: 'Разговор', color: 'var(--talk)' },
    gram: { name: 'Грамматика', color: 'var(--gram)' },
    story: { name: 'Истории', color: 'var(--story)' },
    dial: { name: 'Диалоги', color: 'var(--dial)' }
  };
  const isStoryLine = line => line === 'story' || line === 'dial';

  function nameItem(letter) {
    return {
      id: 'N_' + letter.ch, kind: 'name', ch: letter.ch, uc: letter.uc, say: letter.say,
      en: letter.uc, ru: 'буква ' + letter.uc, letterId: letter.id
    };
  }

  function resolve(raw) {
    if (raw.ref) {
      const L = D.letters[raw.ref];
      if (!L) throw new Error('Unknown letter ' + raw.ref);
      return raw.asName ? nameItem(L) : L;
    }
    if (raw.refId) {
      const it = C.items[raw.refId];
      if (!it) throw new Error('Reference to an item not introduced yet: ' + raw.refId);
      return it;
    }
    return raw;
  }

  function chunk(arr, n) {
    const out = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    // avoid a lonely last lesson with one item
    if (out.length > 1 && out[out.length - 1].length === 1) out[out.length - 2].push(out.pop()[0]);
    return out;
  }

  C.build = function () {
    const seen = new Set();
    D.units.forEach((u, ui) => {
      u.index = ui;
      C.unitIndex[u.id] = ui;
      // Content files describe lessons in u.lessons (explicit groups) or u.items (auto-split)
      const authored = u.authored || (u.authored = Array.isArray(u.lessons) ? u.lessons : (u.items ? chunk(u.items, u.size || 4) : []));
      u.lessons = [];
      if (isStoryLine(u.line)) {
        u.lessons.push({ key: u.id + ':0', unit: u, idx: 0, title: D.stories[u.story].title, story: u.story, newIds: [], refIds: [] });
      } else {
        authored.forEach((def, li) => {
          const g = Array.isArray(def) ? { items: def } : def;
          const newIds = [], refIds = [];
          g.items.forEach(r => {
            const it = resolve(r);
            if (!C.items[it.id]) C.items[it.id] = it;
            if (seen.has(it.id)) { refIds.push(it.id); return; }
            seen.add(it.id);
            newIds.push(it.id);
            it.unit = u.id;
            if (it.kind === 'word' && u.line === 'read') it.read = true;
          });
          u.lessons.push({ key: u.id + ':' + li, unit: u, idx: li, title: g.title || ('Урок ' + (li + 1)), newIds, refIds, mode: g.mode || null });
        });
        if (u.lessons.length > 1 && !u.noReview) {
          const all = [].concat(...u.lessons.map(l => l.newIds));
          u.lessons.push({ key: u.id + ':r', unit: u, idx: u.lessons.length, title: 'Закрепление', review: true, newIds: [], refIds: all });
        }
      }
      u.lessons.forEach(l => { C.lessonByKey[l.key] = l; });
      C.units.push(u);
    });
    C.list = Object.values(C.items);

    // Lexicon for tap-to-translate in stories
    C.lexicon = {};
    C.list.forEach(it => { if (it.kind === 'word') C.lexicon[it.en.toLowerCase()] = it.ru; });
    Object.keys(D.gloss).forEach(k => { if (!C.lexicon[k]) C.lexicon[k] = D.gloss[k]; });
  };

  C.gloss = function (word) {
    const w = A.U.norm(word);
    if (!w) return '';
    if (C.lexicon[w]) return C.lexicon[w];
    const stems = [w.replace(/'s$/, ''), w.replace(/s$/, ''), w.replace(/es$/, ''), w.replace(/ies$/, 'y'),
      w.replace(/ed$/, ''), w.replace(/d$/, ''), w.replace(/ied$/, 'y'), w.replace(/ing$/, ''), w.replace(/ing$/, 'e'), w.replace(/er$/, '')];
    for (const s of stems) if (s && C.lexicon[s]) return C.lexicon[s];
    return '';
  };

  const S = () => A.Store.state;
  C.lessonDone = key => !!S().lessons[key];
  C.unitDoneCount = u => u.lessons.filter(l => C.lessonDone(l.key)).length;
  C.unitComplete = u => u.lessons.every(l => C.lessonDone(l.key));
  // A unit stays open once any of its lessons is done (course updates may add lessons to earlier units)
  C.unitUnlocked = u => S().settings.openAll || u.index === 0 || C.unitComplete(C.units[u.index - 1]) || C.unitDoneCount(u) > 0;
  C.lessonUnlocked = l => {
    if (!C.unitUnlocked(l.unit)) return false;
    if (S().settings.openAll) return true;
    return l.idx === 0 || C.lessonDone(l.unit.lessons[l.idx - 1].key);
  };
  C.nextLesson = function () {
    for (const u of C.units) {
      if (!C.unitUnlocked(u)) break;
      const l = u.lessons.find(x => !C.lessonDone(x.key));
      if (l) return l;
    }
    return null;
  };
})(window.A);
