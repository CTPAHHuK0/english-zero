'use strict';
// Exercise builders. Each builder returns an object:
//   { title, view(api) -> Node, check() -> {ok}, autoplay?, sayAfter?, fb?, auto? }
// api.ready(bool) enables the Check button; api.done(result) finishes exercises without it.
(function (A) {
  const U = A.U, h = U.h;
  const C = A.Course, Sp = A.Speech;
  const X = A.Ex = {};

  // Words that sound the same must never be offered as alternatives in listening tasks
  const HOMO = [['see', 'sea'], ['be', 'bee'], ['to', 'two', 'too'], ['here', 'hear'], ['no', 'know'], ['right', 'write'],
    ['for', 'four'], ['one', 'won'], ['son', 'sun'], ['eight', 'ate'], ['meat', 'meet'], ['by', 'bye', 'buy'], ['i', 'eye'],
    ['tea', 'tee'], ['there', 'their'], ['our', 'hour'], ['red', 'read'], ['wait', 'weight'], ['mail', 'male'], ['road', 'rode'],
    ['nose', 'knows'], ['rose', 'rows'], ['cell', 'sell'], ['ant', 'aunt'], ['cent', 'sent'], ['sum', 'some'], ['night', 'knight'], ['plane', 'plain']];
  const homoOf = {};
  HOMO.forEach(g => g.forEach(w => { homoOf[w] = g; }));
  const isHomo = (a, b) => { const g = homoOf[String(a).toLowerCase()]; return !!g && g.includes(String(b).toLowerCase()); };

  // Letters that share a sound (avoid offering them as "wrong" answers to each other)
  const SOUND = { c: 'k', k: 'k', ck: 'k', q: 'k', ee: 'i:', ea: 'i:', ai: 'ei', ay: 'ei', a_e: 'ei', oa: 'ou', ow: 'ou', o_e: 'ou', igh: 'ai', y_end: 'ai', i_e: 'ai', ou: 'au', ow2: 'au', x: 'ks' };
  const soundOf = L => SOUND[L.id.slice(2)] || L.id;

  const LETTER_CONF = { b: 'dpq', d: 'bpq', p: 'qbd', q: 'pgd', n: 'umh', u: 'nvy', m: 'nw', w: 'mv', i: 'ljt', l: 'ijt', j: 'ig', g: 'qj', h: 'nk', v: 'uwy', y: 'vj', e: 'ca', a: 'eo', o: 'ac', c: 'eo', r: 'nt', t: 'lf', f: 'tl', s: 'zc', z: 'sx', x: 'zk', k: 'xh' };
  const NAME_CONF = { A: 'ERHI', B: 'VDPE', C: 'SZKE', D: 'BTEG', E: 'IAYG', F: 'SVHX', G: 'JZDE', H: 'AKEX', I: 'EYAR', J: 'GAKY', K: 'QCAJ', L: 'MNEF', M: 'NLE', N: 'MLE', O: 'UAQ', P: 'BTDE', Q: 'KUCW', R: 'AEIO', S: 'FXCZ', T: 'DPEB', U: 'YWQO', V: 'BZWE', W: 'VYUD', X: 'SKZE', Y: 'WIUE', Z: 'CGSE' };
  const GRAPHEMES = ['igh', 'sh', 'ch', 'th', 'ck', 'ng', 'ee', 'ea', 'oo', 'ai', 'ay', 'oa', 'ow', 'ou', 'ar', 'or', 'er', 'ir', 'ur', 'qu'];

  X.nameSay = ch => ch.toUpperCase() + '.';

  // ---------- small view helpers ----------
  function play(btn, text, opt) {
    btn.classList.add('playing');
    const f = opt && opt.varied ? Sp.speakVaried : Sp.speak;
    f(text, opt).then(() => btn.classList.remove('playing'));
  }
  function auBtn(text, opt) {
    opt = opt || {};
    const b = h('button', { class: 'au' + (opt.cls ? ' ' + opt.cls : ''), type: 'button', 'aria-label': 'Прослушать', html: U.icon('speaker') });
    b.onclick = () => play(b, typeof text === 'function' ? text() : text, opt);
    return b;
  }
  function slowBtn(text, opt) {
    const b = h('button', { class: 'au slow', type: 'button', 'aria-label': 'Медленно', title: 'Медленно' }, '🐢');
    b.onclick = () => play(b, typeof text === 'function' ? text() : text, Object.assign({}, opt, { slow: true }));
    return b;
  }
  function audioRow(text, opt) { return h('div', { class: 'audio-row' }, auBtn(text, opt), slowBtn(text, opt)); }
  X.auBtn = auBtn;
  X.slowBtn = slowBtn;
  function picNode(pic) { return h('div', { class: 'pic' + (U.isTextPic(pic) ? ' txt' : '') }, pic); }
  X.picNode = picNode;
  const sizeCls = t => t.length > 22 ? ' sm' : t.length > 9 ? ' md' : '';
  function wordNode(t) { return h('div', { class: 'bigword en' + sizeCls(t) }, t); }
  const fbOf = it => ({ en: it.en, ru: it.ru });
  const family = k => (k === 'phrase' || k === 'sent') ? ['phrase', 'sent'] : [k];

  const tokenize = U.tokenize;

  // ---------- distractors ----------
  function pool(item, ctx, test) {
    const out = [], seen = new Set([item.id]);
    const push = it => { if (it && !seen.has(it.id) && test(it)) { seen.add(it.id); out.push(it); } };
    U.shuffle(ctx.knownIds).forEach(id => push(C.items[id]));
    const maxU = ctx.unitIndex == null ? 999 : ctx.unitIndex + 1;
    const rest = U.shuffle(C.list);
    rest.forEach(it => { const ui = C.unitIndex[it.unit]; if (ui != null && ui <= maxU) push(it); });
    rest.forEach(push);
    return out;
  }
  function distract(item, ctx, n, test, key) {
    const used = new Set([key(item)]);
    const res = [];
    for (const it of pool(item, ctx, test)) {
      const k = key(it);
      if (!k || used.has(k)) continue;
      if (item.en && it.en && isHomo(item.en, it.en)) continue;
      used.add(k);
      res.push(it);
      if (res.length >= n) break;
    }
    return res;
  }

  function syllables(w) { return (w.replace(/e$/, '').match(/[aeiouy]+/g) || []).length || 1; }
  function similar(w, ctx) {
    const c = new Map();
    const add = (s, sc) => {
      if (s && s !== w && !isHomo(w, s) && /^[a-z]+$/.test(s) && (!c.has(s) || c.get(s) > sc)) c.set(s, sc);
    };
    C.list.forEach(it => {
      if (it.kind !== 'word') return;
      const e = it.en.toLowerCase();
      if (!/^[a-z]+$/.test(e) || Math.abs(e.length - w.length) > 1) return;
      const d = U.lev(e, w);
      if (d >= 1 && d <= 2) add(e, d + (ctx.known.has(it.id) ? 0 : 0.3));
    });
    if (syllables(w) === 1) {
      for (let i = 0; i < w.length; i++) {
        if (!'aeiou'.includes(w[i]) || (i === w.length - 1 && w[i] === 'e') || 'aeiou'.includes(w[i + 1] || '') || 'aeiou'.includes(w[i - 1] || '')) continue;
        for (const v of 'aeiou') if (v !== w[i]) add(w.slice(0, i) + v + w.slice(i + 1), 1.4);
      }
    }
    [['th', 's'], ['th', 't'], ['th', 'f'], ['w', 'v'], ['v', 'w'], ['ee', 'i'], ['ea', 'i'], ['sh', 's'], ['ch', 'sh'], ['sh', 'ch'], ['ng', 'n']].forEach(([f, t]) => {
      const i = w.indexOf(f);
      if (i >= 0) add(w.slice(0, i) + t + w.slice(i + f.length), 1.1);
    });
    const m = w.match(/^([^aeiou]+)i([^aeiou]+)$/);
    if (m) add(m[1] + 'ee' + m[2], 1.1);
    return [...c.entries()].sort((a, b) => a[1] - b[1]).slice(0, 7).map(e => e[0]);
  }
  function spellingOptions(it, ctx, n) {
    const w = it.en;
    let opts;
    if (it.unit === 'u22' || !/^[a-z]+$/i.test(w) || w.length < 2) {
      opts = distract(it, ctx, n, x => x.kind === 'word' && !x.pic && /^[a-z]+$/i.test(x.en), x => x.en.toLowerCase()).map(x => x.en);
    } else {
      opts = U.sample(similar(w.toLowerCase(), ctx), n);
      if (opts.length < n) {
        opts = opts.concat(distract(it, ctx, n - opts.length,
          x => x.kind === 'word' && /^[a-z]+$/i.test(x.en) && !opts.includes(x.en.toLowerCase()), x => x.en.toLowerCase()).map(x => x.en.toLowerCase()));
      }
      if (/^[A-Z]/.test(w)) opts = opts.map(o => o[0].toUpperCase() + o.slice(1));
    }
    return opts.filter(o => o !== w);
  }
  function extraWords(it, ctx, toks, n) {
    const have = new Set(toks.map(t => t.toLowerCase()));
    const out = [];
    const src = pool(it, ctx, x => x.kind === 'phrase' || x.kind === 'sent');
    for (const x of src) {
      for (const t of tokenize(x.en)) {
        const l = t.toLowerCase();
        if (have.has(l) || out.some(o => o.toLowerCase() === l)) continue;
        out.push(t);
        if (out.length >= n) return out;
      }
    }
    return out;
  }

  // ---------- generic exercise shapes ----------
  function choice(o) {
    let sel = -1, btns = [];
    return {
      title: o.title, autoplay: o.autoplay, autoplayOpt: o.autoplayOpt, fb: o.fb, sayAfter: o.sayAfter,
      view(api) {
        btns = o.options.map((op, i) => h('button', {
          class: 'opt ' + op.cls, type: 'button',
          onclick: () => {
            sel = i;
            btns.forEach((b, j) => b.classList.toggle('sel', j === i));
            if (op.say) Sp.speak(op.say); else U.sfx('tap');
            if (o.onSelect) o.onSelect(i);
            api.ready(true);
          }
        }, op.label));
        return h('div', { class: 'ex' }, o.prompt, h('div', { class: 'opts' + (o.list ? ' list' : '') }, btns));
      },
      check() {
        const ok = sel === o.correct;
        btns.forEach((b, j) => {
          b.disabled = true;
          b.classList.remove('sel');
          b.classList.add(j === o.correct ? 'ok' : j === sel ? 'bad' : 'dim');
        });
        if (o.onCheck) o.onCheck(ok);
        return { ok };
      }
    };
  }

  function tiles(o) {
    const items = U.shuffle(o.tokens.concat(o.extra)).map(t => ({ t, used: false }));
    let answer = [], ansRow, poolRow, api;
    const cls = 'tile ' + (o.letters ? 'letter en' : 'en');
    function redraw() {
      ansRow.replaceChildren(...answer.map(p => h('button', {
        class: cls, type: 'button',
        onclick: () => { p.used = false; answer = answer.filter(x => x !== p); redraw(); }
      }, p.t)));
      poolRow.replaceChildren(...items.map(p => h('button', {
        class: cls + (p.used ? ' used' : ''), type: 'button', disabled: p.used, 'aria-hidden': p.used ? 'true' : null,
        onclick: () => {
          if (p.used) return;
          p.used = true;
          answer.push(p);
          if (!o.letters) Sp.speak(p.t, { rateMul: 1.05 }); else U.sfx('tap');
          redraw();
        }
      }, p.t)));
      api.ready(answer.length > 0);
    }
    return {
      title: o.title, autoplay: o.autoplay, fb: o.fb, sayAfter: o.sayAfter,
      view(a) {
        api = a;
        ansRow = h('div', { class: 'answer-row' + (o.letters ? ' letters' : '') });
        poolRow = h('div', { class: 'tiles' });
        const n = h('div', { class: 'ex' }, o.prompt, ansRow, poolRow);
        redraw();
        return n;
      },
      check() {
        const got = answer.map(p => p.t).join(o.letters ? '' : ' ');
        const ok = U.normLoose(got) === U.normLoose(o.target);
        ansRow.classList.add(ok ? 'ok' : 'bad');
        U.$$('button', ansRow).concat(U.$$('button', poolRow)).forEach(b => { b.disabled = true; });
        return { ok };
      }
    };
  }

  // ---------- builders ----------
  const B = {};

  B.listen_pick_pic = (it, ctx) => {
    if (!it.pic) return null;
    const ds = distract(it, ctx, 3, x => x.kind === it.kind && !!x.pic, x => x.pic);
    if (ds.length < 2) return null;
    const all = U.shuffle([it, ...ds]);
    return choice({
      title: 'Послушайте и выберите картинку', prompt: h('div', { class: 'prompt' }, audioRow(it.en)), autoplay: it.en,
      options: all.map(x => ({ cls: 'pic-opt' + (U.isTextPic(x.pic) ? ' txt' : ''), label: x.pic })), correct: all.indexOf(it), fb: fbOf(it)
    });
  };

  B.read_pick_pic = (it, ctx) => {
    if (!it.pic) return null;
    const ds = distract(it, ctx, 3, x => x.kind === it.kind && !!x.pic, x => x.pic);
    if (ds.length < 2) return null;
    const all = U.shuffle([it, ...ds]);
    return choice({
      title: 'Прочитайте и выберите картинку', prompt: h('div', { class: 'prompt' }, wordNode(it.en)), sayAfter: it.en,
      options: all.map(x => ({ cls: 'pic-opt' + (U.isTextPic(x.pic) ? ' txt' : ''), label: x.pic })), correct: all.indexOf(it), fb: fbOf(it)
    });
  };

  B.listen_pick_word = (it, ctx) => {
    const cands = spellingOptions(it, ctx, 3);
    if (cands.length < 2) return null;
    const all = U.shuffle([it.en, ...cands]);
    return choice({
      title: 'Какое слово вы услышали?', prompt: h('div', { class: 'prompt' }, audioRow(it.en)), autoplay: it.en,
      options: all.map(w => ({ cls: 'word-opt en', label: w })), correct: all.indexOf(it.en), fb: fbOf(it)
    });
  };

  B.pic_pick_word = (it, ctx) => {
    if (!it.pic) return null;
    const ds = distract(it, ctx, 3, x => x.kind === it.kind && !/\s/.test(x.en), x => x.en.toLowerCase());
    if (ds.length < 2) return null;
    const all = U.shuffle([it, ...ds]);
    return choice({
      title: 'Как это по-английски?', prompt: h('div', { class: 'prompt' }, picNode(it.pic), h('div', { class: 'ru-prompt' }, it.ru)), sayAfter: it.en,
      options: all.map(x => ({ cls: 'word-opt en', label: x.en })), correct: all.indexOf(it), fb: fbOf(it)
    });
  };

  B.read_pick_meaning = (it, ctx) => {
    if (!family(it.kind).some(k => ['word', 'phrase', 'sent'].includes(k))) return null;
    const ds = distract(it, ctx, 3, x => family(it.kind).includes(x.kind), x => x.ru);
    if (ds.length < 2) return null;
    const all = U.shuffle([it, ...ds]);
    return choice({
      title: 'Что это значит?', list: true,
      prompt: h('div', { class: 'prompt' }, wordNode(it.en), auBtn(it.en, { cls: 'xs' })),
      sayAfter: it.en, options: all.map(x => ({ cls: 'ru-opt', label: x.ru })), correct: all.indexOf(it), fb: fbOf(it)
    });
  };

  B.listen_pick_meaning = (it, ctx) => {
    const ds = distract(it, ctx, 3, x => family(it.kind).includes(x.kind), x => x.ru);
    if (ds.length < 2) return null;
    const all = U.shuffle([it, ...ds]);
    return choice({
      title: 'Послушайте. Что это значит?', list: true, prompt: h('div', { class: 'prompt' }, audioRow(it.en)), autoplay: it.en,
      options: all.map(x => ({ cls: 'ru-opt', label: x.ru })), correct: all.indexOf(it), fb: fbOf(it)
    });
  };

  B.ru_pick_en = (it, ctx) => {
    const ds = distract(it, ctx, 3, x => family(it.kind).includes(x.kind), x => x.en.toLowerCase());
    if (ds.length < 2) return null;
    const all = U.shuffle([it, ...ds]);
    const long = it.en.length > 9;
    return choice({
      title: 'Как сказать по-английски?', list: long,
      prompt: h('div', { class: 'prompt' }, it.pic ? picNode(it.pic) : null, h('div', { class: 'ru-prompt' }, it.ru)), sayAfter: it.en,
      options: all.map(x => ({ cls: 'word-opt en', label: x.en })), correct: all.indexOf(it), fb: fbOf(it)
    });
  };

  B.spell = (it) => {
    const w = it.en.toLowerCase();
    if (!/^[a-z]{2,8}$/.test(w)) return null;
    const letters = w.split('');
    const extra = U.sample('abcdefghijklmnoprstuvwyz'.split('').filter(c => !letters.includes(c)), w.length <= 3 ? 2 : 3);
    return tiles({
      title: 'Соберите слово из букв', letters: true, tokens: letters, extra, target: w, autoplay: w, fb: fbOf(it),
      prompt: h('div', { class: 'prompt' }, it.pic ? picNode(it.pic) : null, h('div', { class: 'ru-prompt' }, it.ru), audioRow(w))
    });
  };

  B.build = (it, ctx) => {
    const toks = tokenize(it.en);
    if (toks.length < 2) return null;
    return tiles({
      title: 'Переведите на английский', tokens: toks, extra: extraWords(it, ctx, toks, toks.length > 5 ? 1 : 2), target: toks.join(' '),
      sayAfter: it.en, fb: fbOf(it),
      prompt: h('div', { class: 'prompt' }, h('div', { class: 'ru-prompt' }, it.ru))
    });
  };

  B.listen_build = (it, ctx) => {
    const toks = tokenize(it.en);
    if (toks.length < 2) return null;
    return tiles({
      title: 'Соберите то, что услышали', tokens: toks, extra: extraWords(it, ctx, toks, toks.length > 5 ? 1 : 2), target: toks.join(' '),
      autoplay: it.en, fb: fbOf(it), prompt: h('div', { class: 'prompt' }, audioRow(it.en))
    });
  };

  B.gap = (it) => {
    if (!it.gap) return null;
    const before = it.en.slice(0, it.gapAt), after = it.en.slice(it.gapAt + it.gap.length);
    const blank = h('span', { class: 'blank' }, ' ');
    const opts = U.shuffle([it.gap].concat(it.alts));
    return choice({
      title: 'Вставьте пропущенное слово', sayAfter: it.en, fb: fbOf(it),
      prompt: h('div', { class: 'prompt' }, h('div', { class: 'gap-sent en' }, before, blank, after), h('div', { class: 'ru-hint' }, it.ru)),
      options: opts.map(o => ({ cls: 'word-opt en', label: o })), correct: opts.indexOf(it.gap),
      onSelect: i => { blank.textContent = opts[i]; },
      onCheck: ok => { blank.textContent = it.gap; blank.classList.add(ok ? 'filled-ok' : 'filled-bad'); }
    });
  };

  B.minimal = (it) => {
    const target = Math.random() < 0.5 ? it.a : it.b;
    const opts = [it.a, it.b];
    const ex = choice({
      title: 'Какое слово прозвучало?',
      prompt: h('div', { class: 'prompt' }, audioRow(target.en, { varied: true }), h('p', { class: 'muted small' }, 'Голоса меняются — так слух учится лучше.')),
      options: opts.map(o => ({ cls: 'word-opt en', label: [h('span', { class: 'pic', style: 'display:block;font-size:40px;margin-bottom:4px' }, o.pic), o.en] })),
      correct: opts.indexOf(target), fb: { en: target.en, ru: target.ru, note: it.note }
    });
    ex.autoplay = target.en;
    ex.autoplayOpt = { varied: true };
    ex.afterWrong = () => Sp.speak(it.a.en, { slow: true }).then(() => Sp.speak(it.b.en, { slow: true }));
    return ex;
  };

  B.speak = (it, ctx) => {
    if (!Sp.canListen() || ctx.noSpeak) return null;
    const thr = /\s/.test(it.en.trim()) ? 0.72 : 0.6;
    let tries = 0;
    return {
      title: 'Скажите вслух', auto: true, autoplay: it.en,
      view(a) {
        let finished = false;
        const api = { done: r => { if (finished) return; finished = true; mic.disabled = true; skip.disabled = true; a.done(r); } };
        const heard = h('div', { class: 'heard' }, 'Нажмите на микрофон и скажите фразу');
        const mic = h('button', { class: 'mic', type: 'button', 'aria-label': 'Говорить', html: U.icon('mic') });
        mic.onclick = async () => {
          if (finished) return;
          if (mic.classList.contains('listening')) { Sp.stopListening(); return; }
          Sp.stop();
          mic.classList.add('listening');
          heard.textContent = 'Слушаю…';
          const r = await Sp.listen();
          mic.classList.remove('listening');
          if (Sp.micBlocked) {
            heard.textContent = 'Нет доступа к микрофону. Упражнения на произношение отключены — включить можно в профиле.';
            ctx.noSpeak = true;
            setTimeout(() => api.done({ skip: true }), 1800);
            return;
          }
          if (r.error && r.error !== 'no-speech' && r.error !== 'timeout' && r.error !== 'aborted') {
            heard.textContent = r.error === 'network' ? 'Для распознавания речи нужен интернет.' : 'Не получилось включить микрофон. Попробуйте ещё раз.';
            return;
          }
          tries++;
          const best = Sp.bestMatch(it.en, r.alts || []);
          if (best.score >= thr) {
            heard.textContent = '«' + best.text + '»';
            api.done({ ok: true, spoken: true });
          } else if (tries >= 3) {
            api.done({ skip: true, msg: 'Ничего страшного: распознавание речи не идеально. Главное — вы говорили вслух.' });
          } else {
            heard.textContent = r.alts && r.alts[0] ? 'Я услышал: «' + r.alts[0] + '». Попробуйте ещё раз!' : 'Ничего не услышал. Говорите чуть громче.';
          }
        };
        const skip = h('button', {
          class: 'btn ghost sm', type: 'button',
          onclick: () => { Sp.stopListening(); Sp.pauseMic(15); api.done({ skip: true, msg: 'Хорошо, 15 минут без микрофона.' }); }
        }, 'Не могу говорить сейчас');
        return h('div', { class: 'ex' },
          h('div', { class: 'prompt' }, wordNode(it.en), h('div', { class: 'ru-hint' }, it.ru), audioRow(it.en)),
          h('div', { class: 'mic-wrap' }, mic, heard), skip);
      }
    };
  };

  // ----- letters -----
  function altWord(L, ctx) {
    if (!L.re || Math.random() < 0.5) return null;
    const re = new RegExp(L.re);
    const ws = ctx.knownIds.map(id => C.items[id]).filter(x => x && x.kind === 'word' && x.read && re.test(x.en.toLowerCase()));
    return ws.length ? U.pick(ws) : null;
  }

  B.letter_pic = (L, ctx) => {
    const ds = distract(L, ctx, 3, x => x.kind === 'letter' && x.single === L.single && soundOf(x) !== soundOf(L), x => x.pic);
    if (ds.length < 2) return null;
    const all = U.shuffle([L, ...ds]);
    const title = L.pos === 'start' ? (L.single ? 'Какое слово начинается с этой буквы?' : 'Какое слово начинается с этих букв?') : 'В каком слове есть этот звук?';
    return choice({
      title, prompt: h('div', { class: 'prompt' }, h('div', { class: 'bigletter en', style: L.ch.length > 3 ? 'font-size:56px' : '' }, L.ch),
        h('p', { class: 'muted small' }, 'Нажимайте на картинки, чтобы услышать слово')),
      options: all.map(x => ({ cls: 'pic-opt', label: x.pic, say: x.key })), correct: all.indexOf(L), fb: { en: L.key, ru: L.keyRu }, sayAfter: L.key
    });
  };

  B.letter_listen = (L, ctx) => {
    const alt = altWord(L, ctx);
    const word = alt ? alt.en : L.key;
    const ds = distract(L, ctx, 3, x => x.kind === 'letter' && x.single === L.single && soundOf(x) !== soundOf(L), x => x.ch);
    if (ds.length < 2) return null;
    const all = U.shuffle([L, ...ds]);
    const title = L.pos === 'start' ? 'С чего начинается это слово?' : 'Какие буквы дают звук в этом слове?';
    return choice({
      title, prompt: h('div', { class: 'prompt' }, audioRow(word)), autoplay: word,
      options: all.map(x => ({ cls: (x.ch.length > 3 ? 'word-opt' : 'letter-opt') + ' en', label: x.ch })), correct: all.indexOf(L),
      fb: { en: word, ru: alt ? alt.ru : L.keyRu }
    });
  };

  B.letter_case = (L) => {
    if (!L.single) return null;
    const conf = U.shuffle((LETTER_CONF[L.ch] || '').split(''));
    const rnd = U.shuffle('abcdefghijklmnopqrstuvwxyz'.split(''));
    const others = [...new Set(conf.concat(rnd))].filter(c => c !== L.ch).slice(0, 3);
    const all = U.shuffle([L.ch, ...others]);
    return choice({
      title: 'Найдите эту же букву, но маленькую', prompt: h('div', { class: 'prompt' }, h('div', { class: 'bigletter en' }, L.uc)),
      options: all.map(c => ({ cls: 'letter-opt en', label: c })), correct: all.indexOf(L.ch), fb: { en: L.uc + ' ' + L.ch, ru: '', say: X.nameSay(L.ch) }, sayAfter: X.nameSay(L.ch)
    });
  };

  B.twin_sound = (L) => {
    if (!L.twin) return null;
    const others = U.sample(['м', 'т', 'л', 'д', 'ш', 'з', 'ф', 'ц'].filter(x => x !== L.snd && x !== L.twin.wrong), 2);
    const all = U.shuffle([L.snd, L.twin.wrong, ...others]);
    const lower = L.twin.cyr === L.twin.cyr.toLowerCase();
    return choice({
      title: 'Как читается эта английская буква?',
      prompt: h('div', { class: 'prompt' }, h('div', { class: 'bigletter en' }, lower ? L.ch : L.uc), h('p', { class: 'muted small' }, 'Осторожно: похожа на русскую!')),
      options: all.map(s => ({ cls: 'sound-opt', label: '«' + s + '»' })), correct: all.indexOf(L.snd),
      fb: { en: L.key, ru: L.keyRu, note: L.twin.note }, sayAfter: L.key
    });
  };

  B.name_listen = (N) => {
    const conf = (NAME_CONF[N.uc] || '').split('');
    const rnd = U.shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    const others = [...new Set(conf.concat(rnd))].filter(c => c !== N.uc).slice(0, 3);
    const all = U.shuffle([N.uc, ...others]);
    const say = X.nameSay(N.ch);
    return choice({
      title: 'Какую букву назвали?', prompt: h('div', { class: 'prompt' }, audioRow(say)), autoplay: say,
      options: all.map(c => ({ cls: 'letter-opt en', label: c })), correct: all.indexOf(N.uc), fb: { en: N.uc + ' ' + N.ch, ru: '', say }
    });
  };

  B.spell_listen = (it, ctx) => {
    const w = it.en.toLowerCase();
    if (it.kind !== 'word' || !/^[a-z]{2,6}$/.test(w)) return null;
    const say = w.split('').map(X.nameSay).join(' ');
    const cands = spellingOptions(it, ctx, 3);
    if (cands.length < 2) return null;
    const all = U.shuffle([it.en, ...cands]);
    return choice({
      title: 'Слово продиктовали по буквам. Какое?', prompt: h('div', { class: 'prompt' }, audioRow(say)), autoplay: say,
      options: all.map(x => ({ cls: 'word-opt en', label: x })), correct: all.indexOf(it.en), fb: fbOf(it), sayAfter: it.en
    });
  };

  // Which exercise types fit an item at a given level (0 = just met, 2+ = should produce it)
  function menu(it, lvl, ctx) {
    const mic = Sp.canListen() && !ctx.noSpeak && Math.random() < 0.6;
    const k = it.kind;
    let m;
    if (k === 'letter') m = lvl <= 0 ? ['letter_pic', 'letter_listen'] : ['letter_listen', 'letter_pic', it.twin && 'twin_sound', it.single && 'letter_case'];
    else if (k === 'name') m = ['name_listen'];
    else if (k === 'pair') m = ['minimal'];
    else if (k === 'word') {
      const pic = !!it.pic, short = /^[a-z]{2,7}$/i.test(it.en);
      if (lvl <= 0) m = pic ? (it.read ? ['read_pick_pic', 'listen_pick_pic'] : ['listen_pick_pic', 'read_pick_meaning']) : ['listen_pick_word', 'read_pick_meaning'];
      else if (lvl === 1) m = pic ? (it.read ? ['read_pick_pic', 'listen_pick_word', 'pic_pick_word'] : ['pic_pick_word', 'listen_pick_pic', 'listen_pick_word']) : ['read_pick_meaning', 'listen_pick_word', 'ru_pick_en'];
      else m = [short && 'spell', 'listen_pick_word', pic ? 'pic_pick_word' : 'ru_pick_en', mic && 'speak'];
    } else if (k === 'sent') {
      if (lvl <= 0) m = ['read_pick_meaning', it.gap && 'gap'];
      else if (lvl === 1) m = [it.gap && 'gap', 'build', 'ru_pick_en'];
      else m = ['listen_build', 'build', it.gap && 'gap', mic && 'speak'];
    } else {
      if (lvl <= 0) m = ['listen_pick_meaning', 'read_pick_meaning'];
      else if (lvl === 1) m = ['ru_pick_en', 'build', 'listen_pick_meaning'];
      else m = ['listen_build', 'build', mic && 'speak'];
    }
    return m.filter(Boolean);
  }

  const FALLBACK = {
    letter: ['letter_pic', 'letter_listen', 'letter_case'], name: ['name_listen'], pair: ['minimal'],
    word: ['read_pick_meaning', 'listen_pick_word', 'listen_pick_pic'], phrase: ['read_pick_meaning', 'listen_pick_meaning'], sent: ['read_pick_meaning', 'build']
  };

  X.make = function (entry, ctx) {
    const it = C.items[entry.id];
    if (!it) return null;
    const types = entry.mode ? [entry.mode] : U.shuffle(menu(it, entry.lvl, ctx));
    types.sort((a, b) => (a === ctx.lastType) - (b === ctx.lastType));
    for (const t of types.concat(FALLBACK[it.kind] || [])) {
      const ex = B[t] && B[t](it, ctx);
      if (ex) {
        ex.type = t;
        ex.item = it;
        ctx.lastType = t;
        return ex;
      }
    }
    return null;
  };

  // ---------- match pairs ----------
  X.makeMatch = function (ids) {
    const picked = [], used = new Set();
    U.shuffle(ids.map(id => C.items[id]).filter(it => it && it.kind === 'word' && it.pic)).forEach(it => {
      if (picked.length >= 5 || used.has(it.pic) || used.has(it.en.toLowerCase())) return;
      used.add(it.pic);
      used.add(it.en.toLowerCase());
      picked.push(it);
    });
    if (picked.length < 3) return null;
    let errors = 0, done = 0, selL = -1, selR = -1, api;
    const left = U.shuffle(picked), right = U.shuffle(picked);
    const lb = left.map(it => h('button', { class: 'mitem en', type: 'button' }, it.en));
    const rb = right.map(it => h('button', { class: 'mitem pic-m', type: 'button' }, it.pic));
    function tryPair() {
      if (selL < 0 || selR < 0) return;
      const L = lb[selL], R = rb[selR];
      if (left[selL] === right[selR]) {
        [L, R].forEach(b => { b.classList.remove('sel'); b.classList.add('done'); b.disabled = true; });
        done++;
        U.sfx('ok');
        if (done === picked.length) setTimeout(() => api.done({ ok: errors <= 1, match: true }), 350);
      } else {
        errors++;
        [L, R].forEach(b => { b.classList.remove('sel'); b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 450); });
        U.sfx('bad');
        U.vibrate(30);
      }
      selL = selR = -1;
    }
    lb.forEach((b, i) => { b.onclick = () => { selL = i; lb.forEach((x, j) => x.classList.toggle('sel', j === i)); Sp.speak(left[i].en); tryPair(); }; });
    rb.forEach((b, i) => { b.onclick = () => { selR = i; rb.forEach((x, j) => x.classList.toggle('sel', j === i)); tryPair(); }; });
    return {
      title: 'Найдите пары', auto: true, type: 'match',
      view(a) { api = a; return h('div', { class: 'ex' }, h('div', { class: 'match' }, h('div', { class: 'match-col' }, lb), h('div', { class: 'match-col' }, rb))); }
    };
  };

  // ---------- intro cards ----------
  function segments(word) {
    const w = word.toLowerCase(), out = [];
    let i = 0;
    while (i < w.length) {
      const g = GRAPHEMES.find(x => w.startsWith(x, i));
      const len = g ? g.length : 1;
      out.push(word.slice(i, i + len));
      i += len;
    }
    return out;
  }
  function blend(el, word) {
    const spans = Array.from(el.children);
    let i = 0;
    (function step() {
      spans.forEach((s, j) => s.classList.toggle('on', j === i));
      i++;
      if (i <= spans.length) setTimeout(step, 280);
      else Sp.speak(word);
    })();
  }
  function highlightKey(L) {
    const k = L.key;
    const m = L.re ? k.toLowerCase().match(new RegExp(L.re)) : null;
    if (!m) return [k];
    return [k.slice(0, m.index), h('b', {}, k.slice(m.index, m.index + m[0].length)), k.slice(m.index + m[0].length)];
  }

  const KIND_LABEL = { word: 'Новое слово', phrase: 'Новая фраза', sent: 'Новое предложение' };

  X.intro = function (it) {
    if (it.kind === 'letter') {
      const L = it;
      const node = h('div', { class: 'intro' },
        h('div', { class: 'label kind' }, L.single ? 'Новая буква' : 'Новое сочетание букв'),
        L.single ? h('div', { class: 'bigletter en' }, L.uc, h('small', {}, L.ch)) : h('div', { class: 'bigletter en', style: L.ch.length > 3 ? 'font-size:56px' : '' }, L.ch),
        h('div', { class: 'key-row' },
          h('div', { class: 'pic' }, L.pic),
          h('div', { class: 'grow', style: 'text-align:left' }, h('div', { class: 'en' }, highlightKey(L)), h('div', { class: 'muted small' }, L.keyRu)),
          auBtn(L.key, { cls: 'sm' }), slowBtn(L.key)),
        h('div', { class: 'intro-hint', html: L.hint }),
        L.twin ? h('div', { class: 'twin-warn', html: '<b>Буква-обманщик.</b> ' + L.twin.note }) : null,
        L.single ? h('button', { class: 'btn sm', type: 'button', onclick: () => Sp.speak(X.nameSay(L.ch)) }, 'Как называется буква') : null);
      return { node, play: () => Sp.speak(L.key) };
    }
    if (it.kind === 'name') {
      const L = A.DATA.letters[it.letterId];
      const say = X.nameSay(it.ch);
      const node = h('div', { class: 'intro' },
        h('div', { class: 'label kind' }, 'Название буквы'),
        h('div', { class: 'bigletter en' }, it.uc, h('small', {}, it.ch)),
        audioRow(say),
        L ? h('div', { class: 'intro-hint' }, 'Так букву называют, когда диктуют по буквам. А звук у неё — как в слове ', h('b', { class: 'en' }, L.key), ' ', L.pic) : null);
      return { node, play: () => Sp.speak(say) };
    }
    if (it.kind === 'pair') {
      const card = o => h('button', { class: 'pair-card', type: 'button', onclick: () => Sp.speak(o.en) },
        h('div', { class: 'pic' }, o.pic), h('div', { class: 'en' }, o.en), h('div', { class: 'ru' }, o.ru));
      const node = h('div', { class: 'intro' },
        h('div', { class: 'label kind' }, 'Тренируем слух'),
        h('h2', { class: 'h2' }, 'Похожие, но разные слова'),
        h('div', { class: 'pair-cards' }, card(it.a), card(it.b)),
        h('div', { class: 'intro-hint', html: it.note }),
        h('p', { class: 'muted small' }, 'Нажимайте на карточки по очереди и слушайте разницу.'));
      return { node, play: () => Sp.speak(it.a.en, { slow: true }).then(() => Sp.speak(it.b.en, { slow: true })) };
    }
    const isRead = it.kind === 'word' && it.read;
    const enEl = h('div', { class: 'intro-en en' + sizeCls(it.en) + (isRead ? ' blend' : ''), role: 'button', tabindex: '0' });
    if (isRead) segments(it.en).forEach(s => enEl.appendChild(h('span', {}, s)));
    else enEl.textContent = it.en;
    const say = () => (isRead ? blend(enEl, it.en) : Sp.speak(it.en));
    enEl.onclick = say;
    const node = h('div', { class: 'intro' },
      h('div', { class: 'label kind' }, KIND_LABEL[it.kind] || ''),
      it.pic ? picNode(it.pic) : null,
      enEl,
      h('div', { class: 'intro-ru' }, it.ru),
      audioRow(it.en),
      isRead ? h('p', { class: 'muted small' }, 'Посмотрите, как звуки букв сливаются в слово. Нажмите на слово, чтобы повторить.') : null,
      it.kind === 'sent' && it.gap ? h('div', { class: 'intro-hint' }, 'Главное слово здесь — ', h('b', { class: 'en' }, it.gap)) : null);
    return { node, play: say };
  };

  X.tips = function (unit) {
    const lc = C.LINES[unit.line].color;
    return h('div', { class: 'tip-list' }, unit.tips.map(t => h('div', { class: 'tip', style: '--lc:' + lc },
      h('h4', {}, t.t), h('p', { html: t.x }),
      t.ex ? h('div', { class: 'chips' }, t.ex.map(e => h('button', { class: 'chip en', type: 'button', onclick: () => Sp.speak(e) }, e))) : null)));
  };
})(window.A);
