const CACHE_NAME = "rahmotpur-news-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];


/* =========================
   INSTALL
========================= */

self.addEventListener("install", function(event) {

  event.waitUntil(

    caches.open(CACHE_NAME).then(function(cache) {

      return cache.addAll(APP_FILES);

    }).catch(function(error) {

      console.error(
        "Cache install error:",
        error
      );

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

    }).then(function() {

      return self.clients.claim();

    })

  );

});


/* =========================
   FETCH
========================= */

self.addEventListener("fetch", function(event) {

  if(event.request.method !== "GET") {

    return;

  }

  const requestURL =
    new URL(
      event.request.url
    );


  /* =========================
     APP NAVIGATION
  ========================= */

  if(
    event.request.mode === "navigate" &&
    requestURL.origin === location.origin
  ){

    event.respondWith(

      fetch(event.request)
        .then(function(response){

          return response;

        })
        .catch(function(){

          return caches.match(
            "./index.html"
          );

        })

    );

    return;

  }


  /* =========================
     OTHER REQUESTS
  ========================= */

  event.respondWith(

    fetch(event.request)

      .then(function(response){

        if(
          response &&
          response.status === 200
        ){

          const copy =
            response.clone();

          caches.open(
            CACHE_NAME
          ).then(function(cache){

            cache.put(
              event.request,
              copy
            );

          });

        }

        return response;

      })

      .catch(function(){

        return caches.match(
          event.request
        );

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

          body:
            event.data
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
        "./icon.png",

      badge:
        "./icon.png",

      data: {

        url:
          notification.click_action ||
          "./"

      },

      requireInteraction: false,

      vibrate: [
        200,
        100,
        200
      ]

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


    const targetURL =
      event.notification.data &&
      event.notification.data.url
        ? event.notification.data.url
        : "./";


    event.waitUntil(

      clients.matchAll({

        type: "window",
        includeUncontrolled: true

      }).then(function(clientList) {


        for(
          const client of clientList
        ){

          if(
            client.url.includes(
              "/rahmotpur-news-pwa/"
            )
          ){

            client.focus();

            return;

          }

        }


        return clients.openWindow(
          targetURL
        );

      })

    );

  }
);
