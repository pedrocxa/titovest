const CACHE_NAME = 'titovest-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpa caches antigos
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Em desenvolvimento (localhost), não intercepta nada — deixa o Vite trabalhar normalmente
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return;

  // Ignora requisições cross-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Clona o request antes de usar, pois só pode ser lido uma vez
      const networkFetch = fetch(event.request.clone())
        .then((networkResponse) => {
          // Só cacheia respostas válidas e do mesmo origin
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type !== 'opaque'
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('App offline, usando versão em cache.');
          // Retorna cache se existir, senão resposta de erro limpa
          return cachedResponse || new Response('Offline - sem cache disponível.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        });

      // Stale-while-revalidate: cache imediato + rede atualizando no fundo
      return cachedResponse || networkFetch;
    })
  );
});
