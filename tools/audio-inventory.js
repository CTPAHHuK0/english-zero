// Lists every English text the app can speak, grouped into audio packs.
// Usage: node tools/audio-inventory.js > inventory.json   (then: python tools/make_audio.py)
//
// Packs per recorded voice:
//   <voice>       zones 1–3 (loaded first)
//   <voice>-more  zones 4–5 and grammar-pattern sentences
//   <voice>-slow  slow versions of single words, key words and letter names
// Shared packs (character voices): shared (stories 1–7, minimal pairs), shared-more (later stories, dialogues)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1])
  .filter(f => /^js\/(util|course)\.js$|^js\/content\//.test(f));
const ctx = { console, Date, Math, JSON, setTimeout, clearTimeout };
ctx.window = ctx;
vm.createContext(ctx);
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const A = ctx.A;
A.Course.build();
const U = A.U, C = A.Course, D = A.DATA;
const zoneOf = it => { const u = C.units[C.unitIndex[it.unit]]; return u ? u.zone : 1; };

const core = new Map(), more = new Map(), slow = new Map();
const addTo = (map, text, kind) => {
  if (!text) return;
  const key = U.audioKey(text);
  if (map === more && core.has(key)) return;
  if (!map.has(key)) map.set(key, { text, kind });
};

// Pass 1: zones 1–3 into the core pack, later zones into "more"
C.list.forEach(it => {
  const target = zoneOf(it) <= 3 && it.kind !== 'pat' ? core : more;
  if (target !== core) return;
  if (it.kind === 'word' || it.kind === 'phrase' || it.kind === 'sent') addTo(core, it.en, it.kind);
  if (it.kind === 'phrase' || it.kind === 'sent') U.tokenize(it.en).forEach(t => addTo(core, t, 'token'));
  if (it.kind === 'letter') addTo(core, it.key, 'word');
  if (it.kind === 'pair') { addTo(core, it.a.en, 'word'); addTo(core, it.b.en, 'word'); }
});
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => addTo(core, ch.toUpperCase() + '.', 'letter'));
D.units.filter(u => u.zone <= 3).forEach(u => (u.tips || []).forEach(t => (t.ex || []).forEach(e => addTo(core, e, 'phrase'))));
const earlyStories = new Set(['st1', 'st2', 'st3', 'st4', 'st5', 'st6', 'st7']);
Object.values(D.stories).filter(s => earlyStories.has(s.id)).forEach(s => s.lines.forEach(([, en]) => en.split(/\s+/).forEach(w => addTo(core, w.replace(/[.,!?“”"]/g, ''), 'token'))));
D.voices.samples.forEach(t => addTo(core, t, 'phrase'));

C.list.forEach(it => {
  if (it.kind === 'pat') {
    it.variants.forEach(v => { addTo(more, v.en, 'sent'); U.tokenize(v.en).forEach(t => addTo(more, t, 'token')); });
    return;
  }
  if (zoneOf(it) <= 3) return;
  if (it.kind === 'word' || it.kind === 'phrase' || it.kind === 'sent') addTo(more, it.en, it.kind);
  if (it.kind === 'phrase' || it.kind === 'sent') U.tokenize(it.en).forEach(t => addTo(more, t, 'token'));
});
D.units.filter(u => u.zone > 3).forEach(u => (u.tips || []).forEach(t => (t.ex || []).forEach(e => addTo(more, e, 'phrase'))));
Object.values(D.stories).filter(s => !earlyStories.has(s.id)).forEach(s => s.lines.forEach(([, en]) => en.split(/\s+/).forEach(w => addTo(more, w.replace(/[.,!?“”"]/g, ''), 'token'))));

// Slow versions: single words, key words of letters, letter names
C.list.forEach(it => {
  if (it.kind === 'word' && !/\s/.test(it.en)) addTo(slow, it.en, 'slow');
  if (it.kind === 'letter') addTo(slow, it.key, 'slow');
  if (it.kind === 'pair') { addTo(slow, it.a.en, 'slow'); addTo(slow, it.b.en, 'slow'); }
});
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => addTo(slow, ch.toUpperCase() + '.', 'slow'));

const out = [];
D.voices.main.forEach(v => {
  core.forEach((m, key) => out.push({ pack: v.id, key, text: m.text, kind: m.kind, voice: v.kokoro }));
  more.forEach((m, key) => out.push({ pack: v.id + '-more', key, text: m.text, kind: m.kind, voice: v.kokoro }));
  slow.forEach((m, key) => out.push({ pack: v.id + '-slow', key, text: m.text, kind: m.kind, voice: v.kokoro }));
});

// Story and dialogue lines in character voices; minimal pairs in several voices
Object.values(D.stories).forEach(s => s.lines.forEach(([who, en]) => {
  out.push({ pack: earlyStories.has(s.id) ? 'shared' : 'shared-more', key: 'story|' + U.audioKey(en), text: en, kind: 'line', voice: D.voices.story[who] || D.voices.main[0].kokoro });
}));
C.list.filter(it => it.kind === 'pair').forEach(p => [p.a, p.b].forEach(o => D.voices.pairs.forEach(v => {
  out.push({ pack: 'shared', key: 'pair|' + v + '|' + U.audioKey(o.en), text: o.en, kind: 'word', voice: v });
})));

// The same story line can appear twice: keep the first
const seen = new Set();
const uniq = out.filter(e => { const k = e.pack + '\u0000' + e.key; if (seen.has(k)) return false; seen.add(k); return true; });
process.stdout.write(JSON.stringify(uniq));
const by = {};
uniq.forEach(e => { by[e.pack] = (by[e.pack] || 0) + 1; });
console.error('clips per pack:', JSON.stringify(by));
