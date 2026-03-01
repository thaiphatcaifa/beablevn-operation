import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- HELPER LÀM SẠCH VÀ ÉP KIỂU SỐ ---
const parseAmount = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    const clean = String(val).replace(/,/g, '').replace(/\s/g, '');
    const num = Number(clean);
    return isNaN(num) ? 0 : num;
};

const getPercent = (val) => {
    if (val === undefined || val === null || val === '') return 100;
    const clean = String(val).replace(/,/g, '').replace(/\s/g, '');
    const num = Number(clean);
    return isNaN(num) ? 100 : num;
};

// --- HELPER THỜI GIAN ---
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

const formatDateTime = (isoString) => {
    if (!isoString) return '---';
    const d = new Date(isoString);
    return `${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ${d.getDate()}/${d.getMonth()+1}`;
};

// --- LOGIC TÍNH GIỜ HIỂN THỊ TRONG BẢNG (String) ---
const calculateWorkHours = (schedStart, schedEnd, actualCheckIn, actualCheckOut) => {
    if (!schedStart || !schedEnd || !actualCheckIn || !actualCheckOut) return '---';
    
    const sStart = new Date(schedStart);
    const sEnd = new Date(schedEnd);
    const aIn = new Date(actualCheckIn);
    const aOut = new Date(actualCheckOut);

    let calcStart = aIn > sStart ? aIn : sStart;
    let calcEnd;
    if (aOut > sEnd) {
        calcEnd = sEnd;
    } else {
        const diffMinutesEarly = (sEnd - aOut) / 60000;
        if (diffMinutesEarly <= 10) {
            calcEnd = sEnd; 
        } else {
            calcEnd = aOut;
        }
    }

    const diffMs = calcEnd - calcStart;
    if (diffMs < 0) return '0h 00p';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes < 10 ? '0' + minutes : minutes}p`;
};

// --- LOGIC TÍNH SỐ GIỜ THỰC TẾ (SỐ THẬP PHÂN) ĐỂ NHÂN LƯƠNG ---
const calculateWorkHoursDecimal = (schedStart, schedEnd, actualCheckIn, actualCheckOut) => {
    if (!schedStart || !schedEnd || !actualCheckIn || !actualCheckOut) return 0;
    
    const sStart = new Date(schedStart);
    const sEnd = new Date(schedEnd);
    const aIn = new Date(actualCheckIn);
    const aOut = new Date(actualCheckOut);

    let calcStart = aIn > sStart ? aIn : sStart;
    let calcEnd;
    
    if (aOut > sEnd) {
        calcEnd = sEnd;
    } else {
        const diffMinutesEarly = (sEnd - aOut) / 60000;
        if (diffMinutesEarly <= 10) {
            calcEnd = sEnd; 
        } else {
            calcEnd = aOut;
        }
    }

    const diffMs = calcEnd - calcStart;
    if (diffMs < 0) return 0;

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    return totalMinutes / 60; // Trả về dạng thập phân
};

// --- ICONS ---
const Icons = {
  Finance: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Facility: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>),
  Task: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>),
  Schedule: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Print: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>),
  ArrowRight: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>),
  Back: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>)
};

const Reports = () => {
  const { user } = useAuth();
  const { tasks, staffList, facilityLogs } = useData();
  
  const [activeTab, setActiveTab] = useState('overview'); 

  const [attendanceFilter, setAttendanceFilter] = useState('month'); 
  const [attendanceStaffFilter, setAttendanceStaffFilter] = useState('all'); 
  const [attendanceDayFilter, setAttendanceDayFilter] = useState('all'); 

  const [financeStaffFilter, setFinanceStaffFilter] = useState('all'); 
  // --- BỔ SUNG STATE ĐỂ LỌC THÁNG/NĂM CHO TÀI CHÍNH ---
  const [financeMonthFilter, setFinanceMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [facilityAreaFilter, setFacilityAreaFilter] = useState('all'); 
  const [facilityStaffFilter, setFacilityStaffFilter] = useState('all'); 
  const [facilityTimeFilter, setFacilityTimeFilter] = useState('month'); 
  
  const [taskStaffFilter, setTaskStaffFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');

  const daysOfWeek = [
      { key: 'Mon', label: 'Thứ 2', val: 1 }, { key: 'Tue', label: 'Thứ 3', val: 2 }, { key: 'Wed', label: 'Thứ 4', val: 3 },
      { key: 'Thu', label: 'Thứ 5', val: 4 }, { key: 'Fri', label: 'Thứ 6', val: 5 }, { key: 'Sat', label: 'Thứ 7', val: 6 },
      { key: 'Sun', label: 'Chủ Nhật', val: 0 }
  ];

  const handlePrint = () => { window.print(); };

  // --- PHÂN TÁCH DỮ LIỆU ---
  const opAdminTasks = Array.isArray(tasks) ? tasks.filter(t => !t.fromScheduleId) : [];
  const scheduleTasks = Array.isArray(tasks) ? tasks.filter(t => t.fromScheduleId) : [];

  // --- 1. TÀI CHÍNH ---
  let totalEstimatedCost = 0;
  const financeRows = [];

  // Lấy thông tin tháng/năm từ bộ lọc
  const [selYear, selMonth] = financeMonthFilter.split('-');
  const selectedFinanceMonth = new Date(selYear, selMonth - 1, 1);

  const currentMonthScheduleTasks = scheduleTasks.filter(t => {
      if (!t.startTime) return false;
      const d = new Date(t.startTime);
      // Thay đổi: sử dụng selectedFinanceMonth thay vì currentMonth hiện tại
      return !isNaN(d.getTime()) && isSameMonth(d, selectedFinanceMonth);
  });

  const safeStaffList = Array.isArray(staffList) ? staffList : [];

  safeStaffList.forEach(staff => {
      if (financeStaffFilter !== 'all' && String(staff.id) !== String(financeStaffFilter)) return;

      const ubi1 = parseAmount(staff.ubi1Base) * getPercent(staff.ubi1Percent) / 100;
      const ubi2 = parseAmount(staff.ubi2Base) * getPercent(staff.ubi2Percent) / 100;
      const totalUBI = ubi1 + ubi2;

      const staffTasks = currentMonthScheduleTasks.filter(t => String(t.assigneeId) === String(staff.id));
      let taskRemuneration = 0;
      let totalMatchedHours = 0;
      let matchedTasksList = [];

      staffTasks.forEach(task => {
          if (!staff.remunerations || !Array.isArray(staff.remunerations)) return;
          if (!task.checkInTime || !task.checkOutTime) return; 
          
          const matchedRule = staff.remunerations.find(rem => {
              if (!rem) return false; 
              
              if (rem.position && String(rem.position).trim() !== '') {
                  const rulePos = String(rem.position).trim().toLowerCase();
                  const taskPos = String(task.assignedRole || '').trim().toLowerCase();
                  if (rulePos !== taskPos) return false;
              }
              
              if (rem.keywords && String(rem.keywords).trim() !== '') {
                  const keywords = String(rem.keywords).split(',').map(k => k.trim().toLowerCase()).filter(k => k);
                  const titleLower = String(task.title || '').toLowerCase();
                  const isMatch = keywords.some(k => titleLower.includes(k));
                  if (!isMatch) return false;
              }
              return true;
          });

          if (matchedRule) {
              const workedHours = calculateWorkHoursDecimal(task.startTime, task.endTime, task.checkInTime, task.checkOutTime);
              totalMatchedHours += workedHours;
              matchedTasksList.push({
                  hours: workedHours,
                  rate: parseAmount(matchedRule.amount)
              });
          }
      });

      // ÁP DỤNG THUẬT TOÁN GIỜ TỐI THIỂU
      const minHours = parseAmount(staff.minWorkHours);
      
      if (totalMatchedHours >= minHours) {
          matchedTasksList.sort((a, b) => a.rate - b.rate);
          let hoursToOffset = minHours;

          matchedTasksList.forEach(t => {
              if (hoursToOffset > 0) {
                  if (t.hours <= hoursToOffset) {
                      hoursToOffset -= t.hours;
                      t.hours = 0;
                  } else {
                      t.hours -= hoursToOffset;
                      hoursToOffset = 0;
                  }
              }
              if (t.hours > 0) {
                  taskRemuneration += t.hours * t.rate;
              }
          });
      } else {
          taskRemuneration = 0;
      }

      const totalSalary = totalUBI + taskRemuneration;

      if (totalSalary > 0 || minHours > 0) {
          financeRows.push({
              item: staff.name,
              type: `UBI: ${Math.round(totalUBI).toLocaleString()}đ + Thù lao vượt mức: ${Math.round(taskRemuneration).toLocaleString()}đ (Làm ${totalMatchedHours.toFixed(1)}/${minHours}h)`,
              amount: totalSalary,
              date: new Date().toLocaleDateString('vi-VN')
          });
          totalEstimatedCost += totalSalary;
      }
  });

  // 2. CSVC
  const availableAreas = [...new Set(facilityLogs.map(l => l.area).filter(Boolean))];
  const availableReporters = [...new Set(facilityLogs.map(l => l.staffName).filter(Boolean))];

  const filteredFacilityLogs = facilityLogs.filter(log => {
      if (facilityAreaFilter !== 'all' && log.area !== facilityAreaFilter) return false;
      if (facilityStaffFilter !== 'all' && log.staffName !== facilityStaffFilter) return false;
      
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (facilityTimeFilter === 'day' && !isSameDay(logDate, now)) return false;
      if (facilityTimeFilter === 'week' && !isSameWeek(logDate, now)) return false;
      if (facilityTimeFilter === 'month' && !isSameMonth(logDate, now)) return false;
      
      return true;
  });

  // 3. TIẾN ĐỘ CÔNG VIỆC
  const filteredOpTasks = opAdminTasks.filter(t => {
      if (taskStaffFilter !== 'all' && String(t.assigneeId) !== String(taskStaffFilter)) return false;
      
      const isCompleted = t.status === 'completed';
      const isOverdue = new Date() > new Date(t.endTime) && !isCompleted;
      
      if (taskStatusFilter === 'completed' && !isCompleted) return false;
      if (taskStatusFilter === 'overdue' && !isOverdue) return false;
      if (taskStatusFilter === 'inprogress' && (isCompleted || isOverdue)) return false; 

      return true;
  });

  const totalTasks = filteredOpTasks.length;
  const completedTasks = filteredOpTasks.filter(t => t.status === 'completed').length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 4. CHẤM CÔNG
  const filteredAttendance = scheduleTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const now = new Date();
      if (attendanceFilter === 'day' && !isSameDay(taskDate, now)) return false;
      if (attendanceFilter === 'week' && !isSameWeek(taskDate, now)) return false;
      if (attendanceFilter === 'month' && !isSameMonth(taskDate, now)) return false;
      if (attendanceStaffFilter !== 'all' && String(t.assigneeId) !== String(attendanceStaffFilter)) return false;
      if (attendanceDayFilter !== 'all') {
          const dayVal = daysOfWeek.find(d => d.key === attendanceDayFilter)?.val;
          if (taskDate.getDay() !== dayVal) return false;
      }
      return true;
  });

  // --- RENDER FUNCTIONS ---
  const renderDashboard = () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {user?.role === 'chief' && (
              <div style={styles.menuCard}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                      <div style={styles.iconBox}><Icons.Finance /></div>
                      <h3 style={styles.cardTitle}>Tài chính & Thu nhập</h3>
                  </div>
                  <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>
                      Tổng chi dự kiến (Tháng {Number(selMonth)}/{selYear}): <strong style={{color:'#059669'}}>{Math.round(totalEstimatedCost).toLocaleString()} VNĐ</strong>
                  </div>
                  <button onClick={() => setActiveTab('finance')} style={styles.accessBtn}>
                      Truy cập <Icons.ArrowRight />
                  </button>
              </div>
          )}

          <div style={styles.menuCard}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                  <div style={styles.iconBox}><Icons.Facility /></div>
                  <h3 style={styles.cardTitle}>Tình trạng Cơ sở vật chất</h3>
              </div>
              <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>
                  Báo cáo mới: <strong>{filteredFacilityLogs.length}</strong>
              </div>
              <button onClick={() => setActiveTab('facility')} style={styles.accessBtn}>
                  Truy cập <Icons.ArrowRight />
              </button>
          </div>

          <div style={styles.menuCard}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                  <div style={styles.iconBox}><Icons.Schedule /></div>
                  <h3 style={styles.cardTitle}>Báo cáo Chấm công</h3>
              </div>
              <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>
                  Dữ liệu chấm công theo lịch Scheduler.
              </div>
              <button onClick={() => setActiveTab('attendance')} style={styles.accessBtn}>
                  Truy cập <Icons.ArrowRight />
              </button>
          </div>

          <div style={styles.menuCard}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'15px'}}>
                  <div style={styles.iconBox}><Icons.Task /></div>
                  <h3 style={styles.cardTitle}>Tiến độ Công việc (Op Admin)</h3>
              </div>
              <div style={{color:'#6b7280', fontSize:'0.9rem', marginBottom:'20px'}}>
                  Tổng: <strong>{totalTasks}</strong> | Xong: <strong>{completedTasks}</strong>
              </div>
              <button onClick={() => setActiveTab('tasks')} style={styles.accessBtn}>
                  Truy cập <Icons.ArrowRight />
              </button>
          </div>
      </div>
  );

  return (
    <div style={{ paddingBottom: '40px' }} className="reports-page">
      <style>{`
        @media print {
          .admin-sidebar, .admin-header-mobile, .admin-bottom-nav, .btn-print, .filter-select, .nav-back-btn { display: none !important; }
          .admin-content { margin: 0 !important; padding: 20px !important; width: 100% !important; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
        }
        .filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
      `}</style>

      {/* HEADER + NÚT IN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
         <h2 style={{ color: '#003366', margin: 0, fontWeight: 'bold', fontSize: '1.5rem' }}>BÁO CÁO QUẢN TRỊ</h2>
         <button onClick={handlePrint} className="btn-print" style={styles.printBtn}>
            <Icons.Print /> Xuất Báo cáo
         </button>
      </div>

      {activeTab === 'overview' && renderDashboard()}

      {/* VIEW: CHI TIẾT TÀI CHÍNH */}
      {activeTab === 'finance' && user?.role === 'chief' && (
          <div style={styles.card} className="card">
               <div style={{...styles.cardHeader, justifyContent: 'space-between', flexWrap: 'wrap'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={styles.iconBox}><Icons.Finance /></div>
                      <h3 style={styles.cardTitle}>Tài chính & Thu nhập (Tháng {Number(selMonth)}/{selYear})</h3>
                  </div>
                  <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap: 'wrap'}}>
                      <input 
                          type="month" 
                          value={financeMonthFilter} 
                          onChange={(e) => setFinanceMonthFilter(e.target.value)} 
                          style={styles.filterSelect}
                          title="Chọn tháng để lọc"
                      />
                      <select value={financeStaffFilter} onChange={(e) => setFinanceStaffFilter(e.target.value)} style={styles.filterSelect}>
                          <option value="all">Tất cả nhân sự</option>
                          {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
                  </div>
               </div>
               <div style={{...styles.cardBody, overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={{...styles.th, width: '50px'}}>STT</th>
                        <th style={styles.th}>Nhân sự</th>
                        <th style={styles.th}>Chi tiết Phân bổ</th>
                        <th style={styles.th}>Tổng Số Tiền (VNĐ)</th>
                        <th style={styles.th}>Ngày chốt BC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeRows.length > 0 ? financeRows.map((row, idx) => (
                        <tr key={idx} style={styles.tr}>
                            <td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af'}}>{idx + 1}</td>
                            <td style={{...styles.td, fontWeight:'600', color:'#111827'}}>{row.item}</td>
                            <td style={{...styles.td, fontSize:'0.8rem', color:'#4b5563'}}>{row.type}</td>
                            <td style={{...styles.td, fontWeight: 'bold', color: '#059669'}}>{Math.round(row.amount).toLocaleString()}</td>
                            <td style={styles.td}>{row.date}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" style={styles.emptyTd}>Không có dữ liệu hiển thị.</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
          </div>
      )}

      {/* VIEW: CHI TIẾT CSVC */}
      {activeTab === 'facility' && (
          <div style={styles.card} className="card">
             <div style={{...styles.cardHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
                <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={styles.iconBox}><Icons.Facility /></div>
                        <h3 style={styles.cardTitle}>Tình trạng Cơ sở vật chất</h3>
                    </div>
                    <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
                </div>
                <div className="filter-group" style={{width: '100%'}}>
                    <select value={facilityAreaFilter} onChange={(e) => setFacilityAreaFilter(e.target.value)} style={{...styles.filterSelect, flex: 1}}>
                        <option value="all">Khu vực: Tất cả</option>
                        {availableAreas.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                    <select value={facilityStaffFilter} onChange={(e) => setFacilityStaffFilter(e.target.value)} style={{...styles.filterSelect, flex: 1}}>
                        <option value="all">Nhân sự: Tất cả</option>
                        {availableReporters.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <select value={facilityTimeFilter} onChange={(e) => setFacilityTimeFilter(e.target.value)} style={{...styles.filterSelect, flex: 1}}>
                        <option value="day">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                    </select>
                </div>
             </div>
             <div style={{...styles.cardBody, overflowX: 'auto'}}>
                 <table style={styles.table}>
                   <thead>
                     <tr style={styles.tableHeadRow}>
                       <th style={{...styles.th, width: '50px'}}>STT</th>
                       <th style={styles.th}>Khu vực</th>
                       <th style={styles.th}>Tình trạng trước</th>
                       <th style={styles.th}>Tình trạng sau</th>
                       <th style={styles.th}>Nhân sự báo cáo</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredFacilityLogs.length > 0 ? (
                       [...filteredFacilityLogs].reverse().map((log, index) => (
                         <tr key={index} style={styles.tr}>
                           <td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af'}}>{index + 1}</td>
                           <td style={{...styles.td, fontWeight: '600'}}>{log.area || '---'}</td>
                           <td style={styles.td}>
                               <div style={{fontWeight:'700', fontSize:'0.9rem', marginBottom:'4px', color:'#1f2937'}}>{log.itemName || log.item || log.category || 'Hạng mục'}</div>
                               <div style={{color:'#4b5563'}}>{log.prevStatus ? log.prevStatus : <span style={{fontStyle:'italic', color:'#9ca3af'}}>---</span>}</div>
                               <div style={{fontSize:'0.75rem', color:'#9ca3af', marginTop:'2px'}}>{formatDateTime(log.prevTime)}</div>
                           </td>
                           <td style={styles.td}>
                               <div style={{fontWeight:'700', fontSize:'0.9rem', marginBottom:'4px', color:'#1f2937'}}>{log.itemName || log.item || log.category || 'Hạng mục'}</div>
                               <div style={{color: '#003366', fontWeight:'500'}}>{log.status || log.note || 'Đã kiểm tra'}</div>
                               <div style={{fontSize:'0.75rem', color:'#6b7280', marginTop:'2px'}}>{formatDateTime(log.timestamp)}</div>
                           </td>
                           <td style={styles.td}>{log.staffName || 'Unknown'}</td>
                         </tr>
                       ))
                     ) : (
                       <tr><td colSpan="5" style={styles.emptyTd}>Chưa có báo cáo kiểm tra phù hợp.</td></tr>
                     )}
                   </tbody>
                 </table>
             </div>
          </div>
      )}

      {/* VIEW: CHI TIẾT CHẤM CÔNG */}
      {activeTab === 'attendance' && (
          <div style={styles.card} className="card">
            <div style={{ ...styles.cardHeader, flexDirection:'column', alignItems: 'flex-start', gap: '15px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={styles.iconBox}><Icons.Schedule /></div>
                      <h3 style={styles.cardTitle}>Báo cáo Chấm công (Theo Lịch Scheduler)</h3>
                  </div>
                  <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
               </div>
               <div className="filter-group" style={{width: '100%'}}>
                   <select value={attendanceStaffFilter} onChange={(e) => setAttendanceStaffFilter(e.target.value)} style={{...styles.filterSelect, flex: 1}}>
                        <option value="all">Nhân sự: Tất cả</option>
                        {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={attendanceDayFilter} onChange={(e) => setAttendanceDayFilter(e.target.value)} style={{...styles.filterSelect, flex: 1}}>
                        <option value="all">Ngày: Tất cả</option>
                        {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                    </select>
                    <select value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value)} style={{...styles.filterSelect, flex: 1}}>
                        <option value="day">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                    </select>
               </div>
            </div>
            <div style={{...styles.cardBody, overflowX: 'auto'}}>
               <table style={styles.table}>
                  <thead>
                     <tr style={styles.tableHeadRow}>
                       <th style={{ ...styles.th, borderRadius: '8px 0 0 8px', width: '50px' }}>STT</th>
                       <th style={styles.th}>Nhân sự</th>
                       <th style={styles.th}>Ca làm việc</th>
                       <th style={styles.th}>Thời gian</th>
                       <th style={styles.th}>Số giờ</th>
                       <th style={styles.th}>Trạng thái</th>
                       <th style={{ ...styles.th, borderRadius: '0 8px 8px 0' }}>Kết quả</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredAttendance.length > 0 ? filteredAttendance.map((t, index) => {
                       const isCompleted = t.status === 'completed' || t.progress === 100;
                       const statusDetails = [];

                       if (!t.checkInTime) {
                           statusDetails.push("Chưa check-in");
                       } else {
                           const plannedStart = new Date(t.startTime);
                           const actualIn = new Date(t.checkInTime);
                           const diffIn = (actualIn - plannedStart) / 60000; 
                           if (diffIn > 3) statusDetails.push(`Check-in trễ ${Math.round(diffIn)}p`);

                           if (!t.checkOutTime) {
                               statusDetails.push("Chưa check-out");
                           } else {
                               const plannedEnd = new Date(t.endTime);
                               const actualOut = new Date(t.checkOutTime);
                               const diffOut = (actualOut - plannedEnd) / 60000;
                               if (diffOut > 15) statusDetails.push(`Check-out trễ ${Math.round(diffOut)}p`);
                           }
                       }

                       if (t.explanation) {
                           statusDetails.push(`Giải trình: ${t.explanation}`);
                       }

                       return (
                           <tr key={t.id} style={styles.tr}>
                              <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af' }}>{index + 1}</td>
                              <td style={{ ...styles.td, fontWeight: '600' }}>{t.assigneeName}</td>
                              <td style={styles.td}>
                                  <div>{t.title}</div>
                                  <div style={{fontSize:'0.75rem', color:'#6b7280'}}>{t.assignedRole}</div>
                              </td>
                              <td style={styles.td}>
                                 {new Date(t.startTime).toLocaleDateString('vi-VN')} <br/>
                                 <span style={{fontSize:'0.75rem', color:'#64748b'}}>
                                   {new Date(t.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(t.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                 </span>
                              </td>
                              <td style={{...styles.td, fontWeight: 'bold', color: '#059669'}}>
                                  {calculateWorkHours(t.startTime, t.endTime, t.checkInTime, t.checkOutTime)}
                              </td>
                              <td style={styles.td}>
                                 {isCompleted ? 
                                   <span style={styles.badgeSuccess}>Đã chấm công</span> : 
                                   <span style={styles.badgePending}>Chưa hoàn thành</span>
                                 }
                                 {statusDetails.length > 0 && (
                                     <div style={{fontSize: '0.75rem', color: '#6b7280', marginTop: '4px', fontStyle:'italic'}}>
                                         {statusDetails.map((detail, idx) => (
                                             <div key={idx}>- {detail}</div>
                                         ))}
                                     </div>
                                 )}
                              </td>
                              <td style={styles.td}>{t.progress}%</td>
                           </tr>
                       );
                     }) : (
                       <tr><td colSpan="7" style={styles.emptyTd}>Không có dữ liệu chấm công phù hợp.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
          </div>
      )}

      {/* VIEW: CHI TIẾT NHIỆM VỤ (TIẾN ĐỘ) */}
      {activeTab === 'tasks' && (
          <div style={styles.card} className="card">
              <div style={{...styles.cardHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '15px'}}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                     <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                         <div style={styles.iconBox}><Icons.Task /></div>
                         <h3 style={styles.cardTitle}>Tiến độ Công việc (Operational Admin giao)</h3>
                     </div>
                     <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
                 </div>
                 <div className="filter-group" style={{width: '100%'}}>
                     <select 
                          value={taskStaffFilter} 
                          onChange={(e) => setTaskStaffFilter(e.target.value)}
                          style={{...styles.filterSelect, flex: 1}}
                      >
                          <option value="all">Nhân sự: Tất cả</option>
                          {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select 
                          value={taskStatusFilter} 
                          onChange={(e) => setTaskStatusFilter(e.target.value)}
                          style={{...styles.filterSelect, flex: 1}}
                      >
                          <option value="all">Trạng thái: Tất cả</option>
                          <option value="inprogress">Đang làm</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="overdue">Quá hạn</option>
                      </select>
                 </div>
              </div>

              <div style={styles.cardBody}>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={styles.statBoxBlue}>
                        <div style={{fontSize:'0.8rem', color:'#6b7280'}}>Tổng nhiệm vụ</div>
                        <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#003366'}}>{totalTasks}</div>
                    </div>
                    <div style={styles.statBoxGreen}>
                        <div style={{fontSize:'0.8rem', color:'#6b7280'}}>Hoàn thành</div>
                        <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#059669'}}>{completedTasks}</div>
                    </div>
                    <div style={styles.statBoxGray}>
                        <div style={{fontSize:'0.8rem', color:'#6b7280'}}>Tỷ lệ</div>
                        <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#003366'}}>{taskProgress}%</div>
                    </div>
                </div>

                <div style={{overflowX: 'auto'}}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={{...styles.th, width: '50px'}}>STT</th>
                        <th style={styles.th}>Nhiệm vụ</th>
                        <th style={styles.th}>Phụ trách</th>
                        <th style={styles.th}>Hạn chót</th>
                        <th style={styles.th}>Tiến độ</th>
                        <th style={styles.th}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                        {filteredOpTasks.map((task, index) => {
                          let statusElement;
                          const isOverdue = new Date() > new Date(task.endTime) && task.status !== 'completed';

                          if (task.status === 'completed') {
                              statusElement = <span style={styles.badgeSuccess}>Hoàn thành</span>;
                          } else if (isOverdue) {
                              statusElement = <span style={styles.badgeError}>Quá hạn / Giải trình</span>;
                          } else {
                              statusElement = <span style={styles.badgeInfo}>Đang làm</span>;
                          }

                          return (
                            <tr key={task.id} style={styles.tr}>
                              <td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af'}}>{index + 1}</td>
                              <td style={{ ...styles.td, fontWeight: '500' }}>{task.title}</td>
                              <td style={styles.td}>{task.assigneeName}</td>
                              <td style={styles.td}>{new Date(task.endTime).toLocaleDateString('vi-VN')}</td>
                              <td style={styles.td}>
                                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <div style={{flex:1, height:'6px', background:'#e5e7eb', borderRadius:'3px', minWidth:'60px'}}>
                                      <div style={{width:`${task.progress}%`, background:'#003366', height:'100%', borderRadius:'3px'}}></div>
                                    </div>
                                    <span style={{fontSize:'0.8em', fontWeight:'bold'}}>{task.progress}%</span>
                                </div>
                              </td>
                              <td style={styles.td}>{statusElement}</td>
                            </tr>
                          );
                        })}
                        {filteredOpTasks.length === 0 && <tr><td colSpan="6" style={styles.emptyTd}>Không tìm thấy nhiệm vụ phù hợp.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', marginBottom: '30px', overflow: 'hidden' },
  cardHeader: { padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb' },
  iconBox: { width: '36px', height: '36px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003366' },
  cardTitle: { margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937' },
  cardBody: { padding: '20px' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem', color: '#4b5563' },
  filterSelect: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontWeight: '600', color: '#4b5563', cursor: 'pointer', fontSize: '0.85rem' },
  printBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#003366', border: '1px solid #003366', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' },
  tableHeadRow: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' },
  tr: { transition: 'background 0.2s' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#334155' },
  emptyTd: { padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' },
  badgeSuccess: { background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  badgePending: { background: '#fff7ed', color: '#ea580c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  badgeError: { background: '#fef2f2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  badgeInfo: { background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  statBoxBlue: { flex: 1, background: '#f0f9ff', padding: '15px', borderRadius: '12px', border: '1px solid #bae6fd', minWidth: '120px' },
  statBoxGreen: { flex: 1, background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #bbf7d0', minWidth: '120px' },
  statBoxGray: { flex: 1, background: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', minWidth: '120px' },
  menuCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px' },
  accessBtn: { marginTop: 'auto', background: '#003366', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' },
  backBtn: { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }
};

export default Reports;