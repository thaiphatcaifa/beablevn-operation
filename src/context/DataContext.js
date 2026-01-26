import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase'; 
import { ref, onValue, set, update, remove } from "firebase/database";

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  // --- STATES ---
  const [staffList, setStaffList] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  
  const [facilityLogs, setFacilityLogs] = useState([]); 
  
  // Discipline Types: { id, name, status, createdBy, createdAt, deletedBy, deletedAt, deleteReason }
  const [disciplineTypes, setDisciplineTypes] = useState([]); 
  const [disciplineRecords, setDisciplineRecords] = useState([]);

  // --- FIREBASE LISTENERS ---
  useEffect(() => {
    // 1. STAFF
    const staffRef = ref(db, 'staff');
    const unsubStaff = onValue(staffRef, (snapshot) => {
      const data = snapshot.val();
      setStaffList(data ? Object.keys(data).map(key => ({ ...data[key], id: key, positions: data[key].positions || [] })) : []);
    });

    // 2. TASKS
    const tasksRef = ref(db, 'tasks');
    const unsubTasks = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      setTasks(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
    });

    // 3. SHIFTS
    const shiftsRef = ref(db, 'shifts');
    const unsubShifts = onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      setShifts(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
    });

    // 4. ATTENDANCE
    const attRef = ref(db, 'attendance');
    const unsubAtt = onValue(attRef, (snapshot) => {
      const data = snapshot.val();
      setAttendanceLogs(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
    });

    // 5. FACILITY LOGS
    const facilityRef = ref(db, 'facilityLogs');
    const unsubFacility = onValue(facilityRef, (snapshot) => {
      const data = snapshot.val();
      setFacilityLogs(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
    });

    // 6. DISCIPLINES
    const discTypeRef = ref(db, 'disciplineTypes');
    const unsubDiscType = onValue(discTypeRef, (snapshot) => {
      const data = snapshot.val();
      setDisciplineTypes(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
    });
    
    const discRecRef = ref(db, 'disciplineRecords');
    const unsubDiscRec = onValue(discRecRef, (snapshot) => {
      const data = snapshot.val();
      setDisciplineRecords(data ? Object.keys(data).map(key => ({ ...data[key], id: key })) : []);
    });

    return () => {
      unsubStaff(); unsubTasks(); unsubShifts(); unsubAtt();
      unsubFacility(); unsubDiscType(); unsubDiscRec();
    };
  }, []);

  // --- ACTIONS ---

  // Staff
  const addStaff = (s) => { const newId = Date.now().toString(); set(ref(db, 'staff/' + newId), { ...s, id: newId }); };
  const deleteStaff = (id) => remove(ref(db, 'staff/' + id));
  const updateStaffInfo = (id, updates) => update(ref(db, 'staff/' + id), updates);

  // Tasks
  const addTask = (t) => { const newId = Date.now().toString(); set(ref(db, 'tasks/' + newId), { ...t, id: newId, progress: 0, status: 'assigned', createdDate: new Date().toISOString() }); };
  const updateTask = (taskId, newData) => update(ref(db, 'tasks/' + taskId), newData);
  const deleteTask = (taskId) => remove(ref(db, 'tasks/' + taskId));
  const updateTaskProgress = (taskId, progress, reason) => update(ref(db, 'tasks/' + taskId), { progress, reason });
  
  const finishTask = (taskId) => {
    update(ref(db, 'tasks/' + taskId), { 
      status: 'completed',
      finishedAt: new Date().toISOString() 
    });
  };

  // Facility
  const addFacilityLog = (log) => { const newId = Date.now().toString(); set(ref(db, 'facilityLogs/' + newId), { ...log, id: newId, timestamp: new Date().toISOString() }); };

  // Discipline Types
  const addDisciplineType = (typeObj) => { 
      const newId = Date.now().toString(); 
      set(ref(db, 'disciplineTypes/' + newId), { 
          ...typeObj, 
          id: newId,
          createdAt: new Date().toISOString() // Thêm ngày tạo
      }); 
  };
  const updateDisciplineTypeStatus = (id, status) => update(ref(db, 'disciplineTypes/' + id), { status });
  
  // MỚI: Xóa mềm (Soft Delete) hình thức kỷ luật có lý do
  const softDeleteDisciplineType = (id, deleteInfo) => {
      update(ref(db, 'disciplineTypes/' + id), {
          status: 'Deleted',
          deletedBy: deleteInfo.deletedBy,
          deleteReason: deleteInfo.deleteReason,
          deletedAt: new Date().toISOString()
      });
  };

  // Discipline Records
  const addDisciplineRecord = (record) => { const newId = Date.now().toString(); set(ref(db, 'disciplineRecords/' + newId), { ...record, id: newId, status: 'Active' }); };
  const updateDisciplineRecordStatus = (id, status) => update(ref(db, 'disciplineRecords/' + id), { status });
  const deleteDisciplineRecord = (id) => remove(ref(db, 'disciplineRecords/' + id));

  // Attendance
  const addAttendance = (log) => { const newId = Date.now().toString(); set(ref(db, 'attendance/' + newId), { ...log, id: newId }); };
  const updateAttendanceLog = (logId, updates) => { update(ref(db, 'attendance/' + logId), updates); };

  return (
    <DataContext.Provider value={{ 
      staffList, addStaff, deleteStaff, updateStaffInfo,
      tasks, addTask, updateTask, deleteTask, updateTaskProgress, finishTask,
      shifts, attendanceLogs, addAttendance, updateAttendanceLog,
      facilityLogs, addFacilityLog,
      disciplineTypes, addDisciplineType, updateDisciplineTypeStatus, softDeleteDisciplineType, // Export hàm mới
      disciplineRecords, addDisciplineRecord, updateDisciplineRecordStatus, deleteDisciplineRecord
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);