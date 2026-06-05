import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './utils/notify'; // Ghi đè window.alert -> toast nổi (áp dụng toàn app, không chặn luồng)
import App from './App';

// KHẮC PHỤC LỖI IOS SAFARI PWA: Tự động xóa bộ nhớ đệm cũ mỗi khi mở app
if ('caches' in window) {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name);
    });
  });
}

// Gỡ Service Worker CŨ bị kẹt (vd PWA cache trên iPhone), NHƯNG giữ lại
// service worker của Firebase Messaging — cần cho thông báo nhắc ca chạy nền.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    registrations.forEach(function(registration) {
      const url = (registration.active && registration.active.scriptURL) || '';
      const scope = registration.scope || '';
      const isMessagingSW = url.includes('firebase-messaging-sw') || scope.includes('firebase-cloud-messaging');
      if (!isMessagingSW) {
        registration.unregister();
      }
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);