'use strict';
// Story reader: lines appear one at a time with audio; every word can be tapped for a translation.
// Ends with a few comprehension questions.
// Dialogues add a role-play: after listening, the learner plays Anna and picks her replies.
(function (A) {
  const U = A.U, h = U.h, C = A.Course, Sp = A.Speech, St = A.Store;
  const Story = A.Story = {};
  let T = null;
  let el = null;

  function voiceFor(who) {
    const vs = Sp.voices();
    if (!vs.length || who === 'Anna' || !who) return null;
    let hsh = 0;
    for (const ch of who) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
    const def = Sp.defaultVoice();
    const others = vs.filter(v => v !== def);
    return others.length ? others[hsh % others.length] : null;
  }
  const sayLine = line => Sp.speak(line[1], { clip: 'story|' + U.audioKey(line[1]), voice: voiceFor(line[0]) });

  let popT;
  function gloss(word, wEl) {
    const tr = C.gloss(word);
    U.$$('.w.on').forEach(x => x.classList.remove('on'));
    wEl.classList.add('on');
    const clean = word.replace(/[.,!?“”"]/g, '');
    Sp.speak(clean);
    let pop = U.$('.gloss-pop');
    if (pop) pop.remove();
    pop = h('div', { class: 'gloss-pop', role: 'status' }, h('span', { class: 'en' }, clean), h('span', {}, tr ? '— ' + tr : '— (имя или новое слово)'));
    document.body.append(pop);
    clearTimeout(popT);
    popT = setTimeout(() => { pop.remove(); wEl.classList.remove('on'); }, 2600);
  }

  function bubble(line, opt) {
    opt = opt || {};
    const [who, en, ru] = line;
    const side = who === 'Anna' ? ' right' : who ? '' : ' narr';
    const enEl = h('div', { class: 'line-en en' });
    en.split(/(\s+)/).forEach(tok => {
      if (/^\s+$/.test(tok)) enEl.append(tok);
      else {
        const w = h('span', { class: 'w', role: 'button', tabindex: '0' }, tok);
        w.onclick = () => { if (!b.classList.contains('masked')) gloss(tok, w); };
        enEl.append(w);
      }
    });
    const ruEl = h('div', { class: 'line-ru', hidden: true }, ru);
    const play = A.Ex.auBtn(en, { cls: 'xs' });
    play.onclick = () => sayLine(line);
    const tr = h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { ruEl.hidden = !ruEl.hidden; } }, 'Перевод');
    const label = who === 'Anna' && T && T.dialog ? 'Anna (вы)' : who;
    const b = h('div', { class: 'bubble' + side + (opt.masked ? ' masked' : '') }, who ? h('div', { class: 'who' }, label) : null, enEl, ruEl, h('div', { class: 'line-tools' }, play, tr));
    return b;
  }

  Story.start = function (lesson) {
    const story = A.DATA.stories[lesson.story];
    const dialog = story.type === 'dialog';
    const roleLines = dialog ? story.lines.filter(l => l[0] === story.role).length : 0;
    T = { lesson, story, dialog, shown: 0, q: -1, correct: 0, roleOk: 0, roleTotal: roleLines, t0: Date.now(), finished: false, done: 0 };
    T.total = story.lines.length + story.questions.length + roleLines;
    A.App.enterFocus();
    el = A.Lesson.shell(askExit);
    cover();
  };

  async function askExit() {
    if (!T || T.finished) { A.App.exitFocus(); return; }
    const ok = await U.confirm({ title: T.dialog ? 'Закрыть диалог?' : 'Закрыть историю?', text: 'Его можно будет пройти заново в любой момент.', ok: 'Закрыть', cancel: 'Продолжить' });
    if (ok) { Sp.stop(); T = null; A.App.exitFocus(); }
  }
  Story.askExit = askExit;
  Story.active = () => !!T && !T.finished;

  const step = () => { T.done++; el.progress.style.width = Math.round(T.done / T.total * 100) + '%'; };
  function resetFoot() {
    el.fb.hidden = true;
    el.foot.className = 'lesson-foot';
    el.cta.hidden = false;
    el.cta.disabled = false;
  }

  function cover() {
    const s = T.story;
    const who = [...new Set(s.lines.map(l => l[0]).filter(Boolean))];
    el.body.replaceChildren(h('div', { class: 'stack' },
      h('div', { class: 'story-cover' + (T.dialog ? ' dial' : '') },
        h('div', { class: 'label' }, T.dialog ? 'Диалог' : 'История'),
        h('h1', { class: 'h1' }, s.title),
        h('p', {}, s.intro),
        h('p', { class: 'small' }, (T.dialog ? 'Участники: ' : 'Герои: ') + who.join(', '))),
      T.dialog
        ? h('div', { class: 'intro-hint' }, 'Три шага: ', h('b', {}, 'послушайте'), ' разговор (текст скрыт — попробуйте понять на слух), ', h('b', {}, 'ответьте'), ' на вопросы и ', h('b', {}, 'сыграйте Анну'), ': выбирайте её реплики.')
        : h('div', { class: 'intro-hint' }, 'Слушайте каждую реплику. ', h('b', {}, 'Нажмите на любое слово'), ' — увидите перевод. Кнопка «Перевод» показывает всю фразу, но сначала попробуйте понять сами.')));
    el.progress.style.width = '0%';
    resetFoot();
    el.cta.textContent = T.dialog ? 'Слушать' : 'Читать';
    el.cta.onclick = nextLine;
  }

  let list, showText = false;
  function nextLine() {
    const s = T.story;
    if (T.shown === 0) {
      list = h('div', { class: 'story-lines' });
      showText = !T.dialog;
      const toggle = T.dialog ? h('button', {
        class: 'btn sm', type: 'button',
        onclick: e => { showText = !showText; U.$$('.bubble', list).forEach(b => b.classList.toggle('masked', !showText)); e.currentTarget.textContent = showText ? 'Скрыть текст' : 'Показать текст'; }
      }, 'Показать текст') : null;
      el.body.replaceChildren(h('div', { class: 'row', style: 'justify-content:space-between;margin-bottom:12px' }, h('div', { class: 'ex-title', style: 'margin:0' }, T.dialog ? 'Слушаем' : s.title), toggle), list);
    }
    if (T.shown < s.lines.length) {
      const line = s.lines[T.shown];
      const b = bubble(line, { masked: T.dialog && !showText });
      list.append(b);
      T.shown++;
      step();
      sayLine(line);
      setTimeout(() => b.scrollIntoView({ behavior: 'smooth', block: 'end' }), 30);
      el.cta.textContent = T.shown < s.lines.length ? 'Дальше' : 'К вопросам';
      return;
    }
    question();
  }

  function question() {
    T.q++;
    const s = T.story;
    if (T.q >= s.questions.length) { if (T.dialog) roleIntro(); else finish(); return; }
    const [q, right, ...wrong] = s.questions[T.q];
    const opts = U.shuffle([right, ...wrong]);
    let sel = -1;
    const btns = opts.map((o, i) => h('button', {
      class: 'opt ru-opt', type: 'button',
      onclick: () => { sel = i; btns.forEach((b, j) => b.classList.toggle('sel', j === i)); el.cta.disabled = false; U.sfx('tap'); }
    }, o));
    el.body.replaceChildren(h('div', { class: 'ex' },
      h('div', { class: 'label' }, 'Вопрос ' + (T.q + 1) + ' из ' + s.questions.length),
      h('div', { class: 'ex-title' }, q),
      h('div', { class: 'opts list' }, btns),
      h('details', { class: 'muted small' }, h('summary', {}, T.dialog ? 'Послушать и прочитать разговор' : 'Перечитать историю'),
        h('div', { class: 'story-lines', style: 'margin-top:10px' }, s.lines.map(l => bubble(l))))));
    U.$('#main').scrollTop = 0;
    resetFoot();
    el.cta.textContent = 'Проверить';
    el.cta.disabled = true;
    el.cta.onclick = () => {
      const ok = opts[sel] === right;
      btns.forEach((b, j) => { b.disabled = true; b.classList.remove('sel'); b.classList.add(opts[j] === right ? 'ok' : j === sel ? 'bad' : 'dim'); });
      if (ok) { T.correct++; U.sfx('ok'); U.vibrate(12); } else { U.sfx('bad'); U.vibrate([30, 40, 30]); }
      step();
      feedback(ok, ok ? null : right);
      el.cta.textContent = 'Дальше';
      el.cta.onclick = question;
    };
  }

  function feedback(ok, rightText, isEn) {
    el.foot.className = 'lesson-foot ' + (ok ? 'good' : 'bad');
    U.fill(el.fb, h('div', { class: 'fb-ico', html: U.icon(ok ? 'check' : 'x') }),
      h('div', { class: 'grow' }, h('div', { class: 'fb-title' }, ok ? 'Верно!' : 'Правильный ответ:'),
        ok ? null : h('div', { class: 'fb-body' + (isEn ? ' en' : '') }, rightText)));
    el.fb.hidden = false;
  }

  // ---------- Role-play (dialogues) ----------
  let roleList, roleIdx;
  function roleIntro() {
    el.body.replaceChildren(h('div', { class: 'stack' },
      h('div', { class: 'story-cover dial' }, h('div', { class: 'label' }, 'Шаг 3'), h('h1', { class: 'h1' }, 'Теперь вы — Анна'),
        h('p', {}, 'Собеседник говорит свои реплики, а вы выбираете, что ответить. Правильная реплика прозвучит — повторяйте её вслух.')),
      h('div', { class: 'intro-hint' }, 'Не бойтесь ошибиться: верный вариант покажем сразу.')));
    resetFoot();
    el.cta.textContent = 'Начать';
    roleIdx = 0;
    roleList = h('div', { class: 'story-lines' });
    el.cta.onclick = () => { el.body.replaceChildren(h('div', { class: 'ex-title' }, 'Ваша роль'), roleList); roleNext(); };
  }

  function replyOptions(line) {
    const role = T.story.role;
    const same = T.story.lines.filter(l => l[0] === role && l[1] !== line[1]).map(l => l[1]);
    const other = [].concat(...Object.values(A.DATA.stories).filter(s => s.type === 'dialog' && s !== T.story)
      .map(s => s.lines.filter(l => l[0] === role).map(l => l[1])));
    const picks = U.sample(same, 1).concat(U.sample(other.filter(x => x !== line[1]), 1));
    return U.shuffle([line[1]].concat(picks));
  }

  function roleNext() {
    const s = T.story;
    resetFoot();
    if (roleIdx >= s.lines.length) { finish(); return; }
    const line = s.lines[roleIdx];
    if (line[0] !== s.role) {
      const b = bubble(line);
      roleList.append(b);
      sayLine(line);
      setTimeout(() => b.scrollIntoView({ behavior: 'smooth', block: 'end' }), 30);
      roleIdx++;
      el.cta.textContent = 'Дальше';
      el.cta.onclick = roleNext;
      return;
    }
    const opts = replyOptions(line);
    let sel = -1;
    const box = h('div', { class: 'reply-box' }, h('div', { class: 'label' }, 'Что ответит Анна?'));
    const btns = opts.map((o, i) => h('button', {
      class: 'opt word-opt en reply-opt', type: 'button',
      onclick: () => { sel = i; btns.forEach((b, j) => b.classList.toggle('sel', j === i)); el.cta.disabled = false; U.sfx('tap'); }
    }, o));
    box.append(h('div', { class: 'opts list' }, btns));
    roleList.append(box);
    setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'end' }), 30);
    el.cta.textContent = 'Ответить';
    el.cta.disabled = true;
    el.cta.onclick = () => {
      const ok = opts[sel] === line[1];
      if (ok) { T.roleOk++; U.sfx('ok'); U.vibrate(12); } else { U.sfx('bad'); U.vibrate([30, 40, 30]); }
      box.replaceWith(bubble(line));
      step();
      feedback(ok, line[1], true);
      setTimeout(() => sayLine(line), ok ? 250 : 450);
      roleIdx++;
      el.cta.textContent = 'Дальше';
      el.cta.onclick = roleNext;
    };
  }

  function finish() {
    const stt = St.state;
    const secs = (Date.now() - T.t0) / 1000;
    const n = T.story.questions.length + T.roleTotal;
    const good = T.correct + T.roleOk;
    const xp = 10 + good * 2;
    const was = C.unitComplete(T.lesson.unit);
    stt.lessons[T.lesson.key] = { at: Date.now(), acc: Math.round(good / n * 100) };
    if (T.dialog) stt.stats.dialogs = (stt.stats.dialogs || 0) + 1; else stt.stats.stories++;
    stt.stats.answered += n;
    stt.stats.correct += good;
    const ev = A.Progress.addXP(xp, secs);
    const badges = A.Progress.checkBadges();
    St.save();
    T.finished = true;
    A.Lesson.finishView({
      label: (T.dialog ? 'Диалог · ' : 'История · ') + T.story.title, xp, acc: Math.round(good / n * 100), secs, fresh: 0,
      perfect: good === n, ev, badges, unitDone: !was
    });
  }
})(window.A);
