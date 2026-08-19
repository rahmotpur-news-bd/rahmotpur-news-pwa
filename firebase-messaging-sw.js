importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBZjx3DqTd-1yzymUB5p4cVpO3QokVq11M4",
  authDomain: "rahmotpur-news.firebaseapp.com",
  projectId: "rahmotpur-news",
  storageBucket: "rahmotpur-news.firebasestorage.app",
  messagingSenderId: "669823932201",
  appId: "1:669823932201:web:0f6e4fd04fc01293a78938"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

  const notificationTitle =
    payload.notification?.title ||
    "Rahmotpur News";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "নতুন খবর প্রকাশিত হয়েছে।",

    icon: "./icon.svg",

    data: {
      url:
        payload.data?.url ||
        "https://rahmotpur-news-bd.github.io/rahmotpur-news-pwa/"
    }
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});


self.addEventListener(
  "notificationclick",
  function(event) {

    event.notification.close();

    const url =
      event.notification.data?.url ||
      "https://rahmotpur-news-bd.github.io/rahmotpur-news-pwa/";

    event.waitUntil(
      clients.openWindow(url)
    );

  }
);
