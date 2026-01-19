import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Thư viện điều hướng trang đơn [cite: 779]
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Khởi tạo root element từ id 'root' trong tệp index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Bao bọc App bằng BrowserRouter để sử dụng được Routes và Link trong toàn bộ dự án  */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Đo lường hiệu suất ứng dụng (tùy chọn)
reportWebVitals();