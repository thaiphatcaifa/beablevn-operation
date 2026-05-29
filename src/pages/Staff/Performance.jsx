import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
const isSameYear = (d1, d2) => d1.getFullYear() === d2.getFullYear();
const isSameWeek = (d1, d2) => {
    const start = new Date(d2);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate() - start.getDay() + 1); 
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return d1 >= start && d1 <= end;
};

const generateMonthYearOptions = () => {
    const options = [];
    for (let y = 2026; y <= 2030; y++) {
        for (let m = 1; m <= 12; m++) {
            options.push({
                value: `${y}-${String(m).padStart(2, '0')}`,
                label: `Tháng ${m}/${y}`
            });
        }
    }
    return options;
};
const monthYearOptions = generateMonthYearOptions();

const parseAmount = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    const clean = String(val).replace(/,/g, '').replace(/\s/g, '');
    const num = Number(clean);
    return isNaN(num) ? 0 : num;
};

const calculateWorkHoursDecimal = (schedStart, schedEnd, actualCheckIn, actualCheckOut, isAdminEdited = false) => {
    if (!schedStart || !schedEnd || !actualCheckIn || !actualCheckOut) return 0;
    
    const sStart = new Date(schedStart);
    const sEnd = new Date(schedEnd);
    const aIn = new Date(actualCheckIn);
    const aOut = new Date(actualCheckOut);

    let diffMs = 0;

    if (isAdminEdited) {
        const scheduledMs = sEnd - sStart;
        const actualMs = aOut - aIn;
        diffMs = actualMs > scheduledMs ? scheduledMs : actualMs;
    } else {
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
        diffMs = calcEnd - calcStart;
    }

    if (diffMs < 0) return 0;

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    return totalMinutes / 60; 
};

// Helper để khớp Rate
const getMatchedRate = (staffRems, task) => {
    if (!staffRems || !Array.isArray(staffRems)) return 0;
    const matched = staffRems.find(rem => {
        if (rem.position && String(rem.position).trim() !== '') {
            if (String(rem.position).trim().toLowerCase() !== String(task.assignedRole || '').trim().toLowerCase()) return false;
        }
        const rCode = String(rem.jobCode !== undefined ? rem.jobCode : (rem.keywords || '')).trim();
        if (rCode !== '') {
            const codes = rCode.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
            const tCode = String(task.jobCode || '').trim().toLowerCase();
            const tTitle = String(task.title || '').trim().toLowerCase();
            const isMatch = codes.some(c => tCode === c || tTitle.includes(c));
            if (!isMatch) return false;
        }
        return true;
    });
    return matched ? parseAmount(matched.amount) : 0;
};

// --- BỘ ICON MINIMALIST ĐỒNG BỘ ---
const Icons = {
  Money: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Trend: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>),
  Performance: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>)
};

