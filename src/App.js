// src/App.js
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/LoginForm';
import StaffManager from './pages/Admin/StaffManager';
import TaskManager from './pages/Admin/TaskManager';
import Attendance from './pages/Staff/Attendance';
import MyTasks from './pages/Staff/MyTasks';
// ... import các component khác

function App() {
  // Giả lập trạng thái đăng nhập (Thực tế sẽ lấy từ API/Context)
  const [user, setUser] = useState(null); // { role: 'admin' } hoặc { role: 'staff' }

  return (
    <div className="App">
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/login" element={<Login onLogin={setUser} />} />

        {/* Khu vực Admin - Chỉ vào được nếu role là admin */}
        <Route path="/admin/*" element={
            user?.role === 'admin' ? (
              <div className="admin-layout">
                 <nav>Menu Admin: <a href="/admin/staff">Nhân sự</a> | <a href="/admin/tasks">Giao việc</a></nav>
                 <Routes>
                    <Route path="staff" element={<StaffManager />} />
                    <Route path="tasks" element={<TaskManager />} />
                 </Routes>
              </div>
            ) : <Navigate to="/login" />
        } />

        {/* Khu vực Staff - Chỉ vào được nếu role là staff */}
        <Route path="/staff/*" element={
            user?.role === 'staff' ? (
              <div className="staff-layout">
                 <nav>Menu NV: <a href="/staff/attendance">Điểm danh</a> | <a href="/staff/tasks">Công việc</a></nav>
                 <Routes>
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="tasks" element={<MyTasks />} />
                 </Routes>
              </div>
            ) : <Navigate to="/login" />
        } />
        
        {/* Mặc định về trang login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;