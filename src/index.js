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

// Xóa Service Worker cũ nếu bị kẹt trên iPhone
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    } 
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