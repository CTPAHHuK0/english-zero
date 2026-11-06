'use strict';
// Conversation practice with Claude (role-play). Works only inside the claude.ai artifact viewer,
// where the page may ask Claude on the viewer's own account (`sample` capability). Elsewhere it is hidden.
(function (A) {
  const U = A.U, h = U.h, Sp = A.Speech, St = A.Store, C = A.Course;
  const AI = A.AI = {};
  AI.ARTIFACT_URL = 'https://claude.ai/artifact/3DTEvCaNh8cAQ5k3bLqRyn';

  let sample = null;
  let state = 'unknown'; // unknown | ready | none | denied
  const listeners = [];
  AI.onChange = fn => listeners.push(fn);
  AI.state = () => state;
  function setState(s) { state = s; listeners.forEach(fn => fn(s)); }

  // `host` defaults to the viewer's window.claude; passing one replaces the current connection
  AI.detect = function (host) {
    if (state !== 'unknown' && !host) return;
    const c = host || window.claude;
    if (!c || typeof c.use !== 'function') { setState('none'); return; }
    c.use('sample').then(fn => { sample = fn; setState(fn ? 'ready' : 'none'); }).catch(() => setState('none'));
  };

  const SCENES = [
    { id: 'cafe', t: 'Кафе', d: 'Закажите кофе и что-нибудь поесть', who: 'Mia', setting: 'a small coffee shop in New York. You are Mia, a friendly barista. The learner is a customer who wants to order.' },
    { id: 'airport', t: 'Паспортный контроль', d: 'Ответьте на вопросы офицера', who: 'Officer', setting: 'passport control at JFK airport in New York. You are a polite officer asking simple questions. The learner is arriving.' },
    { id: 'hotel', t: 'Отель', d: 'Заселитесь в номер', who: 'Receptionist', setting: 'a hotel reception desk. You are a friendly receptionist. The learner has a reservation and wants to check in.' },
    { id: 'shop', t: 'Магазин одежды', d: 'Купите тёплую куртку', who: 'Clerk', setting: 'a clothes store. You are a helpful shop assistant. The learner wants to buy a warm jacket.' },
    { id: 'street', t: 'На улице', d: 'Спросите дорогу до метро', who: 'Sam', setting: 'a street in Manhattan. You are Sam, a kind local. The learner is lost and asks for directions to the subway.' },
    { id: 'neighbor', t: 'Новый сосед', d: 'Познакомьтесь с соседом Беном', who: 'Ben', setting: 'an apartment building. You are Ben, a cheerful teacher who lives next door. You meet the learner for the first time.' },
    { id: 'free', t: 'Свободная тема', d: 'Поговорите с Анной о чём угодно', who: 'Anna', setting: 'a casual chat. You are Anna, a programmer from Moscow who moved to New York and learned English from zero. You are kind and curious.' }
  ];

  function knownWords() {
    const words = Object.keys(St.state.items).map(id => C.items[id]).filter(it => it && it.kind === 'word' && /^[a-z]+$/i.test(it.en)).map(it => it.en.toLowerCase());
    return words.slice(-250).join(', ');
  }
  function rules(scene) {
    const known = knownWords();
    return [
      'You are a role-play partner in an English learning app. The learner is a Russian-speaking adult beginner (CEFR A1).',
      'Scene: ' + scene.setting,
      'Rules:',
      '- Stay in character. Use very simple English: 1-2 short sentences, at most 15 words in total, present or simple past, common words.',
      known ? '- Prefer words the learner already knows: ' + known + '.' : '- Use only the most common English words.',
      '- Keep the conversation going. Usually end with one simple question.',
      '- If the learner\'s last message has a grammar or word mistake, put a short friendly correction in Russian in "fix": first the corrected English sentence in quotes, then one short explanation in Russian. If there is no mistake, "fix" is "".',
      '- If the learner writes in Russian, answer in character in English and in "fix" show (in Russian) how to say their message in English.',
      '- Give 3 short, different things the learner could say next (A1 level English) in "options".',
      'Reply with only JSON: {"say": "your English line", "ru": "Russian translation of say", "fix": "", "options": ["...", "...", "..."]}'
    ].join('\n');
  }

  const ERR = {
    not_granted: 'Разговор с ИИ не разрешён. Разрешить можно в меню этой страницы (Permissions).',
    sampling_disabled: 'ИИ недоступен для этого аккаунта.',
    rate_limited: 'Слишком много сообщений подряд или исчерпан лимит. Попробуйте чуть позже.',
    session_expired: 'Нужно заново войти в claude.ai.',
    refused: 'ИИ не стал отвечать на это сообщение. Попробуйте сказать иначе.'
  };
  const PERMANENT = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];

  // ---------- Scene picker ----------
  AI.open = function () {
    if (state !== 'ready') { U.toast('Разговор с ИИ работает в версии на claude.ai'); return; }
    U.sheet(h('div', { class: 'stack' },
      h('h2', { class: 'h2' }, 'Разговор с ИИ'),
      h('p', { class: 'muted small' }, 'Собеседник говорит простым английским, исправляет ошибки по-русски и подсказывает варианты ответа. Пишите по-английски, а если не знаете как — можно по-русски.'),
      h('div', { class: 'choice-list' }, SCENES.map(s => h('button', { class: 'choice', type: 'button', onclick: () => { U.closeSheet(); chat(s); } },
        h('span', {}, h('b', {}, s.t), h('span', {}, s.d)))))));
  };

  // ---------- Chat ----------
  let ctl = null;
  function chat(scene) {
    const turns = [{ role: 'user', content: rules(scene) + '\n\nStart the conversation with your first line.' }];
    let sent = 0, busy = false;
    A.App.enterFocus();
    const list = h('div', { class: 'story-lines ai-chat' });
    const chips = h('div', { class: 'chips ai-chips' });
    const input = h('input', { class: 'search', id: 'ai-input', type: 'text', placeholder: 'Напишите по-английски…', autocomplete: 'off', enterkeyhint: 'send' });
    const send = h('button', { class: 'btn primary', type: 'button' }, 'Отправить');
    const stop = h('button', { class: 'btn ghost sm', type: 'button', hidden: true, onclick: () => ctl && ctl.abort() }, 'Остановить');
    const close = h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Закрыть', html: U.icon('close'), onclick: exit });
    U.$('#main').replaceChildren(h('div', { class: 'lesson' },
      h('div', { class: 'lesson-top' }, close, h('div', { class: 'grow' }, h('b', {}, scene.t), h('div', { class: 'small muted' }, 'Разговор с ИИ · ' + scene.who))),
      h('div', { class: 'lesson-body' }, list),
      h('div', { class: 'lesson-foot' }, chips, stop, h('div', { class: 'row', style: 'margin-top:8px' }, input, send))));

    function exit() {
      if (ctl) ctl.abort();
      if (sent) { A.Progress.addXP(Math.min(20, sent * 2), 0); St.state.stats.aiMessages = (St.state.stats.aiMessages || 0) + sent; A.Progress.checkBadges(); St.save(); }
      A.App.exitFocus();
    }
    const scroll = n => setTimeout(() => n.scrollIntoView({ behavior: 'smooth', block: 'end' }), 30);
    function aiBubble(r) {
      const ru = h('div', { class: 'line-ru', hidden: true }, r.ru || '');
      const b = h('div', { class: 'bubble' }, h('div', { class: 'who' }, scene.who), h('div', { class: 'line-en en' }, r.say),
        ru, h('div', { class: 'line-tools' },
          h('button', { class: 'au xs', type: 'button', 'aria-label': 'Прослушать', html: U.icon('speaker'), onclick: () => Sp.speak(r.say) }),
          r.ru ? h('button', { class: 'btn sm ghost', type: 'button', onclick: () => { ru.hidden = !ru.hidden; } }, 'Перевод') : null));
      list.append(b);
      scroll(b);
    }
    function note(text, cls) {
      const n = h('div', { class: 'ai-note ' + (cls || '') }, text);
      list.append(n);
      scroll(n);
      return n;
    }
    function setChips(opts) {
      U.fill(chips, (opts || []).slice(0, 3).map(o => h('button', { class: 'chip en', type: 'button', onclick: () => { input.value = o; input.focus(); } }, o)));
    }
    async function ask() {
      busy = true;
      send.disabled = true;
      stop.hidden = false;
      const typing = note('Собеседник печатает…', 'typing');
      ctl = new AbortController();
      try {
        const r = await sample.json(turns, { modelTier: 'quick', cache: false, signal: ctl.signal });
        typing.remove();
        if (!r || typeof r.say !== 'string') throw { code: 'invalid_json' };
        turns.push({ role: 'assistant', content: JSON.stringify(r) });
        if (r.fix) note(r.fix, 'fix');
        aiBubble(r);
        setChips(Array.isArray(r.options) ? r.options.map(String) : []);
      } catch (e) {
        typing.remove();
        if (e && e.code === 'cancelled') { note('Остановлено.'); }
        else {
          if (e && PERMANENT.includes(e.code)) setState('denied');
          note((e && ERR[e.code]) || 'Не получилось получить ответ. Попробуйте отправить ещё раз.', 'err');
          if (turns.length > 1 && turns[turns.length - 1].role === 'user') turns.pop();
        }
      } finally {
        busy = false;
        send.disabled = false;
        stop.hidden = true;
        ctl = null;
      }
    }
    function submit() {
      const text = input.value.trim();
      if (!text || busy) return;
      input.value = '';
      const b = h('div', { class: 'bubble right' }, h('div', { class: 'who' }, 'Вы'), h('div', { class: 'line-en en' }, text));
      list.append(b);
      scroll(b);
      setChips([]);
      turns.push({ role: 'user', content: text });
      // keep the instructions turn and the last exchanges
      while (turns.length > 21) turns.splice(1, 2);
      sent++;
      ask();
    }
    send.onclick = submit;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    ask();
  }
})(window.A);
