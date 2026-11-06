// Lists every English text the app can speak, grouped into audio packs.
// Usage: node tools/audio-inventory.js > inventory.json   (then: python tools/make_audio.py)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const files = ['js/util.js', 'js/content/define.js', 'js/content/voices.js', 'js/content/letters.js',
  'js/content/units-1.js', 'js/content/units-2.js', 'js/content/units-3.js', 'js/content/stories.js', 'js/course.js'];
const ctx = { console, Date, Math, JSON, setTimeout, clearTimeout };
ctx.window = ctx;
vm.createContext(ctx);
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const A = ctx.A;
A.Course.build();
const U = A.U, C = A.Course, D = A.DATA;

// Texts spoken in the learner's chosen voice
const main = new Map();
const add = (text, kind) => {
  if (!text) return;
  const key = U.audioKey(text);
  if (!main.has(key)) main.set(key, { text, kind });
};
C.list.forEach(it => {
  if (it.kind === 'word' || it.kind === 'phrase' || it.kind === 'sent') add(it.en, it.kind);
  if (it.kind === 'phrase' || it.kind === 'sent') U.tokenize(it.en).forEach(t => add(t, 'token'));
  if (it.kind === 'letter') add(it.key, 'word');
  if (it.kind === 'pair') { add(it.a.en, 'word'); add(it.b.en, 'word'); }
});
'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => add(ch.toUpperCase() + '.', 'letter'));
D.units.forEach(u => (u.tips || []).forEach(t => (t.ex || []).forEach(e => add(e, 'phrase'))));
Object.values(D.stories).forEach(s => s.lines.forEach(([, en]) => en.split(/\s+/).forEach(w => add(w.replace(/[.,!?]/g, ''), 'token'))));
D.voices.samples.forEach(t => add(t, 'phrase'));

const out = [];
D.voices.main.forEach(v => main.forEach((m, key) => out.push({ pack: v.id, key, text: m.text, kind: m.kind, voice: v.kokoro })));

// Shared pack: story lines in character voices, minimal pairs in several voices
Object.values(D.stories).forEach(s => s.lines.forEach(([who, en]) => {
  out.push({ pack: 'shared', key: 'story|' + U.audioKey(en), text: en, kind: 'line', voice: D.voices.story[who] || D.voices.main[0].kokoro });
}));
C.list.filter(it => it.kind === 'pair').forEach(p => [p.a, p.b].forEach(o => D.voices.pairs.forEach(v => {
  out.push({ pack: 'shared', key: 'pair|' + v + '|' + U.audioKey(o.en), text: o.en, kind: 'word', voice: v });
})));

// story keys can repeat (same line in two stories): keep the first
const seen = new Set();
const uniq = out.filter(e => { const k = e.pack + '\u0000' + e.key; if (seen.has(k)) return false; seen.add(k); return true; });
process.stdout.write(JSON.stringify(uniq, null, 0));
const by = {};
uniq.forEach(e => { by[e.pack] = (by[e.pack] || 0) + 1; });
console.error('clips per pack:', JSON.stringify(by));
