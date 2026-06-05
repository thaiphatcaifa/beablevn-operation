/* Service Worker cho Firebase Cloud Messaging.
   Cần thiết để: (1) app lấy được FCM token, (2) hiển thị thông báo khi app ở nền/đóng.
   Đặt ở thư mục public/ để được phục vụ tại đường dẫn gốc /firebase-messaging-sw.js */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCcDf-QwrU2zkkQan49gSdq6AkjY5JI2rQ",
  authDomain: "beablevn-operation.firebaseapp.com",
  databaseURL: "https://beablevn-operation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beablevn-operation",
  storageBucket: "beablevn-operation.firebasestorage.app",
  messagingSenderId: "18301003388",
  appId: "1:18301003388:web:a32ceea5343c27a1134bf9",
  measurementId: "G-L54LMGPTL4",
});

const messaging = firebase.messaging();

// Hiển thị thông báo khi app KHÔNG mở (chạy nền).
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "Be Able VN";
  const options = {
    body: (payload.notification && payload.notification.body) || "",
    icon: "/BA LOGO.png",
    badge: "/BA LOGO.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// Bấm vào thông báo -> mở trang chấm công.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/staff/attendance"));
});
