import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // Dữ liệu mẫu Staff
  const [staffList, setStaffList] = useState([
    { id: 1, username: 'nv1', password: '123', name: 'Nguyễn Văn A', role: 'staff' },
    { id: 2, username: 'nv2', password: '123', name: 'Trần Thị B', role: 'staff' }
  ]);

  // Dữ liệu mẫu Tasks (Thêm trường discipline)
  const [tasks, setTasks] = useState([
    { 
      id: 1715000000000, 
      title: 'Thiết kế Logo mới', 
      assigneeId: 1, 
      progress: 50, 
      startDate: '2023-10-20',
      deadline: '2023-10-25', 
      discipline: 'Trừ 10% KPI tháng', // Dữ liệu mẫu
      completedDate: null,
      reason: '' 
    }
  ]);

  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [facilityLogs, setFacilityLogs] = useState([]);

  // --- CÁC HÀM XỬ LÝ ---

  const addStaff = (s) => setStaffList([...staffList, { ...s, id: Date.now() }]);
  
  const deleteStaff = (id) => {
    setStaffList(staffList.filter(staff => staff.id !== id));
  };

  const updatePassword = (id, newPass) => {
    setStaffList(staffList.map(s => s.id === id ? { ...s, password: newPass } : s));
  };

  // [CẬP NHẬT] Hàm addTask nhận thêm discipline
  const addTask = (t) => setTasks([...tasks, { 
    ...t, 
    id: Date.now(), 
    progress: 0, 
    reason: '',
    completedDate: null 
  }]);

  const updateTaskProgress = (id, p, reason = '') => {
    const now = new Date().toISOString().split('T')[0];
    setTasks(tasks.map(t => 
      t.id === id ? { 
        ...t, 
        progress: p, 
        reason: reason,
        completedDate: p === 100 ? now : null 
      } : t
    ));
  };

  const addAttendance = (log) => setAttendanceLogs([...attendanceLogs, log]);
  const addFacilityLog = (log) => setFacilityLogs([...facilityLogs, log]);

  return (
    <DataContext.Provider value={{ 
      staffList, addStaff, deleteStaff, updatePassword,
      tasks, addTask, updateTaskProgress, 
      attendanceLogs, addAttendance, 
      facilityLogs, addFacilityLog 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);