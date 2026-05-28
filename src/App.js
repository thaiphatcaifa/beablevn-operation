import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import LoginForm from './components/LoginForm';
import AdminLayout from './components/Layouts/AdminLayout';
import StaffLayout from './components/Layouts/StaffLayout';

import StaffManager from './pages/Admin/StaffManager';
import TaskManager from './pages/Admin/TaskManager';
import DisciplineManager from './pages/Admin/DisciplineManager'; 
import FacilityManager from './pages/Admin/FacilityManager'; // --- IMPORT TRANG CSHT ---
import Reports from './pages/Admin/Reports';

// --- IMPORT STAFF PAGES ---
import StaffDashboard from './pages/Staff/StaffDashboard';
import Attendance from './pages/Staff/Attendance';
import MyTasks from './pages/Staff/MyTasks';
import FacilityCheck from './pages/Staff/FacilityCheck';
import Performance from './pages/Staff/Performance';

// --- COMPONENT BỌC BẢO VỆ ĐỊNH TUYẾN (PROTECTED ROUTE) ---
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  // 1. Nếu không có user (chưa đăng nhập), điều hướng ngay về trang Login (/)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // DANH SÁCH CÁC ROLE CÓ QUYỀN TRUY CẬP TRANG QUẢN TRỊ (ADMIN PORTAL)
  const adminRoles = ['admin', 'chief', 'reg', 'op', 'scheduler'];

  // 2. Nếu route yêu cầu quyền admin mà user không phải admin -> Đẩy về app nhân viên
  if (requireAdmin && !adminRoles.includes(user.role)) {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // ĐÃ XÓA ĐOẠN CODE CHẶN ADMIN TRUY CẬP TRANG STAFF ĐỂ BẠN CÓ THỂ CHUYỂN ĐỔI GIAO DIỆN BÌNH THƯỜNG

  return children;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          {/* Màn hình đăng nhập */}
          <Route path="/" element={<LoginForm />} />

          {/* --- ADMIN ROUTES --- */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="staff-manager" />} />
            <Route path="staff-manager" element={<StaffManager />} />
            <Route path="task-manager" element={<TaskManager />} />
            <Route path="discipline-manager" element={<DisciplineManager />} />
            <Route path="facility-manager" element={<FacilityManager />} /> {/* --- ROUTE CHO TRANG CSHT --- */}
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* --- STAFF ROUTES --- */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute requireAdmin={false}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" />} /> 
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="facility-check" element={<FacilityCheck />} />
            <Route path="performance" element={<Performance />} />
          </Route>

          {/* Catch-all: Chuyển về Login nếu không tìm thấy trang */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;