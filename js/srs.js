'use strict';
// Spaced repetition: FSRS-4.5 (Free Spaced Repetition Scheduler) with default weights.
// Each card keeps stability S (days until recall drops to 90%) and difficulty D (1..10).
// Grades: 1 = Again (forgot), 2 = Hard, 3 = Good, 4 = Easy.
(function (A) {
  const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
  const DECAY = -0.5;
  const FACTOR = 19 / 81;      // makes R(S) = 0.9
  const RETENTION = 0.9;       // target probability of recall at review time
  const MAX_IVL = 365;
  const DAY = 864e5;

  const clampD = d => Math.min(10, Math.max(1, d));
  const retrievability = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
  const d0 = g => clampD(W[4] - (g - 3) * W[5]);

  function nextInterval(s) {
    const ivl = s / FACTOR * (Math.pow(RETENTION, 1 / DECAY) - 1);
    return Math.min(MAX_IVL, Math.max(1, Math.round(ivl)));
  }
  function nextD(d, g) {
    const nd = d - W[6] * (g - 3);
    return clampD(W[7] * d0(4) + (1 - W[7]) * nd);
  }
  function stabilityAfterRecall(d, s, r, g) {
    const hard = g === 2 ? W[15] : 1;
    const easy = g === 4 ? W[16] : 1;
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy);
  }
  function stabilityAfterLapse(d, s, r) {
    const sf = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
    return Math.min(s, sf);
  }

  // Returns a new card after a review with grade g. `card` may be null for a new item.
  function review(card, g, now) {
    now = now || Date.now();
    const c = Object.assign({ s: 0, d: 0, last: 0, due: '', reps: 0, lapses: 0 }, card || {});
    let days;
    if (!c.s) {
      c.s = W[g - 1];
      c.d = d0(g);
      days = 1; // first check the next day: the lesson itself already gave same-day practice
    } else {
      const t = Math.max(0, (now - c.last) / DAY);
      const r = retrievability(t, c.s);
      if (g === 1) { c.s = stabilityAfterLapse(c.d, c.s, r); c.lapses++; }
      else c.s = stabilityAfterRecall(c.d, c.s, r, g);
      c.d = nextD(c.d, g);
      days = g === 1 ? 1 : nextInterval(c.s);
      if (days > 3) days = Math.round(days * (0.95 + Math.random() * 0.1)); // small fuzz spreads the load
    }
    c.reps++;
    c.last = now;
    c.due = A.U.addDays(A.U.dayKey(new Date(now)), days);
    return c;
  }

  function retr(card, now) {
    if (!card || !card.s) return 0;
    return retrievability(Math.max(0, ((now || Date.now()) - card.last) / DAY), card.s);
  }

  const isDue = (card, today) => !!card && !!card.due && card.due <= (today || A.U.dayKey());

  A.SRS = { review, retr, isDue, nextInterval };
})(window.A);
