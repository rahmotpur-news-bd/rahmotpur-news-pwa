const CACHE_NAME = "rahmotpur-news-v4";


const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];


importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);


firebase.initializeApp({

  apiKey:
    "AIzaSyBZjx3DqTd-1yzymUBp4cVpO3QokVq11M4",

  authDomain:
    "rahmotpur-news.firebaseapp.com",

  projectId:
    "rahmotpur-news",

  storageBucket:
    "rahmotpur-news.firebasestorage.app",

  messagingSenderId:
    "669823932201",

  appId:
    "1:669823932201:web:0f6e4fd04fc01293a78938"

});


const messaging =
firebase.messaging();


messaging.onBackgroundMessage(
function(payload){

  const title =
    payload.notification?.title ||
    "Rahmotpur News";


  const options = {

    body:
      payload.notification?.body ||
      "নতুন খবর প্রকাশিত হয়েছে।",

    icon:
      "./icon.svg",

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


self.addEventListener(
"notificationclick",
function(event){

  event.notification.close();


  const url =
    event.notification?.data?.url ||
    "./";


  event.waitUntil(

    clients.matchAll({
      type:"window",
      includeUncontrolled:true
    })
    .then(function(clientList){

      for(
        const client of clientList
      ){

        if(
          "focus" in client
        ){

          client.navigate(url);

          return client.focus();

        }

      }


      if(
        clients.openWindow
      ){

        return clients.openWindow(url);

      }

    })

  );

});


self.addEventListener(
"install",
function(event){

  event.waitUntil(

    caches.open(
      CACHE_NAME
    ).then(function(cache){

      return cache.addAll(
        FILES_TO_CACHE
      );

    })

  );

  self.skipWaiting();

});


self.addEventListener(
"activate",
function(event){

  event.waitUntil(

    caches.keys()
    .then(function(keys){

      return Promise.all(

        keys.map(
          function(key){

            if(
              key !== CACHE_NAME
            ){

              return caches.delete(
                key
              );

            }

          }
        )

      );

    })

  );

  self.clients.claim();

});


self.addEventListener(
"fetch",
function(event){

  if(
    event.request.method !== "GET"
  ){

    return;

  }


  event.respondWith(

    fetch(event.request)
    .then(function(response){

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


      return response;

    })
    .catch(function(){

      return caches.match(
        event.request
      );

    })

  );

});
