const cacheName = 'mp3-player-cache-v1';
const filesToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/script.js',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/music/Adventure Of A Lifetime.mp3',
    '/music/gregodopiseiro.mp3',
    '/music/Guns N Roses Greatest Hits.mp3',
    '/music/Pharrell Williams - Happy.mp3',
    '/music/Sky Full of Stars.mp3',
    '/music/DANCE MONKEY.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(filesToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});