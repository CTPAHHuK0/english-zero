// Full-course check: walks every lesson in order as a fresh learner, answering correctly, and reports
//  - exercises about an item the learner has not been shown yet,
//  - sound, picture and right answer that do not belong together,
//  - duplicate options or two options with the same meaning,
//  - a right answer that the app marks as wrong.
// How to run: start the app locally (python -m http.server 8765), open it in Chrome, open DevTools → Console,
// paste this file and press Enter. Progress is reset first. Takes about a minute; the report is printed at the end.
(async () => {
  localStorage.clear();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const C = A.Course, U = A.U, Sp = A.Speech;
  Sp.speak = () => Promise.resolve(); Sp.speakSeq = () => Promise.resolve(); Sp.speakVaried = () => Promise.resolve();
  A.Store.reset(); A.Store.state.onboarded = true; A.App.show('home');
  const issues = []; let exCount = 0, cur = null;
  const origMake = A.Ex.make;
  A.Ex.make = (e, ctx) => { const ex = origMake(e, ctx); if (ex) cur = { ex, ctx }; return ex; };
  const nameSay = ch => ch.toUpperCase() + '.';
  const meanings = ru => String(ru || '').toLowerCase().replace(/ё/g, 'е').split(/[,;/]/).map(p => p.replace(/[^а-яa-z ]+/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);

  function check(key) {
    const { ex, ctx } = cur, it = ex.item, t = ex.type, fb = ex.fb || {}, L = ex.labels || [], ans = L[ex.answer];
    const bad = m => issues.push(key + ' [' + t + '] ' + (it.en || it.id) + ': ' + m);
    exCount++;
    if (!ctx.learned.has(it.id)) bad('item not introduced yet');
    if (L.length && new Set(L.filter(Boolean)).size !== L.filter(Boolean).length) bad('duplicate options ' + L.join(' | '));
    if (t === 'letter_listen') {
      if (ex.autoplay !== fb.en) bad('sound and feedback differ');
      if (ex.autoplay !== it.key && !ctx.learned.has('w:' + ex.autoplay.toLowerCase())) bad('word not learned yet: ' + ex.autoplay);
      if (ans !== it.ch) bad('wrong answer key');
    } else if (t === 'name_listen') { if (ex.autoplay !== nameSay(it.ch) || ans !== it.uc) bad('letter name'); }
    else if (t === 'letter_pic' || t === 'listen_pick_pic' || t === 'read_pick_pic') { if (ans !== it.pic) bad('picture'); if (ex.autoplay && ex.autoplay !== it.en) bad('sound'); }
    else if (['listen_pick_word', 'pic_pick_word', 'ru_pick_en', 'minimal', 'spell_listen'].includes(t)) { if (ans !== fb.en) bad('answer'); }
    else if (t === 'read_pick_meaning' || t === 'listen_pick_meaning') {
      if (ans !== fb.ru) bad('answer');
      L.forEach((lab, i) => { if (i !== ex.answer && meanings(lab).some(x => meanings(fb.ru).includes(x))) bad('two right translations: ' + lab); });
    } else if (t === 'gap') { if (!ans || !(fb.en || '').includes(ans)) bad('gap'); }
    else if (['spell', 'build', 'listen_build'].includes(t)) { if (U.normLoose(ex.answer) !== U.normLoose(fb.en)) bad('tiles'); }
  }
  async function answer(body) {
    const ex = cur.ex;
    if (ex.type === 'speak' || ex.type === 'shadow') { [...body.querySelectorAll('button')].find(b => /Не могу говорить/.test(b.textContent)).click(); return; }
    const opts = [...body.querySelectorAll('.opts .opt')];
    if (opts.length) opts[ex.answer].click();
    else for (const tk of ex.tokens) { const b = [...body.querySelectorAll('.tiles .tile')].find(p => !p.disabled && !p.classList.contains('used') && p.textContent === tk); if (b) b.click(); }
    document.querySelector('.lesson-foot .btn.primary').click();
  }

  for (const u of C.units) for (const l of u.lessons) {
    await A.Lesson.startLesson(l); await sleep(3);
    const story = l.story ? A.DATA.stories[l.story] : null; let roleIx = 0;
    for (let g = 0; g < 400; g++) {
      const cta = document.querySelector('.lesson-foot .btn.primary'), body = document.querySelector('.lesson-body');
      if (body.querySelector('.finish')) { cta.click(); await sleep(3); break; }
      if (story) {
        const reply = body.querySelector('.reply-box');
        if (reply) { const want = story.lines.filter(x => x[0] === story.role)[roleIx++][1]; [...reply.querySelectorAll('.reply-opt')].find(x => x.textContent === want).click(); cta.click(); continue; }
        const qt = body.querySelector('.opts') && body.querySelector('.ex-title') ? body.querySelector('.ex-title').innerText : null;
        if (qt && cta.textContent === 'Проверить') { const q = story.questions.find(x => x[0] === qt); [...body.querySelectorAll('.opts .opt')].find(x => x.textContent === q[1]).click(); }
        cta.click(); continue;
      }
      if (!cta.hidden && cta.textContent !== 'Проверить') { cta.click(); continue; }
      const left = [...body.querySelectorAll('.match-col:first-child .mitem')];
      if (left.length) {
        const right = [...body.querySelectorAll('.match-col:last-child .mitem')];
        left.forEach(b => { const it = C.list.find(x => x.kind === 'word' && x.en === b.textContent && x.pic); b.click(); right.find(r => r.textContent === it.pic && !r.disabled).click(); });
        await sleep(400); continue;
      }
      if (cur) { check(l.key); await answer(body); if (document.querySelector('.lesson-foot.bad')) issues.push(l.key + ' right answer marked wrong: ' + cur.ex.item.en); cur = null; continue; }
      issues.push(l.key + ' stuck'); break;
    }
  }
  A.Ex.make = origMake;
  console.log('Course audit: ' + C.units.length + ' units, ' + exCount + ' exercises, ' + issues.length + ' problems');
  issues.forEach(i => console.warn(i));
})();
