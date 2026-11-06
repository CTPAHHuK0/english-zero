'use strict';
// Text-to-speech (speechSynthesis) and speech recognition (webkitSpeechRecognition).
(function (A) {
  const S = A.Speech = {};
  const synth = window.speechSynthesis;
  S.supported = !!synth && typeof window.SpeechSynthesisUtterance !== 'undefined';

  let voices = [];
  let listeners = [];
  function loadVoices() {
    if (!S.supported) return;
    try {
      voices = synth.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang));
    } catch (e) { voices = []; }
    listeners.forEach(fn => fn(voices));
  }
  if (S.supported) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices);
    else synth.onvoiceschanged = loadVoices;
  }
  S.onVoices = fn => listeners.push(fn);
  S.voices = () => voices;
  S.hasEnglish = () => voices.length > 0;

  function score(v) {
    const lang = v.lang.replace('_', '-').toLowerCase();
    let s = 0;
    if (lang === 'en-us') s += 10; else if (lang === 'en-gb') s += 3;
    if (/natural|neural|online/i.test(v.name)) s += 6;
    if (/google/i.test(v.name)) s += 5;
    if (/samantha|aria|jenny|ava|allison|guy|zira/i.test(v.name)) s += 2;
    return s;
  }
  S.defaultVoice = function () {
    const want = A.Store.state.settings.voiceURI;
    if (want) {
      const v = voices.find(x => x.voiceURI === want);
      if (v) return v;
    }
    return voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
  };

  let keep = null; // keeps the utterance referenced (Chrome may drop callbacks otherwise)
  S.speak = function (text, opt) {
    opt = opt || {};
    return new Promise(resolve => {
      if (!S.supported || !text) { resolve(); return; }
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const v = opt.voice || S.defaultVoice();
        if (v) u.voice = v;
        u.lang = v ? v.lang : 'en-US';
        const base = A.Store.state.settings.rate || 1;
        u.rate = Math.max(0.4, Math.min(1.6, base * (opt.slow ? 0.6 : 1) * (opt.rateMul || 1)));
        let done = false;
        const fin = () => { if (!done) { done = true; clearTimeout(t); resolve(); } };
        u.onend = fin;
        u.onerror = fin;
        const t = setTimeout(fin, 1800 + text.length * 160 / u.rate);
        keep = u;
        synth.speak(u);
        if (synth.paused) synth.resume();
      } catch (e) { resolve(); }
    });
  };

  // High-variability listening: a different voice and a slightly different tempo each time
  let lastVaried = null;
  S.speakVaried = function (text, opt) {
    const pool = voices.filter(v => v !== lastVaried);
    const v = pool.length ? pool[Math.floor(Math.random() * pool.length)] : S.defaultVoice();
    lastVaried = v;
    return S.speak(text, Object.assign({ voice: v, rateMul: 0.85 + Math.random() * 0.2 }, opt));
  };

  S.stop = function () { try { if (S.supported) synth.cancel(); } catch (e) { /* ignore */ } };

  // ---------- Recognition ----------
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  S.recSupported = !!Rec;
  S.micBlocked = false;
  let pausedUntil = 0;
  S.pauseMic = min => { pausedUntil = Date.now() + min * 60e3; };
  S.canListen = () => S.recSupported && !S.micBlocked && A.Store.state.settings.mic && Date.now() > pausedUntil;

  let active = null;
  S.listen = function () {
    return new Promise(resolve => {
      let r;
      try { r = new Rec(); } catch (e) { resolve({ error: 'unsupported', alts: [] }); return; }
      r.lang = 'en-US';
      r.interimResults = false;
      r.maxAlternatives = 5;
      r.continuous = false;
      let done = false;
      const fin = x => {
        if (done) return;
        done = true;
        clearTimeout(t);
        active = null;
        try { r.abort(); } catch (e) { /* ignore */ }
        resolve(x);
      };
      r.onresult = e => {
        const alts = [];
        const res = e.results[0];
        for (let i = 0; i < res.length; i++) alts.push(res[i].transcript);
        fin({ alts });
      };
      r.onerror = e => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') S.micBlocked = true;
        fin({ error: e.error, alts: [] });
      };
      r.onend = () => setTimeout(() => fin({ alts: [] }), 300);
      const t = setTimeout(() => fin({ error: 'timeout', alts: [] }), 8000);
      active = r;
      try { r.start(); } catch (e) { fin({ error: 'start', alts: [] }); }
    });
  };
  S.stopListening = () => { if (active) try { active.stop(); } catch (e) { /* ignore */ } };

  S.bestMatch = function (target, alts) {
    const tn = A.U.normLoose(target);
    let best = { score: 0, text: alts[0] || '' };
    alts.forEach(a => {
      const sc = A.U.sim(A.U.normLoose(a), tn);
      if (sc > best.score) best = { score: sc, text: a };
    });
    return best;
  };
})(window.A);
