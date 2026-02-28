import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- HELPER FUNCTIONS ---
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

// Chuyển đổi ISO string sang format dùng cho <input type="datetime-local">
const toDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// --- ICONS ---
const Icons = {
    Task: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>),
    Schedule: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
    ArrowRight: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>),
    Back: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>)
};

const TaskManager = () => {
  const { user } = useAuth();
  // THÊM updateTask ĐỂ ADMIN CÓ THỂ CHỈNH SỬA CA LÀM VIỆC TỪ SCHEDULER
  const { tasks, addTask, deleteTask, updateTask, staffList, disciplineTypes, schedules, addSchedule, deleteSchedule, updateSchedule } = useData();
  
  const activeDisciplines = disciplineTypes.filter(d => d.status === 'Active');
  
  // --- PHÂN QUYỀN ---
  const isScheduler = user?.role === 'scheduler';
  const isApprover = ['chief', 'reg', 'op'].includes(user?.role);

  // --- THẺ CON (SUB-TABS CHO ADMIN) ---
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'create_task', 'create_schedule', 'manage_tasks', 'manage_schedules'

  // --- STATE FORM ---
  const [newTask, setNewTask] = useState({ 
      title: '', assigneeId: '', description: '',
      startTime: '', endTime: '', 
      assignedRole: 'ST',
      paymentType: '', // Đã chuyển thành ô nhập mức tiền chi trả
      disciplineId: ''
  });

  const [scheduleConfig, setScheduleConfig] = useState({
      repeatWeeks: 1,
      days: [] 
  });

  const [editingScheduleId, setEditingScheduleId] = useState(null);

  // --- STATE INLINE EDIT (CHO CA LÀM VIỆC Ở MỤC 4) ---
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({});

  // --- STATE BỘ LỌC (SCHEDULER VIEW) ---
  const [filterStaff, setFilterStaff] = useState('all');
  const [filterDay, setFilterDay] = useState('all');

  // --- STATE BỘ LỌC TÁCH BIỆT ---
  // Lọc cho Mục 3 (TASK+)
  const [filterAdhocStaff, setFilterAdhocStaff] = useState('all');
  const [filterAdhocDay, setFilterAdhocDay] = useState('all');
  const [filterAdhocTime, setFilterAdhocTime] = useState('all'); 

  // Lọc cho Mục 4 (Scheduler Tasks)
  const [filterSchedTaskStaff, setFilterSchedTaskStaff] = useState('all');
  const [filterSchedTaskDay, setFilterSchedTaskDay] = useState('all');
  const [filterSchedTaskTime, setFilterSchedTaskTime] = useState('all'); 
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');

  const daysOfWeek = [
      { key: 'Mon', label: 'T2', val: 1 }, { key: 'Tue', label: 'T3', val: 2 }, { key: 'Wed', label: 'T4', val: 3 },
      { key: 'Thu', label: 'T5', val: 4 }, { key: 'Fri', label: 'T6', val: 5 }, { key: 'Sat', label: 'T7', val: 6 },
      { key: 'Sun', label: 'CN', val: 0 }
  ];

  // --- HELPER FORMAT TIME ---
  const formatTaskTime = (start, end) => {
      const s = new Date(start);
      const e = new Date(end);
      const dateStr = s.toLocaleDateString('vi-VN');
      const timeStr = `${s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
      return (
          <div>
              <div style={{fontWeight:'bold', fontSize:'0.85rem'}}>{dateStr}</div>
              <div style={{fontSize:'0.8rem', color:'#6b7280'}}>{timeStr}</div>
          </div>
      );
  };

  const formatScheduleTimeRange = (start, end) => {
      const s = new Date(start);
      const e = new Date(end);
      return `${s.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${e.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
  };

  // --- LOGIC FUNCTIONS ---
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
              paymentType: '', disciplineId: ''
          });
          setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alert("Dữ liệu đã được tải lên form. Hãy chỉnh sửa và nhấn nút 'Gửi yêu cầu điều chỉnh'.");
      } else {
          alert("Lệnh không hợp lệ. Vui lòng nhập 'delete' hoặc 'edit'.");
      }
  };

  // Xử lý tạo Task lẻ (Mục 1)
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
      
      setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: '', disciplineId: '' });
      alert("Đã giao nhiệm vụ thành công!");
  };

  // Xử lý tạo Lịch định kỳ (Mục 2)
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

      setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: '', disciplineId: '' });
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

  const handleDeleteTask = (id) => { if (window.confirm("Xóa nhiệm vụ này?")) deleteTask(id); };
  
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
          paymentType: '', disciplineId: ''
      });
      setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
      setActiveView('create_schedule');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSchedule = (id) => {
      if(window.confirm("Xóa lịch này sẽ xóa cả các ca làm việc liên quan. Tiếp tục?")) {
          deleteRelatedTasks(id);
          deleteSchedule(id);
      }
  };

  // Xử lý Sửa Inline Task (Mục 4)
  const startEditTask = (task) => {
      setEditingTaskId(task.id);
      setEditTaskForm({
          title: task.title,
          assigneeId: task.assigneeId,
          assignedRole: task.assignedRole || 'ST',
          startTime: task.startTime,
          endTime: task.endTime
      });
  };

  const saveTaskEdit = () => {
      if (!editTaskForm.title || !editTaskForm.assigneeId || !editTaskForm.startTime || !editTaskForm.endTime) {
          return alert("Vui lòng điền đủ thông tin!");
      }
      const staff = staffList.find(s => s.id === editTaskForm.assigneeId);
      
      // Update task đảm bảo không chạm vào các trường checkInTime, progress,...
      updateTask(editingTaskId, {
          title: editTaskForm.title,
          assigneeId: editTaskForm.assigneeId,
          assigneeName: staff ? staff.name : 'Unknown',
          assignedRole: editTaskForm.assignedRole,
          startTime: new Date(editTaskForm.startTime).toISOString(),
          endTime: new Date(editTaskForm.endTime).toISOString(),
      });

      setEditingTaskId(null);
  };

  // --- LỌC DATA CHO CÁC VIEW ---

  // Lọc Schedules (Góc nhìn Scheduler)
  const filteredSchedules = schedules.filter(s => {
      const matchStaff = filterStaff === 'all' || s.assigneeId === filterStaff;
      const matchDay = filterDay === 'all' || (s.repeatDays && s.repeatDays.includes(filterDay));
      return matchStaff && matchDay;
  });

  // Lọc Mục 3: Task Ad-hoc (Giao lẻ)
  const opAdminTasks = tasks.filter(t => !t.fromScheduleId);
  const filteredAdhocTasks = opAdminTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const now = new Date();

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

      return matchStaff && matchDay && matchTime;
  });

  // Lọc Mục 4: Lịch gốc
  const searchedAdminSchedules = schedules.filter(s => {
      if (!scheduleSearchTerm.trim()) return true;
      const term = scheduleSearchTerm.toLowerCase();
      const matchTitle = s.title && s.title.toLowerCase().includes(term);
      const matchName = s.assigneeName && s.assigneeName.toLowerCase().includes(term);
      return matchTitle || matchName;
  });

  // Lọc Mục 4: Task từ Scheduler
  const generatedTasks = tasks.filter(t => t.fromScheduleId);
  const filteredGeneratedTasks = generatedTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const now = new Date();

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

      return matchStaff && matchDay && matchTime;
  });

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.5rem' }}>
          {isScheduler ? 'LÊN LỊCH CÔNG TÁC (SCHEDULER)' : 'QUẢN LÝ NHIỆM VỤ - OPERATIONS'}
      </h2>

      {/* --- DUYỆT YÊU CẦU (HIỂN THỊ CHUNG) --- */}
      {isApprover && schedules.some(s => s.request) && (
          <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '16px', border: '1px solid #fed7aa', marginBottom: '24px' }}>
              <h4 style={{ color: '#c2410c', marginTop: 0 }}>⚠️ Yêu cầu điều chỉnh từ Scheduler</h4>
              <div style={{overflowX: 'auto'}}>
                  <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                          <tr style={{ textAlign: 'left', color: '#9a3412' }}>
                              <th>Scheduler</th>
                              <th>Lịch trình</th>
                              <th>Loại yêu cầu</th>
                              <th>Lý do</th>
                              <th>Hành động</th>
                          </tr>
                      </thead>
                      <tbody>
                          {schedules.filter(s => s.request).map(s => (
                              <tr key={s.id} style={{ borderTop: '1px solid #ffedd5' }}>
                                  <td style={{ padding: '8px' }}>{s.request.requestedBy}</td>
                                  <td>{s.title}</td>
                                  <td>
                                      <span style={{ 
                                          padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem',
                                          background: s.request.type === 'delete' ? '#fee2e2' : '#dbeafe',
                                          color: s.request.type === 'delete' ? '#991b1b' : '#1e40af'
                                      }}>
                                          {s.request.type === 'delete' ? 'XIN XÓA' : 'XIN SỬA'}
                                      </span>
                                  </td>
                                  <td>{s.request.reason}</td>
                                  <td>
                                      <button onClick={() => handleApproveRequest(s)} style={{ marginRight: '8px', cursor: 'pointer', background: '#16a34a', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>Duyệt</button>
                                      <button onClick={() => handleRejectRequest(s)} style={{ cursor: 'pointer', background: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>Từ chối</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* ==============================================================
          GIAO DIỆN ADMIN / OP ADMIN (4 THẺ CON)
      ============================================================== */}
      {!isScheduler ? (
          <>
             {/* MENU TỔNG QUAN */}
             {activeView === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {/* Mục 1 */}
                    <div style={styles.menuCard}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                            <div style={styles.iconBox}><Icons.Task /></div>
                            <h3 style={styles.cardTitle}>1. Giao nhiệm vụ (TASK+)</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>Thiết lập việc mới & Mức kỷ luật.</div>
                        <button onClick={() => { setActiveView('create_task'); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: '', disciplineId: '' }); }} style={styles.accessBtn}>
                            Truy cập <Icons.ArrowRight />
                        </button>
                    </div>

                    {/* Mục 2 */}
                    <div style={styles.menuCard}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                            <div style={styles.iconBox}><Icons.Schedule /></div>
                            <h3 style={styles.cardTitle}>2. Lên lịch công tác định kỳ</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>Khởi tạo lịch làm việc lặp lại.</div>
                        <button onClick={() => { setActiveView('create_schedule'); setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }} style={styles.accessBtn}>
                            Truy cập <Icons.ArrowRight />
                        </button>
                    </div>

                    {/* Mục 3 */}
                    <div style={styles.menuCard}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                            <div style={styles.iconBox}><Icons.Task /></div>
                            <h3 style={styles.cardTitle}>3. Quản lý nhiệm vụ (TASK+)</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>Theo dõi tiến độ việc lẻ.</div>
                        <button onClick={() => setActiveView('manage_tasks')} style={styles.accessBtn}>
                            Truy cập <Icons.ArrowRight />
                        </button>
                    </div>

                    {/* Mục 4 */}
                    <div style={styles.menuCard}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                            <div style={styles.iconBox}><Icons.Schedule /></div>
                            <h3 style={styles.cardTitle}>4. Quản lý công tác định kỳ</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>Quản lý lịch gốc & Các ca thực tế.</div>
                        <button onClick={() => setActiveView('manage_schedules')} style={styles.accessBtn}>
                            Truy cập <Icons.ArrowRight />
                        </button>
                    </div>
                </div>
             )}

             {/* MỤC 1: GIAO NHIỆM VỤ LẺ */}
             {activeView === 'create_task' && (
                 <div style={styles.formContainer}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h4 style={{ margin: 0, color: '#003366', fontWeight: '600' }}>Giao nhiệm vụ (TASK+) & Thiết lập Kỷ luật</h4>
                        <button onClick={() => setActiveView('overview')} style={styles.backBtn}><Icons.Back /> Ẩn</button>
                    </div>
                    <form onSubmit={handleAddTaskAdhoc} style={styles.formGrid}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Tiêu đề công việc</label>
                            <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={styles.input} required />
                        </div>
                        <div>
                            <label style={styles.label}>Người thực hiện</label>
                            <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} style={styles.select} required>
                                <option value="">-- Chọn nhân sự --</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Vai trò thực hiện</label>
                            <select value={newTask.assignedRole} onChange={e => setNewTask({...newTask, assignedRole: e.target.value})} style={styles.select}>
                                {['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Bắt đầu (Check-in)</label>
                            <input type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} style={styles.input} required />
                        </div>
                        <div>
                            <label style={styles.label}>Kết thúc (Check-out)</label>
                            <input type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} style={styles.input} required />
                        </div>
                        <div>
                            <label style={styles.label}>Mức tiền chi trả (VNĐ)</label>
                            <input type="number" placeholder="Ví dụ: 100000" value={newTask.paymentType} onChange={e => setNewTask({...newTask, paymentType: e.target.value})} style={styles.input} />
                        </div>
                        <div>
                            <label style={styles.label}>Kỷ luật (nếu trễ)</label>
                            <select value={newTask.disciplineId} onChange={e => setNewTask({...newTask, disciplineId: e.target.value})} style={{...styles.select, borderColor: 'red', color: '#b91c1c'}}>
                                <option value="">-- Chọn hình thức --</option>
                                {activeDisciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Mô tả chi tiết</label>
                            <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{...styles.input, height: '80px'}} />
                        </div>
                        <button type="submit" style={styles.btnSubmit}>Giao việc</button>
                    </form>
                 </div>
             )}

             {/* MỤC 2: LÊN LỊCH ĐỊNH KỲ */}
             {activeView === 'create_schedule' && (
                 <div style={styles.formContainer}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h4 style={{ margin: 0, color: '#003366', fontWeight: '600' }}>
                            {editingScheduleId ? 'Chỉnh sửa Lịch công tác' : 'Lên lịch công tác định kỳ'}
                        </h4>
                        <button onClick={() => { setActiveView('overview'); setEditingScheduleId(null); }} style={styles.backBtn}><Icons.Back /> Ẩn</button>
                    </div>
                    <form onSubmit={handleAddScheduleSubmit} style={styles.formGrid}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Tiêu đề lịch trình</label>
                            <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={styles.input} required />
                        </div>
                        <div>
                            <label style={styles.label}>Người thực hiện</label>
                            <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} style={styles.select} required>
                                <option value="">-- Chọn nhân sự --</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Vai trò thực hiện</label>
                            <select value={newTask.assignedRole} onChange={e => setNewTask({...newTask, assignedRole: e.target.value})} style={styles.select}>
                                {['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Bắt đầu (Giờ & Ngày)</label>
                            <input type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} style={styles.input} required />
                        </div>
                        <div>
                            <label style={styles.label}>Kết thúc (Giờ & Ngày)</label>
                            <input type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} style={styles.input} required />
                        </div>
                        <div style={{ gridColumn: '1 / -1', background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <h5 style={{margin:'0 0 10px 0', fontSize:'0.9rem', color:'#003366'}}>Cấu hình lặp lại</h5>
                            <div style={{display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap'}}>
                                <div style={{display:'flex', flexDirection:'column'}}>
                                    <label style={styles.label}>Số tuần lặp lại:</label>
                                    <input type="number" min="1" max="52" value={scheduleConfig.repeatWeeks} onChange={e => setScheduleConfig({...scheduleConfig, repeatWeeks: e.target.value})} style={{...styles.input, width: '100px'}} />
                                </div>
                                <div style={{display:'flex', flexDirection:'column'}}>
                                    <label style={styles.label}>Chọn thứ trong tuần:</label>
                                    <div style={{display:'flex', gap:'8px', marginTop:'5px', flexWrap: 'wrap'}}>
                                        {daysOfWeek.map(d => (
                                            <div key={d.key} onClick={() => handleDayToggle(d.key)} style={{ width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', cursor:'pointer', fontWeight:'bold', border: '1px solid #d1d5db', background: scheduleConfig.days.includes(d.key) ? '#003366' : 'white', color: scheduleConfig.days.includes(d.key) ? 'white' : '#6b7280' }}>
                                                {d.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Mô tả chi tiết</label>
                            <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{...styles.input, height: '80px'}} />
                        </div>
                        <button type="submit" style={styles.btnSubmit}>Lưu Lịch & Tạo Nhiệm Vụ</button>
                    </form>
                 </div>
             )}

             {/* MỤC 3: QUẢN LÝ TASK+ (CHỈ AD-HOC TASKS) */}
             {activeView === 'manage_tasks' && (
                 <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'20px'}}>
                         <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={styles.iconBox}><Icons.Task /></div>
                            <h4 style={{margin:0, fontSize: '1.2rem', color:'#003366'}}>Quản lý Nhiệm vụ (TASK+)</h4>
                         </div>
                         <button onClick={() => setActiveView('overview')} style={styles.backBtn}><Icons.Back /> Ẩn</button>
                     </div>
                     
                     <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'15px'}}>
                         <select value={filterAdhocStaff} onChange={e => setFilterAdhocStaff(e.target.value)} style={styles.filterSelect}>
                             <option value="all">Tất cả nhân sự</option>
                             {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                         <select value={filterAdhocDay} onChange={e => setFilterAdhocDay(e.target.value)} style={styles.filterSelect}>
                             <option value="all">Tất cả các ngày</option>
                             {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                         </select>
                         <select value={filterAdhocTime} onChange={e => setFilterAdhocTime(e.target.value)} style={styles.filterSelect}>
                             <option value="all">Tất cả thời gian</option>
                             <option value="day">Hôm nay</option>
                             <option value="week">Tuần này</option>
                             <option value="month">Tháng này</option>
                         </select>
                     </div>

                     <div style={{overflowX: 'auto'}}>
                         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                            <thead>
                               <tr style={{textAlign:'left', borderBottom: '1px solid #eee', background:'#f9fafb', color:'#6b7280'}}>
                                 <th style={{padding:'12px', width: '50px'}}>STT</th>
                                 <th style={{padding:'12px'}}>Nhiệm vụ</th>
                                 <th style={{padding:'12px'}}>Người làm</th>
                                 <th style={{padding:'12px'}}>Vai trò</th>
                                 <th style={{padding:'12px'}}>Thời gian</th>
                                 <th style={{padding:'12px'}}>Tiến độ</th>
                                 <th style={{padding:'12px'}}>Xóa</th>
                               </tr>
                            </thead>
                            <tbody>
                               {filteredAdhocTasks.map((t, index) => (
                                 <tr key={t.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{padding:'12px', textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{index + 1}</td>
                                    <td style={{padding:'12px'}}>
                                        <strong>{t.title}</strong><br/>
                                        <span style={{fontSize:'0.75rem', color:'#059669', fontWeight:'600'}}>{t.paymentType}</span>
                                    </td>
                                    <td style={{padding:'12px'}}>{t.assigneeName}</td>
                                    <td style={{padding:'12px'}}>{t.assignedRole}</td>
                                    <td style={{padding:'12px'}}>{formatTaskTime(t.startTime, t.endTime)}</td>
                                    <td style={{padding:'12px'}}>{t.progress}%</td>
                                    <td style={{padding:'12px'}}>
                                        <button onClick={()=>handleDeleteTask(t.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Xóa</button>
                                    </td>
                                 </tr>
                               ))}
                               {filteredAdhocTasks.length === 0 && (
                                   <tr><td colSpan="7" style={{padding:'30px', textAlign:'center', color:'#9ca3af', fontStyle:'italic'}}>Không tìm thấy nhiệm vụ phù hợp.</td></tr>
                               )}
                            </tbody>
                         </table>
                     </div>
                 </div>
             )}

             {/* MỤC 4: QUẢN LÝ CÔNG TÁC ĐỊNH KỲ (SCHEDULES & GENERATED TASKS) */}
             {activeView === 'manage_schedules' && (
                 <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'20px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <div style={styles.iconBox}><Icons.Schedule /></div>
                            <h4 style={{margin:0, fontSize: '1.2rem', color:'#003366'}}>Quản lý Công tác định kỳ</h4>
                        </div>
                        <button onClick={() => setActiveView('overview')} style={styles.backBtn}><Icons.Back /> Ẩn</button>
                    </div>

                    {/* BẢNG 1: LỊCH GỐC */}
                    <div style={{marginBottom:'40px', padding:'15px', border:'1px solid #e5e7eb', borderRadius:'12px', background:'#f9fafb'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'15px'}}>
                            <h5 style={{margin:0, color:'#1f2937'}}>A. Lịch gốc định kỳ (Templates)</h5>
                            <input type="text" placeholder="Tìm tiêu đề, nhân sự..." value={scheduleSearchTerm} onChange={(e) => setScheduleSearchTerm(e.target.value)} style={{...styles.input, width: '250px', marginTop: 0, padding:'6px 10px'}} />
                        </div>
                        <div style={{overflowX: 'auto', background:'white', borderRadius:'8px', border:'1px solid #e5e7eb'}}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '500px' }}>
                              <thead>
                                 <tr style={{textAlign:'left', borderBottom: '1px solid #eee', background:'#f3f4f6', color:'#6b7280'}}>
                                   <th style={{padding:'10px', width: '50px'}}>STT</th>
                                   <th style={{padding:'10px'}}>Thông tin lịch trình</th>
                                   <th style={{padding:'10px'}}>Hành động</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {searchedAdminSchedules.map((s, index) => (
                                   <tr key={s.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                      <td style={{padding:'10px', textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{index + 1}</td>
                                      <td style={{padding:'10px'}}>
                                          <strong>{s.title}</strong>
                                          {s.assigneeName && <div style={{fontSize:'0.8rem', color:'#6b7280'}}>Phụ trách: {s.assigneeName} {s.assignedRole ? `(${s.assignedRole})` : ''}</div>}
                                      </td>
                                      <td style={{padding:'10px'}}>
                                          <button onClick={()=>handleEditSchedule(s)} style={{color:'#003366', border:'none', background:'none', cursor:'pointer', marginRight:'10px', fontWeight:'600'}}>Sửa</button>
                                          <button onClick={()=>handleDeleteSchedule(s.id)} style={{color:'#dc2626', border:'none', background:'none', cursor:'pointer', fontWeight:'600'}}>Xóa</button>
                                      </td>
                                   </tr>
                                 ))}
                                 {searchedAdminSchedules.length === 0 && (
                                     <tr><td colSpan="3" style={{padding:'20px', textAlign:'center', color:'#9ca3af', fontStyle:'italic'}}>Trống.</td></tr>
                                 )}
                              </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BẢNG 2: CÁC CA LÀM VIỆC TỪ SCHEDULER (CÓ INLINE EDIT) */}
                    <div>
                        <h5 style={{margin:'0 0 15px 0', color:'#1f2937'}}>B. Danh sách ca làm việc thực tế (Generated Tasks)</h5>
                        <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'15px'}}>
                            <select value={filterSchedTaskStaff} onChange={e => setFilterSchedTaskStaff(e.target.value)} style={styles.filterSelect}>
                                <option value="all">Tất cả nhân sự</option>
                                {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select value={filterSchedTaskDay} onChange={e => setFilterSchedTaskDay(e.target.value)} style={styles.filterSelect}>
                                <option value="all">Tất cả các ngày</option>
                                {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                            </select>
                            <select value={filterSchedTaskTime} onChange={e => setFilterSchedTaskTime(e.target.value)} style={styles.filterSelect}>
                                <option value="all">Tất cả thời gian</option>
                                <option value="day">Hôm nay</option>
                                <option value="week">Tuần này</option>
                                <option value="month">Tháng này</option>
                            </select>
                        </div>
                        <div style={{overflowX: 'auto', border:'1px solid #e5e7eb', borderRadius:'8px'}}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '800px' }}>
                               <thead>
                                  <tr style={{textAlign:'left', borderBottom: '1px solid #eee', background:'#f9fafb', color:'#6b7280'}}>
                                    <th style={{padding:'12px', width: '50px'}}>STT</th>
                                    <th style={{padding:'12px'}}>Nhiệm vụ</th>
                                    <th style={{padding:'12px'}}>Người làm</th>
                                    <th style={{padding:'12px'}}>Vai trò</th>
                                    <th style={{padding:'12px'}}>Thời gian (Checkin-Checkout)</th>
                                    <th style={{padding:'12px'}}>Tiến độ</th>
                                    <th style={{padding:'12px'}}>Hành động</th>
                                  </tr>
                               </thead>
                               <tbody>
                                  {filteredGeneratedTasks.map((t, index) => (
                                    <tr key={t.id} style={{ borderBottom: '1px solid #f9f9f9', background: editingTaskId === t.id ? '#f0fdf4' : 'transparent' }}>
                                       <td style={{padding:'12px', textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{index + 1}</td>
                                       
                                       {/* NEU DANG EDIT ROW NAY */}
                                       {editingTaskId === t.id ? (
                                           <>
                                              <td style={{padding:'8px'}}>
                                                  <input value={editTaskForm.title} onChange={e => setEditTaskForm({...editTaskForm, title: e.target.value})} style={{...styles.input, padding:'6px', marginTop:0}} />
                                              </td>
                                              <td style={{padding:'8px'}}>
                                                  <select value={editTaskForm.assigneeId} onChange={e => setEditTaskForm({...editTaskForm, assigneeId: e.target.value})} style={{...styles.select, padding:'6px', marginTop:0}}>
                                                      {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                  </select>
                                              </td>
                                              <td style={{padding:'8px'}}>
                                                  <select value={editTaskForm.assignedRole} onChange={e => setEditTaskForm({...editTaskForm, assignedRole: e.target.value})} style={{...styles.select, padding:'6px', marginTop:0}}>
                                                      {['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'].map(r => <option key={r} value={r}>{r}</option>)}
                                                  </select>
                                              </td>
                                              <td style={{padding:'8px', display:'flex', flexDirection:'column', gap:'4px'}}>
                                                  <input type="datetime-local" value={toDateTimeLocal(editTaskForm.startTime)} onChange={e => setEditTaskForm({...editTaskForm, startTime: e.target.value})} style={{...styles.input, padding:'6px', marginTop:0}} />
                                                  <input type="datetime-local" value={toDateTimeLocal(editTaskForm.endTime)} onChange={e => setEditTaskForm({...editTaskForm, endTime: e.target.value})} style={{...styles.input, padding:'6px', marginTop:0}} />
                                              </td>
                                              <td style={{padding:'12px'}}>{t.progress}%</td>
                                              <td style={{padding:'8px'}}>
                                                  <button onClick={saveTaskEdit} style={{color:'white', background:'#059669', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', width:'100%', marginBottom:'4px'}}>Lưu</button>
                                                  <button onClick={()=>setEditingTaskId(null)} style={{color:'#4b5563', background:'#e5e7eb', border:'none', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', width:'100%'}}>Hủy</button>
                                              </td>
                                           </>
                                       ) : (
                                           // NEU NORMAL ROW
                                           <>
                                              <td style={{padding:'12px'}}><strong>{t.title}</strong></td>
                                              <td style={{padding:'12px'}}>{t.assigneeName}</td>
                                              <td style={{padding:'12px'}}>{t.assignedRole}</td>
                                              <td style={{padding:'12px'}}>{formatTaskTime(t.startTime, t.endTime)}</td>
                                              <td style={{padding:'12px'}}>{t.progress}%</td>
                                              <td style={{padding:'12px'}}>
                                                  <button onClick={()=>startEditTask(t)} style={{color:'#003366', border:'none', background:'none', cursor:'pointer', marginRight:'10px', fontWeight:'bold'}}>Sửa</button>
                                                  <button onClick={()=>handleDeleteTask(t.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>Xóa</button>
                                              </td>
                                           </>
                                       )}
                                    </tr>
                                  ))}
                                  {filteredGeneratedTasks.length === 0 && (
                                      <tr><td colSpan="7" style={{padding:'30px', textAlign:'center', color:'#9ca3af', fontStyle:'italic'}}>Không tìm thấy ca làm việc phù hợp.</td></tr>
                                  )}
                               </tbody>
                            </table>
                        </div>
                    </div>
                 </div>
             )}
          </>
      ) : (
          // ==============================================================
          // GIAO DIỆN SCHEDULER (GIỮ NGUYÊN NHƯ CŨ)
          // ==============================================================
          <>
              <div style={styles.formContainer}>
                <h4 style={{ margin: '0 0 15px 0', color: '#003366', fontWeight: '600' }}>
                    {editingScheduleId ? 'Đang soạn yêu cầu điều chỉnh' : 'Lên lịch công tác mới'}
                </h4>
                <form onSubmit={handleAddScheduleSubmit} style={styles.formGrid}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Tiêu đề công việc</label>
                        <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={styles.input} required />
                    </div>
                    <div>
                        <label style={styles.label}>Người thực hiện</label>
                        <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} style={styles.select} required>
                            <option value="">-- Chọn nhân sự --</option>
                            {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>Vai trò thực hiện</label>
                        <select value={newTask.assignedRole} onChange={e => setNewTask({...newTask, assignedRole: e.target.value})} style={styles.select}>
                            {['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>Bắt đầu (Check-in)</label>
                        <input type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} style={styles.input} required />
                    </div>
                    <div>
                        <label style={styles.label}>Kết thúc (Check-out)</label>
                        <input type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} style={styles.input} required />
                    </div>
                    <div style={{ gridColumn: '1 / -1', background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <h5 style={{margin:'0 0 10px 0', fontSize:'0.9rem', color:'#003366'}}>Cấu hình lặp lại</h5>
                        <div style={{display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap'}}>
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <label style={styles.label}>Số tuần lặp lại:</label>
                                <input type="number" min="1" max="52" value={scheduleConfig.repeatWeeks} onChange={e => setScheduleConfig({...scheduleConfig, repeatWeeks: e.target.value})} style={{...styles.input, width: '100px'}} />
                            </div>
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <label style={styles.label}>Chọn thứ trong tuần:</label>
                                <div style={{display:'flex', gap:'8px', marginTop:'5px', flexWrap: 'wrap'}}>
                                    {daysOfWeek.map(d => (
                                        <div key={d.key} onClick={() => handleDayToggle(d.key)} style={{ width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', cursor:'pointer', fontWeight:'bold', border: '1px solid #d1d5db', background: scheduleConfig.days.includes(d.key) ? '#003366' : 'white', color: scheduleConfig.days.includes(d.key) ? 'white' : '#6b7280' }}>
                                            {d.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Mô tả chi tiết</label>
                        <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{...styles.input, height: '80px'}} />
                    </div>
                    <button type="submit" style={styles.btnSubmit}>
                        {editingScheduleId ? 'Gửi yêu cầu điều chỉnh' : 'Lưu lịch & Tạo Tasks'}
                    </button>
                    {editingScheduleId && (
                        <button type="button" onClick={() => { setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }} style={{ ...styles.btnSubmit, background: '#9ca3af', marginTop: '-10px' }}>
                            Hủy thao tác
                        </button>
                    )}
                </form>
              </div>

              <div style={{ background: 'white', padding: '20px', borderRadius: '16px' }}>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'15px'}}>
                     <h4 style={{margin:0}}>Danh sách lịch đã thiết lập</h4>
                     <div style={{display:'flex', gap:'10px'}}>
                         <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} style={styles.filterSelect}>
                             <option value="all">Tất cả nhân sự</option>
                             {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                         </select>
                         <select value={filterDay} onChange={e => setFilterDay(e.target.value)} style={styles.filterSelect}>
                             <option value="all">Tất cả các ngày</option>
                             {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                         </select>
                     </div>
                 </div>

                 <div style={{overflowX: 'auto'}}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '700px' }}>
                        <thead>
                           <tr style={{textAlign:'left', borderBottom: '1px solid #eee', background:'#f9fafb', color:'#6b7280'}}>
                             <th style={{padding:'12px', width:'50px'}}>STT</th>
                             <th style={{padding:'12px'}}>Tiêu đề</th>
                             <th style={{padding:'12px'}}>Thời gian</th>
                             <th style={{padding:'12px'}}>Người thực hiện</th>
                             <th style={{padding:'12px'}}>Lặp lại</th>
                             <th style={{padding:'12px'}}>Các ngày</th>
                             <th style={{padding:'12px'}}>Thao tác</th>
                           </tr>
                        </thead>
                        <tbody>
                           {filteredSchedules.map((s, index) => (
                             <tr key={s.id} style={{ borderBottom: '1px solid #f9f9f9', background: s.request ? '#fefce8' : 'transparent' }}>
                                <td style={{padding:'12px', textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{index + 1}</td>
                                <td style={{padding:'12px'}}>
                                    <strong>{s.title}</strong>
                                    <div style={{fontSize:'0.75rem', color:'#6b7280'}}>{s.description?.substring(0, 30)}...</div>
                                    {s.request && <div style={{fontSize:'0.7rem', color:'#d97706', fontWeight:'bold', marginTop:'4px'}}>⏳ Đang chờ duyệt: {s.request.type === 'delete' ? 'XÓA' : 'SỬA'}</div>}
                                </td>
                                <td style={{padding:'12px', color:'#003366', fontWeight:'600'}}>
                                    {formatScheduleTimeRange(s.startTime, s.endTime)}
                                </td>
                                <td style={{padding:'12px'}}>{s.assigneeName} ({s.assignedRole})</td>
                                <td style={{padding:'12px'}}>{s.repeatWeeks} tuần</td>
                                <td style={{padding:'12px'}}>
                                    <div style={{display:'flex', gap:'4px', flexWrap: 'wrap'}}>
                                        {s.repeatDays && s.repeatDays.map(d => (
                                            <span key={d} style={{fontSize:'0.7rem', background:'#e5e7eb', padding:'2px 6px', borderRadius:'4px'}}>{d}</span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{padding:'12px'}}>
                                    {!s.request ? (
                                        <button onClick={() => handleRequestAdjustmentClick(s)} style={{color:'#003366', border:'1px solid #003366', background:'white', cursor:'pointer', fontWeight:'600', padding:'4px 8px', borderRadius:'6px', fontSize:'0.8rem', whiteSpace: 'nowrap'}}>
                                            Xin điều chỉnh
                                        </button>
                                    ) : (
                                        <span style={{fontSize:'0.8rem', color:'#9ca3af', fontStyle:'italic'}}>Đã gửi yêu cầu</span>
                                    )}
                                </td>
                             </tr>
                           ))}
                           {filteredSchedules.length === 0 && (
                               <tr><td colSpan="7" style={{padding:'30px', textAlign:'center', color:'#9ca3af', fontStyle:'italic'}}>Không tìm thấy lịch phù hợp.</td></tr>
                           )}
                        </tbody>
                     </table>
                 </div>
              </div>
          </>
      )}
    </div>
  );
};

const styles = {
    formContainer: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #f0f0f0' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px', background: 'white' },
    filterSelect: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', color: '#374151', cursor: 'pointer', background:'white' },
    label: { fontSize: '0.8rem', fontWeight: 'bold', color: '#555' },
    btnSubmit: { gridColumn: '1 / -1', padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    
    // UI của Tab Container
    menuCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' },
    iconBox: { width: '36px', height: '36px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003366' },
    cardTitle: { margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937' },
    accessBtn: { marginTop: 'auto', background: '#003366', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' },
    backBtn: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }
};

export default TaskManager;