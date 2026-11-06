'use strict';
// XP, daily goal, streak with freezes, achievements.
(function (A) {
  const U = A.U;
  const P = A.Progress = {};
  const st = () => A.Store.state;

  P.todayXP = () => st().stats.days[U.dayKey()] || 0;

  // Streak shown to the learner: still alive if the last active day was today or yesterday,
  // or if the missed days can be covered by freezes.
  P.streakInfo = function () {
    const s = st().stats;
    if (!s.last) return { n: 0, today: false, atRisk: false };
    const today = U.dayKey();
    const gap = U.daysBetween(s.last, today);
    if (gap <= 0) return { n: s.streak, today: true, atRisk: false };
    if (gap === 1) return { n: s.streak, today: false, atRisk: true };
    if (gap - 1 <= s.freezes) return { n: s.streak, today: false, atRisk: true, frozen: gap - 1 };
    return { n: 0, today: false, atRisk: false, lost: s.streak };
  };

  // Call after every finished lesson / review / story
  P.addXP = function (xp, seconds) {
    const s = st().stats;
    const today = U.dayKey();
    const before = P.todayXP();
    s.days[today] = before + xp;
    s.xp += xp;
    s.seconds += Math.round(seconds || 0);
    const events = {};
    if (s.last !== today) {
      const gap = s.last ? U.daysBetween(s.last, today) : 0;
      if (s.last && gap === 1) s.streak += 1;
      else if (s.last && gap > 1 && gap - 1 <= s.freezes) { s.freezes -= gap - 1; s.streak += 1; events.usedFreeze = gap - 1; }
      else s.streak = 1;
      s.last = today;
      events.streakUp = s.streak;
      if (s.streak % 7 === 0 && s.freezes < 2) { s.freezes += 1; events.newFreeze = true; }
    }
    s.best = Math.max(s.best, s.streak);
    const goal = st().settings.goal;
    if (before < goal && s.days[today] >= goal) events.goalDone = true;
    // keep the day log small
    const keys = Object.keys(s.days).sort();
    while (keys.length > 120) delete s.days[keys.shift()];
    return events;
  };

  const countKinds = kinds => Object.keys(st().items).filter(id => {
    const it = A.Course.items[id];
    return it && kinds.includes(it.kind);
  }).length;
  P.learnedWords = () => countKinds(['word', 'phrase', 'sent']);
  P.learnedLetters = () => Object.keys(st().items).filter(id => /^L_[a-z]$/.test(id)).length;

  P.BADGES = [
    { id: 'first', mark: '1', t: 'Первый шаг', d: 'Пройден первый урок', test: s => Object.keys(s.lessons).length >= 1 },
    { id: 'goal', mark: 'XP', t: 'Цель дня', d: 'Выполнена дневная цель', test: s => Object.values(s.stats.days).some(x => x >= s.settings.goal) },
    { id: 'perfect', mark: '100%', t: 'Без ошибок', d: 'Урок без единой ошибки', test: s => s.stats.perfect >= 1 },
    { id: 'letters', mark: 'Aa', t: 'Все буквы', d: 'Изучены все 26 букв', test: () => P.learnedLetters() >= 26 },
    { id: 'abc', mark: 'A–Z', t: 'Алфавит', d: 'Пройдена станция «Алфавит»', test: () => A.Course.unitComplete(A.Course.units[A.Course.unitIndex.u10]) },
    { id: 'story', mark: 'Ст', t: 'Читатель', d: 'Прочитана первая история', test: s => s.stats.stories >= 1 },
    { id: 'w50', mark: '50', t: '50 слов и фраз', d: 'В словаре 50 слов и фраз', test: () => P.learnedWords() >= 50 },
    { id: 'w100', mark: '100', t: '100 слов и фраз', d: 'В словаре 100 слов и фраз', test: () => P.learnedWords() >= 100 },
    { id: 'w250', mark: '250', t: '250 слов и фраз', d: 'В словаре 250 слов и фраз', test: () => P.learnedWords() >= 250 },
    { id: 's3', mark: '3', t: '3 дня подряд', d: 'Серия из 3 дней', test: s => s.stats.best >= 3 },
    { id: 's7', mark: '7', t: 'Неделя', d: 'Серия из 7 дней', test: s => s.stats.best >= 7 },
    { id: 's30', mark: '30', t: 'Месяц', d: 'Серия из 30 дней', test: s => s.stats.best >= 30 },
    { id: 'r10', mark: '×10', t: 'Повторение', d: '10 сессий повторения', test: s => s.stats.reviews >= 10 },
    { id: 'voice', mark: 'Mic', t: 'Голос', d: '10 раз сказали фразу вслух', test: s => s.stats.spoken >= 10 },
    { id: 'dialog', mark: '⇄', t: 'Собеседник', d: 'Пройден первый диалог', test: s => (s.stats.dialogs || 0) >= 1 },
    { id: 'ai', mark: 'AI', t: 'Разговорчивый', d: '20 сообщений в разговоре с ИИ', test: s => (s.stats.aiMessages || 0) >= 20 },
    { id: 'past', mark: 'was', t: 'Прошлое', d: 'Пройдена зона «Рассказываю о прошлом»', test: () => A.Course.units.filter(u => u.zone === 4).every(A.Course.unitComplete) },
    { id: 'finish', mark: 'NY', t: 'Нью-Йорк', d: 'Пройден весь маршрут', test: () => A.Course.units.every(A.Course.unitComplete) }
  ];

  // Returns badges earned just now
  P.checkBadges = function () {
    const s = st();
    const fresh = [];
    P.BADGES.forEach(b => {
      if (!s.badges[b.id] && b.test(s)) { s.badges[b.id] = U.dayKey(); fresh.push(b); }
    });
    return fresh;
  };

  P.dueIds = function () {
    const today = U.dayKey();
    return Object.keys(st().items).filter(id => A.Course.items[id] && A.SRS.isDue(st().items[id], today));
  };
})(window.A);
