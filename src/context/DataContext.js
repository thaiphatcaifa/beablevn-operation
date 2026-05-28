import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase'; 
import { ref, onValue, set, update, remove, push } from "firebase/database";
import { auth } from '../firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // --- STATES ---
  const [staffList, setStaffList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [facilityLogs, setFacilityLogs] = useState([]); 
  const [disciplineTypes, setDisciplineTypes] = useState([]); 
  const [disciplineRecords, setDisciplineRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [autoDisciplineRules, setAutoDisciplineRules] = useState([]); // State cho luật kỷ luật tự động
  
  // State theo dõi tiến trình tải dữ liệu ban đầu
  const [loading, setLoading] = useState(true);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    let unsubs = [];
    
    // Đảm bảo đăng nhập ẩn danh trước khi gắn listener để lấy quyền đọc database
    const setupListeners = () => {
      // Bộ đếm kiểm tra việc nạp dữ liệu lần đầu từ 10 nhánh DatabaseListeners khác nhau
      let loadedCount = 0;
      const totalListeners = 10; // Đã bao gồm autoDisciplineRules

      const checkInitialLoad = () => {
        loadedCount++;
        if (loadedCount >= totalListeners) {
          setLoading(false);
        }
      };

      // 1. STAFF
      const staffRef = ref(db, 'staff');
      const unsubStaff = onValue(staffRef, (snapshot) => {
        const data = snapshot.val();
        setStaffList(data ? Object.keys(data).map(key => ({ ...data[key], id: key, positions: data[key].positions || [] })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 2. TASKS
      const tasksRef = ref(db, 'tasks');
      const unsubTasks = onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();
        setTasks(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 3. SHIFTS
      const shiftsRef = ref(db, 'shifts');
      const unsubShifts = onValue(shiftsRef, (snapshot) => {
        const data = snapshot.val();
        setShifts(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 4. ATTENDANCE
      const attRef = ref(db, 'attendance');
      const unsubAtt = onValue(attRef, (snapshot) => {
        const data = snapshot.val();
        setAttendanceLogs(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 5. FACILITY LOGS
      const facilityRef = ref(db, 'facilityLogs');
      const unsubFacility = onValue(facilityRef, (snapshot) => {
        const data = snapshot.val();
        setFacilityLogs(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 6. DISCIPLINES
      const discTypeRef = ref(db, 'disciplineTypes');
      const unsubDiscType = onValue(discTypeRef, (snapshot) => {
        const data = snapshot.val();
        setDisciplineTypes(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });
      
      const discRecRef = ref(db, 'disciplineRecords');
      const unsubDiscRec = onValue(discRecRef, (snapshot) => {
        const data = snapshot.val();
        setDisciplineRecords(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 7. SCHEDULES
      const schedulesRef = ref(db, 'schedules');
      const unsubSchedules = onValue(schedulesRef, (snapshot) => {
        const data = snapshot.val();
        setSchedules(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 8. PAYROLL RECORDS
      const payrollRef = ref(db, 'payrollRecords');
      const unsubPayroll = onValue(payrollRef, (snapshot) => {
        const data = snapshot.val();
        setPayrollRecords(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      // 9. AUTO DISCIPLINE RULES (QUY TẮC TỰ ĐỘNG)
      const autoRulesRef = ref(db, 'autoDisciplineRules');
      const unsubAutoRules = onValue(autoRulesRef, (snapshot) => {
        const data = snapshot.val();
        setAutoDisciplineRules(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
        checkInitialLoad();
      }, (error) => { checkInitialLoad(); });

      unsubs = [
        unsubStaff, unsubTasks, unsubShifts, unsubAtt, unsubFacility, 
        unsubDiscType, unsubDiscRec, unsubSchedules, unsubPayroll, unsubAutoRules
      ];
    };

    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Lỗi đăng nhập ẩn danh (Anonymous Auth):", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Đã có Auth (ẩn danh hoặc thật), bắt đầu gắn listeners
        setupListeners();
      } else {
        // Chưa có, tiến hành đăng nhập ẩn danh
        initAuth();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubs.forEach(unsub => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  // --- ACTIONS ---

  // Staff
  const addStaff = (s) => { 
    const newRef = push(ref(db, 'staff'));
    const newId = newRef.key;
    return set(newRef, { ...s, id: newId }); 
  };
  const deleteStaff = (id) => remove(ref(db, 'staff/' + id));
  const updateStaffInfo = (id, updates) => update(ref(db, 'staff/' + id), updates);

  // Tasks
  const addTask = (t) => { 
    const newRef = push(ref(db, 'tasks'));
    const newId = newRef.key; 
    return set(newRef, { ...t, id: newId, progress: 0, status: 'assigned', createdDate: new Date().toISOString() }); 
  };
  const updateTask = (id, updates) => update(ref(db, 'tasks/' + id), updates);
  const deleteTask = (id) => remove(ref(db, 'tasks/' + id));
  const updateTaskProgress = (id, progress) => update(ref(db, 'tasks/' + id), { progress });
  const finishTask = (id) => update(ref(db, 'tasks/' + id), { status: 'completed', progress: 100 });

  // Shifts / Attendance
  const addAttendance = (log) => { 
    const newRef = push(ref(db, 'attendance'));
    const newId = newRef.key;
    return set(newRef, { ...log, id: newId }); 
  };
  const updateAttendanceLog = (id, updates) => update(ref(db, 'attendance/' + id), updates);

  // Facility
  const addFacilityLog = (log) => {
    const newRef = push(ref(db, 'facilityLogs'));
    const newId = newRef.key;
    return set(newRef, { ...log, id: newId });
  };

  // Discipline Types
  const addDisciplineType = (type) => {
    const newRef = push(ref(db, 'disciplineTypes'));
    const newId = newRef.key;
    return set(newRef, { ...type, id: newId });
  };
  const updateDisciplineTypeStatus = (id, status) => update(ref(db, 'disciplineTypes/' + id), { status });
  const softDeleteDisciplineType = (id) => update(ref(db, 'disciplineTypes/' + id), { status: 'inactive' });
  const proposeDeleteDisciplineType = (id) => update(ref(db, 'disciplineTypes/' + id), { status: 'pending_delete' });
  const deleteDisciplineType = (id) => remove(ref(db, 'disciplineTypes/' + id));

  // Discipline Records
  const addDisciplineRecord = (record) => {
    const newRef = push(ref(db, 'disciplineRecords'));
    const newId = newRef.key;
    return set(newRef, { ...record, id: newId, status: 'pending' });
  };
  const updateDisciplineRecordStatus = (id, status) => update(ref(db, 'disciplineRecords/' + id), { status });
  const deleteDisciplineRecord = (id) => remove(ref(db, 'disciplineRecords/' + id)); // Hỗ trợ gỡ kỷ luật gán nhầm

  // Auto Discipline Rules (THÊM MỚI / HOÀN THIỆN)
  const addAutoRule = (rule) => {
    const newRef = push(ref(db, 'autoDisciplineRules'));
    const newId = newRef.key;
    return set(newRef, { ...rule, id: newId, createdAt: new Date().toISOString() });
  };
  const updateAutoRule = (id, updates) => update(ref(db, 'autoDisciplineRules/' + id), updates);
  const deleteAutoRule = (id) => remove(ref(db, 'autoDisciplineRules/' + id));

  // Schedules 
  const addSchedule = (sched) => { 
    const newRef = push(ref(db, 'schedules'));
    const newId = newRef.key; 
    set(newRef, { ...sched, id: newId, createdAt: new Date().toISOString() }); 
    return newId; 
  };
  const updateSchedule = (id, updates) => update(ref(db, 'schedules/' + id), updates);
  const deleteSchedule = (id) => remove(ref(db, 'schedules/' + id));

  // --- PAYROLL RECORDS (Chốt báo cáo) ---
  const savePayrollRecord = (recordData) => {
    return set(ref(db, 'payrollRecords/' + recordData.month), { ...recordData, id: recordData.month });
  };

  // --- EXPORT CONTEXT ---
  return (
    <DataContext.Provider value={{ 
      loading, // Xuất trạng thái loading ra ngoài context
      staffList, addStaff, deleteStaff, updateStaffInfo, 
      tasks, addTask, updateTask, deleteTask, updateTaskProgress, finishTask,
      shifts, attendanceLogs, addAttendance, updateAttendanceLog,
      facilityLogs, addFacilityLog,
      disciplineTypes, addDisciplineType, updateDisciplineTypeStatus, softDeleteDisciplineType, proposeDeleteDisciplineType, deleteDisciplineType,
      disciplineRecords, addDisciplineRecord, updateDisciplineRecordStatus, deleteDisciplineRecord,
      autoDisciplineRules, addAutoRule, updateAutoRule, deleteAutoRule, // Export cho Auto Rules
      schedules, addSchedule, updateSchedule, deleteSchedule,
      payrollRecords, savePayrollRecord 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);