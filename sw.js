'use strict';
// Offline support: the app shell is cached on install; Google Fonts are cached on first use.
// Audio packs (audio/*.js) are cached the first time the app loads them.
const VERSION = 'english-zero-v2';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/util.js', 'js/storage.js', 'js/srs.js', 'js/speech.js',
  'js/content/define.js', 'js/content/voices.js', 'js/content/letters.js', 'js/content/units-1.js', 'js/content/units-2.js', 'js/content/units-3.js', 'js/content/stories.js',
  'js/course.js', 'js/progress.js', 'js/exercises.js', 'js/lesson.js', 'js/story.js', 'js/screens.js', 'js/app.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !isFont) return;
  // Network first for our own files (so updates arrive), cache as fallback offline
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
