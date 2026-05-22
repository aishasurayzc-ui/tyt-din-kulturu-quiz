/* =============================================
   SERVICE WORKER — TYT Din Kültürü Quiz PWA
   Offline-first cache stratejisi
   ============================================= */

const CACHE  = 'din-quiz-v1';
const BASE   = '/tyt-din-kulturu-quiz';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/questions-data.js',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,500&family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
];

/* ── Install: tüm varlıkları önbelleğe al ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: eski cache'leri temizle ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first, sonra network ── */
self.addEventListener('fetch', e => {
  // Sadece GET isteklerini yakala
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(response => {
            // Geçerli yanıtları cache'e ekle
            if (response && response.status === 200 && response.type !== 'opaque') {
              const clone = response.clone();
              caches.open(CACHE).then(c => c.put(e.request, clone));
            }
            return response;
          })
          .catch(() => {
            // Offline ve cache'de yoksa fallback
            if (e.request.destination === 'document') {
              return caches.match(BASE + '/index.html');
            }
          });
      })
  );
});
