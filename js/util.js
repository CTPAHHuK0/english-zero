'use strict';
window.A = window.A || {};

(function (A) {
  const U = A.U = {};

  U.$ = (s, r) => (r || document).querySelector(s);
  U.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // Hyperscript: h('div', {class: 'x', onclick: fn}, child, 'text', [more])
  U.h = function (tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style') el.style.cssText = v;
        else if (k === 'data') Object.assign(el.dataset, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (let i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  };
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(x => add(el, x)); return; }
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  // Like replaceChildren, but flattens arrays and skips null/false
  U.fill = function (el) {
    el.replaceChildren();
    for (let i = 1; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  };

  U.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  U.sample = (arr, n) => U.shuffle(arr).slice(0, n);
  U.clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // Dates are handled as local calendar days: 'YYYY-MM-DD'
  U.dayKey = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  U.addDays = function (key, n) {
    const d = new Date(key + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return U.dayKey(d);
  };
  U.daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);

  // Text normalisation for comparing answers
  const NUM = { 0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 20: 'twenty', 100: 'hundred' };
  const CONTR = { "i'm": 'i am', "you're": 'you are', "he's": 'he is', "she's": 'she is', "it's": 'it is', "we're": 'we are', "they're": 'they are', "what's": 'what is', "that's": 'that is', "let's": 'let us', "don't": 'do not', "doesn't": 'does not', "can't": 'cannot', "isn't": 'is not', "aren't": 'are not', "i'd": 'i would' };
  U.norm = function (s) {
    return String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  };
  U.normLoose = function (s) {
    return U.norm(s).split(' ').map(w => CONTR[w] || NUM[w] || w).join(' ').replace(/\bcan not\b/g, 'cannot');
  };
  U.lev = function (a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  };
  U.sim = (a, b) => 1 - U.lev(a, b) / Math.max(a.length, b.length, 1);

  // Russian plural: plural(5, ['слово', 'слова', 'слов'])
  U.plural = function (n, f) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    if (b === 1) return f[0];
    return f[2];
  };

  U.isTextPic = p => !!p && /^[0-9A-Za-zА-Яа-яЁё.,:\- ]+$/.test(p);

  U.debounce = function (fn, ms) {
    let t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  };

  // ---------- Feedback: sound & vibration ----------
  let actx = null;
  const NOTES = {
    ok: [[660, 0], [880, 0.09]],
    bad: [[233, 0], [196, 0.13]],
    done: [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.32]],
    tap: [[520, 0]]
  };
  U.sfx = function (kind) {
    if (!A.Store || !A.Store.state.settings.sfx) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      (NOTES[kind] || []).forEach(([f, t]) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === 'bad' ? 'triangle' : 'sine';
        o.frequency.value = f;
        const st = actx.currentTime + t;
        g.gain.setValueAtTime(0.0001, st);
        g.gain.exponentialRampToValueAtTime(kind === 'tap' ? 0.05 : 0.16, st + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, st + 0.24);
        o.connect(g).connect(actx.destination);
        o.start(st);
        o.stop(st + 0.26);
      });
    } catch (e) { /* audio is optional */ }
  };
  U.vibrate = function (p) {
    if (!A.Store || !A.Store.state.settings.vibrate) return;
    const ua = navigator.userActivation;
    if (ua && !ua.hasBeenActive) return; // browsers block vibration before the first real tap
    try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* optional */ }
  };

  // ---------- Icons ----------
  const I = {
    speaker: '<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    route: '<circle cx="6" cy="5.5" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.5 5.5H15a3.5 3.5 0 0 1 0 7H9a3.5 3.5 0 0 0 0 7h6.5"/>',
    repeat: '<path d="M4.5 11.5a7.5 7.5 0 0 1 13.2-4.9L19.5 8.5"/><path d="M19.5 4v4.5H15"/><path d="M19.5 12.5a7.5 7.5 0 0 1-13.2 4.9L4.5 15.5"/><path d="M4.5 20v-4.5H9"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/><path d="M9 7.5h6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    flame: '<path fill="currentColor" stroke="none" d="M12.6 2.2c.6 3.6 4.9 5.5 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2.6 1.4-4.2 2.3-5.6.5 1.4 1.3 2.3 2.4 2.6-.9-2.7-.4-5.2 1.4-7.6z"/>',
    snow: '<path d="M12 2.5v19M4 7l16 10M20 7L4 17"/><path d="M9.5 4.5L12 6.5l2.5-2M9.5 19.5L12 17.5l2.5 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    play: '<path fill="currentColor" d="M8 5.5v13l10.5-6.5z"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    flask: '<path d="M9 3h6M10 3v6L5 18.5A1.8 1.8 0 0 0 6.6 21h10.8a1.8 1.8 0 0 0 1.6-2.5L14 9V3"/><path d="M7.5 15h9"/>',
    star: '<path fill="currentColor" stroke="none" d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/>'
  };
  U.icon = (n, cls) => '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || '') + '</svg>';

  // ---------- Toast ----------
  let toastT;
  U.toast = function (msg, ms) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), ms || 2400);
  };

  // ---------- Bottom sheet / modal ----------
  let sheetClose = null;
  U.sheet = function (content, opts) {
    opts = opts || {};
    const ov = document.getElementById('overlay');
    if (sheetClose) sheetClose(true);
    const box = U.h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, U.h('div', { class: 'sheet-grip' }), content);
    ov.replaceChildren(box);
    ov.hidden = false;
    const close = function (silent) {
      ov.hidden = true;
      ov.replaceChildren();
      ov.onclick = null;
      document.removeEventListener('keydown', onKey);
      sheetClose = null;
      if (!silent && opts.onClose) opts.onClose();
    };
    const onKey = e => { if (e.key === 'Escape') close(); };
    ov.onclick = e => { if (e.target === ov && opts.dismiss !== false) close(); };
    document.addEventListener('keydown', onKey);
    sheetClose = close;
    return close;
  };
  U.closeSheet = () => { if (sheetClose) sheetClose(true); };
  U.sheetOpen = () => !!sheetClose;

  // In-page confirmation (artifact viewers block window.confirm)
  U.confirm = function (o) {
    return new Promise(resolve => {
      let done = false;
      const fin = v => { if (!done) { done = true; close(true); resolve(v); } };
      const close = U.sheet(U.h('div', { class: 'stack' },
        U.h('h2', { class: 'h2' }, o.title),
        o.text ? U.h('p', { class: 'muted' }, o.text) : null,
        U.h('button', { class: 'btn block ' + (o.danger ? 'bad' : 'primary'), type: 'button', onclick: () => fin(true) }, o.ok || 'Да'),
        U.h('button', { class: 'btn block ghost', type: 'button', onclick: () => fin(false) }, o.cancel || 'Отмена')
      ), { onClose: () => { if (!done) { done = true; resolve(false); } } });
    });
  };

  // ---------- Confetti ----------
  U.confetti = function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.getElementById('confetti');
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
    const cs = getComputedStyle(document.documentElement);
    const colors = ['--read', '--talk', '--gram', '--story', '--accent'].map(v => cs.getPropertyValue(v).trim() || '#fc0');
    const P = Array.from({ length: 130 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35,
      vx: (Math.random() - 0.5) * 16 * dpr, vy: (-Math.random() * 14 - 6) * dpr,
      w: (6 + Math.random() * 6) * dpr, h: (8 + Math.random() * 8) * dpr,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: U.pick(colors)
    }));
    const t0 = performance.now();
    (function frame(t) {
      const dt = t - t0;
      ctx.clearRect(0, 0, W, H);
      P.forEach(p => {
        p.vy += 0.45 * dpr; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - dt / 2200);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (dt < 2200) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(t0);
  };

  U.escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
})(window.A);
