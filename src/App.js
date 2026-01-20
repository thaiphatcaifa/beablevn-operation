import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import LoginForm from './components/LoginForm';
import AdminLayout from './components/Layouts/AdminLayout';
import StaffLayout from './components/Layouts/StaffLayout';

import StaffManager from './pages/Admin/StaffManager';
import TaskManager from './pages/Admin/TaskManager';
import Reports from './pages/Admin/Reports';

import Attendance from './pages/Staff/Attendance';
import MyTasks from './pages/Staff/MyTasks';
import FacilityCheck from './pages/Staff/FacilityCheck';
import Performance from './pages/Staff/Performance'; // Import trang mới

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="staff-manager" element={<StaffManager />} />
            <Route path="task-manager" element={<TaskManager />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="/staff" element={<StaffLayout />}>
            <Route path="attendance" element={<Attendance />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="facility-check" element={<FacilityCheck />} />
            <Route path="performance" element={<Performance />} /> {/* Route mới */}
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;