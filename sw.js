const CACHE_NAME = "rahmotpur-news-v1";

const OFFLINE_FILES = [
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

      return cache.addAll(OFFLINE_FILES);

    })

  );

  self.skipWaiting();

});


/* =========================
   ACTIVATE
========================= */

self.addEventListener("activate", function(event) {

  event.waitUntil(

    caches.keys().then(function(names) {

      return Promise.all(

        names.map(function(name) {

          if(name !== CACHE_NAME) {

            return caches.delete(name);

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

  if(event.request.method !== "GET") {

    return;

  }

  event.respondWith(

    fetch(event.request)

      .then(function(response) {

        if(response && response.status === 200) {

          const copy = response.clone();

          caches.open(CACHE_NAME).then(function(cache) {

            cache.put(event.request, copy);

          });

        }

        return response;

      })

      .catch(function() {

        return caches.match(event.request);

      })

  );

});


/* =========================
   FIREBASE NOTIFICATION
========================= */

self.addEventListener(
  "push",
  function(event) {

    let data = {};

    try {

      if(event.data) {

        data = event.data.json();

      }

    } catch(error) {

      data = {

        notification: {

          title: "Rahmotpur News",

          body: event.data
            ? event.data.text()
            : "নতুন খবর প্রকাশিত হয়েছে।"

        }

      };

    }


    const notification =
      data.notification || data;


    const title =
      notification.title ||
      "Rahmotpur News";


    const options = {

      body:
        notification.body ||
        "নতুন খবর প্রকাশিত হয়েছে।",

      icon:
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjubv8pdof9w5KdiSeB5TV8e93OYhQ8nhBcO3RRgSW8GyPr9ysInzD3GCU_B7K74qHbnZHJdcLuaqVRNACbfhk4DLCpg6nbweylNnfSgRBAJXoMdyXuYLZ-aLEWp3Yt4qwh-U1gx5UoXs49xMKeA6w7BLVH1lvjGzSCHH3ayVQKSbdOpQ/s1600/FB_IMG_1786278216091.jpg",

      badge:
        "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjubv8pdof9w5KdiSeB5TV8e93OYhQ8nhBcO3RRgSW8GyPr9ysInzD3GCU_B7K74qHbnZHJdcLuaqVRNACbfhk4DLCpg6nbweylNnfSgRBAJXoMdyXuYLZ-aLEWp3Yt4qwh-U1gx5UoXs49xMKeA6w7BLVH1lvjGzSCHH3ayVQKSbdOpQ/s1600/FB_IMG_1786278216091.jpg",

      data: {

        url:
          notification.click_action ||
          "https://rahmotpur-news-bd.github.io/rahmotpur-news-pwa/"

      },

      requireInteraction: false,

      vibrate: [200, 100, 200]

    };


    event.waitUntil(

      self.registration.showNotification(
        title,
        options
      )

    );

  }
);


/* =========================
   NOTIFICATION CLICK
========================= */

self.addEventListener(
  "notificationclick",
  function(event) {

    event.notification.close();


    const url =
      event.notification.data &&
      event.notification.data.url
        ? event.notification.data.url
        : "https://rahmotpur-news-bd.github.io/rahmotpur-news-pwa/";


    event.waitUntil(

      clients.matchAll({

        type: "window",
        includeUncontrolled: true

      }).then(function(clientList) {

        for(
          const client of clientList
        ) {

          if(
            client.url.includes(
              "rahmotpur-news-bd.github.io"
            )
          ) {

            client.focus();

            return client.navigate(url);

          }

        }


        return clients.openWindow(url);

      })

    );

  }
);
