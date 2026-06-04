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
    Task: () => (<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125-1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>),
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
  
  // --- LOAD AREAS TỪ DATABASE ---
  const { tasks, addTask, deleteTask, updateTask, staffList, disciplineTypes, schedules, addSchedule, deleteSchedule, updateSchedule, areas } = useData();
  
  const activeDisciplines = disciplineTypes.filter(d => d.status === 'Active');
  
  const isScheduler = user?.role === 'scheduler';
  const isApprover = ['chief', 'reg', 'op'].includes(user?.role);

  const [activeView, setActiveView] = useState('overview'); 
  const [scheduleTab, setScheduleTab] = useState('instances'); 

  // Bổ sung state 'area'
  const [newTask, setNewTask] = useState({ 
      title: '', assigneeId: '', description: '',
      startTime: '', endTime: '', 
      assignedRole: '',
      jobCode: '', 
      paymentType: '', 
      disciplineId: '',
      area: '' 
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

  // [MỚI] Bộ lọc + sắp xếp cho mục "Cấu hình Lịch gốc" (Template)
  const [filterTplStaff, setFilterTplStaff] = useState('all');
  const [filterTplDay, setFilterTplDay] = useState('all');
  const [filterTplMonth, setFilterTplMonth] = useState('all'); // lọc theo tháng bắt đầu của lịch
  const [filterTplYear, setFilterTplYear] = useState('all');   // lọc theo năm bắt đầu của lịch
  const [tplSort, setTplSort] = useState({ key: null, direction: 'ascending' }); // sort theo cột "Thông tin mẫu lịch"
  const [tplConflicts, setTplConflicts] = useState(null); // kết quả dò lịch trùng (null = chưa dò)

  // [TÍNH NĂNG MỚI] Tháng cần sinh ca (mặc định tháng hiện tại) — dùng cho nút "Sinh ca theo tháng"
  const [genMonth, setGenMonth] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // [MODAL] Hộp thoại pop-up tùy biến (giữa màn hình) thay cho alert()/confirm() mặc định của trình duyệt.
  // modal = { kind:'alert'|'confirm', title, message, onConfirm, confirmText, cancelText, tone }
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);
  const showAlert = (message, opts = {}) =>
      setModal({ kind: 'alert', title: opts.title || 'Thông báo', message, tone: opts.tone || 'info' });
  const showConfirm = (message, onConfirm, opts = {}) =>
      setModal({
          kind: 'confirm', title: opts.title || 'Xác nhận', message, onConfirm,
          confirmText: opts.confirmText || 'Đồng ý', cancelText: opts.cancelText || 'Hủy',
          tone: opts.tone || 'primary'
      });

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

  // [CHỐNG NHẦM ĐỊNH DẠNG NGÀY] Hiển thị ngày rõ ràng kiểu Việt Nam: "Thứ X, dd/MM/yyyy HH:mm".
  // Ô <input type="datetime-local"> có thể hiển thị theo MM/DD/YYYY (kiểu Mỹ) gây nhầm với DD/MM của VN —
  // nhãn này giúp Scheduler nhìn đúng ngày thực sự đang được lưu.
  const formatVNDateTimeLabel = (val) => {
      if (!val) return '';
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      const WD = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${WD[d.getDay()]}, ${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
  };

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

  const getStaffRoles = (staffId) => {
      if (!staffId) return [];
      const st = staffList.find(s => s.id === staffId);
      if (!st) return [];

      let roles = Array.isArray(st.positions) 
            ? st.positions.filter(p => POSITIONS.includes(p)) 
            : [];

      const systemRole = getSystemRoleName(st.role);

      if (systemRole && systemRole !== 'Staff' && !roles.includes(systemRole)) {
          roles.unshift(systemRole);
      }

      return roles;
  };

  // --- HANDLER THAY ĐỔI NHÂN SỰ & AUTOFILL KHU VỰC ---
  const handleAssigneeChange = (e) => {
      const selectedId = e.target.value;
      const staff = staffList.find(s => s.id === selectedId);
      setNewTask(prev => ({
          ...prev,
          assigneeId: selectedId,
          assignedRole: '',
          jobCode: '',
          area: staff?.defaultArea || '' // Tự động điền khu vực mặc định của nhân sự
      }));
  };

  const generateTasksFromSchedule = (scheduleData, schedId) => {
    const { startTime, endTime, repeatWeeks, repeatDays } = scheduleData;
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);
    const duration = endObj - startObj;

    const targetDayVals = daysOfWeek.filter(d => repeatDays.includes(d.key)).map(d => d.val);

    // [FIX CHỐNG TRÙNG] Lập danh sách NGÀY đã có ca ĐÃ CHẤM CÔNG của lịch này.
    // deleteRelatedTasks đã giữ lại các ca đó; ở đây ta KHÔNG sinh lại cho những ngày này
    // để tránh tạo ca trùng (1 ca đã chấm công + 1 ca trống cùng ngày).
    const workedDateKeys = new Set();
    (tasks || []).filter(t => t.fromScheduleId === schedId && isTaskWorked(t)).forEach(t => {
        const dt = new Date(t.startTime || t.checkInTime || t.endTime);
        if (!isNaN(dt.getTime())) workedDateKeys.add(`${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`);
    });

    for (let w = 0; w < repeatWeeks; w++) {
        for (let d = 0; d < 7; d++) {
            const currentCheckDate = new Date(startObj);
            currentCheckDate.setDate(startObj.getDate() + (w * 7) + d);

            if (targetDayVals.includes(currentCheckDate.getDay())) {
                const taskStart = new Date(currentCheckDate);
                const taskEnd = new Date(taskStart.getTime() + duration);

                // Bỏ qua ngày đã có ca đã chấm công -> giữ nguyên ca cũ, không tạo trùng.
                const dayKey = `${taskStart.getFullYear()}-${taskStart.getMonth() + 1}-${taskStart.getDate()}`;
                if (workedDateKeys.has(dayKey)) continue;

                const taskPayload = {
                    title: scheduleData.title,
                    assigneeId: scheduleData.assigneeId,
                    assigneeName: scheduleData.assigneeName,
                    description: scheduleData.description,
                    assignedRole: scheduleData.assignedRole,
                    jobCode: scheduleData.jobCode || '', 
                    area: scheduleData.area || '', // Lưu area vào Task con
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

  // [FIX BẢO TOÀN CHẤM CÔNG] Một ca được coi là "ĐÃ CHẤM CÔNG" nếu đã có check-in/out,
  // đã hoàn thành, hoặc đã có tiến độ. Những ca này TUYỆT ĐỐI không được xóa khi sửa/duyệt lịch.
  const isTaskWorked = (t) => Boolean(t.checkInTime || t.checkOutTime || t.status === 'completed' || (t.progress > 0));

  const deleteRelatedTasks = (schedId) => {
      // [FIX] Trước đây xóa SẠCH mọi ca của lịch -> ca đã check-in/out của nhân sự bị xóa,
      // hôm sau khi sinh lại hiện "chưa check-in" và bị xét kỷ luật đi trễ sai.
      // Nay CHỈ xóa ca CHƯA chấm công; ca đã chấm công được giữ nguyên.
      const relatedTasks = tasks.filter(t => t.fromScheduleId === schedId);
      relatedTasks.forEach(t => { if (!isTaskWorked(t)) deleteTask(t.id); });
  };

  // ==============================================================
  // [TÍNH NĂNG MỚI] SINH CA THEO THÁNG
  // --------------------------------------------------------------
  // Quét toàn bộ Lịch gốc (templates) và sinh đầy đủ ca cho ĐÚNG tháng được chọn,
  // dựa trên các thứ trong tuần (repeatDays) + giờ:phút của lịch gốc.
  // - KHÔNG xóa bất kỳ ca cũ nào (ca đã chấm công được giữ nguyên tuyệt đối).
  // - CHỐNG TRÙNG: nếu một lịch đã có ca trong đúng ngày đó thì bỏ qua, không tạo lại.
  // - Bỏ qua lịch đang chờ duyệt yêu cầu điều chỉnh (s.request).
  // ==============================================================
  const handleGenerateMonthShifts = () => {
      if (!genMonth) return showAlert("Vui lòng chọn tháng cần sinh ca!");
      const [yStr, mStr] = genMonth.split('-');
      const year = Number(yStr);
      const month = Number(mStr); // 1-12

      showConfirm(
          `Sinh ca làm việc cho THÁNG ${month}/${year}?\n\n` +
          `• Hệ thống quét tất cả Lịch gốc và tạo đủ ca cho tháng này.\n` +
          `• Các ca đã tồn tại (kể cả đã chấm công) sẽ ĐƯỢC GIỮ NGUYÊN, không tạo trùng.\n` +
          `• Không xóa bất kỳ dữ liệu nào.`,
          () => runGenerateMonthShifts(year, month),
          { confirmText: 'Sinh ca' }
      );
  };

  const runGenerateMonthShifts = (year, month) => {
      // Tập hợp khóa các ca ĐÃ CÓ theo từng lịch + ngày, để chống trùng.
      // Khóa dạng: "<scheduleId>_<year>-<month>-<day>" (month/day không pad, dùng giờ địa phương).
      const existingKeys = new Set();
      tasks.filter(t => t.fromScheduleId).forEach(t => {
          const dt = new Date(t.startTime || t.checkInTime || t.endTime || t.deadline);
          if (!isNaN(dt.getTime())) {
              existingKeys.add(`${t.fromScheduleId}_${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`);
          }
      });

      let created = 0;
      let skipped = 0;       // ca đã tồn tại sẵn -> không tạo trùng
      let outOfRange = 0;    // ca thuộc lịch nhưng rơi ngoài tháng được chọn

      schedules.forEach(s => {
          if (s.request) return; // bỏ qua lịch đang chờ duyệt
          if (!s.startTime || !s.endTime || !Array.isArray(s.repeatDays) || s.repeatDays.length === 0) return;

          const startObj = new Date(s.startTime);
          const endObj = new Date(s.endTime);
          if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) return;

          const duration = endObj - startObj; // độ dài ca (ms)
          const repeatWeeks = Number(s.repeatWeeks) || 1;
          const targetDayVals = daysOfWeek.filter(d => s.repeatDays.includes(d.key)).map(d => d.val);
          const staff = staffList.find(st => st.id === s.assigneeId);

          // [ĐÚNG THIẾT LẬP SCHEDULER] Lặp y hệt generateTasksFromSchedule:
          // chỉ sinh đúng các ca mà Scheduler đã định nghĩa (ngày bắt đầu + repeatDays + repeatWeeks),
          // sau đó CHỈ GIỮ những ca rơi vào tháng được chọn.
          for (let w = 0; w < repeatWeeks; w++) {
              for (let dd = 0; dd < 7; dd++) {
                  const cur = new Date(startObj);
                  cur.setDate(startObj.getDate() + (w * 7) + dd);

                  if (!targetDayVals.includes(cur.getDay())) continue;

                  // Chỉ lấy ca rơi đúng vào tháng/năm được chọn
                  if (cur.getFullYear() !== year || (cur.getMonth() + 1) !== month) { outOfRange++; continue; }

                  const key = `${s.id}_${year}-${month}-${cur.getDate()}`;
                  if (existingKeys.has(key)) { skipped++; continue; }

                  const taskStart = new Date(cur);
                  const taskEnd = new Date(taskStart.getTime() + duration);

                  addTask({
                      title: s.title,
                      assigneeId: s.assigneeId,
                      assigneeName: s.assigneeName || (staff ? staff.name : 'Unknown'),
                      description: s.description || '',
                      assignedRole: s.assignedRole || '',
                      jobCode: s.jobCode || '',
                      area: s.area || '',
                      startTime: taskStart.toISOString(),
                      endTime: taskEnd.toISOString(),
                      paymentType: 'Theo lịch',
                      disciplineId: '',
                      disciplineName: '',
                      deadline: taskEnd.toISOString(),
                      fromScheduleId: s.id,
                      generatedDate: new Date().toISOString()
                  });

                  existingKeys.add(key);
                  created++;
              }
          }
      });

      showAlert(
          `Hoàn tất sinh ca tháng ${month}/${year} (đúng theo thiết lập Scheduler)!\n\n` +
          `• Đã tạo mới: ${created} ca\n` +
          `• Bỏ qua (đã có sẵn): ${skipped} ca\n\n` +
          `Mở tab "Ca làm việc thực tế" và lọc Tháng ${month} / Năm ${year} để kiểm tra.`,
          { title: 'Hoàn tất', tone: 'success' }
      );
  };

  // ==============================================================
  // [TÍNH NĂNG MỚI] DỌN CA SINH DƯ (lịch chưa có hiệu lực)
  // --------------------------------------------------------------
  // Xóa các ca trong tháng đã chọn thuộc Lịch gốc CHƯA tới ngày bắt đầu
  // (ca được sinh nhầm trước khi lịch có hiệu lực). CHỈ xóa ca CHƯA chấm công
  // — ca đã có check-in/check-out được giữ nguyên tuyệt đối.
  // ==============================================================
  const handleCleanupIneffectiveShifts = () => {
      if (!genMonth) return showAlert("Vui lòng chọn tháng cần dọn!");
      const [yStr, mStr] = genMonth.split('-');
      const year = Number(yStr);
      const month = Number(mStr);

      const schedMap = {};
      schedules.forEach(s => { schedMap[s.id] = s; });

      const toDelete = tasks.filter(t => {
          if (!t.fromScheduleId) return false;
          if (t.checkInTime || t.checkOutTime) return false; // giữ ca đã chấm công
          const dt = new Date(t.startTime || t.endTime || t.deadline);
          if (isNaN(dt.getTime())) return false;
          if (dt.getFullYear() !== year || (dt.getMonth() + 1) !== month) return false;
          const s = schedMap[t.fromScheduleId];
          if (!s || !s.startTime) return false;
          const base = new Date(s.startTime);
          if (isNaN(base.getTime())) return false;
          // Ca nằm TRƯỚC ngày lịch bắt đầu => lịch chưa có hiệu lực => cần xóa
          return dt.getTime() < base.getTime();
      });

      if (toDelete.length === 0) {
          return showAlert(`Không có ca sinh dư nào cần dọn trong tháng ${month}/${year}.`);
      }

      showConfirm(
          `Tìm thấy ${toDelete.length} ca sinh dư trong tháng ${month}/${year}\n` +
          `(thuộc lịch chưa tới ngày bắt đầu, chưa chấm công).\n\n` +
          `Xóa các ca này? Ca đã chấm công và ca hợp lệ sẽ được giữ nguyên.`,
          () => {
              toDelete.forEach(t => deleteTask(t.id));
              showAlert(`Đã dọn ${toDelete.length} ca sinh dư trong tháng ${month}/${year}.`, { title: 'Hoàn tất', tone: 'success' });
          },
          { tone: 'danger', confirmText: 'Xóa ca sinh dư' }
      );
  };

  const handleRequestAdjustmentClick = (sched) => {
      // Bước 1: chọn loại yêu cầu (gõ 'delete' hoặc 'edit') — giữ nguyên logic cũ, chỉ đổi sang modal đẹp.
      window.promptDialog("Bạn muốn yêu cầu gì? Gõ 'delete' để xin XÓA, hoặc 'edit' để xin SỬA lịch này.", {
          title: 'Yêu cầu điều chỉnh', okText: 'Tiếp tục', placeholder: "delete  hoặc  edit", multiline: false, emoji: '✏️'
      }).then(action => {
          if (!action) return;
          const act = action.toLowerCase().trim();

          if (act === 'delete') {
              // Bước 2: nhập lý do xóa (bắt buộc)
              window.promptDialog("Vui lòng nhập lý do muốn xóa lịch này:", {
                  title: 'Lý do xin xóa', okText: 'Gửi yêu cầu', placeholder: 'Nhập lý do bắt buộc...', emoji: '📝'
              }).then(reason => {
                  if (!reason) return; // hủy hoặc để trống
                  updateSchedule(sched.id, {
                      request: {
                          type: 'delete',
                          reason: reason,
                          requestedBy: user.username,
                          requestedAt: new Date().toISOString()
                      }
                  });
                  showAlert("Đã gửi yêu cầu xóa. Vui lòng đợi Admin phê duyệt.", { tone: 'success' });
              });

          } else if (act === 'edit') {
              setEditingScheduleId(sched.id);
              setNewTask({
                  title: sched.title, assigneeId: sched.assigneeId, description: sched.description,
                  startTime: sched.startTime, endTime: sched.endTime, assignedRole: sched.assignedRole,
                  jobCode: sched.jobCode || '',
                  area: sched.area || '', // Load lại area
                  paymentType: '', disciplineId: ''
              });
              setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
              window.scrollTo({ top: 0, behavior: 'smooth' });
              showAlert("Dữ liệu đã được tải lên form. Hãy chỉnh sửa và nhấn nút 'Gửi yêu cầu điều chỉnh'.");
          } else {
              showAlert("Lệnh không hợp lệ. Vui lòng nhập 'delete' hoặc 'edit'.", { tone: 'danger' });
          }
      });
  };

  const handleAddTaskAdhoc = (e) => {
      e.preventDefault();
      if (!newTask.title || !newTask.assigneeId || !newTask.endTime) return showAlert("Vui lòng điền đủ thông tin!", { tone: 'danger' });

      const staff = staffList.find(s => s.id === newTask.assigneeId);
      const disc = activeDisciplines.find(d => d.id === newTask.disciplineId);
      
      addTask({ 
          ...newTask, 
          assigneeName: staff ? staff.name : 'Unknown',
          disciplineName: disc ? disc.name : 'Chưa quy định',
          deadline: newTask.endTime,
          paymentType: newTask.paymentType ? `${newTask.paymentType} VNĐ` : 'Chưa nhập'
      });
      
      setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', area: '', paymentType: '', disciplineId: '' });
      showAlert("Đã giao nhiệm vụ thành công!", { tone: 'success' });
  };

  const handleAddScheduleSubmit = (e) => {
      e.preventDefault();
      if (!newTask.title || !newTask.assigneeId || !newTask.endTime) return showAlert("Vui lòng điền đủ thông tin!", { tone: 'danger' });
      if (scheduleConfig.days.length === 0) return showAlert("Vui lòng chọn ít nhất một ngày trong tuần!", { tone: 'danger' });
      
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
          // SCHEDULER chỉnh sửa -> gửi yêu cầu chờ Admin duyệt
          updateSchedule(editingScheduleId, {
              request: {
                  type: 'edit',
                  reason: 'Điều chỉnh thông tin',
                  draftData: scheduleData,
                  requestedBy: user.username,
                  requestedAt: new Date().toISOString()
              }
          });
          showAlert("Đã gửi yêu cầu điều chỉnh. Admin sẽ xem xét và phê duyệt.", { tone: 'success' });
      } else if (editingScheduleId) {
          // [FIX] ADMIN chỉnh sửa -> cập nhật TRỰC TIẾP lên lịch gốc đã có (không tạo lịch mới),
          // xóa các ca cũ của lịch này rồi sinh lại ca theo cấu hình mới.
          updateSchedule(editingScheduleId, { ...scheduleData, request: null });
          deleteRelatedTasks(editingScheduleId);
          generateTasksFromSchedule(scheduleData, editingScheduleId);
          showAlert(`Đã cập nhật lịch gốc "${scheduleData.title}" và sinh lại ca thành công!`, { tone: 'success' });
      } else {
          // Tạo lịch mới
          const savedId = addSchedule(scheduleData);
          generateTasksFromSchedule(scheduleData, savedId);
          showAlert(`Đã lên lịch và tạo tasks cho ${scheduleData.assigneeName}!`, { tone: 'success' });
      }

      setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', area: '', paymentType: '', disciplineId: '' });
      setScheduleConfig({ repeatWeeks: 1, days: [] });
      setEditingScheduleId(null);
  };

  const handleApproveRequest = (sched) => {
      const { request } = sched;
      if (!request) return;

      showConfirm(`Xác nhận phê duyệt yêu cầu "${request.type}" của ${request.requestedBy}?`, () => {
          deleteRelatedTasks(sched.id);

          if (request.type === 'delete') {
              deleteSchedule(sched.id);
          } else if (request.type === 'edit') {
              const newScheduleData = { ...request.draftData, request: null };
              updateSchedule(sched.id, newScheduleData);
              generateTasksFromSchedule(newScheduleData, sched.id);
          }
      }, { confirmText: 'Phê duyệt' });
  };

  const handleRejectRequest = (sched) => {
      window.promptDialog("Lý do từ chối (có thể để trống):", {
          title: 'Từ chối yêu cầu', okText: 'Tiếp tục', placeholder: 'Tùy chọn...', required: false, emoji: '✏️'
      }).then(reason => {
          showConfirm("Từ chối yêu cầu điều chỉnh này?", () => {
              updateSchedule(sched.id, { request: null, rejectionReason: reason || '' });
          }, { tone: 'danger', confirmText: 'Từ chối' });
      });
  };

  const handleDeleteTask = (id) => {
      showConfirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?", () => deleteTask(id), { tone: 'danger', confirmText: 'Xóa' });
  };
  
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
          area: sched.area || '', // Load lại area
          paymentType: '', disciplineId: ''
      });
      setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
      setActiveView('create_schedule');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSchedule = (id) => {
      showConfirm("Xóa lịch này sẽ xóa cả các ca làm việc liên quan. Bạn có chắc chắn tiếp tục?", () => {
          deleteRelatedTasks(id);
          deleteSchedule(id);
      }, { tone: 'danger', confirmText: 'Xóa lịch' });
  };

  const startEditTask = (task) => {
      setEditingTaskId(task.id);
      setEditTaskForm({
          title: task.title,
          assigneeId: task.assigneeId,
          assignedRole: task.assignedRole || '',
          jobCode: task.jobCode || '',
          area: task.area || '', // Lưu area để edit
          startTime: task.startTime,
          endTime: task.endTime
      });
  };

  const saveTaskEdit = () => {
      if (!editTaskForm.title || !editTaskForm.assigneeId || !editTaskForm.startTime || !editTaskForm.endTime) {
          return showAlert("Vui lòng điền đủ thông tin bắt buộc!", { tone: 'danger' });
      }
      const staff = staffList.find(s => s.id === editTaskForm.assigneeId);
      
      updateTask(editingTaskId, {
          title: editTaskForm.title,
          assigneeId: editTaskForm.assigneeId,
          assigneeName: staff ? staff.name : 'Unknown',
          assignedRole: editTaskForm.assignedRole,
          jobCode: editTaskForm.jobCode || '',
          area: editTaskForm.area || '', // Update area
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
      // [FIX BUG #3] Đồng bộ ngày dự phòng cho Task(R) lẻ để tránh bỏ sót khi lọc theo tháng.
      const taskDate = new Date(t.startTime || t.checkInTime || t.endTime || t.deadline);
      if (isNaN(taskDate.getTime())) return false;
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

  // [MỚI] Áp dụng thêm bộ lọc Nhân sự / Ngày (Thứ) và sắp xếp cho danh sách Template.
  const displayedTemplates = searchedAdminSchedules
      .filter(s => filterTplStaff === 'all' || s.assigneeId === filterTplStaff)
      .filter(s => filterTplDay === 'all' || (Array.isArray(s.repeatDays) && s.repeatDays.includes(filterTplDay)))
      .filter(s => {
          // Lọc theo tháng/năm BẮT ĐẦU của lịch gốc (startTime)
          if (filterTplMonth === 'all' && filterTplYear === 'all') return true;
          const d = new Date(s.startTime);
          if (isNaN(d.getTime())) return false;
          if (filterTplMonth !== 'all' && (d.getMonth() + 1).toString() !== filterTplMonth) return false;
          if (filterTplYear !== 'all' && d.getFullYear().toString() !== filterTplYear) return false;
          return true;
      });
  const sortedTemplates = [...displayedTemplates];
  if (tplSort.key === 'title') {
      sortedTemplates.sort((a, b) => {
          const cmp = (a.title || '').localeCompare(b.title || '', 'vi-VN');
          return tplSort.direction === 'ascending' ? cmp : -cmp;
      });
  } else if (tplSort.key === 'startTime') {
      // Sắp xếp theo ngày bắt đầu (startTime) của lịch gốc
      sortedTemplates.sort((a, b) => {
          const ta = new Date(a.startTime).getTime() || 0;
          const tb = new Date(b.startTime).getTime() || 0;
          const cmp = ta - tb;
          return tplSort.direction === 'ascending' ? cmp : -cmp;
      });
  }

  // [MỚI] Dò các lịch gốc bị TRÙNG: cùng nhân sự, ca rơi cùng ngày và trùng khung giờ.
  // Bung ca theo đúng thiết lập (repeatWeeks × repeatDays) rồi đối chiếu từng cặp lịch.
  const handleFindTemplateConflicts = () => {
      const occ = []; // danh sách ca dự kiến của mọi lịch
      schedules.forEach(s => {
          if (!s.startTime || !s.endTime || !Array.isArray(s.repeatDays) || s.repeatDays.length === 0) return;
          const startObj = new Date(s.startTime);
          const endObj = new Date(s.endTime);
          if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) return;
          const duration = endObj - startObj;
          const repeatWeeks = Number(s.repeatWeeks) || 1;
          const targetVals = daysOfWeek.filter(d => s.repeatDays.includes(d.key)).map(d => d.val);
          for (let w = 0; w < repeatWeeks; w++) {
              for (let dd = 0; dd < 7; dd++) {
                  const cur = new Date(startObj);
                  cur.setDate(startObj.getDate() + (w * 7) + dd);
                  if (!targetVals.includes(cur.getDay())) continue;
                  const st = cur.getTime();
                  occ.push({
                      sid: s.id, title: s.title, assigneeId: s.assigneeId, assigneeName: s.assigneeName,
                      dayKey: `${cur.getFullYear()}-${cur.getMonth() + 1}-${cur.getDate()}`,
                      st, en: st + duration, date: new Date(cur)
                  });
              }
          }
      });

      // Gom theo nhân sự + ngày, tìm cặp ca khác lịch nhưng trùng khung giờ
      const groups = {};
      occ.forEach(o => { const k = `${o.assigneeId}__${o.dayKey}`; (groups[k] = groups[k] || []).push(o); });

      const pairs = {};
      Object.values(groups).forEach(list => {
          for (let i = 0; i < list.length; i++) {
              for (let j = i + 1; j < list.length; j++) {
                  const a = list[i], b = list[j];
                  if (a.sid === b.sid) continue;
                  if (a.st < b.en && b.st < a.en) { // hai khung giờ giao nhau
                      const key = [a.sid, b.sid].sort().join('__');
                      if (!pairs[key]) pairs[key] = { sidA: a.sid, sidB: b.sid, titleA: a.title, titleB: b.title, assignee: a.assigneeName, days: new Set(), sample: a.date };
                      pairs[key].days.add(a.dayKey);
                  }
              }
          }
      });

      const result = Object.values(pairs).map(p => ({
          sidA: p.sidA, sidB: p.sidB,
          titleA: p.titleA, titleB: p.titleB, assignee: p.assignee,
          count: p.days.size,
          sample: formatVNDateTimeLabel(p.sample)
      })).sort((x, y) => y.count - x.count);

      setTplConflicts(result);
      if (result.length === 0) {
          showAlert('Không phát hiện lịch trùng (cùng nhân sự, cùng ngày, trùng khung giờ).', { title: 'Kết quả dò trùng', tone: 'success' });
      }
  };

  // [MỚI] Xóa nhanh một lịch ngay tại dòng kết quả trùng (có xác nhận).
  // Xóa lịch + các ca liên quan, đồng thời gỡ các dòng kết quả có chứa lịch vừa xóa.
  const handleQuickDeleteConflict = (sid, title) => {
      showConfirm(
          `Xóa lịch gốc "${title}"?\n\nCác ca làm việc liên quan của lịch này cũng sẽ bị xóa.`,
          () => {
              deleteRelatedTasks(sid);
              deleteSchedule(sid);
              setTplConflicts(prev => prev ? prev.filter(c => c.sidA !== sid && c.sidB !== sid) : prev);
          },
          { tone: 'danger', confirmText: 'Xóa lịch này' }
      );
  };

  // Bấm vào tiêu đề cột "Thông tin mẫu lịch" để đổi chiều sắp xếp theo TÊN tăng/giảm dần.
  const requestTplSort = () => {
      setTplSort(prev => ({
          key: 'title',
          direction: prev.key === 'title' && prev.direction === 'ascending' ? 'descending' : 'ascending'
      }));
  };

  const generatedTasks = tasks.filter(t => t.fromScheduleId);
  const filteredGeneratedTasks = generatedTasks.filter(t => {
      // [FIX BUG #3] Dùng ngày dự phòng (startTime -> checkInTime -> endTime -> deadline)
      // để ca làm thiếu/không hợp lệ startTime không bị rớt khỏi bộ đếm tháng (T5/2026).
      const taskDate = new Date(t.startTime || t.checkInTime || t.endTime || t.deadline);
      if (isNaN(taskDate.getTime())) return false;
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
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
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
        .input-modern:focus { border-color: #2B6830; box-shadow: 0 0 0 3px rgba(43, 104, 48, 0.1); }
        
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
        .filter-modern:focus { border-color: #2B6830; box-shadow: 0 0 0 3px rgba(43, 104, 48, 0.1); }
        
        optgroup {
            font-weight: bold;
            font-style: normal;
            background: #f1f5f9;
            color: #2B6830;
        }
        optgroup option {
            background: white;
            color: #334155;
            font-weight: normal;
            padding: 4px;
        }

        /* MEDIA QUERIES ĐỂ RESPONSIVE FORM TRÊN MOBILE */
        @media (max-width: 600px) {
            .mobile-padding { padding: 16px !important; }
            .mobile-grid { grid-template-columns: 1fr !important; }
        }

        /* === CARD-VIEW MOBILE cho bảng: bỏ cuộn ngang, mỗi hàng thành 1 thẻ dọc === */
        @media (max-width: 768px) {
            .ops-table { min-width: 0 !important; }
            .ops-table thead { display: none; }
            .ops-table, .ops-table tbody, .ops-table tr, .ops-table td { display: block; width: 100%; box-sizing: border-box; }
            .ops-table tr {
                margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 14px;
                overflow: hidden; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            }
            .ops-table td {
                display: flex; justify-content: space-between; align-items: center; gap: 12px;
                text-align: right !important; padding: 11px 16px !important;
                border: none !important; border-bottom: 1px solid #f1f5f9 !important;
                white-space: normal !important; min-width: 0 !important;
            }
            .ops-table td:last-child { border-bottom: none !important; }
            .ops-table td::before {
                content: attr(data-label);
                font-weight: 700; color: #64748b; font-size: 0.7rem;
                text-transform: uppercase; letter-spacing: 0.03em; text-align: left; flex-shrink: 0;
            }
            .ops-table td:empty { display: none !important; }
            .ops-table td[colspan] { display: block; text-align: left !important; }
            .ops-table td[colspan]::before { content: ''; display: none; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#2B6830' }}>
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
                  <table className="ops-table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', minWidth: '700px' }}>
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
                                  <td data-label="Scheduler" style={styles.td}><strong>{s.request.requestedBy}</strong></td>
                                  <td data-label="Lịch trình" style={styles.td}>{s.title}</td>
                                  <td data-label="Loại yêu cầu" style={styles.td}>
                                      <span style={{
                                          padding: '4px 10px', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem',
                                          background: s.request.type === 'delete' ? '#fee2e2' : '#dbeafe',
                                          color: s.request.type === 'delete' ? '#b91c1c' : '#1d4ed8'
                                      }}>
                                          {s.request.type === 'delete' ? 'XIN XÓA' : 'XIN SỬA'}
                                      </span>
                                  </td>
                                  <td data-label="Lý do" style={{...styles.td, color: '#4b5563', fontStyle: 'italic'}}>{s.request.reason}</td>
                                  <td data-label="Hành động" style={{...styles.td, textAlign: 'right'}}>
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
                    <div className="menu-card" style={styles.menuCard} onClick={() => { setActiveView('create_task'); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', area: '', paymentType: '', disciplineId: '' }); }}>
                        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                            <div style={styles.iconBox}><Icons.Task /></div>
                            <h3 style={styles.cardTitle}>Tạo Task(R)</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'24px', lineHeight: '1.5'}}>Khởi tạo công việc lẻ & Thiết lập mức kỷ luật tương ứng.</div>
                        <div style={{...styles.accessBtn, background: '#f0f9ff', color: '#0369a1'}}>
                            Bắt đầu <Icons.ArrowRight />
                        </div>
                    </div>

                    <div className="menu-card" style={styles.menuCard} onClick={() => { setActiveView('create_schedule'); setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', area: '', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }}>
                        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                            <div style={{...styles.iconBox, background: '#fef3c7', color: '#d97706'}}><Icons.Schedule /></div>
                            <h3 style={styles.cardTitle}>Thiết lập Lịch làm</h3>
                        </div>
                        <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'24px', lineHeight: '1.5'}}>Khởi tạo lịch làm việc lặp lại theo tuần cho nhân sự. Bắt buộc kiểm tra CSVT nếu có gán Khu vực.</div>
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
                 <div style={styles.formContainer} className="mobile-padding">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px'}}>
                        <h3 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.25rem' }}>Tạo Task(R)</h3>
                        <button onClick={() => setActiveView('overview')} style={styles.backBtn}><Icons.Back /> Quay lại</button>
                    </div>
                    <form onSubmit={handleAddTaskAdhoc} style={styles.formGrid} className="mobile-grid">
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Tiêu đề công việc</label>
                            <input className="input-modern" placeholder="Nhập tiêu đề ngắn gọn, rõ ràng..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                        </div>
                        <div>
                            <label style={styles.label}>Người thực hiện</label>
                            <select className="input-modern" value={newTask.assigneeId} onChange={handleAssigneeChange} required>
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
                        {/* --- CHỌN KHU VỰC ĐỘNG TỪ FIREBASE --- */}
                        <div>
                            <label style={styles.label}>Khu vực làm việc (Area)</label>
                            <select className="input-modern" value={newTask.area || ''} onChange={e => setNewTask({...newTask, area: e.target.value})}>
                                <option value="">-- Không yêu cầu kiểm tra CSVT --</option>
                                {areas && areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Mức tiền chi trả (VNĐ)</label>
                            <input className="input-modern" type="number" placeholder="Ví dụ: 100000" value={newTask.paymentType} onChange={e => setNewTask({...newTask, paymentType: e.target.value})} />
                        </div>
                        <div>
                            <label style={styles.label}>Bắt đầu (Check-in)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} required />
                            {newTask.startTime && <div style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'700', marginTop:'4px'}}>📅 {formatVNDateTimeLabel(newTask.startTime)}</div>}
                        </div>
                        <div>
                            <label style={styles.label}>Kết thúc (Check-out)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} required />
                            {newTask.endTime && <div style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'700', marginTop:'4px'}}>📅 {formatVNDateTimeLabel(newTask.endTime)}</div>}
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
                 <div style={styles.formContainer} className="mobile-padding">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px'}}>
                        <h3 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.25rem' }}>
                            {editingScheduleId ? 'Chỉnh sửa Lịch công tác' : 'Thiết lập Lịch làm việc mới'}
                        </h3>
                        <button onClick={() => { setActiveView('overview'); setEditingScheduleId(null); }} style={styles.backBtn}><Icons.Back /> Quay lại</button>
                    </div>
                    <form onSubmit={handleAddScheduleSubmit} style={styles.formGrid} className="mobile-grid">
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={styles.label}>Tiêu đề lịch trình</label>
                            <input className="input-modern" placeholder="VD: Ca trực Canteen Sáng..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                        </div>
                        <div>
                            <label style={styles.label}>Người thực hiện</label>
                            <select className="input-modern" value={newTask.assigneeId} onChange={handleAssigneeChange} required>
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
                        {/* --- CHỌN KHU VỰC ĐỘNG TỪ FIREBASE --- */}
                        <div>
                            <label style={styles.label}>Khu vực làm việc (Area)</label>
                            <select className="input-modern" value={newTask.area || ''} onChange={e => setNewTask({...newTask, area: e.target.value})}>
                                <option value="">-- Không yêu cầu kiểm tra CSVT --</option>
                                {areas && areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={styles.label}>Bắt đầu (Giờ & Ngày gốc)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} required />
                            {newTask.startTime && <div style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'700', marginTop:'4px'}}>📅 {formatVNDateTimeLabel(newTask.startTime)}</div>}
                        </div>
                        <div>
                            <label style={styles.label}>Kết thúc (Giờ & Ngày gốc)</label>
                            <input className="input-modern" type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} required />
                            {newTask.endTime && <div style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'700', marginTop:'4px'}}>📅 {formatVNDateTimeLabel(newTask.endTime)}</div>}
                        </div>
                        
                        <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
                            <h5 style={{margin:'0 0 16px 0', fontSize:'1rem', color:'#1e293b', fontWeight: '700'}}>🔁 Cấu hình chu kỳ lặp lại</h5>
                            <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                                <div style={{display:'flex', flexDirection:'column', minWidth: '150px'}}>
                                    <label style={styles.label}>Số tuần kéo dài:</label>
                                    <input className="input-modern" type="number" min="1" max="52" value={scheduleConfig.repeatWeeks} onChange={e => setScheduleConfig({...scheduleConfig, repeatWeeks: e.target.value})} style={{width: '100px', fontWeight: 'bold'}} />
                                </div>
                                <div style={{display:'flex', flexDirection:'column', flex: 1, minWidth: '0'}}>
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
                                                    background: scheduleConfig.days.includes(d.key) ? '#2B6830' : 'white', 
                                                    color: scheduleConfig.days.includes(d.key) ? 'white' : '#64748b',
                                                    boxShadow: scheduleConfig.days.includes(d.key) ? '0 4px 6px rgba(43,104,48,0.3)' : 'none'
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
                            {editingScheduleId ? 'Xác nhận thay đổi' : 'Lưu Lịch & Tự Động Tạo Tasks'}
                        </button>
                        {editingScheduleId && (
                            <button type="button" onClick={() => { setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', area: '', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }} style={{ ...styles.btnSubmit, background: '#f1f5f9', color: '#475569', marginTop: '-10px' }}>
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
                            <h3 style={{margin:0, fontSize: '1.25rem', fontWeight: '800', color: '#111827'}}>Quản lý Nhiệm vụ</h3>
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
                         <table style={styles.table} className="ops-table">
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
                                    <td data-label="STT" style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{(adhocPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td data-label="Nhiệm vụ" style={styles.td}>
                                        <div style={{fontWeight:'700', color: '#1f2937', marginBottom: '4px'}}>{t.title}</div>
                                        {t.paymentType && <span style={{fontSize:'0.7rem', background:'#ecfdf5', color:'#059669', padding:'2px 8px', borderRadius:'12px', fontWeight:'700', marginRight: '6px'}}>{t.paymentType}</span>}
                                        {t.area && <span style={{fontSize:'0.7rem', background:'#fef3c7', color:'#b45309', padding:'2px 8px', borderRadius:'12px', fontWeight:'700'}}>📍 {t.area}</span>}
                                    </td>
                                    <td data-label="Nhân sự" style={{...styles.td, fontWeight: '600'}}>{t.assigneeName}</td>
                                    <td data-label="Vai trò / Mã CV" style={styles.td}>
                                        <div style={{fontSize: '0.85rem', color: '#4b5563'}}>{t.assignedRole}</div>
                                        {t.jobCode && <div style={{fontSize:'0.75rem', color:'#0284c7', fontWeight:'700', marginTop: '2px'}}>Mã: {t.jobCode}</div>}
                                    </td>
                                    <td data-label="Thời gian" style={styles.td}>{formatTaskTime(t.startTime, t.endTime)}</td>
                                    <td data-label="Tiến độ" style={styles.td}>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <div style={{width:'50px', height:'6px', background:'#e5e7eb', borderRadius:'3px', overflow:'hidden'}}>
                                                <div style={{width:`${t.progress}%`, height:'100%', background: t.progress===100?'#10b981':'#3b82f6'}}></div>
                                            </div>
                                            <span style={{fontSize:'0.85rem', fontWeight:'700', color: t.progress===100?'#10b981':'#3b82f6'}}>{t.progress}%</span>
                                        </div>
                                    </td>
                                    <td data-label="Hành động" style={{...styles.td, textAlign: 'right'}}>
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

                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '24px', width: 'fit-content', flexWrap: 'wrap', gap: '6px' }}>
                        <button 
                            className={`pill-tab ${scheduleTab === 'instances' ? 'active' : ''}`}
                            onClick={() => { setScheduleTab('instances'); setGenTaskPage(1); }} 
                            style={{ 
                                padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', transition: 'all 0.2s',
                                background: scheduleTab === 'instances' ? 'white' : 'transparent', 
                                color: scheduleTab === 'instances' ? '#2B6830' : '#64748b',
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
                                color: scheduleTab === 'templates' ? '#2B6830' : '#64748b',
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

                            {/* [FIX BUG #3] Hiển thị tổng số ca thực tế khớp bộ lọc để dễ đối chiếu với số ca đã thiết lập */}
                            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
                                Tổng số ca làm việc (theo bộ lọc):{' '}
                                <span style={{ color: '#2B6830', fontWeight: '800' }}>{filteredGeneratedTasks.length}</span> ca
                            </div>

                            {/* [TÍNH NĂNG MỚI] Bảng điều khiển: Sinh ca theo tháng từ Lịch gốc */}
                            <div style={{ marginBottom: '20px', padding: '16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0369a1' }}>🛠️ Sinh ca theo tháng</span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tạo đủ ca cho tháng đã chọn từ Lịch gốc. Không xóa, chống trùng, giữ nguyên ca đã chấm công.</span>
                                </div>
                                <input
                                    type="month"
                                    value={genMonth}
                                    onChange={e => setGenMonth(e.target.value)}
                                    className="filter-modern"
                                    style={{ marginLeft: 'auto', minWidth: '160px' }}
                                    title="Chọn tháng cần sinh ca"
                                />
                                <button
                                    onClick={handleGenerateMonthShifts}
                                    style={{ background: '#0369a1', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', boxShadow: '0 4px 6px rgba(3,105,161,0.2)' }}
                                >
                                    Sinh ca cho tháng này
                                </button>
                                <button
                                    onClick={handleCleanupIneffectiveShifts}
                                    style={{ background: 'white', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                                    title="Xóa ca sinh nhầm thuộc lịch chưa tới ngày bắt đầu (chưa chấm công)"
                                >
                                    Dọn ca sinh dư
                                </button>
                            </div>

                            <div style={styles.tableWrapper}>
                                <table style={styles.table} className="ops-table">
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
                                           <td data-label="STT" style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{(genTaskPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                           
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
                                                          {/* --- CHỌN KHU VỰC ĐỘNG KHI CHỈNH SỬA TASK --- */}
                                                          <select className="input-modern" value={editTaskForm.area || ''} onChange={e => setEditTaskForm({...editTaskForm, area: e.target.value})} style={{marginTop:0, padding: '8px 36px 8px 12px'}}>
                                                              <option value="">-- Không yêu cầu --</option>
                                                              {areas && areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
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
                                                  <td data-label="Nhiệm vụ" style={styles.td}>
                                                      <strong style={{color: '#1f2937'}}>{t.title}</strong>
                                                      {t.area && <div style={{fontSize:'0.7rem', background:'#fef3c7', color:'#b45309', padding:'2px 8px', borderRadius:'12px', fontWeight:'700', marginTop: '4px', display: 'inline-block'}}>📍 {t.area}</div>}
                                                  </td>
                                                  <td data-label="Nhân sự" style={{...styles.td, fontWeight: '600'}}>{t.assigneeName}</td>
                                                  <td data-label="Vai trò / Mã CV" style={styles.td}>
                                                      <div style={{color: '#4b5563', fontSize: '0.85rem'}}>{t.assignedRole}</div>
                                                      {t.jobCode && <div style={{fontSize:'0.75rem', color:'#be185d', fontWeight:'700', marginTop: '4px', background: '#fdf2f8', display: 'inline-block', padding: '2px 8px', borderRadius: '10px'}}>Mã: {t.jobCode}</div>}
                                                  </td>
                                                  <td data-label="Thời gian gốc" style={styles.td}>{formatTaskTime(t.startTime, t.endTime)}</td>
                                                  <td data-label="Tiến độ" style={styles.td}>
                                                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                                          <div style={{width:'40px', height:'6px', background:'#e5e7eb', borderRadius:'3px', overflow:'hidden'}}>
                                                              <div style={{width:`${t.progress}%`, height:'100%', background: t.progress===100?'#10b981':'#3b82f6'}}></div>
                                                          </div>
                                                          <span style={{fontSize:'0.85rem', fontWeight:'700', color: t.progress===100?'#10b981':'#3b82f6'}}>{t.progress}%</span>
                                                      </div>
                                                  </td>
                                                  <td data-label="Hành động" style={{...styles.td, textAlign: 'right'}}>
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
                                <div style={{display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center'}}>
                                    <button
                                        onClick={handleFindTemplateConflicts}
                                        style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                                        title="Tìm các lịch gốc tạo ca trùng giờ cùng một nhân sự"
                                    >
                                        🔎 Trích xuất lịch trùng
                                    </button>
                                    <input
                                        className="input-modern"
                                        type="text"
                                        placeholder="🔍 Tìm tiêu đề, nhân sự..."
                                        value={scheduleSearchTerm}
                                        onChange={(e) => setScheduleSearchTerm(e.target.value)}
                                        style={{ width: '100%', maxWidth: '250px', marginTop: 0, padding:'10px 14px' }}
                                    />
                                </div>
                            </div>

                            {/* [MỚI] Kết quả dò lịch trùng */}
                            {tplConflicts && tplConflicts.length > 0 && (
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ fontWeight: '800', color: '#b45309', fontSize: '0.95rem' }}>
                                            ⚠️ Phát hiện {tplConflicts.length} cặp lịch trùng (cùng nhân sự, trùng khung giờ)
                                        </span>
                                        <button onClick={() => setTplConflicts(null)} style={{ background: 'transparent', border: 'none', color: '#92400e', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>Đóng ✕</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {tplConflicts.map((c, i) => (
                                            <div key={i} style={{ background: 'white', borderRadius: '8px', border: '1px solid #fde68a', padding: '10px 12px', fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1, minWidth: '220px' }}>
                                                    <span style={{ fontWeight: '700' }}>👤 {c.assignee || 'Unknown'}</span> —{' '}
                                                    <span style={{ fontWeight: '700', color: '#b45309' }}>{c.titleA}</span> ⨯ <span style={{ fontWeight: '700', color: '#b45309' }}>{c.titleB}</span>{' '}
                                                    trùng <span style={{ fontWeight: '800', color: '#dc2626' }}>{c.count}</span> ngày (vd: {c.sample})
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleQuickDeleteConflict(c.sidA, c.titleA)}
                                                        style={{ color: '#dc2626', border: '1px solid #fecaca', background: '#fef2f2', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                                                        title={`Xóa lịch "${c.titleA}"`}
                                                    >🗑 Xóa "{c.titleA}"</button>
                                                    <button
                                                        onClick={() => handleQuickDeleteConflict(c.sidB, c.titleB)}
                                                        style={{ color: '#dc2626', border: '1px solid #fecaca', background: '#fef2f2', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                                                        title={`Xóa lịch "${c.titleB}"`}
                                                    >🗑 Xóa "{c.titleB}"</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* [MỚI] Bộ lọc Template tương tự "Ca làm việc thực tế" */}
                            <div style={{display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'20px'}}>
                                <select className="filter-modern" value={filterTplStaff} onChange={e => setFilterTplStaff(e.target.value)}>
                                    <option value="all">Nhân sự: Tất cả</option>
                                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <select className="filter-modern" value={filterTplDay} onChange={e => setFilterTplDay(e.target.value)}>
                                    <option value="all">Ngày: Tất cả</option>
                                    {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                                </select>
                                <select className="filter-modern" value={filterTplMonth} onChange={e => setFilterTplMonth(e.target.value)}>
                                    <option value="all">Tháng: Tất cả</option>
                                    {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                                </select>
                                <select className="filter-modern" value={filterTplYear} onChange={e => setFilterTplYear(e.target.value)}>
                                    <option value="all">Năm: Tất cả</option>
                                    {availableYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
                                </select>
                                <select
                                    className="filter-modern"
                                    value={tplSort.key ? `${tplSort.key}_${tplSort.direction}` : 'none'}
                                    onChange={e => {
                                        const v = e.target.value;
                                        if (v === 'none') setTplSort({ key: null, direction: 'ascending' });
                                        else {
                                            const [key, direction] = v.split('_');
                                            setTplSort({ key, direction });
                                        }
                                    }}
                                >
                                    <option value="none">Sắp xếp: Mặc định</option>
                                    <option value="title_ascending">Tên: A → Z</option>
                                    <option value="title_descending">Tên: Z → A</option>
                                    <option value="startTime_ascending">Ngày: Tăng dần</option>
                                    <option value="startTime_descending">Ngày: Giảm dần</option>
                                </select>
                            </div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table} className="ops-table">
                                  <thead>
                                     <tr>
                                       <th style={{...styles.th, width: '50px', textAlign: 'center'}}>STT</th>
                                       <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={requestTplSort} title="Bấm để sắp xếp tăng/giảm dần">
                                           Thông tin mẫu lịch (Template) {tplSort.key ? (tplSort.direction === 'ascending' ? '▲' : '▼') : '⇅'}{tplSort.key === 'startTime' ? ' (ngày)' : ''}
                                       </th>
                                       <th style={{...styles.th, textAlign: 'right'}}>Hành động</th>
                                     </tr>
                                  </thead>
                                  <tbody>
                                     {sortedTemplates.map((s, index) => (
                                       <tr key={s.id} className="table-row">
                                          <td data-label="STT" style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{index + 1}</td>
                                          <td data-label="Thông tin mẫu lịch" style={styles.td}>
                                              <div style={{fontWeight:'700', color: '#111827', fontSize: '1.05rem', marginBottom: '4px'}}>{s.title} {s.area && <span style={{fontSize:'0.7rem', background:'#fef3c7', color:'#b45309', padding:'2px 8px', borderRadius:'12px', fontWeight:'700', marginLeft: '6px', verticalAlign: 'middle'}}>📍 {s.area}</span>}</div>
                                              {s.assigneeName && <div style={{fontSize:'0.85rem', color:'#4b5563'}}>👤 <span style={{fontWeight:'600'}}>{s.assigneeName}</span> {s.assignedRole ? `(${s.assignedRole})` : ''}</div>}
                                              <div style={{fontSize:'0.8rem', color:'#0369a1', marginTop: '6px', fontWeight: '700'}}>
                                                  📅 Bắt đầu: {formatVNDateTimeLabel(s.startTime)}
                                              </div>
                                              <div style={{fontSize:'0.8rem', color:'#059669', marginTop: '4px', fontWeight: '600'}}>
                                                  🔁 Lặp lại {s.repeatWeeks} tuần vào các ngày: {s.repeatDays?.join(', ')}
                                              </div>
                                          </td>
                                          <td data-label="Hành động" style={{...styles.td, textAlign: 'right'}}>
                                              <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end'}}>
                                                  <button className="btn-action" onClick={()=>handleEditSchedule(s)} style={{color:'#0ea5e9', border:'none', background:'#e0f2fe', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize: '0.85rem'}}>Chỉnh sửa</button>
                                                  <button className="btn-action" onClick={()=>handleDeleteSchedule(s.id)} style={{color:'#ef4444', border:'none', background:'#fef2f2', padding:'8px', borderRadius:'8px', cursor:'pointer'}}><Icons.Trash /></button>
                                              </div>
                                          </td>
                                       </tr>
                                     ))}
                                     {sortedTemplates.length === 0 && (
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
              <div style={styles.formContainer} className="mobile-padding">
                <h3 style={{ margin: '0 0 24px 0', color: '#111827', fontWeight: '800', fontSize: '1.35rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                    {editingScheduleId ? 'Đang soạn yêu cầu điều chỉnh' : 'Lên lịch công tác mới (Scheduler)'}
                </h3>
                <form onSubmit={handleAddScheduleSubmit} style={styles.formGrid} className="mobile-grid">
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Tiêu đề công việc</label>
                        <input className="input-modern" placeholder="Nhập tiêu đề..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                    </div>
                    <div>
                        <label style={styles.label}>Người thực hiện</label>
                        <select className="input-modern" value={newTask.assigneeId} onChange={handleAssigneeChange} required>
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
                    {/* --- CHỌN KHU VỰC ĐỘNG TỪ FIREBASE --- */}
                    <div>
                        <label style={styles.label}>Khu vực làm việc (Area)</label>
                        <select className="input-modern" value={newTask.area || ''} onChange={e => setNewTask({...newTask, area: e.target.value})}>
                            <option value="">-- Không yêu cầu kiểm tra CSVT --</option>
                            {areas && areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>Bắt đầu (Giờ & Ngày)</label>
                        <input className="input-modern" type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} required />
                        {newTask.startTime && <div style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'700', marginTop:'4px'}}>📅 {formatVNDateTimeLabel(newTask.startTime)}</div>}
                    </div>
                    <div>
                        <label style={styles.label}>Kết thúc (Giờ & Ngày)</label>
                        <input className="input-modern" type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} required />
                        {newTask.endTime && <div style={{fontSize:'0.8rem', color:'#0369a1', fontWeight:'700', marginTop:'4px'}}>📅 {formatVNDateTimeLabel(newTask.endTime)}</div>}
                    </div>
                    <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
                        <h5 style={{margin:'0 0 16px 0', fontSize:'1rem', color:'#1e293b', fontWeight: '700'}}>🔁 Cấu hình chu kỳ lặp lại</h5>
                        <div style={{display:'flex', gap:'30px', flexWrap:'wrap'}}>
                            <div style={{display:'flex', flexDirection:'column', minWidth: '150px'}}>
                                <label style={styles.label}>Số tuần lặp lại:</label>
                                <input className="input-modern" type="number" min="1" max="52" value={scheduleConfig.repeatWeeks} onChange={e => setScheduleConfig({...scheduleConfig, repeatWeeks: e.target.value})} style={{width: '100px', fontWeight: 'bold'}} />
                            </div>
                            <div style={{display:'flex', flexDirection:'column', flex: 1, minWidth: '0'}}>
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
                                                background: scheduleConfig.days.includes(d.key) ? '#2B6830' : 'white', 
                                                color: scheduleConfig.days.includes(d.key) ? 'white' : '#64748b',
                                                boxShadow: scheduleConfig.days.includes(d.key) ? '0 4px 6px rgba(43,104,48,0.3)' : 'none'
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
                        <button type="button" onClick={() => { setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: '', jobCode: '', area: '', paymentType: '', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }} style={{ ...styles.btnSubmit, background: '#f1f5f9', color: '#475569', marginTop: '-10px' }}>
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
                     <table style={styles.table} className="ops-table">
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
                                <td data-label="STT" style={{...styles.td, textAlign:'center', fontWeight:'bold', color:'#9ca3af'}}>{(schedulerPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                <td data-label="Thông tin Lịch" style={styles.td}>
                                    <div style={{fontWeight:'700', color: '#1f2937', marginBottom: '4px'}}>{s.title} {s.area && <span style={{fontSize:'0.7rem', background:'#fef3c7', color:'#b45309', padding:'2px 8px', borderRadius:'12px', fontWeight:'700', marginLeft: '6px', verticalAlign: 'middle'}}>📍 {s.area}</span>}</div>
                                    <div style={{fontSize:'0.8rem', color:'#6b7280'}}>{s.description?.substring(0, 40)}...</div>
                                    {s.request && <div style={{fontSize:'0.75rem', color:'#ea580c', fontWeight:'bold', marginTop:'6px', background: '#ffedd5', display: 'inline-block', padding: '2px 8px', borderRadius: '10px'}}>⏳ Đang chờ duyệt: {s.request.type === 'delete' ? 'XÓA' : 'SỬA'}</div>}
                                </td>
                                <td data-label="Thời gian" style={{...styles.td, color:'#0369a1', fontWeight:'700'}}>
                                    {formatScheduleTimeRange(s.startTime, s.endTime)}
                                    <div style={{fontSize:'0.72rem', color:'#64748b', fontWeight:'600', marginTop:'4px'}}>📅 {formatVNDateTimeLabel(s.startTime)}</div>
                                </td>
                                <td data-label="Nhân sự" style={styles.td}>
                                    <div style={{fontWeight: '600'}}>{s.assigneeName}</div>
                                    <div style={{fontSize: '0.8rem', color: '#6b7280'}}>{s.assignedRole}</div>
                                </td>

                                <td data-label="Chu kỳ Lặp lại" style={styles.td}>
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
                                
                                <td data-label="Hành động" style={{...styles.td, textAlign: 'right'}}>
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

      {/* [MODAL] Hộp thoại pop-up tùy biến — giữa màn hình, tối giản */}
      {modal && (
          <div
              onClick={closeModal}
              style={{
                  position: 'fixed', inset: 0, zIndex: 9999,
                  background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(2px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
              }}
          >
              <div
                  onClick={e => e.stopPropagation()}
                  style={{
                      background: 'white', borderRadius: '18px', width: '100%', maxWidth: '440px',
                      boxShadow: '0 20px 50px -12px rgba(0,0,0,0.35)', overflow: 'hidden',
                      animation: 'modalPop 0.18s ease-out'
                  }}
              >
                  <style>{`@keyframes modalPop{from{opacity:0;transform:translateY(8px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

                  {/* Icon + tiêu đề */}
                  <div style={{ padding: '28px 28px 8px', textAlign: 'center' }}>
                      <div style={{
                          width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                          background: modal.tone === 'danger' ? '#fef2f2' : modal.tone === 'success' ? '#ecfdf5' : '#eff6ff',
                          color: modal.tone === 'danger' ? '#dc2626' : modal.tone === 'success' ? '#059669' : '#0369a1'
                      }}>
                          {modal.tone === 'danger' ? '⚠️' : modal.tone === 'success' ? '✓' : modal.kind === 'confirm' ? '❓' : 'ℹ️'}
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#111827' }}>{modal.title}</h3>
                  </div>

                  {/* Nội dung */}
                  <div style={{ padding: '8px 28px 24px', textAlign: 'center', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {modal.message}
                  </div>

                  {/* Nút hành động */}
                  <div style={{ display: 'flex', gap: '10px', padding: '0 24px 24px', justifyContent: 'center' }}>
                      {modal.kind === 'confirm' && (
                          <button
                              onClick={closeModal}
                              style={{ flex: 1, maxWidth: '160px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' }}
                          >
                              {modal.cancelText}
                          </button>
                      )}
                      <button
                          onClick={() => { const fn = modal.onConfirm; closeModal(); if (typeof fn === 'function') fn(); }}
                          style={{
                              flex: 1, maxWidth: '160px', padding: '12px', borderRadius: '12px', border: 'none',
                              color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                              background: modal.tone === 'danger' ? '#dc2626' : modal.tone === 'success' ? '#059669' : '#2B6830',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.12)'
                          }}
                      >
                          {modal.kind === 'confirm' ? modal.confirmText : 'OK'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const styles = {
    formContainer: { background: '#ffffff', padding: '28px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', marginBottom: '32px', border: '1px solid rgba(0,0,0,0.05)', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', width: '100%', boxSizing: 'border-box' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#374151', marginBottom: '4px' },
    btnSubmit: { gridColumn: '1 / -1', padding: '16px', background: '#2B6830', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(43,104,48,0.2)' },
    
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