import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
const isSameWeek = (d1, d2) => {
    const start = new Date(d2);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate() - start.getDay() + 1); 
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return d1 >= start && d1 <= end;
};

const toDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const getSpecificDate = (startDateStr, dayName) => {
    if (!startDateStr) return '';
    const daysMap = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0 };
    const baseDate = new Date(startDateStr);
    const dayTarget = daysMap[dayName];
    const dayCurrent = baseDate.getDay();
    let diff = dayTarget - dayCurrent;
    if (diff < 0) diff += 7; 
    const resultDate = new Date(baseDate);
    resultDate.setDate(baseDate.getDate() + diff);
    return resultDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// --- BỘ ICON MINIMALIST ---
const Icons = {
    Task: () => (<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>),
    Schedule: () => (<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
    ArrowRight: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>),
    Back: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>),
    Trash: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>)
};

const POSITIONS = [
    'Chief Admin',
    'Regulatory Admin',
    'Operational Admin',
    'Scheduler',
    'Senior Teacher',
    'Tenured Teacher',
    'Customer Care Specialist',
    'Customer Care Officer',
    'Accountant',
    'Infrastructure Officer / Technician',
    'Bartender / Chef',
    'Waiter / Waitress',
    'Junior Marketing'
];

const DISC_LEVELS = [
    "1. Nhắc nhở",
    "2. Khiển trách",
    "3. Cảnh cáo",
    "4. Xem xét cách chức",
    "5. Xem xét sa thải"
];

