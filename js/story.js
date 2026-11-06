'use strict';
// Story reader: lines appear one at a time with audio; every word can be tapped for a translation.
// Ends with a few comprehension questions.
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
  const sayLine = line => Sp.speak(line[1], { voice: voiceFor(line[0]) });

  let popT;
  function gloss(word, wEl) {
    const tr = C.gloss(word);
    U.$$('.w.on').forEach(x => x.classList.remove('on'));
    wEl.classList.add('on');
    Sp.speak(word.replace(/[.,!?]/g, ''));
    let pop = U.$('.gloss-pop');
    if (pop) pop.remove();
    pop = h('div', { class: 'gloss-pop', role: 'status' }, h('span', { class: 'en' }, word.replace(/[.,!?]/g, '')), h('span', {}, tr ? '— ' + tr : '— (имя или новое слово)'));
    document.body.append(pop);
    clearTimeout(popT);
    popT = setTimeout(() => { pop.remove(); wEl.classList.remove('on'); }, 2600);
  }

  function bubble(line) {
    const [who, en, ru] = line;
    const side = who === 'Anna' ? ' right' : who ? '' : ' narr';
    const enEl = h('div', { class: 'line-en en' });
    en.split(/(\s+)/).forEach(tok => {
      if (/^\s+$/.test(tok)) enEl.append(tok);
      else {
        const w = h('span', { class: 'w', role: 'button', tabindex: '0' }, tok);
        w.onclick = () => gloss(tok, w);
        enEl.append(w);
      }
    });
    const ruEl = h('div', { class: 'line-ru', hidden: true }, ru);
    const play = X().auBtn(en, { cls: 'xs' });
    play.onclick = () => sayLine(line);
    const tr = h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { ruEl.hidden = !ruEl.hidden; } }, 'Перевод');
    return h('div', { class: 'bubble' + side }, who ? h('div', { class: 'who' }, who) : null, enEl, ruEl, h('div', { class: 'line-tools' }, play, tr));
  }
  const X = () => A.Ex;

  Story.start = function (lesson) {
    const story = A.DATA.stories[lesson.story];
    T = { lesson, story, shown: 0, q: -1, correct: 0, t0: Date.now(), finished: false };
    A.App.enterFocus();
    el = A.Lesson.shell(askExit);
    cover();
  };

  async function askExit() {
    if (!T || T.finished) { A.App.exitFocus(); return; }
    const ok = await U.confirm({ title: 'Закрыть историю?', text: 'Её можно будет прочитать заново в любой момент.', ok: 'Закрыть', cancel: 'Читать дальше' });
    if (ok) { Sp.stop(); T = null; A.App.exitFocus(); }
  }
  Story.askExit = askExit;
  Story.active = () => !!T && !T.finished;

  const total = () => T.story.lines.length + T.story.questions.length;
  const progress = done => { el.progress.style.width = Math.round(done / total() * 100) + '%'; };

  function cover() {
    const s = T.story;
    const who = [...new Set(s.lines.map(l => l[0]).filter(Boolean))];
    el.body.replaceChildren(h('div', { class: 'stack' },
      h('div', { class: 'story-cover' },
        h('div', { class: 'label' }, 'История'),
        h('h1', { class: 'h1' }, s.title),
        h('p', {}, s.intro),
        h('p', { class: 'small' }, 'Герои: ' + who.join(', '))),
      h('div', { class: 'intro-hint' }, 'Слушайте каждую реплику. ', h('b', {}, 'Нажмите на любое слово'), ' — увидите перевод. Кнопка «Перевод» показывает всю фразу, но сначала попробуйте понять сами.')));
    progress(0);
    el.cta.textContent = 'Читать';
    el.cta.onclick = nextLine;
  }

  let list;
  function nextLine() {
    const s = T.story;
    if (T.shown === 0) {
      list = h('div', { class: 'story-lines' });
      el.body.replaceChildren(h('div', { class: 'ex-title' }, s.title), list);
    }
    if (T.shown < s.lines.length) {
      const line = s.lines[T.shown];
      const b = bubble(line);
      list.append(b);
      T.shown++;
      progress(T.shown);
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
    if (T.q >= s.questions.length) { finish(); return; }
    progress(s.lines.length + T.q);
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
      h('details', { class: 'muted small' }, h('summary', {}, 'Перечитать историю'),
        h('div', { class: 'story-lines', style: 'margin-top:10px' }, s.lines.map(bubble)))));
    U.$('#main').scrollTop = 0;
    el.fb.hidden = true;
    el.foot.className = 'lesson-foot';
    el.cta.textContent = 'Проверить';
    el.cta.disabled = true;
    el.cta.onclick = () => {
      const ok = opts[sel] === right;
      btns.forEach((b, j) => { b.disabled = true; b.classList.remove('sel'); b.classList.add(opts[j] === right ? 'ok' : j === sel ? 'bad' : 'dim'); });
      if (ok) { T.correct++; U.sfx('ok'); U.vibrate(12); } else { U.sfx('bad'); U.vibrate([30, 40, 30]); }
      el.foot.className = 'lesson-foot ' + (ok ? 'good' : 'bad');
      el.fb.replaceChildren(h('div', { class: 'fb-ico', html: U.icon(ok ? 'check' : 'x') }),
        h('div', { class: 'grow' }, h('div', { class: 'fb-title' }, ok ? 'Верно!' : 'Правильный ответ:'), ok ? null : h('div', { class: 'fb-body' }, right)));
      el.fb.hidden = false;
      el.cta.textContent = 'Дальше';
      el.cta.onclick = question;
    };
  }

  function finish() {
    const stt = St.state;
    const secs = (Date.now() - T.t0) / 1000;
    const n = T.story.questions.length;
    const xp = 10 + T.correct * 2;
    const was = C.unitComplete(T.lesson.unit);
    stt.lessons[T.lesson.key] = { at: Date.now(), acc: Math.round(T.correct / n * 100) };
    stt.stats.stories++;
    stt.stats.answered += n;
    stt.stats.correct += T.correct;
    const ev = A.Progress.addXP(xp, secs);
    const badges = A.Progress.checkBadges();
    St.save();
    T.finished = true;
    A.Lesson.finishView({
      label: 'История · ' + T.story.title, xp, acc: Math.round(T.correct / n * 100), secs, fresh: 0,
      perfect: T.correct === n, ev, badges, unitDone: !was
    });
  }
})(window.A);
