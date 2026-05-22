import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import LoginForm from './components/LoginForm';
import AdminLayout from './components/Layouts/AdminLayout';
import StaffLayout from './components/Layouts/StaffLayout';

import StaffManager from './pages/Admin/StaffManager';
import TaskManager from './pages/Admin/TaskManager';
import DisciplineManager from './pages/Admin/DisciplineManager'; 
import Reports from './pages/Admin/Reports';

// --- IMPORT STAFF PAGES ---
import StaffDashboard from './pages/Staff/StaffDashboard'; // <--- 1. IMPORT MỚI
import Attendance from './pages/Staff/Attendance';
import MyTasks from './pages/Staff/MyTasks';
import FacilityCheck from './pages/Staff/FacilityCheck';
import Performance from './pages/Staff/Performance';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          
          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="staff-manager" />} />
            <Route path="staff-manager" element={<StaffManager />} />
            <Route path="task-manager" element={<TaskManager />} />
            <Route path="discipline-manager" element={<DisciplineManager />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* --- STAFF ROUTES --- */}
          <Route path="/staff" element={<StaffLayout />}>
            {/* Khi vào /staff sẽ tự chuyển hướng vào Dashboard */}
            <Route index element={<Navigate to="dashboard" />} /> 
            
            {/* <--- 2. THÊM ROUTE CHO DASHBOARD TẠI ĐÂY */}
            <Route path="dashboard" element={<StaffDashboard />} />
            
            <Route path="attendance" element={<Attendance />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="facility-check" element={<FacilityCheck />} />
            <Route path="performance" element={<Performance />} />
          </Route>

          {/* Catch-all: Chuyển về Login nếu không tìm thấy trang */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;