const TaskManager = () => {
  const { user } = useAuth();
  const { tasks, addTask, deleteTask, updateTask, staffList, disciplineTypes, schedules, addSchedule, deleteSchedule, updateSchedule } = useData();
  
  const activeDisciplines = disciplineTypes.filter(d => d.status === 'Active');
  
  const isScheduler = user?.role === 'scheduler';
  const isApprover = ['chief', 'reg', 'op'].includes(user?.role);

  const [activeView, setActiveView] = useState('overview'); 
  const [scheduleTab, setScheduleTab] = useState('instances'); 

  const [newTask, setNewTask] = useState({ 
      title: '', assigneeId: '', description: '',
      startTime: '', endTime: '', 
      assignedRole: '',
      jobCode: '', 
      paymentType: '', 
      disciplineId: ''
  });

  const [scheduleConfig, setScheduleConfig] = useState({
      repeatWeeks: 1,
      days: [] 
  });

  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({});

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const [filterStaff, setFilterStaff] = useState('all');
  const [filterDay, setFilterDay] = useState('all');

  const [filterAdhocStaff, setFilterAdhocStaff] = useState('all');
  const [filterAdhocDay, setFilterAdhocDay] = useState('all');
  const [filterAdhocTime, setFilterAdhocTime] = useState('all'); 
  const [filterAdhocMonth, setFilterAdhocMonth] = useState('all');
  const [filterAdhocYear, setFilterAdhocYear] = useState('all');  

  const [filterSchedTaskStaff, setFilterSchedTaskStaff] = useState('all');
  const [filterSchedTaskDay, setFilterSchedTaskDay] = useState('all');
  const [filterSchedTaskTime, setFilterSchedTaskTime] = useState('all'); 
  const [filterSchedTaskMonth, setFilterSchedTaskMonth] = useState('all'); 
  const [filterSchedTaskYear, setFilterSchedTaskYear] = useState('all');   
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');

  const [adhocPage, setAdhocPage] = useState(1);
  const [genTaskPage, setGenTaskPage] = useState(1);
  const [schedulerPage, setSchedulerPage] = useState(1); 
  const ITEMS_PER_PAGE = 50; 

  const daysOfWeek = [
      { key: 'Mon', label: 'T2', val: 1 }, { key: 'Tue', label: 'T3', val: 2 }, { key: 'Wed', label: 'T4', val: 3 },
      { key: 'Thu', label: 'T5', val: 4 }, { key: 'Fri', label: 'T6', val: 5 }, { key: 'Sat', label: 'T7', val: 6 },
      { key: 'Sun', label: 'CN', val: 0 }
  ];

  const formatTaskTime = (start, end) => {
      const s = new Date(start);
      const e = new Date(end);
      const dateStr = s.toLocaleDateString('vi-VN');
      const timeStr = `${s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
      return (
          <div style={{ lineHeight: '1.4' }}>
              <div style={{fontWeight:'700', fontSize:'0.85rem', color: '#1f2937'}}>{dateStr}</div>
              <div style={{fontSize:'0.75rem', color:'#6b7280'}}>{timeStr}</div>
          </div>
      );
  };

  const formatScheduleTimeRange = (start, end) => {
      const s = new Date(start);
      const e = new Date(end);
      return `${s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
  };

  // --- CHUYỂN ĐỔI MÃ PHÂN QUYỀN SANG TÊN VAI TRÒ CHUẨN ---
  const getSystemRoleName = (role) => {
      if (!role) return 'Staff';
      switch (role.toLowerCase()) {
          case 'chief': return 'Chief Admin';
          case 'reg': return 'Regulatory Admin';
          case 'op': return 'Operational Admin';
          case 'scheduler': return 'Scheduler';
          default: return 'Staff';
      }
  };

  // --- TRÍCH XUẤT MÃ CÔNG VIỆC TỪ REMUNERATIONS ---
  const getStaffJobCodes = (staffId) => {
      const codes = [];
      const st = staffList.find(s => s.id === staffId);
      if (st && st.remunerations) {
          st.remunerations.forEach(r => {
              const codeStr = r.jobCode || r.keywords || '';
              codeStr.split(',').forEach(c => {
                  const clean = c.trim();
                  if (clean && !codes.includes(clean)) codes.push(clean);
              });
          });
      }
      return codes;
  };

  // --- TRÍCH XUẤT ĐÚNG CÁC VAI TRÒ TẠI MỤC QUYỀN & VỊ TRÍ, ĐỒNG THỜI LOẠI BỎ MÃ CŨ ---
  const getStaffRoles = (staffId) => {
      if (!staffId) return [];
      const st = staffList.find(s => s.id === staffId);
      if (!st) return [];

      // 1. Lấy danh sách các vị trí đã tích chọn, LỌC CHUẨN với POSITIONS hiện hành
      let roles = Array.isArray(st.positions) 
            ? st.positions.filter(p => POSITIONS.includes(p)) 
            : [];

      // 2. Lấy tên vai trò quản trị hệ thống tương ứng (Chief Admin, Scheduler...)
      const systemRole = getSystemRoleName(st.role);

      // 3. Nếu chưa tồn tại vai trò hệ thống này trong danh sách, tự động chèn lên đầu
      if (systemRole && systemRole !== 'Staff' && !roles.includes(systemRole)) {
          roles.unshift(systemRole);
      }

      return roles;
  };

  const generateTasksFromSchedule = (scheduleData, schedId) => {
    const { startTime, endTime, repeatWeeks, repeatDays } = scheduleData;
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);
    const duration = endObj - startObj;

    const targetDayVals = daysOfWeek.filter(d => repeatDays.includes(d.key)).map(d => d.val);

    for (let w = 0; w < repeatWeeks; w++) {
        for (let d = 0; d < 7; d++) {
            const currentCheckDate = new Date(startObj);
            currentCheckDate.setDate(startObj.getDate() + (w * 7) + d);

            if (targetDayVals.includes(currentCheckDate.getDay())) {
                const taskStart = new Date(currentCheckDate);
                const taskEnd = new Date(taskStart.getTime() + duration);

                const taskPayload = {
                    title: scheduleData.title,
                    assigneeId: scheduleData.assigneeId,
                    assigneeName: scheduleData.assigneeName,
                    description: scheduleData.description,
                    assignedRole: scheduleData.assignedRole,
                    jobCode: scheduleData.jobCode || '', 
                    startTime: taskStart.toISOString(),
                    endTime: taskEnd.toISOString(),
                    paymentType: 'Theo lịch', 
                    disciplineId: '', 
                    disciplineName: '',
                    deadline: taskEnd.toISOString(),
                    fromScheduleId: schedId,
                    generatedDate: new Date().toISOString()
                };
                addTask(taskPayload);
            }
        }
    }
  };

  const deleteRelatedTasks = (schedId) => {
      const relatedTasks = tasks.filter(t => t.fromScheduleId === schedId);
      relatedTasks.forEach(t => deleteTask(t.id));
  };

  const handleRequestAdjustmentClick = (sched) => {
      const action = window.prompt("Bạn muốn thực hiện hành động gì?\n- Nhập 'delete' để xin XÓA\n- Nhập 'edit' để xin SỬA");
      if (!action) return;

      if (action.toLowerCase() === 'delete') {
          const reason = window.prompt("Vui lòng nhập lý do muốn xóa (Bắt buộc):");
          if (!reason || reason.trim() === "") return alert("Bắt buộc phải có lý do để xin xóa!");

          updateSchedule(sched.id, {
              request: {
                  type: 'delete',
                  reason: reason,
                  requestedBy: user.username,
                  requestedAt: new Date().toISOString()
              }
          });
          alert("Đã gửi yêu cầu xóa. Vui lòng đợi Admin phê duyệt.");

      } else if (action.toLowerCase() === 'edit') {
          setEditingScheduleId(sched.id);
          setNewTask({
              title: sched.title, assigneeId: sched.assigneeId, description: sched.description,
              startTime: sched.startTime, endTime: sched.endTime, assignedRole: sched.assignedRole,
              jobCode: sched.jobCode || '',
              paymentType: '', disciplineId: ''
          });
          setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alert("Dữ liệu đã được tải lên form. Hãy chỉnh sửa và nhấn nút 'Gửi yêu cầu điều chỉnh'.");
      } else {
          alert("Lệnh không hợp lệ. Vui lòng nhập 'delete' hoặc 'edit'.");
      }
  };

  const handleAddTaskAdhoc = (e) => {
      e.preventDefault();
      if (!newTask.title || !newTask.assigneeId || !newTask.endTime) return alert("Vui lòng điền đủ thông tin!");
      
      const staff = staffList.find(s => s.id === newTask.assigneeId);
      const disc = activeDisciplines.find(d => d.id === newTask.disciplineId);
      
      addTask({ 
          ...newTask, 
          assigneeName: staff ? staff.name : 'Unknown',
          disciplineName: disc ? disc.name : 'Chưa quy định',
          deadline: newTask.endTime,
          paymentType: newTask.paymentType ? `${newTask.paymentType} VNĐ` : 'Chưa nhập'
      });
      
      setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', paymentType: '', disciplineId: '' });
      alert("Đã giao nhiệm vụ thành công!");
  };

  const handleAddScheduleSubmit = (e) => {
      e.preventDefault();
      if (!newTask.title || !newTask.assigneeId || !newTask.endTime) return alert("Vui lòng điền đủ thông tin!");
      if (scheduleConfig.days.length === 0) return alert("Vui lòng chọn ít nhất một ngày trong tuần!");
      
      const staff = staffList.find(s => s.id === newTask.assigneeId);
      const scheduleData = {
          ...newTask,
          assigneeName: staff ? staff.name : 'Unknown',
          paymentType: null, disciplineId: null, disciplineName: null,
          repeatWeeks: Number(scheduleConfig.repeatWeeks),
          repeatDays: scheduleConfig.days,
          createdBy: user.username
      };

      if (isScheduler && editingScheduleId) {
          updateSchedule(editingScheduleId, {
              request: {
                  type: 'edit',
                  reason: 'Điều chỉnh thông tin', 
                  draftData: scheduleData, 
                  requestedBy: user.username,
                  requestedAt: new Date().toISOString()
              }
          });
          alert("Đã gửi yêu cầu điều chỉnh. Admin sẽ xem xét và phê duyệt.");
      } else {
          const savedId = addSchedule(scheduleData);
          generateTasksFromSchedule(scheduleData, savedId);
          alert(`Đã lên lịch và tạo tasks cho ${scheduleData.assigneeName}!`);
      }

      setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', paymentType: '', disciplineId: '' });
      setScheduleConfig({ repeatWeeks: 1, days: [] });
      setEditingScheduleId(null);
  };

  const handleApproveRequest = (sched) => {
      const { request } = sched;
      if (!request) return;

      if (window.confirm(`Xác nhận phê duyệt yêu cầu "${request.type}" của ${request.requestedBy}?`)) {
          deleteRelatedTasks(sched.id);

          if (request.type === 'delete') {
              deleteSchedule(sched.id);
          } else if (request.type === 'edit') {
              const newScheduleData = { ...request.draftData, request: null };
              updateSchedule(sched.id, newScheduleData);
              generateTasksFromSchedule(newScheduleData, sched.id);
          }
      }
  };

  const handleRejectRequest = (sched) => {
      const reason = window.prompt("Lý do từ chối (tùy chọn):");
      if (window.confirm("Từ chối yêu cầu này?")) {
          updateSchedule(sched.id, { request: null, rejectionReason: reason || '' });
      }
  };

  const handleDeleteTask = (id) => { if (window.confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) deleteTask(id); };
  
  const handleDayToggle = (dayKey) => {
      setScheduleConfig(prev => {
          const exists = prev.days.includes(dayKey);
          return { ...prev, days: exists ? prev.days.filter(d => d !== dayKey) : [...prev.days, dayKey] };
      });
  };

  const handleEditSchedule = (sched) => {
      setEditingScheduleId(sched.id);
      setNewTask({
          title: sched.title, assigneeId: sched.assigneeId, description: sched.description,
          startTime: sched.startTime, endTime: sched.endTime, assignedRole: sched.assignedRole,
          jobCode: sched.jobCode || '',
          paymentType: '', disciplineId: ''
      });
      setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
      setActiveView('create_schedule');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSchedule = (id) => {
      if(window.confirm("Xóa lịch này sẽ xóa cả các ca làm việc liên quan. Bạn có chắc chắn tiếp tục?")) {
          deleteRelatedTasks(id);
          deleteSchedule(id);
      }
  };

  const startEditTask = (task) => {
      setEditingTaskId(task.id);
      setEditTaskForm({
          title: task.title,
          assigneeId: task.assigneeId,
          assignedRole: task.assignedRole || '',
          jobCode: task.jobCode || '',
          startTime: task.startTime,
          endTime: task.endTime
      });
  };

  const saveTaskEdit = () => {
      if (!editTaskForm.title || !editTaskForm.assigneeId || !editTaskForm.startTime || !editTaskForm.endTime) {
          return alert("Vui lòng điền đủ thông tin bắt buộc!");
      }
      const staff = staffList.find(s => s.id === editTaskForm.assigneeId);
      
      updateTask(editingTaskId, {
          title: editTaskForm.title,
          assigneeId: editTaskForm.assigneeId,
          assigneeName: staff ? staff.name : 'Unknown',
          assignedRole: editTaskForm.assignedRole,
          jobCode: editTaskForm.jobCode || '',
          startTime: new Date(editTaskForm.startTime).toISOString(),
          endTime: new Date(editTaskForm.endTime).toISOString(),
      });

      setEditingTaskId(null);
  };

  const filteredSchedules = schedules.filter(s => {
      const matchStaff = filterStaff === 'all' || s.assigneeId === filterStaff;
      const matchDay = filterDay === 'all' || (s.repeatDays && s.repeatDays.includes(filterDay));
      return matchStaff && matchDay;
  });

  const totalSchedulerPages = Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE);
  const paginatedSchedules = filteredSchedules.slice((schedulerPage - 1) * ITEMS_PER_PAGE, schedulerPage * ITEMS_PER_PAGE);

  const opAdminTasks = tasks.filter(t => !t.fromScheduleId);
  const filteredAdhocTasks = opAdminTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const now = new Date();
      const taskMonth = taskDate.getMonth() + 1;
      const taskYear = taskDate.getFullYear();

      const matchStaff = filterAdhocStaff === 'all' || t.assigneeId === filterAdhocStaff;
      let matchDay = true;
      if (filterAdhocDay !== 'all') {
          const dayVal = daysOfWeek.find(d => d.key === filterAdhocDay)?.val;
          matchDay = taskDate.getDay() === dayVal;
      }
      let matchTime = true;
      if (filterAdhocTime === 'day') matchTime = isSameDay(taskDate, now);
      else if (filterAdhocTime === 'week') matchTime = isSameWeek(taskDate, now);
      else if (filterAdhocTime === 'month') matchTime = isSameMonth(taskDate, now);

      const matchMonth = filterAdhocMonth === 'all' || taskMonth.toString() === filterAdhocMonth;
      const matchYear = filterAdhocYear === 'all' || taskYear.toString() === filterAdhocYear;

      return matchStaff && matchDay && matchTime && matchMonth && matchYear;
  });

  const totalAdhocPages = Math.ceil(filteredAdhocTasks.length / ITEMS_PER_PAGE);
  const paginatedAdhocTasks = filteredAdhocTasks.slice((adhocPage - 1) * ITEMS_PER_PAGE, adhocPage * ITEMS_PER_PAGE);

  const searchedAdminSchedules = schedules.filter(s => {
      if (!scheduleSearchTerm.trim()) return true;
      const term = scheduleSearchTerm.toLowerCase();
      const matchTitle = s.title && s.title.toLowerCase().includes(term);
      const matchName = s.assigneeName && s.assigneeName.toLowerCase().includes(term);
      return matchTitle || matchName;
  });

  const generatedTasks = tasks.filter(t => t.fromScheduleId);
  const filteredGeneratedTasks = generatedTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const now = new Date();
      const taskMonth = taskDate.getMonth() + 1;
      const taskYear = taskDate.getFullYear();

      const matchStaff = filterSchedTaskStaff === 'all' || t.assigneeId === filterSchedTaskStaff;
      let matchDay = true;
      if (filterSchedTaskDay !== 'all') {
          const dayVal = daysOfWeek.find(d => d.key === filterSchedTaskDay)?.val;
          matchDay = taskDate.getDay() === dayVal;
      }
      let matchTime = true;
      if (filterSchedTaskTime === 'day') matchTime = isSameDay(taskDate, now);
      else if (filterSchedTaskTime === 'week') matchTime = isSameWeek(taskDate, now);
      else if (filterSchedTaskTime === 'month') matchTime = isSameMonth(taskDate, now);

      const matchMonth = filterSchedTaskMonth === 'all' || taskMonth.toString() === filterSchedTaskMonth;
      const matchYear = filterSchedTaskYear === 'all' || taskYear.toString() === filterSchedTaskYear;

      return matchStaff && matchDay && matchTime && matchMonth && matchYear;
  });

  const totalGenTaskPages = Math.ceil(filteredGeneratedTasks.length / ITEMS_PER_PAGE);
  const paginatedGeneratedTasks = filteredGeneratedTasks.slice((genTaskPage - 1) * ITEMS_PER_PAGE, genTaskPage * ITEMS_PER_PAGE);


  return (
    <div style={{ paddingBottom: '40px' }}>
      <style>{`
        .menu-card { transition: all 0.25s ease; cursor: pointer; }
        .menu-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1) !important; border-color: #bae6fd !important; }
        .table-row { transition: background 0.2s; }
        .table-row:hover { background: #f8fafc !important; }
        .btn-action { transition: all 0.2s; }
        .btn-action:hover { opacity: 0.8; transform: scale(1.05); }
        .pill-tab { transition: all 0.3s; }
        .pill-tab:hover:not(.active) { background: #e5e7eb !important; }
        
        .input-modern { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid #e5e7eb; margin-top: 6px; box-sizing: border-box; font-size: 0.95rem; outline: none; transition: border 0.2s, box-shadow 0.2s; background: white; }
        .input-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
        
        select.input-modern {
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
            background-image: url('data:image/svg+xml;utf8,<svg fill="%2364748b" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 40px;
        }

        .filter-modern {
            padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; outline: none;
            font-weight: 600; color: #374151; background: #ffffff; cursor: pointer; font-size: 0.9rem;
            transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); appearance: none; -webkit-appearance: none;
            background-image: url('data:image/svg+xml;utf8,<svg fill="%239ca3af" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
            background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
        }
        .filter-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
        
        optgroup {
            font-weight: bold;
            font-style: normal;
            background: #f1f5f9;
            color: #003366;
        }
        optgroup option {
            background: white;
            color: #334155;
            font-weight: normal;
            padding: 4px;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
              <Icons.Task />
          </div>
          <div>
              <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                  {isScheduler ? 'LÊN LỊCH CÔNG TÁC (SCHEDULER)' : 'QUẢN LÝ NHIỆM VỤ - OPERATIONS'}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Trung tâm điều phối công việc</span>
          </div>
      </div>

      {isApprover && schedules.some(s => s.request) && (
          <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '16px', border: '1px solid #fed7aa', marginBottom: '28px', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                  <h4 style={{ color: '#c2410c', margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>Yêu cầu điều chỉnh từ Scheduler</h4>
              </div>
              <div style={{overflowX: 'auto', borderRadius: '12px', border: '1px solid #ffedd5', background: 'white'}}>
                  <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', minWidth: '700px' }}>
                      <thead>
                          <tr style={{ textAlign: 'left', background: '#fffbeb', color: '#9a3412' }}>
                              <th style={styles.th}>Scheduler</th>
                              <th style={styles.th}>Lịch trình</th>
                              <th style={styles.th}>Loại yêu cầu</th>
                              <th style={styles.th}>Lý do</th>
                              <th style={{...styles.th, textAlign: 'right'}}>Hành động</th>
                          </tr>
                      </thead>
                      <tbody>
                          {schedules.filter(s => s.request).map(s => (
                              <tr key={s.id} style={{ borderBottom: '1px solid #ffedd5' }}>
                                  <td style={styles.td}><strong>{s.request.requestedBy}</strong></td>
                                  <td style={styles.td}>{s.title}</td>
                                  <td style={styles.td}>
                                      <span style={{ 
                                          padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem',
                                          background: s.request.type === 'delete' ? '#fee2e2' : '#dbeafe',
                                          color: s.request.type === 'delete' ? '#b91c1c' : '#1d4ed8'
                                      }}>
                                          {s.request.type === 'delete' ? 'XIN XÓA' : 'XIN SỬA'}
                                      </span>
                                  </td>
                                  <td style={{...styles.td, color: '#4b5563', fontStyle: 'italic'}}>{s.request.reason}</td>
                                  <td style={{...styles.td, textAlign: 'right'}}>
                                      <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                        <button onClick={() => handleApproveRequest(s)} style={{ cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: '600', transition: 'all 0.2s' }}>Duyệt</button>
                                        <button onClick={() => handleRejectRequest(s)} style={{ cursor: 'pointer', background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: '600', transition: 'all 0.2s' }}>Từ chối</button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {!isScheduler ? (
          <>
             {activeView === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    <div className="menu-card" style={styles.menuCard} onClick={() => { setActiveView('create_task'); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', paymentType: '', disciplineId: '' }); }}>
                        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                            <div style={styles.iconBox}><Icons.Task /></div>
                            <h3 style={styles.cardTitle}>Tạo Task(R)</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'24px', lineHeight: '1.5'}}>Khởi tạo công việc lẻ & Thiết lập mức kỷ luật tương ứng.</div>
                        <div style={{...styles.accessBtn, background: '#f0f9ff', color: '#0369a1'}}>
                            Bắt đầu <Icons.ArrowRight />
                        </div>
                    </div>

                    <div className="menu-card" style={styles.menuCard} onClick={() => { setActiveView('create_schedule'); setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }}>
                        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                            <div style={{...styles.iconBox, background: '#fef3c7', color: '#d97706'}}><Icons.Schedule /></div>
                            <h3 style={styles.cardTitle}>Thiết lập Lịch làm</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'24px', lineHeight: '1.5'}}>Khởi tạo lịch làm việc lặp lại theo tuần cho nhân sự.</div>
                        <div style={{...styles.accessBtn, background: '#fffbeb', color: '#d97706'}}>
                            Bắt đầu <Icons.ArrowRight />
                        </div>
                    </div>

                    <div className="menu-card" style={styles.menuCard} onClick={() => setActiveView('manage_tasks')}>
                        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                            <div style={{...styles.iconBox, background: '#ecfdf5', color: '#059669'}}><Icons.Task /></div>
                            <h3 style={styles.cardTitle}>Quản lý Task(R)</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'24px', lineHeight: '1.5'}}>Theo dõi, đánh giá và quản lý tiến độ các việc lẻ đã giao.</div>
                        <div style={{...styles.accessBtn, background: '#ecfdf5', color: '#059669'}}>
                            Truy cập <Icons.ArrowRight />
                        </div>
                    </div>

                    <div className="menu-card" style={styles.menuCard} onClick={() => setActiveView('manage_schedules')}>
                        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                            <div style={{...styles.iconBox, background: '#f3e8ff', color: '#be185d'}}><Icons.Schedule /></div>
                            <h3 style={styles.cardTitle}>Quản lý Lịch làm</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'24px', lineHeight: '1.5'}}>Kiểm soát lịch gốc và theo dõi các ca làm việc thực tế.</div>
                        <div style={{...styles.accessBtn, background: '#fdf2f8', color: '#be185d'}}>
                            Truy cập <Icons.ArrowRight />
                        </div>
                    </div>
                </div>
             )}

             {activeView === 'create_task' && (
                 <div style={styles.formContainer}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px'}}>
                        <h3 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.25rem' }}>Tạo Task(R)</h3>
                        <button onClick={() => setActiveView('overview')} style={styles.backBtn}><Icons.Back /> Quay lại</button>
                    </div>
                    <form onSubmit={handleAddTaskAdhoc} style={styles.formGrid}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Tiêu đề công việc</label>
                            <input className="input-modern" placeholder="Nhập tiêu đề ngắn gọn, rõ ràng..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                        </div>
                        <div>
                            <label style={styles.label}>Người thực hiện</label>
                            <select className="input-modern" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value, assignedRole: ''})} required>
                                <option value="" disabled>-- Chọn nhân sự --</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({getSystemRoleName(s.role)})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Vai trò thực hiện</label>
                            <select className="input-modern" value={newTask.assignedRole} onChange={e => setNewTask({...newTask, assignedRole: e.target.value})} disabled={!newTask.assigneeId}>
                                <option value="" disabled>-- Chọn vai trò --</option>
                                {getStaffRoles(newTask.assigneeId).map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Mã công việc (Tính R)</label>
                            <select className="input-modern" value={newTask.jobCode || ''} onChange={e => setNewTask({...newTask, jobCode: e.target.value})}>
                                <option value="">-- Tự do / Không có mã --</option>
                                {getStaffJobCodes(newTask.assigneeId).map(code => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Mức tiền chi trả (VNĐ)</label>
                            <input className="input-modern" type="number" placeholder="Ví dụ: 100000" value={newTask.paymentType} onChange={e => setNewTask({...newTask, paymentType: e.target.value})} />
                        </div>
                        <div>
                            <label style={styles.label}>Bắt đầu (Check-in)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} required />
                        </div>
                        <div>
                            <label style={styles.label}>Kết thúc (Check-out)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} required />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{...styles.label, color: '#dc2626'}}>Kỷ luật áp dụng (nếu trễ hạn)</label>
                            <select className="input-modern" value={newTask.disciplineId} onChange={e => setNewTask({...newTask, disciplineId: e.target.value})} style={{borderColor: '#fca5a5', backgroundColor: '#fef2f2'}}>
                                <option value="">-- Chọn hình thức (Không bắt buộc) --</option>
                                {DISC_LEVELS.map(lvl => {
                                    const itemsInLevel = activeDisciplines.filter(d => d.level === lvl);
                                    if (itemsInLevel.length === 0) return null;
                                    return (
                                        <optgroup key={lvl} label={lvl}>
                                            {itemsInLevel.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </optgroup>
                                    );
                                })}
                                {(() => {
                                    const otherItems = activeDisciplines.filter(d => !DISC_LEVELS.includes(d.level));
                                    if (otherItems.length === 0) return null;
                                    return (
                                        <optgroup key="Khác" label="Khác (Chưa phân loại)">
                                            {otherItems.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </optgroup>
                                    );
                                })()}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Mô tả chi tiết</label>
                            <textarea className="input-modern" placeholder="Nhập hướng dẫn cụ thể cho nhiệm vụ này..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{height: '100px', resize: 'vertical'}} />
                        </div>
                        <button type="submit" style={styles.btnSubmit}>Giao việc ngay</button>
                    </form>
                 </div>
             )}

             {activeView === 'create_schedule' && (
                 <div style={styles.formContainer}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px'}}>
                        <h3 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.25rem' }}>
                            {editingScheduleId ? 'Chỉnh sửa Lịch công tác' : 'Thiết lập Lịch làm việc mới'}
                        </h3>
                        <button onClick={() => { setActiveView('overview'); setEditingScheduleId(null); }} style={styles.backBtn}><Icons.Back /> Quay lại</button>
                    </div>
                    <form onSubmit={handleAddScheduleSubmit} style={styles.formGrid}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Tiêu đề lịch trình</label>
                            <input className="input-modern" placeholder="VD: Ca trực Canteen Sáng..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                        </div>
                        <div>
                            <label style={styles.label}>Người thực hiện</label>
                            <select className="input-modern" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value, assignedRole: ''})} required>
                                <option value="" disabled>-- Chọn nhân sự --</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({getSystemRoleName(s.role)})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Vai trò thực hiện</label>
                            <select className="input-modern" value={newTask.assignedRole} onChange={e => setNewTask({...newTask, assignedRole: e.target.value})} disabled={!newTask.assigneeId}>
                                <option value="" disabled>-- Chọn vai trò --</option>
                                {getStaffRoles(newTask.assigneeId).map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Mã công việc (Tính R)</label>
                            <select className="input-modern" value={newTask.jobCode || ''} onChange={e => setNewTask({...newTask, jobCode: e.target.value})}>
                                <option value="">-- Tự do / Không có mã --</option>
                                {getStaffJobCodes(newTask.assigneeId).map(code => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Bắt đầu (Giờ & Ngày gốc)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} required />
                        </div>
                        <div>
                            <label style={styles.label}>Kết thúc (Giờ & Ngày gốc)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} required />
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{margin:'0 0 16px 0', fontSize:'1rem', color:'#1e293b', fontWeight: '700'}}>🔁 Cấu hình chu kỳ lặp lại</h5>
                            <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                                <div style={{display:'flex', flexDirection:'column', minWidth: '150px'}}>
                                    <label style={styles.label}>Số tuần kéo dài:</label>
                                    <input className="input-modern" type="number" min="1" max="52" value={scheduleConfig.repeatWeeks} onChange={e => setScheduleConfig({...scheduleConfig, repeatWeeks: e.target.value})} style={{width: '100px', fontWeight: 'bold'}} />
                                </div>
                                <div style={{display:'flex', flexDirection:'column', flex: 1}}>
                                    <label style={styles.label}>Chọn thứ trong tuần:</label>
                                    <div style={{display:'flex', gap:'10px', marginTop:'8px', flexWrap: 'wrap'}}>
                                        {daysOfWeek.map(d => (
                                            <div 
                                                key={d.key} 
                                                onClick={() => handleDayToggle(d.key)} 
                                                style={{ 
                                                    width:'42px', height:'42px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', 
                                                    fontSize:'0.85rem', cursor:'pointer', fontWeight:'700', transition: 'all 0.2s', userSelect: 'none',
                                                    border: scheduleConfig.days.includes(d.key) ? 'none' : '1px solid #cbd5e1', 
                                                    background: scheduleConfig.days.includes(d.key) ? '#003366' : 'white', 
                                                    color: scheduleConfig.days.includes(d.key) ? 'white' : '#64748b',
                                                    boxShadow: scheduleConfig.days.includes(d.key) ? '0 4px 6px rgba(0,51,102,0.3)' : 'none'
                                                }}
                                            >
                                                {d.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Mô tả chi tiết</label>
                            <textarea className="input-modern" placeholder="Ghi chú thêm..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{height: '80px', resize: 'vertical'}} />
                        </div>
                        <button type="submit" style={styles.btnSubmit}>
                            {editingScheduleId ? 'Gửi yêu cầu điều chỉnh' : 'Lưu Lịch & Tự Động Tạo Tasks'}
                        </button>
                        {editingScheduleId && (
                            <button type="button" onClick={() => { setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }} style={{ ...styles.btnSubmit, background: '#f1f5f9', color: '#475569', marginTop: '-10px' }}>
                                Hủy thao tác
                            </button>
                        )}
                    </form>
                 </div>
             )}

             {activeView === 'manage_tasks' && (
                 <div style={styles.tableContainer}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', marginBottom:'24px'}}>
                         <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{...styles.iconBox, background: '#ecfdf5', color: '#059669'}}><Icons.Task /></div>
                            <h3 style={{margin:0, fontSize: '1.25rem', fontWeight: '800', color: '#111827'}}>Quản lý Nhiệm vụ (Adhoc)</h3>
                         </div>
                         <button onClick={() => setActiveView('overview')} style={styles.backBtn}><Icons.Back /> Quay lại</button>
                     </div>
                     
                     <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'24px'}}>
                         <select className="filter-modern" value={filterAdhocStaff} onChange={e => { setFilterAdhocStaff(e.target.value); setAdhocPage(1); }}>
                             <option value="all">Nhân sự: Tất cả</option>
                             {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                         <select className="filter-modern" value={filterAdhocDay} onChange={e => { setFilterAdhocDay(e.target.value); setAdhocPage(1); }}>
                             <option value="all">Ngày: Tất cả</option>
                             {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                         </select>
                         <select className="filter-modern" value={filterAdhocTime} onChange={e => { setFilterAdhocTime(e.target.value); setAdhocPage(1); }}>
                             <option value="all">Thời gian: Tất cả</option>
                             <option value="day">Hôm nay</option>
                             <option value="week">Tuần này</option>
                             <option value="month">Tháng này</option>
                         </select>
                         <select className="filter-modern" value={filterAdhocMonth} onChange={e => { setFilterAdhocMonth(e.target.value); setAdhocPage(1); }}>
                             <option value="all">Tháng: Tất cả</option>
                             {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                         </select>
                         <select className="filter-modern" value={filterAdhocYear} onChange={e => { setFilterAdhocYear(e.target.value); setAdhocPage(1); }}>
                             <option value="all">Năm: Tất cả</option>
                             {availableYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
                         </select>
                     </div>

                     <div style={styles.tableWrapper}>
                         <table style={styles.table}>
                            <thead>
                               <tr>
                                 <th style={{...styles.th, width: '50px', textAlign: 'center'}}>STT</th>
                                 <th style={styles.th}>Nhiệm vụ</th>
                                 <th style={styles.th}>Nhân sự</th>
                                 <th style={styles.th}>Vai trò / Mã CV</th>
                                 <th style={styles.th}>Thời gian</th>
                                 <th style={styles.th}>Tiến độ</th>
                                 <th style={{...styles.th, textAlign: 'right'}}>Hành động</th>
                               </tr>
                            </thead>
                            <tbody>
                               {paginatedAdhocTasks.map((t, index) => (
                                 <tr style={{ borderBottom: '1px solid #f1f5f9' }} key={t.id} className="table-row">
                                    <td style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{(adhocPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td style={styles.td}>
                                        <div style={{fontWeight:'700', color: '#1f2937', marginBottom: '4px'}}>{t.title}</div>
                                        {t.paymentType && <span style={{fontSize:'0.7rem', background:'#ecfdf5', color:'#059669', padding:'2px 8px', borderRadius:'12px', fontWeight:'700'}}>{t.paymentType}</span>}
                                    </td>
                                    <td style={{...styles.td, fontWeight: '600'}}>{t.assigneeName}</td>
                                    <td style={styles.td}>
                                        <div style={{fontSize: '0.85rem', color: '#4b5563'}}>{t.assignedRole}</div>
                                        {t.jobCode && <div style={{fontSize:'0.75rem', color:'#0284c7', fontWeight:'700', marginTop: '2px'}}>Mã: {t.jobCode}</div>}
                                    </td>
                                    <td style={styles.td}>{formatTaskTime(t.startTime, t.endTime)}</td>
                                    <td style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <div style={{width:'50px', height:'6px', background:'#e5e7eb', borderRadius:'3px', overflow:'hidden'}}>
                                                <div style={{width:`${t.progress}%`, height:'100%', background: t.progress===100?'#10b981':'#3b82f6'}}></div>
                                            </div>
                                            <span style={{fontSize:'0.85rem', fontWeight:'700', color: t.progress===100?'#10b981':'#3b82f6'}}>{t.progress}%</span>
                                        </div>
                                    </td>
                                    <td style={{...styles.td, textAlign: 'right'}}>
                                        <button className="btn-action" onClick={()=>handleDeleteTask(t.id)} style={{color:'#ef4444', border:'none', background:'#fef2f2', padding: '8px', borderRadius: '8px', cursor:'pointer'}}>
                                            <Icons.Trash />
                                        </button>
                                    </td>
                                 </tr>
                               ))}
                               {paginatedAdhocTasks.length === 0 && (
                                   <tr><td colSpan="7" style={styles.emptyTd}>Không tìm thấy nhiệm vụ phù hợp với bộ lọc.</td></tr>
                               )}
                            </tbody>
                         </table>
                     </div>

                     {totalAdhocPages > 1 && (
                         <div style={styles.pagination}>
                             <button onClick={() => setAdhocPage(p => Math.max(1, p - 1))} disabled={adhocPage === 1} style={styles.pageBtn}>Trang trước</button>
                             <span style={{ fontSize: '0.9rem', color:'#4b5563', fontWeight:'600' }}>{adhocPage} / {totalAdhocPages}</span>
                             <button onClick={() => setAdhocPage(p => Math.min(totalAdhocPages, p + 1))} disabled={adhocPage === totalAdhocPages} style={styles.pageBtn}>Trang sau</button>
                         </div>
                     )}
                 </div>
             )}

             {activeView === 'manage_schedules' && (
                 <div style={styles.tableContainer}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', marginBottom:'24px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={{...styles.iconBox, background: '#f3e8ff', color: '#be185d'}}><Icons.Schedule /></div>
                            <h3 style={{margin:0, fontSize: '1.25rem', fontWeight: '800', color: '#111827'}}>Quản lý Lịch làm việc</h3>
                        </div>
                        <button onClick={() => setActiveView('overview')} style={styles.backBtn}><Icons.Back /> Quay lại</button>
                    </div>

                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '24px', width: 'fit-content' }}>
                        <button 
                            className={`pill-tab ${scheduleTab === 'instances' ? 'active' : ''}`}
                            onClick={() => { setScheduleTab('instances'); setGenTaskPage(1); }} 
                            style={{ 
                                padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s',
                                background: scheduleTab === 'instances' ? 'white' : 'transparent', 
                                color: scheduleTab === 'instances' ? '#003366' : '#64748b',
                                boxShadow: scheduleTab === 'instances' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Ca làm việc thực tế
                        </button>
                        <button 
                            className={`pill-tab ${scheduleTab === 'templates' ? 'active' : ''}`}
                            onClick={() => setScheduleTab('templates')} 
                            style={{ 
                                padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s',
                                background: scheduleTab === 'templates' ? 'white' : 'transparent', 
                                color: scheduleTab === 'templates' ? '#003366' : '#64748b',
                                boxShadow: scheduleTab === 'templates' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            Cấu hình Lịch gốc
                        </button>
                    </div>

                    {scheduleTab === 'instances' && (
                        <div>
                            <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'24px'}}>
                                <select className="filter-modern" value={filterSchedTaskStaff} onChange={e => { setFilterSchedTaskStaff(e.target.value); setGenTaskPage(1); }}>
                                    <option value="all">Nhân sự: Tất cả</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <select className="filter-modern" value={filterSchedTaskDay} onChange={e => { setFilterSchedTaskDay(e.target.value); setGenTaskPage(1); }}>
                                    <option value="all">Ngày: Tất cả</option>
                                    {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                                </select>
                                <select className="filter-modern" value={filterSchedTaskTime} onChange={e => { setFilterSchedTaskTime(e.target.value); setGenTaskPage(1); }}>
                                    <option value="all">Thời gian: Tất cả</option>
                                    <option value="day">Hôm nay</option>
                                    <option value="week">Tuần này</option>
                                    <option value="month">Tháng này</option>
                                </select>
                                <select className="filter-modern" value={filterSchedTaskMonth} onChange={e => { setFilterSchedTaskMonth(e.target.value); setGenTaskPage(1); }}>
                                    <option value="all">Tháng: Tất cả</option>
                                    {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                                </select>
                                <select className="filter-modern" value={filterSchedTaskYear} onChange={e => { setFilterSchedTaskYear(e.target.value); setGenTaskPage(1); }}>
                                    <option value="all">Năm: Tất cả</option>
                                    {availableYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
                                </select>
                            </div>
                            
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                   <thead>
                                      <tr>
                                        <th style={{...styles.th, width: '50px', textAlign: 'center'}}>STT</th>
                                        <th style={styles.th}>Nhiệm vụ</th>
                                        <th style={styles.th}>Nhân sự</th>
                                        <th style={styles.th}>Vai trò / Mã CV</th>
                                        <th style={styles.th}>Thời gian gốc</th>
                                        <th style={styles.th}>Tiến độ</th>
                                        <th style={{...styles.th, textAlign: 'right'}}>Hành động</th>
                                      </tr>
                                   </thead>
                                   <tbody>
                                      {paginatedGeneratedTasks.map((t, index) => (
                                        <tr key={t.id} className="table-row" style={{ background: editingTaskId === t.id ? '#f0fdf4' : 'transparent' }}>
                                           <td style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{(genTaskPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                           
                                           {editingTaskId === t.id ? (
                                               <>
                                                  <td style={styles.td}>
                                                      <input className="input-modern" value={editTaskForm.title} onChange={e => setEditTaskForm({...editTaskForm, title: e.target.value})} style={{marginTop:0}} />
                                                  </td>
                                                  <td style={styles.td}>
                                                      <select className="input-modern" value={editTaskForm.assigneeId} onChange={e => setEditTaskForm({...editTaskForm, assigneeId: e.target.value, assignedRole: ''})} style={{marginTop:0}}>
                                                          {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                      </select>
                                                  </td>
                                                  <td style={styles.td}>
                                                      <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                                                          <select className="input-modern" value={editTaskForm.assignedRole || ''} onChange={e => setEditTaskForm({...editTaskForm, assignedRole: e.target.value})} disabled={!editTaskForm.assigneeId} style={{marginTop:0, padding: '8px 36px 8px 12px'}}>
                                                              <option value="" disabled>-- Chọn vai trò --</option>
                                                              {getStaffRoles(editTaskForm.assigneeId).map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                                                          </select>
                                                          <select className="input-modern" value={editTaskForm.jobCode || ''} onChange={e => setEditTaskForm({...editTaskForm, jobCode: e.target.value})} style={{marginTop:0, padding: '8px 36px 8px 12px'}}>
                                                              <option value="">-- Không mã --</option>
                                                              {getStaffJobCodes(editTaskForm.assigneeId).map(code => (
                                                                  <option key={code} value={code}>{code}</option>
                                                              ))}
                                                          </select>
                                                      </div>
                                                  </td>
                                                  <td style={styles.td}>
                                                      <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                                                          <input className="input-modern" type="datetime-local" value={toDateTimeLocal(editTaskForm.startTime)} onChange={e => setEditTaskForm({...editTaskForm, startTime: e.target.value})} style={{marginTop:0, padding: '8px 12px'}} />
                                                          <input className="input-modern" type="datetime-local" value={toDateTimeLocal(editTaskForm.endTime)} onChange={e => setEditTaskForm({...editTaskForm, endTime: e.target.value})} style={{marginTop:0, padding: '8px 12px'}} />
                                                      </div>
                                                  </td>
                                                  <td style={{...styles.td, fontWeight: '700', color: '#10b981'}}>{t.progress}%</td>
                                                  <td style={{...styles.td, textAlign: 'right'}}>
                                                      <div style={{display:'flex', flexDirection:'column', gap:'6px', alignItems: 'flex-end'}}>
                                                          <button onClick={saveTaskEdit} style={{color:'white', background:'#059669', border:'none', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', width: '80px'}}>Lưu</button>
                                                          <button onClick={()=>setEditingTaskId(null)} style={{color:'#475569', background:'#e2e8f0', border:'none', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', width: '80px'}}>Hủy</button>
                                                      </div>
                                                  </td>
                                               </>
                                           ) : (
                                               <>
                                                  <td style={styles.td}><strong style={{color: '#1f2937'}}>{t.title}</strong></td>
                                                  <td style={{...styles.td, fontWeight: '600'}}>{t.assigneeName}</td>
                                                  <td style={styles.td}>
                                                      <div style={{color: '#4b5563', fontSize: '0.85rem'}}>{t.assignedRole}</div>
                                                      {t.jobCode && <div style={{fontSize:'0.75rem', color:'#be185d', fontWeight:'700', marginTop: '4px', background: '#fdf2f8', display: 'inline-block', padding: '2px 8px', borderRadius: '10px'}}>Mã: {t.jobCode}</div>}
                                                  </td>
                                                  <td style={styles.td}>{formatTaskTime(t.startTime, t.endTime)}</td>
                                                  <td style={styles.td}>
                                                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                                          <div style={{width:'40px', height:'6px', background:'#e5e7eb', borderRadius:'3px', overflow:'hidden'}}>
                                                              <div style={{width:`${t.progress}%`, height:'100%', background: t.progress===100?'#10b981':'#3b82f6'}}></div>
                                                          </div>
                                                          <span style={{fontSize:'0.85rem', fontWeight:'700', color: t.progress===100?'#10b981':'#3b82f6'}}>{t.progress}%</span>
                                                      </div>
                                                  </td>
                                                  <td style={{...styles.td, textAlign: 'right'}}>
                                                      <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                                          <button className="btn-action" onClick={()=>startEditTask(t)} style={{color:'#0ea5e9', border:'none', background:'#e0f2fe', padding: '6px 12px', borderRadius: '8px', cursor:'pointer', fontWeight:'700', fontSize: '0.8rem'}}>Sửa ca</button>
                                                          <button className="btn-action" onClick={()=>handleDeleteTask(t.id)} style={{color:'#ef4444', border:'none', background:'#fef2f2', padding: '6px', borderRadius: '8px', cursor:'pointer'}}><Icons.Trash /></button>
                                                      </div>
                                                  </td>
                                               </>
                                           )}
                                        </tr>
                                      ))}
                                      {paginatedGeneratedTasks.length === 0 && (
                                          <tr><td colSpan="7" style={styles.emptyTd}>Không tìm thấy ca làm việc thực tế phù hợp.</td></tr>
                                      )}
                                   </tbody>
                                </table>
                            </div>

                            {totalGenTaskPages > 1 && (
                                 <div style={styles.pagination}>
                                     <button onClick={() => setGenTaskPage(p => Math.max(1, p - 1))} disabled={genTaskPage === 1} style={styles.pageBtn}>Trang trước</button>
                                     <span style={{ fontSize: '0.9rem', color:'#4b5563', fontWeight:'600' }}>{genTaskPage} / {totalGenTaskPages}</span>
                                     <button onClick={() => setGenTaskPage(p => Math.min(totalGenTaskPages, p + 1))} disabled={genTaskPage === totalGenTaskPages} style={styles.pageBtn}>Trang sau</button>
                                 </div>
                            )}
                        </div>
                    )}

                    {scheduleTab === 'templates' && (
                        <div>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', marginBottom:'20px'}}>
                                <span style={{color:'#4b5563', fontWeight:'500', fontSize: '0.95rem'}}>Cấu hình lịch chạy tự động định kỳ</span>
                                <input 
                                    className="input-modern" 
                                    type="text" 
                                    placeholder="🔍 Tìm tiêu đề, nhân sự..." 
                                    value={scheduleSearchTerm} 
                                    onChange={(e) => setScheduleSearchTerm(e.target.value)} 
                                    style={{ width: '250px', marginTop: 0, padding:'10px 14px' }} 
                                />
                            </div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                  <thead>
                                     <tr>
                                       <th style={{...styles.th, width: '50px', textAlign: 'center'}}>STT</th>
                                       <th style={styles.th}>Thông tin mẫu lịch (Template)</th>
                                       <th style={{...styles.th, textAlign: 'right'}}>Hành động</th>
                                     </tr>
                                  </thead>
                                  <tbody>
                                     {searchedAdminSchedules.map((s, index) => (
                                       <tr key={s.id} className="table-row">
                                          <td style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{index + 1}</td>
                                          <td style={styles.td}>
                                              <div style={{fontWeight:'700', color: '#111827', fontSize: '1.05rem', marginBottom: '4px'}}>{s.title}</div>
                                              {s.assigneeName && <div style={{fontSize:'0.85rem', color:'#4b5563'}}>👤 <span style={{fontWeight:'600'}}>{s.assigneeName}</span> {s.assignedRole ? `(${s.assignedRole})` : ''}</div>}
                                              <div style={{fontSize:'0.8rem', color:'#059669', marginTop: '6px', fontWeight: '600'}}>
                                                  🔁 Lặp lại {s.repeatWeeks} tuần vào các ngày: {s.repeatDays?.join(', ')}
                                              </div>
                                          </td>
                                          <td style={{...styles.td, textAlign: 'right'}}>
                                              <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end'}}>
                                                  <button className="btn-action" onClick={()=>handleEditSchedule(s)} style={{color:'#0ea5e9', border:'none', background:'#e0f2fe', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize: '0.85rem'}}>Chỉnh sửa</button>
                                                  <button className="btn-action" onClick={()=>handleDeleteSchedule(s.id)} style={{color:'#ef4444', border:'none', background:'#fef2f2', padding:'8px', borderRadius:'8px', cursor:'pointer'}}><Icons.Trash /></button>
                                              </div>
                                          </td>
                                       </tr>
                                     ))}
                                     {searchedAdminSchedules.length === 0 && (
                                         <tr><td colSpan="3" style={styles.emptyTd}>Trống. Chưa có template nào được lưu.</td></tr>
                                     )}
                                  </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                 </div>
             )}
          </>
      ) : (
          /* ==============================================================
             GIAO DIỆN DÀNH RIÊNG CHO ROLE SCHEDULER
             ============================================================== */
          <>
              <div style={styles.formContainer}>
                <h3 style={{ margin: '0 0 24px 0', color: '#111827', fontWeight: '800', fontSize: '1.35rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                    {editingScheduleId ? 'Đang soạn yêu cầu điều chỉnh' : 'Lên lịch công tác mới (Scheduler)'}
                </h3>
                <form onSubmit={handleAddScheduleSubmit} style={styles.formGrid}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Tiêu đề công việc</label>
                        <input className="input-modern" placeholder="Nhập tiêu đề..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                    </div>
                    <div>
                        <label style={styles.label}>Người thực hiện</label>
                        <select className="input-modern" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value, assignedRole: ''})} required>
                            <option value="" disabled>-- Chọn nhân sự --</option>
                            {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({getSystemRoleName(s.role)})</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>Vai trò thực hiện</label>
                        <select className="input-modern" value={newTask.assignedRole} onChange={e => setNewTask({...newTask, assignedRole: e.target.value})} disabled={!newTask.assigneeId}>
                            <option value="" disabled>-- Chọn vai trò --</option>
                            {getStaffRoles(newTask.assigneeId).map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>Mã công việc (Tính R)</label>
                        <select className="input-modern" value={newTask.jobCode || ''} onChange={e => setNewTask({...newTask, jobCode: e.target.value})}>
                            <option value="">-- Tự do / Không có mã --</option>
                            {getStaffJobCodes(newTask.assigneeId).map(code => (
                                <option key={code} value={code}>{code}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>Bắt đầu (Giờ & Ngày)</label>
                        <input className="input-modern" type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} required />
                    </div>
                    <div>
                        <label style={styles.label}>Kết thúc (Giờ & Ngày)</label>
                        <input className="input-modern" type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} required />
                    </div>
                    <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h5 style={{margin:'0 0 16px 0', fontSize:'1rem', color:'#1e293b', fontWeight: '700'}}>🔁 Cấu hình chu kỳ lặp lại</h5>
                        <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                            <div style={{display:'flex', flexDirection:'column', minWidth: '150px'}}>
                                <label style={styles.label}>Số tuần lặp lại:</label>
                                <input className="input-modern" type="number" min="1" max="52" value={scheduleConfig.repeatWeeks} onChange={e => setScheduleConfig({...scheduleConfig, repeatWeeks: e.target.value})} style={{width: '100px', fontWeight: 'bold'}} />
                            </div>
                            <div style={{display:'flex', flexDirection:'column', flex: 1}}>
                                <label style={styles.label}>Chọn thứ trong tuần:</label>
                                <div style={{display:'flex', gap:'10px', marginTop:'8px', flexWrap: 'wrap'}}>
                                    {daysOfWeek.map(d => (
                                        <div 
                                            key={d.key} 
                                            onClick={() => handleDayToggle(d.key)} 
                                            style={{ 
                                                width:'42px', height:'42px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', 
                                                fontSize:'0.85rem', cursor:'pointer', fontWeight:'700', transition: 'all 0.2s', userSelect: 'none',
                                                border: scheduleConfig.days.includes(d.key) ? 'none' : '1px solid #cbd5e1', 
                                                background: scheduleConfig.days.includes(d.key) ? '#003366' : 'white', 
                                                color: scheduleConfig.days.includes(d.key) ? 'white' : '#64748b',
                                                boxShadow: scheduleConfig.days.includes(d.key) ? '0 4px 6px rgba(0,51,102,0.3)' : 'none'
                                            }}
                                        >
                                            {d.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Mô tả chi tiết</label>
                        <textarea className="input-modern" placeholder="Ghi chú thêm..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{height: '80px', resize: 'vertical'}} />
                    </div>
                    <button type="submit" style={styles.btnSubmit}>
                        {editingScheduleId ? 'Gửi yêu cầu điều chỉnh' : 'Lưu Lịch & Tự Động Tạo Tasks'}
                    </button>
                    {editingScheduleId && (
                        <button type="button" onClick={() => { setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }} style={{ ...styles.btnSubmit, background: '#f1f5f9', color: '#475569', marginTop: '-10px' }}>
                            Hủy thao tác
                        </button>
                    )}
                </form>
              </div>

              <div style={styles.tableContainer}>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px', marginBottom:'24px'}}>
                     <h3 style={{margin:0, fontSize: '1.25rem', fontWeight: '800', color: '#111827'}}>Danh sách lịch đã thiết lập</h3>
                     <div style={{display:'flex', gap:'12px', flexWrap: 'wrap'}}>
                         <select className="filter-modern" value={filterStaff} onChange={e => { setFilterStaff(e.target.value); setSchedulerPage(1); }}>
                             <option value="all">Tất cả nhân sự</option>
                             {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                         <select className="filter-modern" value={filterDay} onChange={e => { setFilterDay(e.target.value); setSchedulerPage(1); }}>
                             <option value="all">Tất cả các ngày</option>
                             {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                         </select>
                     </div>
                 </div>

                 <div style={styles.tableWrapper}>
                     <table style={styles.table}>
                        <thead>
                           <tr>
                             <th style={{...styles.th, width:'50px', textAlign: 'center'}}>STT</th>
                             <th style={styles.th}>Thông tin Lịch</th>
                             <th style={styles.th}>Thời gian</th>
                             <th style={styles.th}>Nhân sự</th>
                             <th style={styles.th}>Chu kỳ Lặp lại</th>
                             <th style={{...styles.th, textAlign: 'right'}}>Hành động</th>
                           </tr>
                        </thead>
                        <tbody>
                           {paginatedSchedules.map((s, index) => (
                             <tr key={s.id} className="table-row" style={{ background: s.request ? '#fefce8' : 'transparent' }}>
                                <td style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{(schedulerPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td style={styles.td}>
                                    <div style={{fontWeight:'700', color: '#1f2937', marginBottom: '4px'}}>{s.title}</div>
                                    <div style={{fontSize:'0.8rem', color:'#6b7280'}}>{s.description?.substring(0, 40)}...</div>
                                    {s.request && <div style={{fontSize:'0.75rem', color:'#ea580c', fontWeight:'bold', marginTop:'6px', background: '#ffedd5', display: 'inline-block', padding: '2px 8px', borderRadius: '10px'}}>⏳ Đang chờ duyệt: {s.request.type === 'delete' ? 'XÓA' : 'SỬA'}</div>}
                                </td>
                                <td style={{...styles.td, color:'#0369a1', fontWeight:'700'}}>
                                    {formatScheduleTimeRange(s.startTime, s.endTime)}
                                </td>
                                <td style={styles.td}>
                                    <div style={{fontWeight: '600'}}>{s.assigneeName}</div>
                                    <div style={{fontSize: '0.8rem', color: '#6b7280'}}>{s.assignedRole}</div>
                                </td>
                                
                                <td style={styles.td}>
                                    <div style={{marginBottom: '6px', fontWeight: '600', color: '#059669'}}>{s.repeatWeeks} tuần</div>
                                    <div style={{display:'flex', gap:'6px', flexWrap: 'wrap'}}>
                                        {s.repeatDays && s.repeatDays.map(d => (
                                            <div key={d} style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                <div style={{fontSize:'0.75rem', fontWeight:'700', color: '#334155'}}>{d}</div>
                                                <div style={{fontSize:'0.65rem', color:'#94a3b8', marginTop:'2px'}}>{getSpecificDate(s.startTime, d)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                
                                <td style={{...styles.td, textAlign: 'right'}}>
                                    {!s.request ? (
                                        <button className="btn-action" onClick={() => handleRequestAdjustmentClick(s)} style={{color:'#d97706', border:'none', background:'#fef3c7', cursor:'pointer', fontWeight:'700', padding:'8px 16px', borderRadius:'8px', fontSize:'0.85rem', whiteSpace: 'nowrap'}}>
                                            Xin điều chỉnh
                                        </button>
                                    ) : (
                                        <span style={{fontSize:'0.85rem', color:'#9ca3af', fontStyle:'italic', fontWeight: '500'}}>Đã gửi yêu cầu</span>
                                    )}
                                </td>
                             </tr>
                           ))}
                           {paginatedSchedules.length === 0 && (
                               <tr><td colSpan="6" style={styles.emptyTd}>Không tìm thấy lịch trình phù hợp với bộ lọc.</td></tr>
                           )}
                        </tbody>
                     </table>
                 </div>

                 {totalSchedulerPages > 1 && (
                     <div style={styles.pagination}>
                         <button onClick={() => setSchedulerPage(p => Math.max(1, p - 1))} disabled={schedulerPage === 1} style={styles.pageBtn}>Trang trước</button>
                         <span style={{ fontSize: '0.9rem', color:'#4b5563', fontWeight:'600' }}>{schedulerPage} / {totalSchedulerPages}</span>
                         <button onClick={() => setSchedulerPage(p => Math.min(totalSchedulerPages, p + 1))} disabled={schedulerPage === totalSchedulerPages} style={styles.pageBtn}>Trang sau</button>
                     </div>
                 )}
              </div>
          </>
      )}
    </div>
  );
};

const styles = {
    formContainer: { background: '#ffffff', padding: '28px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', marginBottom: '32px', border: '1px solid rgba(0,0,0,0.05)' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '4px' },
    btnSubmit: { gridColumn: '1 / -1', padding: '16px', background: '#003366', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,51,102,0.2)' },
    
    menuCard: { background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '180px' },
    iconBox: { width: '48px', height: '48px', background: '#e0f2fe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' },
    cardTitle: { margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.01em' },
    accessBtn: { marginTop: 'auto', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', fontSize: '0.95rem' },
    backBtn: { background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', transition: 'all 0.2s' },
    
    tableContainer: { background: '#ffffff', padding: '28px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' },
    tableWrapper: { overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
    th: { padding: '14px 16px', textAlign: 'left', background: '#f8fafc', color: '#64748b', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle' },
    emptyTd: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem' },
    
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '24px' },
    pageBtn: { padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: '700', color: '#475569', transition: 'all 0.2s' }
};

export default TaskManager;