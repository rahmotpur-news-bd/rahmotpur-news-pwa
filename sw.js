const CACHE_NAME = "rahmotpur-news-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

/* =========================
   FIREBASE MESSAGING
========================= */

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBZjx3DqTd-1yzymUB7p4cVpO3QokVq11M4",
  authDomain: "rahmotpur-news.firebaseapp.com",
  projectId: "rahmotpur-news",
  storageBucket: "rahmotpur-news.firebasestorage.app",
  messagingSenderId: "669823932201",
  appId: "1:669823932201:web:0f6e4fd04fc01293a78938"
});

const messaging = firebase.messaging();

/* =========================
   BACKGROUND NOTIFICATION
========================= */

messaging.onBackgroundMessage(payload => {

  const notification = payload.notification || {};

  const title =
    notification.title || "Rahmotpur News";

  const options = {

    body:
      notification.body ||
      "নতুন খবর প্রকাশিত হয়েছে।",

    icon: "./icon.png",

    badge: "./icon.png",

    data: {
      url:
        payload.data?.url ||
        "./"
    }

  };

  self.registration.showNotification(
    title,
    options
  );

});


/* =========================
   NOTIFICATION CLICK
========================= */

self.addEventListener("notificationclick", event => {

  event.notification.close();

  const url =
    event.notification.data?.url || "./";

  event.waitUntil(

    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {

      for (const client of clientList) {

        if ("focus" in client) {

          client.navigate(url);
          return client.focus();

        }

      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

    })

  );

});


/* =========================
   INSTALL
========================= */

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .catch(error => {
        console.error(
          "Cache install error:",
          error
        );
      })

  );

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(names => {

      return Promise.all(

        names
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))

      );

    }).then(() => {

      return self.clients.claim();

    })

  );

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(

    fetch(event.request)

      .then(response => {

        if (
          response &&
          response.status === 200
        ) {

          const copy =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                copy
              );

            });

        }

        return response;

      })

      .catch(() => {

        return caches.match(
          event.request
        ).then(cached => {

          return (
            cached ||
            caches.match("./")
          );

        });

      })

  );

});
