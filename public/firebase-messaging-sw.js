// Import các thư viện Firebase dạng compat cho Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Cấu hình giống y hệt file firebase.js của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCcDf-QwrU2zkkQan49gSdq6AkjY5JI2rQ",
  authDomain: "beablevn-operation.firebaseapp.com",
  databaseURL: "https://beablevn-operation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beablevn-operation",
  storageBucket: "beablevn-operation.firebasestorage.app",
  messagingSenderId: "18301003388",
  appId: "1:18301003388:web:a32ceea5343c27a1134bf9"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Lắng nghe và hiển thị thông báo khi ứng dụng đang chạy ngầm
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Đã nhận tin nhắn dưới nền ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png', // Logo hiển thị ở góc thông báo
    badge: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});