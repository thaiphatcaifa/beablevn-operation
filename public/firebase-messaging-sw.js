// Import các thư viện Firebase dành cho Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Copy config từ dự án của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCcDf-QwrU2zkkQan49gSdq6AkjY5JI2rQ",
  authDomain: "beablevn-operation.firebaseapp.com",
  databaseURL: "https://beablevn-operation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beablevn-operation",
  storageBucket: "beablevn-operation.firebasestorage.app",
  messagingSenderId: "18301003388",
  appId: "1:18301003388:web:a32ceea5343c27a1134bf9",
  measurementId: "G-L54LMGPTL4"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Bắt thông báo khi app đang chạy ngầm
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Nhận thông báo ngầm ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/BA LOGO.png' // Icon sẽ hiển thị trên thông báo (đã có trong file public của bạn)
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});