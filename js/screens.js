'use strict';
// Screens: onboarding, route (home), review, dictionary, profile, science.
(function (A) {
  const U = A.U, h = U.h, C = A.Course, Sp = A.Speech, St = A.Store, P = A.Progress;
  const Scr = A.Screens = {};

  const PLAN_OPTIONS = [
    { id: 'coffee', t: 'Утром с кофе', s: 'Когда я пью утренний кофе' },
    { id: 'commute', t: 'В дороге', s: 'Когда я еду на работу или учёбу' },
    { id: 'lunch', t: 'В обеденный перерыв', s: 'Когда у меня обеденный перерыв' },
    { id: 'evening', t: 'Вечером перед сном', s: 'Когда я ложусь в кровать вечером' }
  ];
  const GOALS = [
    { xp: 20, t: 'Спокойно', s: 'Около 5 минут в день' },
    { xp: 40, t: 'Обычно', s: 'Около 10 минут в день' },
    { xp: 60, t: 'Серьёзно', s: 'Около 15 минут в день' },
    { xp: 100, t: 'Интенсив', s: '25 минут и больше' }
  ];
  const minutesFor = xp => (GOALS.find(g => g.xp === xp) || GOALS[1]).s.replace(/^Около /, '').replace(/ в день$/, '');

  Scr.planText = function () {
    const p = St.state.settings.plan;
    const opt = PLAN_OPTIONS.find(o => o.id === p.when);
    const when = opt ? opt.s : (p.when === 'custom' && p.custom ? p.custom : '');
    if (!when) return '';
    return when + ', я открываю английский на ' + minutesFor(St.state.settings.goal) + '.';
  };

  function ring(pct) {
    const R = 19, L = 2 * Math.PI * R;
    return '<svg class="ring' + (pct >= 1 ? ' full' : '') + '" viewBox="0 0 44 44" aria-hidden="true"><circle class="bg" cx="22" cy="22" r="' + R + '"/>' +
      '<circle class="fg" cx="22" cy="22" r="' + R + '" stroke-dasharray="' + L.toFixed(1) + '" stroke-dashoffset="' + (L * (1 - Math.min(1, pct))).toFixed(1) + '"/></svg>';
  }

  // ---------- Home / route ----------
  Scr.home = function (main) {
    const s = St.state, si = P.streakInfo(), goal = s.settings.goal, today = P.todayXP();
    const hud = h('div', { class: 'hud' },
      h('div', { class: 'hud-pill fire' + (si.n ? '' : ' dim'), title: 'Дней подряд', html: U.icon('flame') + '<span>' + si.n + '</span>' }),
      s.stats.freezes ? h('div', { class: 'hud-pill ice', title: 'Заморозки серии', html: U.icon('snow') + '<span>' + s.stats.freezes + '</span>' }) : null,
      h('div', { class: 'ring-wrap' }, h('div', {}, h('b', {}, Math.min(today, goal) + ' / ' + goal), h('br'), 'XP сегодня'), h('div', { html: ring(today / goal) })));

    const cards = h('div', { class: 'home-cards' });
    if (!St.persistent) cards.append(h('p', { class: 'notice' }, 'Браузер не даёт сохранять прогресс на этом устройстве (например, в режиме инкогнито). Уроки работают, но после закрытия прогресс пропадёт.'));
    if (si.lost) cards.append(h('p', { class: 'notice' }, 'Серия из ' + si.lost + ' ' + U.plural(si.lost, ['дня', 'дней', 'дней']) + ' прервалась. Не страшно: для привычки важнее вернуться, чем не пропускать. Начнём новую!'));
    else if (si.atRisk && si.n) cards.append(h('p', { class: 'notice' }, 'Пройдите урок или повторение сегодня, чтобы сохранить серию: ' + si.n + ' ' + U.plural(si.n, ['день', 'дня', 'дней']) + '.'));

    const nl = C.nextLesson();
    if (nl) {
      cards.append(h('div', { class: 'next-card' },
        h('div', { class: 'label' }, Object.keys(s.lessons).length ? 'Продолжить маршрут' : 'Первый урок'),
        h('div', { class: 'h2' }, nl.unit.title),
        h('div', { class: 'sub' }, 'Станция ' + (nl.unit.index + 1) + ' · ' + nl.title),
        h('button', { class: 'btn primary', type: 'button', onclick: () => A.Lesson.startLesson(nl) }, 'Начать')));
    } else {
      cards.append(h('div', { class: 'next-card' }, h('div', { class: 'label' }, 'Маршрут пройден'), h('div', { class: 'h2' }, 'Добро пожаловать в Нью-Йорк!'),
        h('div', { class: 'sub' }, 'Продолжайте повторять — так слова останутся с вами надолго.')));
    }
    const due = P.dueIds().length;
    if (due) {
      cards.append(h('div', { class: 'card review-card' },
        h('div', { class: 'num' }, due),
        h('div', { class: 'grow' }, h('b', {}, 'Пора повторить'), h('div', { class: 'small muted' }, U.plural(due, ['слово начинает', 'слова начинают', 'слов начинают']) + ' забываться')),
        h('button', { class: 'btn sm', type: 'button', onclick: () => A.Lesson.startReview() }, 'Повторить')));
    }
    if (Sp.muted()) {
      cards.append(h('div', { class: 'card review-card' },
        h('div', { class: 'num', style: 'font-size:22px' }, '🔇'),
        h('div', { class: 'grow' }, h('b', {}, 'Режим без звука'), h('div', { class: 'small muted' }, 'Ещё ' + Sp.mutedMinutes() + ' мин. Задания на слух пропускаются.')),
        h('button', { class: 'btn sm', type: 'button', onclick: () => { Sp.unmute(); A.App.show('home'); } }, 'Включить звук')));
    }
    if (A.AI.state() === 'ready' && Object.keys(s.lessons).length >= 3) {
      cards.append(h('button', { class: 'card review-card ai-card', type: 'button', onclick: () => A.AI.open() },
        h('div', { class: 'num', style: 'background:color-mix(in srgb, var(--dial) 16%, var(--surface));color:var(--dial)' }, 'AI'),
        h('div', { class: 'grow', style: 'text-align:left' }, h('b', {}, 'Разговор с ИИ'), h('div', { class: 'small muted' }, 'Кафе, аэропорт, отель — собеседник поправит ошибки')),
        h('span', { class: 'muted', html: U.icon('chevron') })));
    }
    const plan = Scr.planText();
    if (plan) cards.append(h('div', { class: 'plan-line', html: U.icon('calendar') + '<span>Ваш план: <b>' + U.escape(plan) + '</b></span>' }));

    const legend = h('div', { class: 'legend' }, Object.keys(C.LINES).map(k => h('span', { style: '--lc:' + C.LINES[k].color }, h('i'), C.LINES[k].name)));

    const zones = {};
    C.units.forEach(u => { (zones[u.zone] = zones[u.zone] || []).push(u); });
    const route = Object.keys(zones).map(z => [
      h('div', { class: 'zone-title' }, h('span', { class: 'zone-n' }, 'ЗОНА ' + z), h('h2', { class: 'h2' }, A.DATA.zones[z])),
      h('div', { class: 'route' }, zones[z].map((u, i, arr) => station(u, i, arr, nl)))
    ]);

    U.fill(main, hud, cards, legend, route);
    const cur = U.$('.station.current', main);
    if (cur && Object.keys(s.lessons).length > 2 && !Scr._scrolled) {
      Scr._scrolled = true;
      setTimeout(() => cur.scrollIntoView({ block: 'center' }), 50);
    }
  };

  function station(u, i, arr, nl) {
    const done = C.unitComplete(u), unlocked = C.unitUnlocked(u), current = !!nl && nl.unit === u;
    const cls = 'station' + (done ? ' done' : '') + (current ? ' current' : '') + (!unlocked ? ' locked' : '') + (i === 0 ? ' first' : '') + (i === arr.length - 1 ? ' last' : '');
    return h('button', { class: cls, type: 'button', style: '--lc:' + C.LINES[u.line].color, onclick: () => openUnit(u), 'aria-label': 'Станция ' + (u.index + 1) + ': ' + u.title },
      h('span', { class: 'st-mark', html: done ? U.icon('check') : '' }),
      h('span', { class: 'st-body' },
        h('span', { class: 'st-glyph' }, u.glyph),
        h('span', { class: 'grow' },
          h('span', { class: 'st-num', style: 'display:block' }, 'Станция ' + (u.index + 1) + ' · ' + C.LINES[u.line].name),
          h('span', { class: 'st-title', style: 'display:block' }, u.title),
          h('span', { class: 'st-sub', style: 'display:block' }, u.sub)),
        h('span', { class: 'st-prog', html: !unlocked ? U.icon('lock') : C.unitDoneCount(u) + '/' + u.lessons.length })));
  }

  function lessonSub(l) {
    if (l.story) return 'История с вопросами';
    if (l.review) return 'Повторение всей станции';
    if (l.mode === 'twin_sound') return 'Латинские буквы, похожие на русские';
    if (l.mode === 'spell_listen') return 'Узнайте слово по названиям букв';
    const ids = l.newIds.length ? l.newIds : l.refIds;
    return ids.slice(0, 5).map(id => {
      const it = C.items[id];
      return it.kind === 'letter' ? it.ch : it.kind === 'pair' ? it.en : it.en;
    }).join(' · ');
  }

  function openUnit(u) {
    const unlocked = C.unitUnlocked(u);
    const lc = C.LINES[u.line].color;
    const firstOpen = u.lessons.find(l => !C.lessonDone(l.key) && C.lessonUnlocked(l));
    const rows = u.lessons.map(l => {
      const done = C.lessonDone(l.key), avail = C.lessonUnlocked(l);
      return h('button', {
        class: 'lesson-row' + (done ? ' done' : '') + (l === firstOpen ? ' next' : ''), type: 'button', disabled: !avail,
        onclick: () => { U.closeSheet(); A.Lesson.startLesson(l); }
      },
        h('span', { class: 'dot', html: done ? U.icon('check') : String(l.idx + 1) }),
        h('span', { class: 'grow' }, h('b', {}, l.title), h('div', { class: 'lr-sub en' }, lessonSub(l))),
        h('span', { class: 'muted', html: avail ? U.icon('chevron') : U.icon('lock') }));
    });
    const startL = firstOpen || u.lessons[0];
    U.sheet(h('div', {},
      h('div', { class: 'sheet-head', style: '--lc:' + lc },
        h('div', { class: 'st-glyph', style: '--lc:' + lc }, u.glyph),
        h('div', { class: 'grow' }, h('div', { class: 'label' }, 'Станция ' + (u.index + 1) + ' · ' + C.LINES[u.line].name), h('h2', { class: 'h2' }, u.title), h('div', { class: 'muted small' }, u.sub))),
      !unlocked ? h('p', { class: 'notice' }, 'Станция откроется, когда вы пройдёте предыдущую. Если вы уже немного знаете английский, можно открыть все станции в профиле.') : null,
      u.tips ? h('details', {}, h('summary', { class: 'label', style: 'cursor:pointer;padding:6px 0' }, 'Подсказки станции'), h('div', { style: 'margin-top:8px' }, A.Ex.tips(u))) : null,
      h('div', { class: 'lesson-list' }, rows),
      unlocked ? h('button', { class: 'btn primary block', type: 'button', onclick: () => { U.closeSheet(); A.Lesson.startLesson(startL); } },
        firstOpen ? (C.unitDoneCount(u) ? 'Продолжить' : 'Начать') : 'Пройти ещё раз') : null));
  }
  Scr.openUnit = openUnit;

  // ---------- Review ----------
  Scr.review = function (main) {
    const s = St.state;
    const ids = Object.keys(s.items).filter(id => C.items[id]);
    const due = P.dueIds();
    const today = U.dayKey();
    const days = [1, 2, 3, 4, 5, 6, 7].map(n => {
      const key = U.addDays(today, n);
      return { n, c: ids.filter(id => s.items[id].due === key).length };
    });
    const now = Date.now();
    const weak = ids.filter(id => C.items[id].kind !== 'name')
      .map(id => ({ id, r: A.SRS.retr(s.items[id], now) })).sort((a, b) => a.r - b.r).slice(0, 8);

    U.fill(main,
      h('h1', { class: 'h1' }, 'Повторение'),
      h('p', { class: 'muted', style: 'margin:6px 0 16px' }, 'Слово возвращается к вам как раз тогда, когда начинает забываться. С каждым правильным ответом перерыв становится длиннее: день, три дня, неделя, месяц.'),
      h('div', { class: 'card stack' },
        due.length
          ? [h('div', { class: 'row' }, h('div', { class: 'big-xp', style: 'font:700 44px var(--f-display)' }, due.length),
            h('div', {}, h('b', {}, U.plural(due.length, ['слово ждёт', 'слова ждут', 'слов ждут']) + ' повторения'), h('div', { class: 'small muted' }, 'Займёт пару минут'))),
          h('button', { class: 'btn primary block', type: 'button', onclick: () => A.Lesson.startReview() }, 'Начать повторение')]
          : [h('b', {}, ids.length ? 'На сегодня всё повторено' : 'Здесь появятся слова для повторения'),
            h('p', { class: 'small muted' }, ids.length ? 'Можно потренировать самые слабые слова — это не помешает расписанию.' : 'Пройдите первый урок — и слова начнут возвращаться по расписанию.'),
            ids.length ? h('button', { class: 'btn block', type: 'button', onclick: () => A.Lesson.startReview() }, 'Тренировать слабые слова') : null]),
      ids.length ? [
        h('h2', { class: 'h2 section-title' }, 'Ближайшие дни'),
        h('div', { class: 'card' }, forecastChart(days)),
        h('h2', { class: 'h2 section-title' }, 'Самые слабые'),
        h('div', { class: 'dict-list' }, weak.map(w => dictRow(C.items[w.id], s.items[w.id])))
      ] : null);
  };

  function forecastChart(days) {
    const W = 320, H = 120, max = Math.max(1, ...days.map(d => d.c));
    const bw = 30, gap = (W - 20 - bw * 7) / 6;
    const names = ['завтра', '2 дн', '3 дн', '4 дн', '5 дн', '6 дн', '7 дн'];
    let svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Сколько слов вернётся в ближайшие 7 дней">';
    days.forEach((d, i) => {
      const x = 10 + i * (bw + gap), bh = Math.round(d.c / max * 70);
      svg += '<rect class="bar" x="' + x + '" y="' + (90 - bh) + '" width="' + bw + '" height="' + Math.max(bh, 2) + '" rx="4"/>';
      svg += '<text x="' + (x + bw / 2) + '" y="' + (84 - bh) + '" text-anchor="middle">' + d.c + '</text>';
      svg += '<text x="' + (x + bw / 2) + '" y="108" text-anchor="middle">' + names[i] + '</text>';
    });
    return h('div', { html: svg + '</svg>' });
  }

  // ---------- Dictionary ----------
  const DICT_FILTERS = [['all', 'Все'], ['letter', 'Буквы'], ['word', 'Слова'], ['phrase', 'Фразы'], ['pair', 'Пары звуков']];
  let dictState = { f: 'all', q: '' };

  function dictRow(it, card) {
    const r = A.SRS.retr(card);
    const on = Math.max(1, Math.ceil(r * 4));
    const pic = it.kind === 'letter' ? it.pic : it.kind === 'pair' ? it.a.pic + it.b.pic : it.kind === 'pat' ? 'Аа' : it.pic;
    const en = it.kind === 'letter' ? it.ch : it.en;
    const ru = it.kind === 'letter' ? 'как в ' + it.key + ' — ' + it.keyRu : it.kind === 'pat' ? 'правило: ' + it.ru : it.ru;
    const say = it.kind === 'letter' ? it.key : it.kind === 'pat' ? it.variants[0].en : it.en;
    return h('button', { class: 'dict-row', type: 'button', onclick: () => (it.kind === 'pair' ? Sp.speakSeq([it.a.en, it.b.en]) : Sp.speak(say)) },
      h('span', { class: 'pic' + (U.isTextPic(pic) ? ' txt' : '') }, pic || ''),
      h('span', { style: 'min-width:0' }, h('div', { class: 'en' }, en), h('div', { class: 'ru' }, ru)),
      h('span', { class: 'strength' + (r < 0.7 ? ' weak' : ''), title: 'Прочность памяти: ' + Math.round(r * 100) + '%' },
        [0, 1, 2, 3].map(i => h('i', { class: i < on ? 'on' : '' }))));
  }

  Scr.dict = function (main) {
    const s = St.state;
    const all = Object.keys(s.items).map(id => C.items[id]).filter(it => it && it.kind !== 'name');
    const list = h('div', { class: 'dict-list' });
    const counter = h('p', { class: 'muted small' });
    function render() {
      const q = dictState.q.trim().toLowerCase();
      const f = dictState.f;
      const rows = all.filter(it => {
        if (f === 'phrase' ? !(it.kind === 'phrase' || it.kind === 'sent' || it.kind === 'pat') : (f !== 'all' && it.kind !== f)) return false;
        if (!q) return true;
        return (it.en + ' ' + (it.ru || '') + ' ' + (it.key || '') + ' ' + (it.keyRu || '')).toLowerCase().includes(q);
      }).sort((a, b) => (a.kind === 'letter') - (b.kind === 'letter') || a.en.localeCompare(b.en));
      counter.textContent = 'Найдено: ' + rows.length;
      list.replaceChildren(...(rows.length ? rows.map(it => dictRow(it, s.items[it.id]))
        : [h('div', { class: 'empty' }, all.length ? 'Ничего не найдено' : 'Пока пусто. Слова появятся здесь после первого урока.')]));
    }
    const chips = h('div', { class: 'chips' }, DICT_FILTERS.map(([k, t]) => h('button', {
      class: 'chip' + (dictState.f === k ? ' on' : ''), type: 'button',
      onclick: e => { dictState.f = k; U.$$('.chip', chips).forEach(c => c.classList.remove('on')); e.currentTarget.classList.add('on'); render(); }
    }, t)));
    const search = h('input', { class: 'search', id: 'dict-search', type: 'search', placeholder: 'Поиск по-английски или по-русски', value: dictState.q, autocomplete: 'off' });
    search.oninput = () => { dictState.q = search.value; render(); };
    const words = P.learnedWords(), letters = P.learnedLetters();
    main.replaceChildren(
      h('h1', { class: 'h1' }, 'Словарь'),
      h('p', { class: 'muted', style: 'margin:6px 0 14px' }, letters + ' ' + U.plural(letters, ['буква', 'буквы', 'букв']) + ' · ' + words + ' ' + U.plural(words, ['слово и фраза', 'слова и фразы', 'слов и фраз']) + '. Нажмите на строку, чтобы послушать. Полоски — прочность памяти.'),
      h('div', { class: 'stack' }, search, chips, counter),
      list);
    render();
  };

  // ---------- Profile & settings ----------
  function weekChart() {
    const days = St.state.stats.days, goal = St.state.settings.goal;
    const today = U.dayKey();
    const data = [6, 5, 4, 3, 2, 1, 0].map(n => { const k = U.addDays(today, -n); return { k, v: days[k] || 0, d: new Date(k + 'T12:00:00') }; });
    const W = 320, H = 130, max = Math.max(goal, ...data.map(d => d.v));
    const bw = 30, gap = (W - 20 - bw * 7) / 6;
    const wd = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const gy = 96 - Math.round(goal / max * 80);
    let svg = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="XP за последние 7 дней">';
    svg += '<line class="goal" x1="4" x2="' + (W - 4) + '" y1="' + gy + '" y2="' + gy + '"/>';
    data.forEach((d, i) => {
      const x = 10 + i * (bw + gap), bh = Math.round(d.v / max * 80);
      svg += '<rect class="bar' + (i === 6 ? ' today' : '') + '" x="' + x + '" y="' + (96 - bh) + '" width="' + bw + '" height="' + Math.max(bh, 2) + '" rx="4"/>';
      if (d.v) svg += '<text x="' + (x + bw / 2) + '" y="' + (90 - bh) + '" text-anchor="middle">' + d.v + '</text>';
      svg += '<text x="' + (x + bw / 2) + '" y="116" text-anchor="middle">' + wd[d.d.getDay()] + '</text>';
    });
    return h('div', {}, h('div', { html: svg + '</svg>' }), h('p', { class: 'small muted' }, 'Пунктир — дневная цель (' + goal + ' XP).'));
  }

  function sw(id, checked, onchange, disabled) {
    const input = h('input', { type: 'checkbox', id, role: 'switch', checked: !!checked, disabled: !!disabled });
    input.onchange = () => onchange(input.checked);
    return h('label', { class: 'switch' }, input, h('span'));
  }
  function setRow(title, sub, control, forId) {
    return h('div', { class: 'set-row' }, h('label', { class: 'grow', for: forId || null }, h('b', {}, title), sub ? h('span', {}, sub) : null), control);
  }
  const saveSetting = (k, v) => { St.state.settings[k] = v; St.save(); };
  // The voice list on the profile screen refreshes when device voices or audio packs arrive
  let voiceUi = null;
  Sp.onVoices(() => { if (voiceUi) voiceUi(); });
  Sp.onPack(() => { if (voiceUi) voiceUi(); });

  Scr.profile = function (main) {
    const s = St.state, st = s.stats, si = P.streakInfo();
    const unitsDone = C.units.filter(C.unitComplete).length;
    const acc = st.answered ? Math.round(st.correct / st.answered * 100) : 0;
    const stat = (b, t) => h('div', { class: 'stat' }, h('b', {}, String(b)), h('span', {}, t));

    // voices: recorded ones first, then the device synthesizer
    const voiceSel = h('select', { id: 'set-voice' });
    const voiceNote = h('span', {});
    function fillVoices() {
      const mode = Sp.voiceMode(), uri = s.settings.voiceURI;
      U.fill(voiceSel,
        h('optgroup', { label: 'Записанные голоса' }, Sp.mainVoices().map(v => h('option', { value: v.id, selected: mode === v.id }, v.label))),
        Sp.ttsSupported ? h('optgroup', { label: 'Голос устройства' },
          h('option', { value: 'tts:', selected: mode === 'tts' && !uri }, 'Голос устройства (автоматически)'),
          Sp.voices().map(v => h('option', { value: 'tts:' + v.voiceURI, selected: mode === 'tts' && v.voiceURI === uri }, v.name.replace(/^(Microsoft|Google)\s+/, '') + ' (' + v.lang + ')'))) : null);
      voiceNote.textContent = mode === 'tts' ? 'Синтезатор устройства: качество зависит от устройства'
        : Sp.packReady(mode) ? 'Записанная озвучка, работает без интернета' : 'Озвучка загружается…';
    }
    fillVoices();
    voiceUi = fillVoices;
    voiceSel.onchange = async () => {
      const v = voiceSel.value;
      if (v.slice(0, 4) === 'tts:') { s.settings.voice = 'tts'; s.settings.voiceURI = v.slice(4); }
      else {
        s.settings.voice = v;
        St.save();
        fillVoices();
        await Sp.loadPack(v);
        Sp.loadPack(v + '-more');
        Sp.loadPack(v + '-slow');
      }
      St.save();
      fillVoices();
      Sp.speak('Hello! Nice to meet you.');
    };
    const rate = h('input', { type: 'range', id: 'set-rate', min: '0.6', max: '1.2', step: '0.05', value: String(s.settings.rate) });
    rate.onchange = () => { saveSetting('rate', parseFloat(rate.value)); Sp.speak('This is my speed.'); };
    const goalSel = h('select', { id: 'set-goal' }, GOALS.map(g => h('option', { value: g.xp, selected: g.xp === s.settings.goal }, g.t + ' · ' + g.xp + ' XP')));
    goalSel.onchange = () => { saveSetting('goal', parseInt(goalSel.value, 10)); };
    const themeSel = h('select', { id: 'set-theme' }, [['system', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']].map(([v, t]) => h('option', { value: v, selected: s.settings.theme === v }, t)));
    themeSel.onchange = () => { saveSetting('theme', themeSel.value); A.App.applyTheme(); };

    const ttsMode = Sp.voiceMode() === 'tts';
    const noVoice = ttsMode && Sp.ttsSupported && !Sp.hasEnglish();
    U.fill(main,
      h('h1', { class: 'h1' }, 'Профиль'),
      h('div', { class: 'stat-grid', style: 'margin-top:14px' },
        stat(si.n + ' ' + U.plural(si.n, ['день', 'дня', 'дней']), 'серия · рекорд ' + st.best),
        stat(st.xp, 'XP всего'),
        stat(P.learnedWords(), 'слов и фраз'),
        stat(P.learnedLetters() + ' / 26', 'букв'),
        stat(acc + '%', 'точность ответов'),
        stat(unitsDone + ' / ' + C.units.length, 'станций пройдено')),

      h('h2', { class: 'h2 section-title' }, 'Последние 7 дней'),
      h('div', { class: 'card' }, weekChart()),

      h('h2', { class: 'h2 section-title' }, 'Награды'),
      h('div', { class: 'badges' }, P.BADGES.map(b => h('div', { class: 'badge' + (s.badges[b.id] ? ' got' : ''), title: b.d },
        h('div', { class: 'medal' }, b.mark), h('div', { class: 'bt' }, b.t)))),

      h('h2', { class: 'h2 section-title' }, 'Мой план'),
      h('div', { class: 'card stack' },
        h('p', {}, Scr.planText() || 'План пока не выбран.'),
        h('p', { class: 'small muted' }, 'Чёткий план «когда и где» помогает не бросить. Привычка складывается в среднем за 2 месяца, и один пропуск её не ломает.'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => planSheet(() => A.App.show('profile')) }, 'Изменить план')),

      h('h2', { class: 'h2 section-title' }, 'Настройки'),
      noVoice ? h('p', { class: 'notice', style: 'margin-bottom:10px' }, 'На устройстве не найден английский голос. На Android: Настройки → Специальные возможности → Синтез речи (Преобразование текста в речь) → Google → установите «English (United States)».') : null,
      ttsMode && !Sp.ttsSupported ? h('p', { class: 'notice', style: 'margin-bottom:10px' }, 'Этот браузер не умеет озвучивать текст сам. Выберите записанный голос.') : null,
      h('div', { class: 'settings' },
        setRow('Дневная цель', null, goalSel, 'set-goal'),
        setRow('Голос', voiceNote, voiceSel, 'set-voice'),
        setRow('Скорость речи', null, rate, 'set-rate'),
        setRow('Проверить звук', null, h('button', { class: 'btn sm', type: 'button', onclick: () => Sp.speak('Hello! Let’s learn English.') }, 'Слушать')),
        setRow('Упражнения с микрофоном', Sp.framed ? 'Недоступны в версии claude.ai — работают в установленном приложении' : Sp.recSupported ? 'Произношение и «Послушайте и повторите»' : 'Распознавание речи не поддерживается этим браузером',
          sw('set-mic', s.settings.mic && !Sp.framed, v => { saveSetting('mic', v); if (v) { Sp.micBlocked = false; Sp.recBlocked = false; } }, Sp.framed), 'set-mic'),
        setRow('Звуки ответов', null, sw('set-sfx', s.settings.sfx, v => saveSetting('sfx', v)), 'set-sfx'),
        setRow('Вибрация', null, sw('set-vib', s.settings.vibrate, v => saveSetting('vibrate', v)), 'set-vib'),
        setRow('Тема', null, themeSel, 'set-theme'),
        setRow('Открыть все станции', 'Если вы уже немного знаете английский', sw('set-open', s.settings.openAll, v => saveSetting('openAll', v)), 'set-open')),

      h('h2', { class: 'h2 section-title' }, 'Почему это работает'),
      h('button', { class: 'card row', type: 'button', style: 'width:100%;border:0;text-align:left', onclick: () => A.App.show('science') },
        h('span', { html: U.icon('flask') }), h('span', { class: 'grow' }, h('b', {}, 'Научная основа курса'), h('div', { class: 'small muted' }, 'Какие исследования легли в основу и как они применены')), h('span', { html: U.icon('chevron') })),

      h('h2', { class: 'h2 section-title' }, 'Разговор с ИИ'),
      A.AI.state() === 'ready'
        ? h('button', { class: 'card row', type: 'button', style: 'width:100%;border:0;text-align:left', onclick: () => A.AI.open() },
          h('span', { class: 'grow' }, h('b', {}, 'Поговорить с собеседником'), h('div', { class: 'small muted' }, 'Ролевые сценки: кафе, аэропорт, отель, магазин')), h('span', { html: U.icon('chevron') }))
        : h('div', { class: 'card stack' }, h('p', { class: 'small' }, 'Ролевые сценки с ИИ (кафе, аэропорт, отель) работают в версии приложения на claude.ai — там ИИ отвечает от вашего аккаунта Claude.'),
          h('a', { class: 'btn sm', href: A.AI.ARTIFACT_URL, target: '_blank', rel: 'noopener' }, 'Открыть версию claude.ai')),

      h('h2', { class: 'h2 section-title' }, 'Перенос прогресса'),
      transferCard(),
      h('details', { class: 'card', style: 'margin-top:10px' }, h('summary', { class: 'small', style: 'cursor:pointer' }, 'Копия текстом'), h('div', { style: 'margin-top:10px' }, backupCard())),

      h('div', { style: 'margin-top:26px;text-align:center' },
        h('button', { class: 'btn ghost danger sm', type: 'button', onclick: resetAll }, 'Сбросить весь прогресс')),
      h('p', { class: 'small muted', style: 'text-align:center;margin-top:8px' }, 'Английский с нуля · прогресс хранится только на этом устройстве'));
  };

  // Embedded pages (e.g. a claude.ai preview) cannot start file downloads
  function inFrame() { try { return window.top !== window.self; } catch (e) { return true; } }

  function transferCard() {
    const T = A.Transfer;
    return h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Прогресс хранится на каждом устройстве отдельно. Чтобы продолжить на телефоне с того же места, покажите QR-код на компьютере и отсканируйте его телефоном. Или отправьте себе файл, например в Telegram.'),
      h('div', { class: 'transfer-grid' },
        h('button', { class: 'btn sm', type: 'button', onclick: () => T.showQR() }, 'Показать QR-код'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => T.scan(), disabled: !T.canScan(), title: T.canScan() ? '' : 'Нужен Chrome на Android' }, 'Сканировать QR-код'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => T.shareFile() }, 'Отправить файлом'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => T.pickFile() }, 'Загрузить из файла')),
      T.canScan() ? null : h('p', { class: 'small muted' }, 'Сканировать можно в установленном приложении на телефоне Android (Chrome).'));
  }

  function backupCard() {
    const out = h('textarea', { class: 'backup', id: 'backup-out', readonly: true, hidden: true });
    const inp = h('textarea', { class: 'backup', id: 'backup-in', placeholder: 'Вставьте сюда сохранённую копию', hidden: true });
    const file = h('input', { type: 'file', id: 'backup-file', accept: '.json,application/json,text/plain', hidden: true });
    file.onchange = () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { inp.hidden = false; inp.value = String(r.result); };
      r.readAsText(f);
    };
    return h('div', { class: 'card stack' },
      h('p', { class: 'small muted' }, 'Прогресс хранится в браузере. Чтобы перенести его на другое устройство, скопируйте текст копии и вставьте его там.'),
      h('div', { class: 'row', style: 'flex-wrap:wrap' },
        h('button', { class: 'btn sm', type: 'button', onclick: async () => {
          out.value = St.exportJSON();
          out.hidden = false;
          try { await navigator.clipboard.writeText(out.value); U.toast('Копия скопирована в буфер обмена'); }
          catch (e) { out.select(); U.toast('Выделите текст и скопируйте вручную'); }
        } }, 'Скопировать копию'),
        inFrame() ? null : h('button', { class: 'btn sm', type: 'button', onclick: () => {
          const blob = new Blob([St.exportJSON()], { type: 'application/json' });
          const a = h('a', { href: URL.createObjectURL(blob), download: 'english-zero-' + U.dayKey() + '.json' });
          document.body.append(a); a.click(); a.remove();
        } }, 'Скачать файл'),
        h('button', { class: 'btn sm', type: 'button', onclick: () => { inp.hidden = false; inp.focus(); } }, 'Восстановить'),
        h('button', { class: 'btn sm ghost', type: 'button', onclick: () => file.click() }, 'Из файла')),
      out, inp, file,
      h('button', { class: 'btn sm primary', type: 'button', onclick: async () => {
        if (inp.hidden || !inp.value.trim()) { inp.hidden = false; U.toast('Сначала вставьте копию'); return; }
        const ok = await U.confirm({ title: 'Восстановить прогресс?', text: 'Текущий прогресс на этом устройстве будет заменён копией.', ok: 'Восстановить', danger: true });
        if (!ok) return;
        try { St.importJSON(inp.value.trim()); A.App.applyTheme(); U.toast('Прогресс восстановлен'); A.App.show('home'); }
        catch (e) { U.toast('Не получилось: ' + e.message); }
      } }, 'Применить копию'));
  }

  async function resetAll() {
    const ok = await U.confirm({ title: 'Сбросить весь прогресс?', text: 'Уроки, слова, серия и награды будут удалены. Настройки останутся.', ok: 'Сбросить', danger: true });
    if (!ok) return;
    St.reset();
    U.toast('Прогресс сброшен');
    A.App.show('home');
  }

  // ---------- Plan (implementation intention) ----------
  function planOptions(onPick) {
    const p = St.state.settings.plan;
    const custom = h('input', { type: 'text', id: 'plan-custom', class: 'search', placeholder: 'Например: «Когда я сажусь в автобус»', value: p.custom || '', hidden: p.when !== 'custom' });
    custom.oninput = () => { p.custom = custom.value; St.saveSoon(); onPick(); };
    const list = h('div', { class: 'choice-list' });
    const draw = () => list.replaceChildren(...PLAN_OPTIONS.concat([{ id: 'custom', t: 'Свой вариант', s: 'Напишите сами' }]).map(o => h('button', {
      class: 'choice' + (p.when === o.id ? ' on' : ''), type: 'button',
      onclick: () => { p.when = o.id; custom.hidden = o.id !== 'custom'; if (!custom.hidden) custom.focus(); St.save(); draw(); onPick(); }
    }, h('span', {}, h('b', {}, o.t), h('span', {}, o.s)))));
    draw();
    return h('div', { class: 'stack' }, list, custom);
  }
  function planSheet(after) {
    const prev = h('div', { class: 'plan-preview' });
    const upd = () => { const t = Scr.planText(); prev.innerHTML = t ? 'Ваш план: <b>' + U.escape(t) + '</b>' : 'Выберите момент дня'; };
    upd();
    U.sheet(h('div', { class: 'stack' }, h('h2', { class: 'h2' }, 'Когда вы будете заниматься?'), planOptions(upd), prev,
      h('button', { class: 'btn primary block', type: 'button', onclick: () => { U.closeSheet(); if (after) after(); } }, 'Готово')));
  }

  // ---------- Science ----------
  const SCIENCE = [
    ['Проверка себя вместо перечитывания', 'Почти всё в курсе — это задания, где нужно вспомнить ответ. Попытка вспомнить укрепляет память сильнее, чем повторное чтение: в классическом эксперименте через неделю помнили 61% против 40%.', 'Roediger & Karpicke, 2006; Dunlosky et al., 2013 — «высокая полезность»'],
    ['Интервальные повторения', 'Слова возвращаются, когда начинают забываться, и перерывы растут. Расписание считает алгоритм FSRS — по открытым тестам на сотнях миллионов повторений он точнее классического SM-2.', 'Cepeda et al., 2006 (839 измерений); open-spaced-repetition benchmark'],
    ['Сначала звуки и буквы', 'Систематическая фоника — обучение связи букв и звуков и сложению звуков в слова — помогает научиться читать. Поэтому мы читаем настоящие слова уже на первом уроке.', 'National Reading Panel, 2000; Ehri et al., 2001'],
    ['Картинки вместо перевода', 'Слова, выученные с картинкой, вспоминаются лучше, чем выученные через перевод. Поэтому у слов есть картинки, а перевод — подсказка.', 'Carpenter & Olson, 2012; исследования picture superiority effect'],
    ['Разные голоса для трудных звуков', 'Чтобы слышать разницу между ship и sheep, полезно слушать её разными голосами и сразу получать ответ, верно ли. Это метод HVPT — у него средний и большой эффект.', 'Uchihara, Karas & Thomson, 2025 — мета-анализ 79 исследований'],
    ['Трудности русскоговорящих', 'Отдельно тренируем то, чего нет в русском: th, разницу w и v, долгие и короткие гласные, артикли и глагол am/is/are.', 'Сопоставительная фонетика и грамматика русского и английского'],
    ['Говорить вслух', 'Распознавание речи с обратной связью улучшает произношение (средний эффект). Микрофон можно выключить в любой момент.', 'Ngo, Chen & Lai, 2024 — мета-анализ, g = 0.69'],
    ['Объяснение, а не только ответ', 'При ошибке приложение объясняет, почему вариант не подходит: «с I всегда am», «ee — долгое и-и». Развёрнутая обратная связь помогает сильнее, чем просто «верно / неверно».', 'Van der Kleij, Feskens & Eggen, 2015 — мета-анализ обратной связи в обучающих программах'],
    ['Слушать и повторять (shadowing)', 'В задании «Послушайте и повторите» вы записываете себя и сразу слышите образец и свой голос. Такое повторение за диктором улучшает понятность речи и беглость.', 'Foote & McDonough, 2017; Hamada, 2016'],
    ['Правило на разных примерах', 'Грамматика тренируется на всё новых предложениях, а не на одной заученной фразе. Разнообразные примеры помогают переносить правило на новые случаи.', 'Raviv, Lupyan & Green, 2022 — обзор о вариативности в обучении'],
    ['Разговор с обратной связью', 'Диалоги и сценки с ИИ — это общение, где собеседник мягко исправляет ошибки. Такое взаимодействие с исправлениями ускоряет освоение языка.', 'Mackey & Goo, 2007 — мета-анализ исследований взаимодействия'],
    ['Ошибки — часть обучения','Учиться быстрее всего, когда получается примерно 85% ответов. Поэтому ошибки не наказываются: задание просто вернётся чуть позже и в более лёгком виде.', 'Wilson et al., 2019, Nature Communications'],
    ['Игра и история', 'Очки, серии и награды в среднем улучшают и знания, и мотивацию, особенно когда есть сюжет. Поэтому у курса есть маршрут и героиня Анна.', 'Sailer & Homner, 2020 — мета-анализ геймификации'],
    ['План «когда и где»', 'Фраза «Когда я пью кофе, я открываю английский» повышает шанс заниматься регулярно. Привычка складывается в среднем за 66 дней, и один пропуск её не ломает.', 'Gollwitzer & Sheeran, 2006; Lally et al., 2010'],
    ['Частотные слова и истории', 'Сначала учим самые нужные слова, а затем читаем короткие истории из выученных слов: такое чтение расширяет словарь.', 'Nation, 2006; Nakanishi, 2015 — мета-анализ extensive reading']
  ];
  Scr.science = function (main) {
    main.replaceChildren(
      h('div', { class: 'back-row' }, h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Назад', html: U.icon('back'), onclick: () => A.App.show('profile') }), h('span', { class: 'label' }, 'Профиль')),
      h('h1', { class: 'h1' }, 'Почему это работает'),
      h('p', { class: 'muted', style: 'margin:6px 0 16px' }, 'Курс построен на исследованиях о том, как люди учат языки и запоминают надолго.'),
      h('div', { class: 'sci' }, SCIENCE.map(([t, p, src]) => h('div', { class: 'sci-item' }, h('h3', {}, t), h('p', {}, p), h('div', { class: 'src' }, src)))));
  };

  // ---------- Onboarding ----------
  Scr.onboarding = function (main) {
    let step = 0;
    const s = St.state;
    const steps = [welcome, sound, how, goal, plan];
    function dots() { return h('div', { class: 'dots' }, steps.map((_, i) => h('i', { class: i === step ? 'on' : '' }))); }
    function go(n) { step = n; render(); }
    function render() { main.replaceChildren(steps[step]()); main.scrollTop = 0; }

    function welcome() {
      return h('div', { class: 'onb' },
        h('div', { class: 'onb-hero' },
          h('div', { class: 'onb-glyphs' }, h('span', { class: 'g1' }, 'Aa'), h('span', { class: 'g2' }, '→'), h('span', { class: 'g3' }, 'Hello!')),
          h('h1', { class: 'onb-title' }, 'Английский с нуля'),
          h('p', { class: 'onb-lead' }, 'От первой буквы до первых разговоров. Не нужно ничего знать заранее — даже как читаются английские буквы.')),
        h('div', { class: 'card flat stack' },
          h('p', {}, 'Вас ждёт маршрут из ' + C.units.length + ' ' + U.plural(C.units.length, ['станции', 'станций', 'станций']) + ': буквы и звуки, слова, фразы для поездок, работы и жизни за границей, и истории про Анну, которая переезжает в Нью-Йорк.')),
        h('div', { class: 'onb-foot' }, dots(), h('button', { class: 'btn primary block', type: 'button', onclick: () => go(1) }, 'Начать')));
    }
    function sound() {
      const au = h('button', { class: 'au', type: 'button', 'aria-label': 'Прослушать', html: U.icon('speaker') });
      au.onclick = () => { au.classList.add('playing'); Sp.speak('Hello! Welcome! Let’s learn English.').then(() => au.classList.remove('playing')); };
      const help = h('div', { class: 'notice', hidden: true },
        'Проверьте громкость и не выключен ли звук у вкладки браузера. Подождите пару секунд, пока загрузится озвучка, и нажмите ещё раз. Голос можно сменить позже в профиле.');
      return h('div', { class: 'onb' },
        h('h1', { class: 'h1' }, 'Проверим звук'),
        h('p', { class: 'onb-lead' }, 'Английский мы будем в основном слушать. Нажмите на кнопку и включите звук.'),
        h('div', { class: 'prompt', style: 'padding:24px 0' }, au),
        help,
        h('div', { class: 'onb-foot' }, dots(),
          h('button', { class: 'btn primary block', type: 'button', onclick: () => go(2) }, 'Слышу'),
          h('button', { class: 'btn ghost block', type: 'button', onclick: () => { help.hidden = false; } }, 'Ничего не слышно')));
    }
    function how() {
      const item = (lc, n, t, p) => h('div', { class: 'how-item', style: '--lc:' + lc }, h('div', { class: 'n' }, n), h('div', {}, h('b', {}, t), h('p', {}, p)));
      return h('div', { class: 'onb' },
        h('h1', { class: 'h1' }, 'Как устроено обучение'),
        h('div', { class: 'how' },
          item('var(--read)', 'a', 'Сначала звуки — потом слова', 'Учим, как звучат буквы, и сразу читаем настоящие слова.'),
          item('var(--talk)', 'Hi', 'Короткие уроки каждый день', '5–15 минут. Слова возвращаются на повторение, как раз когда начинают забываться.'),
          item('var(--gram)', '?', 'Ошибки — это нормально', 'Неверный ответ не наказывается: задание вернётся позже. Так запоминается лучше.'),
          item('var(--story)', '1', 'Истории про Анну', 'Читаете и слушаете, как Анна переезжает в Нью-Йорк, — только знакомыми словами.')),
        h('div', { class: 'onb-foot' }, dots(), h('button', { class: 'btn primary block', type: 'button', onclick: () => go(3) }, 'Понятно')));
    }
    function goal() {
      const list = h('div', { class: 'choice-list' });
      const draw = () => list.replaceChildren(...GOALS.map(g => h('button', {
        class: 'choice' + (s.settings.goal === g.xp ? ' on' : ''), type: 'button',
        onclick: () => { s.settings.goal = g.xp; St.save(); draw(); }
      }, h('span', {}, h('b', {}, g.t), h('span', {}, g.s)), h('span', { class: 'xp' }, g.xp + ' XP'))));
      draw();
      return h('div', { class: 'onb' },
        h('h1', { class: 'h1' }, 'Сколько времени в день?'),
        h('p', { class: 'onb-lead' }, 'Лучше понемногу каждый день, чем много раз в неделю. Цель можно поменять в любой момент.'),
        list,
        h('div', { class: 'onb-foot' }, dots(), h('button', { class: 'btn primary block', type: 'button', onclick: () => go(4) }, 'Дальше')));
    }
    function plan() {
      const prev = h('div', { class: 'plan-preview' });
      const upd = () => { const t = Scr.planText(); prev.innerHTML = t ? 'Ваш план: <b>' + U.escape(t) + '</b>' : 'Выберите момент дня — и мы сложим из него план.'; };
      upd();
      return h('div', { class: 'onb' },
        h('h1', { class: 'h1' }, 'Когда вы будете заниматься?'),
        h('p', { class: 'onb-lead' }, 'Привяжите урок к тому, что вы и так делаете каждый день. Такой план заметно повышает шанс не бросить.'),
        planOptions(upd), prev,
        h('div', { class: 'onb-foot' }, dots(),
          h('button', { class: 'btn primary block', type: 'button', onclick: finish }, 'Начать первый урок'),
          h('button', { class: 'btn ghost block', type: 'button', onclick: () => { s.onboarded = true; St.save(); A.App.show('home'); } }, 'Сначала посмотреть маршрут')));
    }
    function finish() {
      s.onboarded = true;
      St.save();
      A.App.show('home');
      const l = C.nextLesson();
      if (l) A.Lesson.startLesson(l);
    }
    render();
  };
})(window.A);
