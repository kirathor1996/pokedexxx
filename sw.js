const CACHE = 'pokedex-v1';
const ASSETS = [
  '/pokedexxx/',
  '/pokedexxx/index.html',
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Press+Start+2P&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Para requests de la PokeAPI siempre ir a la red (datos frescos)
  if (e.request.url.includes('pokeapi.co') || e.request.url.includes('raw.githubusercontent.com')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Para el resto: cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return response;
    }))
  );
});
