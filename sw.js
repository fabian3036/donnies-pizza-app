// Service worker de Donnie's Pizza App
// Permite que la app cargue y se use SIN INTERNET después de haberla
// visitado al menos una vez estando conectado (necesario para descargar
// React, ReactDOM y Babel la primera vez).

const CACHE_NAME = 'donnies-pizza-v1';

// Archivos y librerías que se guardan para uso sin conexión.
// Si cambias el nombre del archivo HTML, actualízalo aquí también.
const ASSETS_TO_CACHE = [
  './',
  './donnies-pizza-app.html',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js',
];

// Al instalar, se descarga y guarda todo en caché.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          fetch(url, { mode: 'cors' })
            .then((res) => cache.put(url, res))
            .catch(() => {
              // Si algún recurso no se pudo descargar (sin internet en el
              // primer uso), simplemente se omite; se reintentará luego.
            })
        )
      );
    })
  );
  self.skipWaiting();
});

// Al activar, se eliminan versiones viejas de la caché.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: intenta la red primero (para tener datos/versión más
// reciente); si falla (sin internet), usa lo que haya en caché.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
