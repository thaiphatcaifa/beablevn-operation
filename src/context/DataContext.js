import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase'; 
import { ref, onValue, set, update, remove } from "firebase/database";

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // --- STATES ---
  const [staffList, setStaffList] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // LocalStorage cho dữ liệu cấu hình (Regulatory ban hành)
  const getInitialData = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // Danh sách hình thức kỷ luật (Do Regulatory quản lý)
  const [disciplineTypes, setDisciplineTypes] = useState(() => getInitialData('disciplineTypes', [
    'Nhắc nhở miệng',
    'Trừ 5% KPI tháng',
    'Cảnh cáo toàn công ty',
    'Đình chỉ công tác'
  ]));

  // Danh sách đề xuất kỷ luật (Do Op đề xuất, Reg duyệt)
  const [proposals, setProposals] = useState(() => getInitialData('proposals', []));

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    // STAFF
    const staffRef = ref(db, 'staff');
    const unsubStaff = onValue(staffRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key, // Đảm bảo ID là key của Firebase để tránh trùng lặp
          positions: data[key].positions || [], 
          baseUBI: data[key].baseUBI || 0,
          ubiPercentage: data[key].ubiPercentage || 100,
          status: data[key].status || 'active'
        }));
        setStaffList(list);
      } else {
        setStaffList([]);
      }
    });

    // TASKS
    const tasksRef = ref(db, 'tasks');
    const unsubTasks = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          ...data[key],
          id: key // ID task
        }));
        setTasks(list);
      } else {
        setTasks([]);
      }
    });

    return () => { unsubStaff(); unsubTasks(); };
  }, []);

  // --- SYNC LOCALSTORAGE ---
  useEffect(() => { localStorage.setItem('disciplineTypes', JSON.stringify(disciplineTypes)); }, [disciplineTypes]);
  useEffect(() => { localStorage.setItem('proposals', JSON.stringify(proposals)); }, [proposals]);

  // --- ACTIONS ---

  // 1. STAFF
  const addStaff = (s) => {
    const newId = Date.now().toString(); // Dùng String ID
    set(ref(db, 'staff/' + newId), { ...s, id: newId });
  };
  const deleteStaff = (id) => remove(ref(db, 'staff/' + id));
  const updateStaffInfo = (id, updates) => update(ref(db, 'staff/' + id), updates);
  const updatePassword = (id, newPass) => updateStaffInfo(id, { password: newPass });

  // 2. TASKS (Operational)
  const addTask = (t) => {
    const newId = Date.now().toString();
    set(ref(db, 'tasks/' + newId), { 
      ...t, 
      id: newId, 
      progress: 0, 
      status: 'assigned',
      createdDate: new Date().toISOString()
    });
  };
  const updateTask = (taskId, newData) => update(ref(db, 'tasks/' + taskId), newData);
  const deleteTask = (taskId) => remove(ref(db, 'tasks/' + taskId));

  // 3. DISCIPLINE (Regulatory & Op)
  const addDisciplineType = (type) => setDisciplineTypes([...disciplineTypes, type]);
  const removeDisciplineType = (type) => setDisciplineTypes(disciplineTypes.filter(t => t !== type));
  
  // Op đề xuất, Reg duyệt
  const addProposal = (prop) => setProposals([...proposals, { ...prop, id: Date.now(), status: 'Pending' }]);
  const updateProposalStatus = (id, status) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, status: status } : p));
  };
  const deleteProposal = (id) => setProposals(proposals.filter(p => p.id !== id));

  return (
    <DataContext.Provider value={{ 
      staffList, addStaff, deleteStaff, updatePassword, updateStaffInfo,
      tasks, addTask, updateTask, deleteTask,
      disciplineTypes, addDisciplineType, removeDisciplineType,
      proposals, addProposal, updateProposalStatus, deleteProposal
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);