const Performance = () => {
  const { user } = useAuth();
  const { tasks, staffList } = useData();

  const [activeTab, setActiveTab] = useState('income');
  const [timeFilter, setTimeFilter] = useState('month');
  
  const [incomeMonthFilter, setIncomeMonthFilter] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const currentUserData = staffList.find(s => s.id === user?.id) || {};

  // ==========================================
  // LOGIC 1: TÍNH TOÁN THU NHẬP ƯỚC TÍNH
  // ==========================================
  const myScheduleTasks = tasks.filter(t => String(t.assigneeId) === String(user?.id) && t.fromScheduleId);

  const filteredIncomeTasks = myScheduleTasks.filter(t => {
      if (incomeMonthFilter === 'all') return true;
      if (!t.startTime) return false;
      const d = new Date(t.startTime);
      const taskMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return taskMonthStr === incomeMonthFilter;
  });

  let hoursUBI1 = 0;
  let ubi1Tasks = [];
  const secHoursMap = {};

  filteredIncomeTasks.forEach(task => {
      if (!task.checkInTime || !task.checkOutTime) return; 
      const workedHours = calculateWorkHoursDecimal(task.startTime, task.endTime, task.checkInTime, task.checkOutTime, task.adminEdited);

      let taskRate = getMatchedRate(currentUserData.remunerations, task);

      if (task.assignedRole === currentUserData.primaryRole) {
          hoursUBI1 += workedHours;
          ubi1Tasks.push({ hours: workedHours, rate: taskRate });
      } else {
          secHoursMap[task.assignedRole] = (secHoursMap[task.assignedRole] || 0) + workedHours;
      }
  });

  let secUbiTotal = 0;
  const ubiRoles = [];
  if (currentUserData.secondaryUBIs && currentUserData.secondaryUBIs.length > 0) {
      currentUserData.secondaryUBIs.forEach(ubi => {
          if (!ubi.type || ubi.type === 'ubi') {
              const lf = Number(ubi.loadFactor);
              const actualLf = lf > 1 ? lf / 100 : lf;
              secUbiTotal += parseAmount(ubi.amount) * actualLf;
              ubiRoles.push(ubi.role);
          }
      });
  } else if (currentUserData.ubi2Base !== undefined) {
      secUbiTotal = parseAmount(currentUserData.ubi2Base) * (parseAmount(currentUserData.ubi2Percent)/100 || 1);
  }

  let R_Secondary = 0;
  let hoursSecondaryPartTime = 0;
  Object.keys(secHoursMap).forEach(role => {
      if (!ubiRoles.includes(role)) {
          const roleHours = secHoursMap[role];
          hoursSecondaryPartTime += roleHours;
          const secRem = currentUserData.remunerations?.find(r => r.position === role);
          if (secRem) {
              R_Secondary += roleHours * parseAmount(secRem.amount);
          }
      }
  });

  let R_UBI1 = 0;
  const minHours = parseAmount(currentUserData.minWorkHours);
  if (hoursUBI1 > minHours) {
      ubi1Tasks.sort((a, b) => a.rate - b.rate);
      let hoursToOffset = minHours;

      ubi1Tasks.forEach(t => {
          if (hoursToOffset > 0) {
              if (t.hours <= hoursToOffset) {
                  hoursToOffset -= t.hours;
                  t.hours = 0;
              } else {
                  t.hours -= hoursToOffset;
                  hoursToOffset = 0;
              }
          }
          if (t.hours > 0 && t.rate > 0) {
              R_UBI1 += t.hours * t.rate;
          }
      });
  }

  // FIX: Đảm bảo UBI Cố định hiển thị chính xác theo trường ubi1Base (UBI 1) do Admin thiết lập
  const baseUbi = parseAmount(currentUserData.ubi1Base);
  
  const allowance = parseAmount(currentUserData.specificAllowance);
  const totalFixedSalary = baseUbi + secUbiTotal + allowance;

  const incomeForBHXH = baseUbi + R_UBI1;
  const bhxhDeduction = incomeForBHXH * 0.105;

  const grossIncome = totalFixedSalary + R_UBI1 + R_Secondary;

  const taxThreshold = 15500000;
  const taxDeduction = grossIncome > taxThreshold ? (grossIncome - taxThreshold) * 0.05 : 0;

  const netIncome = grossIncome - bhxhDeduction - taxDeduction;

  // ==========================================
  // LOGIC 2: ĐÁNH GIÁ HIỆU SUẤT CÔNG VIỆC
  // ==========================================
  const myOpTasks = tasks.filter(t => String(t.assigneeId) === String(user?.id) && !t.fromScheduleId);
  const filteredEvalTasks = myOpTasks.filter(t => {
      const taskDate = new Date(t.startTime || t.createdDate);
      const currentTime = new Date();
      if (timeFilter === 'day') return isSameDay(taskDate, currentTime);
      if (timeFilter === 'week') return isSameWeek(taskDate, currentTime);
      if (timeFilter === 'month') return isSameMonth(taskDate, currentTime);
      if (timeFilter === 'year') return isSameYear(taskDate, currentTime);
      return true;
  });

  const getTaskEvaluation = (task) => {
      const isCompleted = task.status === 'completed';
      const isOverdue = new Date() > new Date(task.endTime) && !isCompleted;
      const progress = task.progress || 0;

      if (isCompleted && !isOverdue) return { grade: 'Hạng A', color: '#10b981', desc: 'Hoàn thành tốt', icon: '⭐' };
      if (isCompleted && isOverdue) return { grade: 'Hạng B', color: '#f59e0b', desc: 'Hoàn thành trễ', icon: '⚠️' };
      if (!isCompleted && !isOverdue && progress > 50) return { grade: 'Hạng C', color: '#3b82f6', desc: 'Đang triển khai', icon: '⏳' };
      if (isOverdue) return { grade: 'Hạng F', color: '#ef4444', desc: 'Quá hạn', icon: '❌' };
      return { grade: 'Chưa ĐG', color: '#64748b', desc: 'Chưa đủ dữ liệu', icon: '➖' };
  };

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box' }}>
        {/* CSS TỐI ƯU UI/UX NỘI BỘ */}
        <style>{`
            .segmented-control {
                display: flex; background: #f1f5f9; padding: 6px; border-radius: 16px; margin-bottom: 32px; width: 100%; box-sizing: border-box;
            }
            .segmented-btn {
                flex: 1; padding: 12px 16px; border-radius: 12px; border: none; font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; gap: 8px; color: #64748b; background: transparent;
            }
            .segmented-btn.active {
                background: #ffffff; color: #003366; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .filter-modern {
                padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; font-weight: 600; color: #334155; background: #ffffff; cursor: pointer; font-size: 0.95rem; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); appearance: none; -webkit-appearance: none; background-image: url('data:image/svg+xml;utf8,<svg fill="%239ca3af" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>'); background-repeat: no-repeat; background-position: right 12px center; padding-right: 40px;
            }
            .filter-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
            .kpi-card {
                transition: all 0.25s ease;
            }
            .kpi-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1) !important;
                border-color: #bae6fd !important;
            }
            @media (max-width: 480px) {
                .header-row { flex-direction: column; align-items: flex-start !important; gap: 12px; }
                .filter-modern { width: 100%; box-sizing: border-box; }
            }
        `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
              <Icons.Performance />
          </div>
          <div>
              <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>HIỆU SUẤT CÁ NHÂN</h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Theo dõi KPI và ước tính lương</span>
          </div>
      </div>

      <div className="segmented-control">
          <button 
              onClick={() => setActiveTab('income')} 
              className={`segmented-btn ${activeTab === 'income' ? 'active' : ''}`}
          >
              <Icons.Money /> Ước tính Thu nhập
          </button>
          <button 
              onClick={() => setActiveTab('tasks')} 
              className={`segmented-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          >
              <Icons.Trend /> Đánh giá KPI
          </button>
      </div>

      <div style={{display: 'grid', gap: '24px'}}>
         {/* TAB 1: THU NHẬP */}
         {activeTab === 'income' && (
             <div style={{ display: 'grid', gap: '24px' }}>
                 <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                     <h3 style={{ margin: 0, color: '#111827', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Chi tiết thu nhập</h3>
                     
                     <select 
                         value={incomeMonthFilter} 
                         onChange={(e) => setIncomeMonthFilter(e.target.value)} 
                         className="filter-modern"
                     >
                         <option value="all">Tất cả các tháng</option>
                         {monthYearOptions.map(opt => (
                             <option key={opt.value} value={opt.value}>{opt.label}</option>
                         ))}
                     </select>
                 </div>

                 {/* KHỐI LƯƠNG CỐ ĐỊNH */}
                 <div style={styles.card}>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                         <span style={{color:'#64748b', fontWeight:'600', fontSize: '0.95rem'}}>Lương cứng (Base) {currentUserData.primaryRole ? `(${currentUserData.primaryRole})` : ''}:</span>
                         <span style={{fontWeight:'700', color: '#1e293b'}}>{Math.round(baseUbi).toLocaleString()} đ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                         <span style={{color:'#64748b', fontWeight:'600', fontSize: '0.95rem'}}>Tổng các vị trí phụ (Fix):</span>
                         <span style={{fontWeight:'700', color: '#1e293b'}}>{Math.round(secUbiTotal).toLocaleString()} đ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px', borderBottom:'1px dashed #e2e8f0', paddingBottom:'16px'}}>
                         <span style={{color:'#64748b', fontWeight:'600', fontSize: '0.95rem'}}>Phụ cấp đặc thù:</span>
                         <span style={{fontWeight:'700', color: '#1e293b'}}>{Math.round(allowance).toLocaleString()} đ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', color:'#059669', alignItems: 'center'}}>
                         <span style={{fontWeight:'800', fontSize: '1rem'}}>TỔNG CỐ ĐỊNH:</span>
                         <span style={{fontWeight:'800', fontSize:'1.25rem'}}>{Math.round(totalFixedSalary).toLocaleString()} đ</span>
                     </div>
                 </div>

                 {/* KHỐI BIẾN ĐỔI */}
                 <div style={styles.card}>
                     <h4 style={{margin:'0 0 20px 0', color:'#111827', fontSize: '1.1rem', fontWeight: '800'}}>Thù lao phát sinh (Remuneration)</h4>
                     
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px', fontSize:'0.95rem'}}>
                         <span style={{color:'#64748b', fontWeight:'600'}}>Giờ UBI yêu cầu:</span>
                         <span style={{fontWeight:'700', color: '#1e293b'}}>{minHours} giờ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px', fontSize:'0.95rem'}}>
                         <span style={{color:'#64748b', fontWeight:'600'}}>Giờ UBI thực tế:</span>
                         <span style={{fontWeight:'800', color: hoursUBI1 >= minHours ? '#059669' : '#ea580c'}}>{hoursUBI1.toFixed(1)} giờ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', fontSize:'0.95rem', borderBottom:'1px dashed #e2e8f0', paddingBottom:'16px'}}>
                         <span style={{color:'#475569', fontWeight:'700'}}>Thưởng vượt UBI 1:</span>
                         <span style={{fontWeight:'800', color: '#0284c7'}}>+ {Math.round(R_UBI1).toLocaleString()} đ</span>
                     </div>
                     
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px', fontSize:'0.95rem'}}>
                         <span style={{color:'#64748b', fontWeight:'600'}}>Giờ Part-time:</span>
                         <span style={{fontWeight:'700', color: '#1e293b'}}>{hoursSecondaryPartTime.toFixed(1)} giờ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', fontSize:'0.95rem', borderBottom:'1px dashed #e2e8f0', paddingBottom:'16px'}}>
                         <span style={{color:'#475569', fontWeight:'700'}}>Thù lao Part-time:</span>
                         <span style={{fontWeight:'800', color: '#0284c7'}}>+ {Math.round(R_Secondary).toLocaleString()} đ</span>
                     </div>
                     
                     <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', color:'#111827', marginTop: '16px'}}>
                         <span style={{fontWeight:'800', fontSize: '1rem'}}>THU NHẬP GỘP (GROSS):</span>
                         <span style={{fontWeight:'800', fontSize:'1.25rem'}}>{Math.round(grossIncome).toLocaleString()} đ</span>
                     </div>
                 </div>

                 {/* KHỐI KHẤU TRỪ */}
                 <div style={styles.card}>
                     <h4 style={{margin:'0 0 16px 0', color:'#111827', fontSize: '1.1rem', fontWeight: '800'}}>Các khoản khấu trừ</h4>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px', fontSize:'0.95rem'}}>
                         <span style={{color:'#64748b', fontWeight:'600'}}>Bảo hiểm XH (10.5%):</span>
                         <span style={{color:'#ef4444', fontWeight:'700'}}>- {Math.round(bhxhDeduction).toLocaleString()} đ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.95rem'}}>
                         <span style={{color:'#64748b', fontWeight:'600'}}>Thuế TNCN dự kiến:</span>
                         <span style={{color:'#ef4444', fontWeight:'700'}}>- {Math.round(taxDeduction).toLocaleString()} đ</span>
                     </div>
                 </div>

                 {/* TỔNG KẾT NET */}
                 <div style={{...styles.card, background:'linear-gradient(135deg, #003366 0%, #002244 100%)', color:'white', border: 'none', boxShadow: '0 10px 20px -5px rgba(0, 51, 102, 0.4)'}}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                         <div>
                             <div style={{fontSize: '0.85rem', color: '#bae6fd', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Dự kiến thực nhận</div>
                             <span style={{fontWeight:'800', fontSize:'1.1rem'}}>NET INCOME</span>
                         </div>
                         <span style={{fontWeight:'800', fontSize:'1.8rem', color:'#fcd34d', letterSpacing: '-0.02em'}}>{Math.round(netIncome).toLocaleString()} <span style={{fontSize: '1.2rem'}}>đ</span></span>
                     </div>
                 </div>
             </div>
         )}

         {/* TAB 2: ĐÁNH GIÁ KPI */}
         {activeTab === 'tasks' && (
             <div style={{ display: 'grid', gap: '20px' }}>
                 <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                     <h3 style={{ margin: 0, color: '#111827', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Lịch sử KPI</h3>
                     <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="filter-modern">
                         <option value="day">Trong ngày</option>
                         <option value="week">Trong tuần</option>
                         <option value="month">Trong tháng</option>
                         <option value="year">Năm nay</option>
                         <option value="all">Toàn bộ thời gian</option>
                     </select>
                 </div>

                 {filteredEvalTasks.length === 0 && (
                     <div style={{textAlign:'center', padding:'60px 20px', color:'#94a3b8', background:'white', borderRadius:'20px', border:'1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'}}>
                         <div style={{fontSize: '3.5rem', opacity: 0.8}}>📊</div>
                         <div style={{fontWeight: '700', fontSize: '1.1rem', color: '#475569'}}>Không có dữ liệu!</div>
                         <div style={{fontSize: '0.9rem'}}>Chưa có nhiệm vụ nào được ghi nhận trong khoảng thời gian này.</div>
                     </div>
                 )}

                 {filteredEvalTasks.map(task => {
                     const evalResult = getTaskEvaluation(task);
                     return (
                         <div key={task.id} className="kpi-card" style={styles.kpiCard}>
                             <div style={{flex: 1, minWidth: 0, paddingRight: '12px'}}>
                                 <div style={{fontWeight:'800', fontSize:'1.1rem', color:'#1e293b', marginBottom:'8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em'}}>
                                     {task.title}
                                 </div>
                                 <div style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'16px', fontWeight: '600'}}>
                                     📅 Hạn chót: {new Date(task.endTime).toLocaleDateString('vi-VN')}
                                 </div>
                                 
                                 {/* PROGRESS BAR HIỆN ĐẠI */}
                                 <div style={{width:'100%', height:'10px', background:'#f1f5f9', borderRadius:'10px', marginBottom:'8px', overflow:'hidden', position: 'relative'}}>
                                     <div style={{width: `${task.progress}%`, height:'100%', background: evalResult.color, borderRadius:'10px', transition: 'width 0.5s ease-out'}}></div>
                                 </div>
                                 <div style={{fontSize:'0.85rem', color:'#475569', fontWeight: '700'}}>
                                     Mức hoàn thành: <strong style={{color: evalResult.color}}>{task.progress}%</strong>
                                 </div>
                             </div>
                             
                             <div style={{textAlign:'center', minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `${evalResult.color}15`, padding: '16px 12px', borderRadius: '16px', border: `1px solid ${evalResult.color}30`}}>
                                 <div style={{fontSize:'2rem', marginBottom:'8px'}}>{evalResult.icon}</div>
                                 <div style={{
                                     color: evalResult.color, 
                                     fontWeight:'800', 
                                     fontSize:'1rem',
                                     letterSpacing: '0.02em'
                                 }}>
                                     {evalResult.grade}
                                 </div>
                                 <div style={{fontSize:'0.7rem', color:'#64748b', marginTop:'4px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                                    {evalResult.desc}
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
         )}
      </div>
    </div>
  );
};

const styles = {
    card: { background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
    kpiCard: { background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

export default Performance;