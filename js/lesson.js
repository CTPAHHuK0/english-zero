'use strict';
// Lesson / review session runner.
// Order inside a lesson: meet each new item and check it right away (easy task), then mixed practice
// with older items (interleaving + spaced retrieval), then harder production tasks.
// Wrong answers come back 2–3 tasks later, so every session ends on a correct retrieval.
(function (A) {
  const U = A.U, h = U.h, C = A.Course, X = A.Ex, Sp = A.Speech, St = A.Store;
  const L = A.Lesson = {};
  const MAX_TASKS = 18;
  const PRAISE = ['Верно!', 'Отлично!', 'Так держать!', 'Супер!', 'Правильно!', 'Здорово!'];
  let S = null;
  let el = {};

  L.active = () => !!S && !S.finished;

  function makeCtx(unitIndex, extra) {
    const known = new Set(Object.keys(St.state.items).filter(id => C.items[id]));
    (extra || []).forEach(id => known.add(id));
    return { known, knownIds: Array.from(known), unitIndex, lastType: null, noSpeak: false };
  }

  // Learned items, most forgotten first (due ones before the rest)
  function weakest(excl, n) {
    const now = Date.now(), today = U.dayKey();
    return Object.keys(St.state.items)
      .filter(id => C.items[id] && !excl.has(id))
      .map(id => ({ id, r: A.SRS.retr(St.state.items[id], now), due: A.SRS.isDue(St.state.items[id], today) ? 1 : 0 }))
      .sort((a, b) => (b.due - a.due) || (a.r - b.r))
      .slice(0, n).map(x => x.id);
  }

  // Shuffle while avoiding the same item twice in a row
  function spread(list) {
    const out = [], pool = U.shuffle(list);
    while (pool.length) {
      const last = out[out.length - 1];
      let i = pool.findIndex(e => !last || e.id !== last.id);
      if (i < 0) i = 0;
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  function lessonQueue(lesson) {
    const q = [];
    const news = lesson.newIds, refs = lesson.refIds;
    if (lesson.idx === 0 && lesson.unit.tips && !St.state.lessons[lesson.key]) q.push({ t: 'tips' });

    if (lesson.mode) {
      const items = refs.concat(news);
      const twice = items.concat(U.sample(items, Math.min(items.length, 4)));
      return q.concat(spread(twice.map(id => ({ t: 'ex', id, lvl: 1, mode: lesson.mode }))));
    }

    if (lesson.review) {
      const ex = refs.map(id => ({ t: 'ex', id, lvl: 1 + (Math.random() < 0.5 ? 1 : 0) }));
      refs.filter(id => C.items[id].kind === 'pair').forEach(id => ex.push({ t: 'ex', id, lvl: 2 }));
      const list = spread(ex).slice(0, 15);
      list.splice(Math.min(list.length, 6), 0, { t: 'match', ids: refs });
      return q.concat(list);
    }

    const p1 = [], p2 = [], p3 = [];
    news.forEach(id => {
      p1.push({ t: 'intro', id });
      p1.push({ t: 'ex', id, lvl: 0 });
      if (C.items[id].kind === 'pair') p1.push({ t: 'ex', id, lvl: 1 });
    });
    news.forEach(id => { if (C.items[id].kind !== 'pair') p2.push({ t: 'ex', id, lvl: 1 }); });
    refs.forEach(id => p2.push({ t: 'ex', id, lvl: 1 }));
    news.forEach(id => { const k = C.items[id].kind; if (k !== 'pair' && k !== 'name') p3.push({ t: 'ex', id, lvl: 2 }); });

    const count = () => p1.filter(e => e.t === 'ex').length + p2.length + p3.length;
    const review = weakest(new Set(news.concat(refs)), 3);
    review.forEach(id => { if (count() < MAX_TASKS - 1) p2.push({ t: 'ex', id, lvl: 2 }); });
    while (count() > MAX_TASKS && p3.length > 2) p3.splice(Math.floor(Math.random() * p3.length), 1);
    while (count() > MAX_TASKS && p2.length > news.length) p2.pop();

    q.push(...p1, ...spread(p2));
    if (news.some(id => C.items[id].kind === 'word' && C.items[id].pic)) {
      q.push({ t: 'match', ids: news.concat(refs, U.sample(Object.keys(St.state.items), 8)) });
    }
    q.push(...spread(p3));
    return q;
  }

  function reviewQueue() {
    const now = Date.now();
    let ids = A.Progress.dueIds()
      .sort((a, b) => A.SRS.retr(St.state.items[a], now) - A.SRS.retr(St.state.items[b], now))
      .slice(0, 12);
    let practice = false;
    if (!ids.length) { ids = weakest(new Set(), 10); practice = true; }
    const q = spread(ids.map(id => ({ t: 'ex', id, lvl: Math.min(3, Math.max(1, St.state.items[id].reps)) })));
    if (q.length >= 5) q.splice(3, 0, { t: 'match', ids });
    return { q, practice };
  }

  // ---------- public ----------
  L.startLesson = function (lesson) {
    if (lesson.story) { A.Story.start(lesson); return; }
    begin({ kind: 'lesson', lesson, queue: lessonQueue(lesson), unitIndex: lesson.unit.index, extraKnown: lesson.newIds.concat(lesson.refIds) });
  };
  L.startReview = function () {
    const r = reviewQueue();
    if (!r.q.length) { U.toast('Повторять пока нечего — сначала пройдите урок'); return; }
    const nl = C.nextLesson();
    begin({ kind: 'review', practice: r.practice, queue: r.q, unitIndex: nl ? nl.unit.index : 999 });
  };
  L.askExit = async function () {
    if (!L.active()) { A.App.exitFocus(); return; }
    const ok = await U.confirm({ title: 'Выйти из урока?', text: 'Прогресс этого урока не сохранится.', ok: 'Выйти', cancel: 'Продолжить урок', danger: true });
    if (ok) { Sp.stop(); S = null; A.App.exitFocus(); }
  };

  // Shared lesson shell (also used by stories)
  L.shell = function (onClose) {
    el = {};
    el.progress = h('i');
    el.combo = h('div', { class: 'combo', 'aria-live': 'polite' });
    el.body = h('div', { class: 'lesson-body' });
    el.fb = h('div', { class: 'feedback', hidden: true });
    el.cta = h('button', { class: 'btn primary block', type: 'button' }, 'Проверить');
    el.foot = h('div', { class: 'lesson-foot' }, el.fb, el.cta);
    const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Выйти', html: U.icon('close'), onclick: onClose || L.askExit });
    U.$('#main').replaceChildren(h('div', { class: 'lesson' },
      h('div', { class: 'lesson-top' }, close, h('div', { class: 'progress', role: 'progressbar' }, el.progress), el.combo),
      el.body, el.foot));
    U.$('#main').scrollTop = 0;
    return el;
  };

  function begin(o) {
    Sp.stop();
    S = Object.assign(o, { pos: 0, results: {}, retries: {}, answered: 0, correct: 0, xp: 0, combo: 0, errRun: 0, t0: Date.now(), introduced: [], phase: 'idle' });
    S.ctx = makeCtx(o.unitIndex, o.extraKnown);
    A.App.enterFocus();
    L.shell();
    show();
  }

  function adjust(e) {
    const r = S.results[e.id];
    let lvl = e.lvl;
    if (r && r.err > r.ok) lvl -= 1;
    if (S.errRun >= 2) lvl = 0;
    return Object.assign({}, e, { lvl: Math.max(0, lvl) });
  }

  function show() {
    if (!S) return;
    let e = S.queue[S.pos];
    let ex = null;
    // skip entries that cannot produce a task (e.g. not enough distractors yet)
    while (e && (e.t === 'ex' || e.t === 'match')) {
      ex = e.t === 'match' ? X.makeMatch(e.ids, S.ctx) : X.make(adjust(e), S.ctx);
      if (ex) break;
      S.pos++;
      e = S.queue[S.pos];
    }
    el.progress.style.width = Math.round(S.pos / S.queue.length * 100) + '%';
    if (!e) { finish(); return; }

    el.body.replaceChildren();
    el.fb.hidden = true;
    el.foot.className = 'lesson-foot';
    el.cta.hidden = false;
    el.cta.disabled = false;
    U.$('#main').scrollTop = 0;
    S.phase = 'idle';
    S.ex = null;

    if (e.t === 'tips') {
      el.body.append(h('div', { class: 'ex-title' }, 'Перед уроком'), X.tips(S.lesson.unit));
      el.cta.textContent = 'Понятно, начнём';
      el.cta.onclick = next;
      return;
    }
    if (e.t === 'intro') {
      const card = X.intro(C.items[e.id]);
      el.body.append(card.node);
      el.cta.textContent = 'Дальше';
      el.cta.onclick = next;
      if (!S.introduced.includes(e.id)) S.introduced.push(e.id);
      setTimeout(() => { if (S && S.queue[S.pos] === e) card.play(); }, 350);
      return;
    }

    S.ex = ex;
    const api = {
      ready: b => { if (S && S.ex === ex && S.phase === 'idle') el.cta.disabled = !b; },
      done: r => result(e, ex, r)
    };
    el.body.append(h('div', { class: 'ex-title' }, ex.title), ex.view(api));
    if (ex.auto) {
      el.cta.hidden = true;
    } else {
      el.cta.textContent = 'Проверить';
      el.cta.disabled = true;
      el.cta.onclick = () => { if (S && S.phase === 'idle') result(e, ex, ex.check()); };
    }
    if (ex.autoplay) {
      setTimeout(() => {
        if (!S || S.ex !== ex || S.phase !== 'idle') return;
        const varied = ex.autoplayOpt && ex.autoplayOpt.varied;
        (varied ? Sp.speakVaried : Sp.speak)(ex.autoplay, ex.autoplayOpt);
      }, 320);
    }
  }

  function requeue(e) {
    const n = S.retries[e.id] || 0;
    if (n >= 2) return;
    S.retries[e.id] = n + 1;
    const at = Math.min(S.queue.length, S.pos + 3 + Math.floor(Math.random() * 2));
    S.queue.splice(at, 0, { t: 'ex', id: e.id, lvl: Math.max(0, (e.lvl || 1) - 1), mode: e.mode, retry: true });
  }

  function result(e, ex, r) {
    if (!S || S.phase !== 'idle' || S.ex !== ex) return;
    S.phase = 'answered';
    el.cta.hidden = false;
    el.cta.disabled = false;
    if (r.skip) {
      showFb('neutral', r.msg || 'Пропускаем это задание', null);
    } else {
      S.answered++;
      if (e.t === 'ex') {
        const res = S.results[e.id] || (S.results[e.id] = { ok: 0, err: 0 });
        if (r.ok) res.ok++; else res.err++;
      }
      if (r.spoken) St.state.stats.spoken++;
      if (r.ok) {
        S.correct++;
        S.xp++;
        S.combo++;
        S.errRun = 0;
        U.sfx('ok');
        U.vibrate(12);
        showFb('good', U.pick(PRAISE), ex);
        if (ex.sayAfter) Sp.speak(ex.sayAfter);
      } else {
        S.combo = 0;
        S.errRun++;
        U.sfx('bad');
        U.vibrate([30, 40, 30]);
        showFb('bad', 'Правильный ответ:', ex);
        const say = (ex.fb && (ex.fb.say || ex.fb.en)) || ex.sayAfter;
        setTimeout(() => { if (S && S.ex === ex) { if (ex.afterWrong) ex.afterWrong(); else if (say) Sp.speak(say); } }, 450);
        if (e.t === 'ex') requeue(e);
      }
    }
    el.combo.textContent = S.combo >= 3 ? S.combo + ' подряд' : '';
    el.cta.textContent = 'Дальше';
    el.cta.onclick = next;
  }

  function showFb(kind, title, ex) {
    el.foot.className = 'lesson-foot ' + kind;
    const fb = ex && ex.fb;
    const body = h('div', { class: 'fb-body' });
    if (fb && kind === 'bad') {
      if (fb.en) body.append(h('div', { class: 'en' }, fb.en));
      if (fb.ru) body.append(h('div', {}, fb.ru));
      if (fb.note) body.append(h('div', { class: 'small', style: 'margin-top:6px', html: fb.note }));
    } else if (fb && kind === 'good' && fb.en && fb.ru) {
      body.append(h('span', { class: 'en', style: 'font-size:17px' }, fb.en), ' — ' + fb.ru);
    }
    const replay = fb && fb.en ? X.auBtn(fb.say || fb.en, { cls: 'xs fb-replay' }) : null;
    U.fill(el.fb,
      h('div', { class: 'fb-ico', html: U.icon(kind === 'good' ? 'check' : kind === 'bad' ? 'x' : 'info') }),
      h('div', { class: 'grow' }, h('div', { class: 'fb-title' }, title), body),
      replay);
    el.fb.hidden = false;
  }

  function next() {
    if (!S) return;
    Sp.stop();
    S.pos++;
    show();
  }

  function finish() {
    const stt = St.state;
    const secs = (Date.now() - S.t0) / 1000;
    let fresh = 0;
    Object.keys(S.results).forEach(id => {
      const r = S.results[id];
      const g = r.err === 0 ? 3 : (r.err === 1 && r.ok > 0) ? 2 : 1;
      if (!stt.items[id]) fresh++;
      stt.items[id] = A.SRS.review(stt.items[id], g);
    });
    S.introduced.forEach(id => { if (!stt.items[id]) { stt.items[id] = A.SRS.review(null, 3); fresh++; } });
    const acc = S.answered ? Math.round(S.correct / S.answered * 100) : 100;
    const perfect = S.answered >= 4 && S.correct === S.answered;
    const xp = S.xp + (S.kind === 'lesson' ? 5 : 3) + (perfect ? 5 : 0);
    stt.stats.answered += S.answered;
    stt.stats.correct += S.correct;
    if (perfect) stt.stats.perfect++;
    if (S.kind === 'review') stt.stats.reviews++;
    let unitDone = false;
    if (S.kind === 'lesson') {
      const was = C.unitComplete(S.lesson.unit);
      stt.lessons[S.lesson.key] = { at: Date.now(), acc };
      unitDone = !was && C.unitComplete(S.lesson.unit);
    }
    const ev = A.Progress.addXP(xp, secs);
    const badges = A.Progress.checkBadges();
    St.save();
    S.finished = true;
    L.finishView({
      label: S.kind === 'review' ? (S.practice ? 'Тренировка' : 'Повторение') : S.lesson.unit.title + ' · ' + S.lesson.title,
      xp, acc, secs, fresh, perfect, ev, badges, unitDone, review: S.kind === 'review'
    });
  }

  const fmtTime = s => { const m = Math.floor(s / 60), r = Math.round(s % 60); return m + ':' + String(r).padStart(2, '0'); };
  const stat = (b, s) => h('div', { class: 'stat' }, h('b', {}, String(b)), h('span', {}, s));

  L.finishView = function (o) {
    el.progress.style.width = '100%';
    U.sfx('done');
    U.confetti();
    const goal = St.state.settings.goal, today = A.Progress.todayXP();
    const si = A.Progress.streakInfo();
    const title = o.perfect ? 'Без единой ошибки!' : o.acc >= 85 ? 'Отличный урок!' : o.acc >= 60 ? 'Урок пройден!' : 'Готово! Ошибки — часть обучения';
    const notes = [];
    if (o.unitDone) notes.push('Станция пройдена — следующая открыта.');
    if (o.ev && o.ev.goalDone) notes.push('Дневная цель выполнена!');
    if (o.ev && o.ev.newFreeze) notes.push('Вы получили заморозку серии: если пропустите день, серия не сгорит.');
    if (o.ev && o.ev.usedFreeze) notes.push('Заморозка сохранила вашу серию.');
    if (o.review) notes.push('Повторённые слова вернутся позже — как раз тогда, когда начнут забываться.');
    else if (o.acc < 70) notes.push('Трудные слова вернутся в повторении. Так мозг запоминает надёжнее.');
    el.body.replaceChildren(h('div', { class: 'finish' },
      h('div', { class: 'label' }, o.label),
      h('h1', { class: 'h1' }, title),
      h('div', { class: 'big-xp' }, '+' + o.xp + ' XP'),
      h('div', { class: 'stat-row' }, stat(o.acc + '%', 'точность'), stat(fmtTime(o.secs), 'время'), stat(o.fresh, U.plural(o.fresh, ['новое', 'новых', 'новых']))),
      h('div', { class: 'card flat stack', style: 'align-self:stretch;text-align:left' },
        h('div', { class: 'row' }, h('span', { style: 'color:var(--read)', html: U.icon('flame') }),
          h('b', {}, si.n + ' ' + U.plural(si.n, ['день', 'дня', 'дней']) + ' подряд')),
        h('div', { class: 'row' }, h('div', { class: 'progress grow' }, h('i', { style: 'width:' + Math.min(100, Math.round(today / goal * 100)) + '%' })),
          h('span', { class: 'small muted' }, Math.min(today, goal) + ' / ' + goal + ' XP'))),
      notes.length ? h('div', { class: 'stack', style: 'align-self:stretch;text-align:left' }, notes.map(n => h('p', { class: 'notice' }, n))) : null,
      o.badges && o.badges.length ? h('div', { class: 'stack' }, h('div', { class: 'label' }, 'Новые награды'),
        h('div', { class: 'new-badges' }, o.badges.map(b => h('div', { class: 'badge got' }, h('div', { class: 'medal' }, b.mark), h('div', { class: 'bt' }, b.t))))) : null));
    el.fb.hidden = true;
    el.foot.className = 'lesson-foot';
    el.combo.textContent = '';
    el.cta.hidden = false;
    el.cta.disabled = false;
    el.cta.textContent = 'Продолжить';
    el.cta.onclick = () => A.App.exitFocus();
    U.$('#main').scrollTop = 0;
  };
})(window.A);
