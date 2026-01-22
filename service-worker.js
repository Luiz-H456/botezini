const CACHE_NAME = 'botezini-erp-v1.8';

// Recursos externos essenciais (React, Tailwind, Icons) que devem ser cacheados
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Instalação: Cacheia arquivos estáticos iniciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// 2. Ativação: Limpa caches antigos se houver atualização de versão
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch: Intercepta requisições
self.addEventListener('fetch', (event) => {
  let url;
  try {
    url = new URL(event.request.url);
  } catch (e) {
    return; 
  }

  // CRITICO: Ignorar cache para APIs do Supabase e extensões
  if (
    event.request.method !== 'GET' || 
    url.hostname.includes('supabase.co') || 
    url.pathname.includes('/api/') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // Estratégia Stale-While-Revalidate para arquivos estáticos (JS, CSS, Imagens)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
           if(networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
           }
           return networkResponse;
        }).catch(() => {});

        return cachedResponse || fetchPromise;
      })
  );
});