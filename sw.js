// Caches the app's own files so it opens fast and works offline. User data lives in
// localStorage and is never touched here. Network first, so updates show up as soon as
// there is a connection; the cache is only the fallback.
const CACHE = 'habit-tracker-v1';
const FILES = [
  './', 'index.html', 'manifest.json', 'css/styles.css', 'fonts/SecularOne-Regular.ttf',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'js/app.js', 'js/data/repository.js', 'js/data/localRepository.js',
  'js/logic/dates.js', 'js/logic/schedule.js', 'js/logic/streaks.js', 'js/logic/backfill.js',
  'js/ui/dom.js', 'js/ui/habitForm.js', 'js/ui/habitsList.js', 'js/ui/confirmDialog.js',
  'js/ui/todayScreen.js', 'js/ui/progressScreen.js', 'js/ui/streakBadge.js', 'js/ui/ring.js',
  'js/ui/confetti.js', 'js/ui/backup.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
