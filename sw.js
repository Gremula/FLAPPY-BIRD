//version 1
const CACHE_NAME = 'v1';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/script.js',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/icon-180x180.png',
    '/offline.html'
];

// Installazione del Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching files');
            return cache.addAll(CACHE_ASSETS);
        })
    );
});

// Attivazione del Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Removing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Gestione delle richieste
self.addEventListener('fetch', event => {
    // Strategia Cache First
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log('Returning cached response for:', event.request.url);
                return cachedResponse; // Restituisce la risposta dalla cache se disponibile
            }
            console.log('Fetching from network:', event.request.url);
            return fetch(event.request).then(networkResponse => {
                // Aggiungi la risposta alla cache se è una risposta valida
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            // In caso di errore, restituisci una pagina offline o un messaggio
            return caches.match('/offline.html'); // Assicurati di avere una pagina offline.html nella cache
        })
    );
});
