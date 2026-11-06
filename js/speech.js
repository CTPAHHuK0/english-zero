'use strict';
// Speech output, recording and recognition.
// Output prefers recorded neural-voice clips (audio packs from tools/make_audio.py) and falls back to the
// device's speech synthesizer (speechSynthesis) for anything not recorded, or when the learner picks it.
// Packs per voice: <voice> (zones 1–3), <voice>-more (zones 4–5 and grammar patterns), <voice>-slow (slow versions);
// shared and shared-more hold story/dialogue lines and minimal pairs in character voices.
(function (A) {
  const S = A.Speech = {};
  const synth = window.speechSynthesis;
  const AUDIO_DIR = 'audio/';
  const settings = () => A.Store.state.settings;
  S.supported = true; // recorded audio works everywhere; ttsSupported tells about the synthesizer
  S.ttsSupported = !!synth && typeof window.SpeechSynthesisUtterance !== 'undefined';

  // ---------- "Can't listen now" mode ----------
  let mutedUntil = 0;
  const muteListeners = [];
  S.onMute = fn => muteListeners.push(fn);
  S.muted = () => Date.now() < mutedUntil;
  S.mute = min => { mutedUntil = Date.now() + min * 60e3; S.stop(); muteListeners.forEach(fn => fn(true)); };
  S.unmute = () => { mutedUntil = 0; muteListeners.forEach(fn => fn(false)); };
  S.mutedMinutes = () => Math.max(0, Math.ceil((mutedUntil - Date.now()) / 60e3));

  // ---------- Recorded audio packs ----------
  const packs = {};      // id -> { type, clips: { key: base64 } }
  const loading = {};    // id -> Promise
  const urls = {};       // 'pack|key' -> blob URL
  const packListeners = [];
  S.addPack = function (id, data) {
    packs[id] = data;
    packListeners.forEach(fn => fn(id));
  };
  S.onPack = fn => packListeners.push(fn);
  S.packReady = id => !!packs[id];
  S.packLoading = id => !!loading[id] && !packs[id];
  S.hasClip = (text, id) => { const p = packs[id || S.voiceMode()]; return !!p && !!p.clips[A.U.audioKey(text)]; };

  function viaScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function viaFetch(src) {
    return fetch(src).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }).then(t => {
      const m = t.match(/^A\.Speech\.addPack\("([^"]+)",([\s\S]*)\);\s*$/);
      if (!m) throw new Error('bad pack');
      S.addPack(m[1], JSON.parse(m[2]));
    });
  }
  S.loadPack = function (id) {
    if (packs[id]) return Promise.resolve();
    if (!loading[id]) {
      const src = AUDIO_DIR + id + '.js';
      // file:// pages cannot fetch() neighbours, but can load them as scripts
      loading[id] = (location.protocol === 'file:' ? viaScript(src) : viaFetch(src).catch(() => viaScript(src)))
        .catch(() => { delete loading[id]; });
    }
    return loading[id];
  };
  S.mainVoices = () => A.DATA.voices.main;
  S.voiceMode = () => {
    const v = settings().voice;
    return v === 'tts' || S.mainVoices().some(m => m.id === v) ? v : S.mainVoices()[0].id;
  };
  // Core pack first; the rest arrives in the background
  S.preload = function () {
    const mode = S.voiceMode();
    const v = mode === 'tts' ? S.mainVoices()[0].id : mode;
    S.loadPack(v);
    S.loadPack('shared');
    setTimeout(() => { S.loadPack(v + '-more'); S.loadPack('shared-more'); }, 2000);
    setTimeout(() => S.loadPack(v + '-slow'), 6000);
  };

  function clipUrl(packId, key) {
    const p = packs[packId];
    if (!p || !p.clips[key]) return null;
    const id = packId + '|' + key;
    if (!urls[id]) {
      const bin = atob(p.clips[key]);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      urls[id] = URL.createObjectURL(new Blob([arr], { type: p.type.split(';')[0] }));
    }
    return urls[id];
  }
  function mainOrder() {
    const mode = S.voiceMode();
    const ids = [mode].concat(S.mainVoices().map(v => v.id).filter(id => id !== mode));
    return [].concat(...ids.map(id => [id, id + '-more']));
  }
  // Recorded clip for a text: the chosen voice first, then the other recorded voice
  function findClip(text, opt) {
    if (opt.clip) for (const id of ['shared', 'shared-more']) { const u = clipUrl(id, opt.clip); if (u) return { url: u }; }
    const key = A.U.audioKey(text);
    if (opt.slow) {
      const u = clipUrl(S.voiceMode() + '-slow', key);
      if (u) return { url: u, native: true };
      S.loadPack(S.voiceMode() + '-slow');
    }
    for (const id of mainOrder()) { const u = clipUrl(id, key); if (u) return { url: u }; }
    return null;
  }
  function relevantLoading(opt) {
    const mode = S.voiceMode();
    const ids = [mode, mode + '-more'].concat(opt.clip ? ['shared', 'shared-more'] : []);
    return ids.filter(id => S.packLoading(id)).map(id => loading[id]);
  }

  let cur = null;      // { audio, fin }
  let seq = 0;         // increases on every stop(); cancels running sequences
  function playUrl(url, rate) {
    return new Promise(resolve => {
      const a = new Audio(url);
      a.preservesPitch = true;
      a.playbackRate = rate;
      let done = false;
      const fin = () => { if (done) return; done = true; clearTimeout(t); if (cur && cur.audio === a) cur = null; resolve(); };
      a.onended = fin;
      a.onerror = fin;
      const t = setTimeout(fin, 20000);
      cur = { audio: a, fin };
      const p = a.play();
      if (p && p.catch) p.catch(fin);
    });
  }

  // ---------- Device synthesizer (fallback) ----------
  let voices = [];
  const voiceListeners = [];
  function loadVoices() {
    if (!S.ttsSupported) return;
    try { voices = synth.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang)); } catch (e) { voices = []; }
    voiceListeners.forEach(fn => fn(voices));
  }
  if (S.ttsSupported) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices);
    else synth.onvoiceschanged = loadVoices;
  }
  S.onVoices = fn => voiceListeners.push(fn);
  S.voices = () => voices;
  S.hasEnglish = () => voices.length > 0;

  function score(v) {
    const lang = v.lang.replace('_', '-').toLowerCase();
    let s = 0;
    if (lang === 'en-us') s += 10; else if (lang === 'en-gb') s += 3;
    if (/natural|neural|online/i.test(v.name)) s += 6;
    if (/google/i.test(v.name)) s += 5;
    if (/samantha|aria|jenny|ava|allison|guy/i.test(v.name)) s += 2;
    return s;
  }
  S.defaultVoice = function () {
    const want = settings().voiceURI;
    if (want) { const v = voices.find(x => x.voiceURI === want); if (v) return v; }
    return voices.slice().sort((a, b) => score(b) - score(a))[0] || null;
  };

  let keep = null; // keeps the utterance referenced (Chrome may drop callbacks otherwise)
  function tts(text, opt, rate) {
    return new Promise(resolve => {
      if (!S.ttsSupported) { resolve(); return; }
      const go = () => {
        try {
          const u = new SpeechSynthesisUtterance(text);
          const v = opt.voice || S.defaultVoice();
          if (v) u.voice = v;
          u.lang = v ? v.lang : 'en-US';
          u.rate = rate;
          let done = false;
          const fin = () => { if (!done) { done = true; clearTimeout(t); resolve(); } };
          u.onend = fin;
          u.onerror = fin;
          const t = setTimeout(fin, 1800 + text.length * 160 / rate);
          keep = u;
          synth.speak(u);
          if (synth.paused) synth.resume();
        } catch (e) { resolve(); }
      };
      // Chrome swallows the first sound if speak() follows cancel() immediately
      if (synth.speaking || synth.pending) { synth.cancel(); setTimeout(go, 120); } else go();
    });
  }

  // ---------- Public ----------
  S.speak = function (text, opt) {
    if (!text || S.muted()) return Promise.resolve();
    const my = ++seq;
    stopSound();
    return speakOne(text, opt || {}, my);
  };
  // Several clips one after another (letter names, pairs of words); stop() cancels the rest
  S.speakSeq = function (list, opt) {
    if (S.muted()) return Promise.resolve();
    const my = ++seq;
    stopSound();
    return playSeq(list, opt || {}, my);
  };
  async function playSeq(list, opt, my) {
    for (let i = 0; i < list.length; i++) {
      if (my !== seq) return;
      await speakOne(list[i], opt, my);
      if (i < list.length - 1) await new Promise(r => setTimeout(r, 220));
    }
  }

  async function speakOne(text, opt, my) {
    const base = settings().rate || 1;
    const rate = slow => Math.max(0.5, Math.min(1.6, base * (slow ? 0.7 : 1) * (opt.rateMul || 1)));
    if (S.voiceMode() !== 'tts') {
      let found = findClip(text, opt);
      if (!found) {
        // a pack still downloading is worth a short wait: it sounds much better than the synthesizer
        const pending = relevantLoading(opt);
        if (pending.length) await Promise.race([Promise.all(pending), new Promise(r => setTimeout(r, 2500))]);
        if (my !== seq) return;
        found = findClip(text, opt);
      }
      if (found) return playUrl(found.url, rate(opt.slow && !found.native));
      if (/^([A-Z]\.\s*){2,}$/.test(text.trim())) return playSeq(text.trim().split(/\s+/), opt, my);
    }
    if (my !== seq) return;
    return tts(text, opt, rate(opt.slow));
  }

  // High-variability listening: a different voice and a slightly different tempo each time
  let lastVaried = '';
  S.speakVaried = function (text, opt) {
    opt = Object.assign({}, opt, { rateMul: 0.9 + Math.random() * 0.15 });
    if (S.voiceMode() !== 'tts' && packs.shared) {
      const key = A.U.audioKey(text);
      const pool = A.DATA.voices.pairs.filter(v => v !== lastVaried && packs.shared.clips['pair|' + v + '|' + key]);
      if (pool.length) {
        lastVaried = pool[Math.floor(Math.random() * pool.length)];
        return S.speak(text, Object.assign(opt, { clip: 'pair|' + lastVaried + '|' + key }));
      }
    }
    const good = voices.filter(v => score(v) >= 10);
    const list = (good.length > 1 ? good : voices).filter(v => v.voiceURI !== lastVaried);
    const v = list.length ? list[Math.floor(Math.random() * list.length)] : null;
    if (v) lastVaried = v.voiceURI;
    return S.speak(text, Object.assign(opt, { voice: v || undefined }));
  };

  // The learner's own recording
  S.playRecording = function (url) {
    const my = ++seq;
    stopSound();
    return my === seq ? playUrl(url, 1) : Promise.resolve();
  };

  function stopSound() {
    if (cur) { try { cur.audio.pause(); } catch (e) { /* ignore */ } cur.fin(); }
    try { if (S.ttsSupported && (synth.speaking || synth.pending)) synth.cancel(); } catch (e) { /* ignore */ }
  }
  S.stop = function () { seq++; stopSound(); };

  // ---------- Microphone: recognition and recording ----------
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  // Embedded pages (the claude.ai viewer) get no microphone at all
  S.framed = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
  S.recSupported = !!Rec && !S.framed;
  S.micBlocked = false;
  S.recBlocked = S.framed;
  let pausedUntil = 0;
  S.pauseMic = min => { pausedUntil = Date.now() + min * 60e3; };
  S.canListen = () => S.recSupported && !S.micBlocked && settings().mic && Date.now() > pausedUntil && !S.muted();
  S.canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) &&
    settings().mic && !S.recBlocked && Date.now() > pausedUntil && !S.muted();

  let recorder = null;
  S.record = function (maxMs) {
    return new Promise(resolve => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        let rec;
        try { rec = new MediaRecorder(stream); } catch (e) { stream.getTracks().forEach(t => t.stop()); resolve({ error: 'recorder' }); return; }
        const chunks = [];
        recorder = rec;
        const t = setTimeout(() => { try { rec.stop(); } catch (e) { /* ignore */ } }, maxMs || 6000);
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = () => {
          clearTimeout(t);
          stream.getTracks().forEach(tr => tr.stop());
          recorder = null;
          const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
          resolve(blob.size ? { url: URL.createObjectURL(blob) } : { error: 'empty' });
        };
        rec.start();
      }).catch(e => {
        if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError' || e.name === 'NotFoundError')) S.recBlocked = true;
        resolve({ error: (e && e.name) || 'error' });
      });
    });
  };
  S.stopRecording = () => { if (recorder && recorder.state === 'recording') try { recorder.stop(); } catch (e) { /* ignore */ } };

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
