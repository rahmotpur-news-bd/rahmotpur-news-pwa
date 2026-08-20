const CACHE_NAME = "rahmotpur-news-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

/* =========================
   INSTALL
========================= */

self.addEventListener("install", function(event) {

  event.waitUntil(

    caches.open(CACHE_NAME).then(function(cache) {

      return cache.addAll(APP_FILES);

    })

  );

  self.skipWaiting();

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches.keys().then(function(cacheNames) {

      return Promise.all(

        cacheNames.map(function(cacheName) {

          if (cacheName !== CACHE_NAME) {

            return caches.delete(cacheName);

          }

        })

      );

    })

  );

  self.clients.claim();

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", function(event) {

  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(

    fetch(event.request)
      .then(function(response) {

        if (
          response &&
          response.status === 200 &&
          response.type !== "opaque"
        ) {

          const responseClone =
            response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {

              cache.put(
                event.request,
                responseClone
              );

            });

        }

        return response;

      })
      .catch(function() {

        return caches.match(
          event.request
        );

      })

  );

});
