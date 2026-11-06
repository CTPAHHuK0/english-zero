'use strict';
// App shell: navigation between tabs, full-screen "focus" mode for lessons, theme, offline cache.
(function (A) {
  const U = A.U, St = A.Store;
  const App = A.App = {};
  const TABS = ['home', 'review', 'dict', 'profile'];
  let tab = 'home';
  let focus = false;
  let ignorePop = false;
  let themeSetByApp = false;
  let renderedDay = '';

  App.applyTheme = function () {
    const t = St.state.settings.theme;
    const root = document.documentElement;
    if (t === 'light' || t === 'dark') { root.setAttribute('data-theme', t); themeSetByApp = true; }
    else if (themeSetByApp) { root.removeAttribute('data-theme'); themeSetByApp = false; }
  };

  function updateTabs() {
    U.$$('.tab').forEach(b => {
      const on = b.dataset.tab === tab;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    const due = St.state.onboarded ? A.Progress.dueIds().length : 0;
    const badge = U.$('.tab-badge');
    badge.hidden = !due;
    badge.textContent = due > 99 ? '99+' : String(due);
    U.$('#tabbar').hidden = !St.state.onboarded;
  }

  App.show = function (name) {
    if (focus) { focus = false; U.$('#app').classList.remove('focus'); }
    if (TABS.includes(name)) tab = name;
    U.closeSheet();
    const main = U.$('#main');
    A.Screens[name](main);
    if (name !== 'home') main.scrollTop = 0;
    renderedDay = U.dayKey();
    updateTabs();
  };

  App.enterFocus = function () {
    focus = true;
    U.closeSheet();
    U.$('#app').classList.add('focus');
    try { history.pushState({ focus: 1 }, ''); } catch (e) { /* history is optional */ }
  };

  App.exitFocus = function (to) {
    A.Speech.stop();
    const pop = U.$('.gloss-pop');
    if (pop) pop.remove();
    if (history.state && history.state.focus) {
      ignorePop = true;
      try { history.back(); } catch (e) { ignorePop = false; }
    }
    App.show(to || tab);
  };

  window.addEventListener('popstate', () => {
    if (ignorePop) { ignorePop = false; return; }
    if (U.sheetOpen()) { U.closeSheet(); if (focus) try { history.pushState({ focus: 1 }, ''); } catch (e) { /* ignore */ } return; }
    if (!focus) return;
    const story = A.Story.active();
    if (story || A.Lesson.active()) {
      try { history.pushState({ focus: 1 }, ''); } catch (e) { /* ignore */ }
      (story ? A.Story.askExit : A.Lesson.askExit)();
    } else {
      App.show(tab);
    }
  });

  // Desktop convenience: Enter presses the main button of a lesson
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !focus || U.sheetOpen()) return;
    const t = e.target;
    if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || (t.tagName === 'BUTTON' && !t.closest('.lesson-foot')))) return;
    const cta = U.$('.lesson-foot .btn.primary');
    if (cta && !cta.hidden && !cta.disabled) { e.preventDefault(); cta.click(); }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden || focus || !St.state.onboarded) return;
    if (renderedDay !== U.dayKey() && (tab === 'home' || tab === 'review')) App.show(tab);
    else updateTabs();
  });

  function registerSW() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    if (!document.querySelector('link[rel="manifest"]')) return; // single-file build has no sw.js next to it
    try { if (window.top !== window.self) return; } catch (e) { return; }
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode is optional */ });
  }

  App.init = function () {
    St.load();
    App.applyTheme();
    try {
      A.Course.build();
    } catch (e) {
      U.$('#main').replaceChildren(U.h('p', { class: 'boot' }, 'Ошибка в учебных данных: ' + e.message));
      throw e;
    }
    // Recorded audio: the chosen voice first, the rest in the background
    A.Speech.preload();
    // Conversation with Claude is available only inside the claude.ai viewer
    A.AI.onChange(s => { if (s === 'ready' && !focus && St.state.onboarded && (tab === 'home' || tab === 'profile')) App.show(tab); });
    A.AI.detect();
    U.$$('.tab').forEach(b => {
      const ico = b.querySelector('.tab-ico');
      ico.innerHTML = U.icon(ico.dataset.icon);
      b.onclick = () => App.show(b.dataset.tab);
    });
    if (!St.state.onboarded) {
      U.$('#tabbar').hidden = true;
      A.Screens.onboarding(U.$('#main'));
    } else {
      App.show('home');
    }
    registerSW();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', App.init);
  else App.init();
})(window.A);
