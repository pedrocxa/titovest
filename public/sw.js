const CACHE_NAME = 'titovest-cache-v1';

// Instalação rápida
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Estratégia Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          // Salva no cache para a próxima vez
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Se falhar (offline), o app continua rodando usando apenas o cache
        console.log('App offline, usando versão em cache.');
      });
      
      // Retorna o cache IMEDIATAMENTE (se existir), enquanto a rede atualiza no fundo
      return cachedResponse || fetchPromise; 
    })
  );
});
