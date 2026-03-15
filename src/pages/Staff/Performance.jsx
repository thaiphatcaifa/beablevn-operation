import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// --- HELPER QUẢN LÝ THỜI GIAN ---
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

// Hàm tạo danh sách tháng năm từ 2026 đến 2030
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

// --- HELPER TÍNH GIỜ LÀM VIỆC (THẬP PHÂN) ---
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
    return totalMinutes / 60; 
};

// --- ICONS ---
const Icons = {
  Money: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Trend: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>),
  Check: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
  Alert: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>)
};

const Performance = () => {
  const { user } = useAuth();
  const { tasks, staffList } = useData();

  const [activeTab, setActiveTab] = useState('income');
  const [timeFilter, setTimeFilter] = useState('month');
  
  // State quản lý bộ lọc Tháng/Năm cho phần Thu Nhập
  const [incomeMonthFilter, setIncomeMonthFilter] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const currentUserData = staffList.find(s => s.id === user?.id) || {};

  // ==========================================
  // LOGIC 1: TÍNH TOÁN THU NHẬP ƯỚC TÍNH (THEO THÁNG ĐƯỢC CHỌN)
  // ==========================================
  const ubi1 = parseAmount(currentUserData.ubi1Base) * getPercent(currentUserData.ubi1Percent) / 100;
  const ubi2 = parseAmount(currentUserData.ubi2Base) * getPercent(currentUserData.ubi2Percent) / 100;
  const totalUBI = ubi1 + ubi2;

  const myScheduleTasks = tasks.filter(t => String(t.assigneeId) === String(user?.id) && t.fromScheduleId);

  // Lọc Task theo Dropbox Tháng/Năm
  const filteredIncomeTasks = myScheduleTasks.filter(t => {
      if (incomeMonthFilter === 'all') return true;
      if (!t.startTime) return false;
      const d = new Date(t.startTime);
      const taskMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return taskMonthStr === incomeMonthFilter;
  });

  let taskRemuneration = 0;
  let totalMatchedHours = 0;
  let matchedTasksList = [];

  filteredIncomeTasks.forEach(task => {
      if (!currentUserData.remunerations || !Array.isArray(currentUserData.remunerations)) return;
      if (!task.checkInTime || !task.checkOutTime) return; 
      
      const matchedRule = currentUserData.remunerations.find(rem => {
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
              title: task.title,
              date: task.startTime,
              hours: workedHours,
              rate: parseAmount(matchedRule.amount)
          });
      }
  });

  const minHours = parseAmount(currentUserData.minWorkHours);
  
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

  const totalEstimatedIncome = totalUBI + taskRemuneration;

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
      return { grade: 'Chưa đánh giá', color: '#6b7280', desc: 'Chưa đủ dữ liệu', icon: '➖' };
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      
      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', overflowX: 'auto' }}>
          <button 
              onClick={() => setActiveTab('income')} 
              style={{ ...styles.tabBtn, background: activeTab === 'income' ? '#003366' : 'transparent', color: activeTab === 'income' ? 'white' : '#4b5563' }}
          >
              <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Icons.Money /> Thu nhập</div>
          </button>
          <button 
              onClick={() => setActiveTab('tasks')} 
              style={{ ...styles.tabBtn, background: activeTab === 'tasks' ? '#003366' : 'transparent', color: activeTab === 'tasks' ? 'white' : '#4b5563' }}
          >
              <div style={{display:'flex', alignItems:'center', gap:'6px'}}><Icons.Trend /> Đánh giá KPI</div>
          </button>
      </div>

      <div style={{display: 'grid', gap: '20px'}}>
         {activeTab === 'income' && (
             <div style={{ display: 'grid', gap: '20px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                     <h3 style={{ margin: 0, color: '#111827', fontSize: '1.2rem', fontWeight: 'bold' }}>Tổng thu nhập ước tính</h3>
                     
                     {/* DROPBOX LỌC THÁNG NĂM TỪ 2026-2030 */}
                     <select 
                         value={incomeMonthFilter} 
                         onChange={(e) => setIncomeMonthFilter(e.target.value)} 
                         style={styles.filterSelect}
                     >
                         <option value="all">Tất cả các tháng</option>
                         {monthYearOptions.map(opt => (
                             <option key={opt.value} value={opt.value}>{opt.label}</option>
                         ))}
                     </select>
                 </div>

                 <div style={styles.card}>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                         <span style={{color:'#4b5563', fontWeight:'600'}}>UBI Cơ bản (1):</span>
                         <span style={{fontWeight:'bold'}}>{Math.round(ubi1).toLocaleString()} VNĐ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', borderBottom:'1px solid #f3f4f6', paddingBottom:'15px'}}>
                         <span style={{color:'#4b5563', fontWeight:'600'}}>UBI Trách nhiệm (2):</span>
                         <span style={{fontWeight:'bold'}}>{Math.round(ubi2).toLocaleString()} VNĐ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', color:'#059669'}}>
                         <span style={{fontWeight:'700'}}>Tổng UBI Cố định:</span>
                         <span style={{fontWeight:'800', fontSize:'1.1rem'}}>{Math.round(totalUBI).toLocaleString()} VNĐ</span>
                     </div>
                 </div>

                 <div style={styles.card}>
                     <h4 style={{margin:'0 0 15px 0', color:'#111827'}}>Thù lao phát sinh (Vượt giờ chuẩn)</h4>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'0.9rem'}}>
                         <span style={{color:'#6b7280'}}>Giờ chuẩn tối thiểu:</span>
                         <span style={{fontWeight:'bold'}}>{minHours} giờ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px', fontSize:'0.9rem', borderBottom:'1px solid #f3f4f6', paddingBottom:'15px'}}>
                         <span style={{color:'#6b7280'}}>Giờ thực tế đã làm:</span>
                         <span style={{fontWeight:'bold', color: totalMatchedHours >= minHours ? '#059669' : '#ef4444'}}>{totalMatchedHours.toFixed(1)} giờ</span>
                     </div>
                     <div style={{display:'flex', justifyContent:'space-between', color:'#003366'}}>
                         <span style={{fontWeight:'700'}}>Thù lao vượt mức:</span>
                         <span style={{fontWeight:'800', fontSize:'1.1rem'}}>+ {Math.round(taskRemuneration).toLocaleString()} VNĐ</span>
                     </div>
                 </div>

                 <div style={{...styles.card, background:'#003366', color:'white'}}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                         <span style={{fontWeight:'600', fontSize:'1.1rem'}}>TỔNG CỘNG DỰ KIẾN:</span>
                         <span style={{fontWeight:'800', fontSize:'1.5rem', color:'#fcd34d'}}>{Math.round(totalEstimatedIncome).toLocaleString()} đ</span>
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'tasks' && (
             <div style={{ display: 'grid', gap: '15px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                     <h3 style={{ margin: 0, color: '#111827', fontSize: '1.2rem', fontWeight: 'bold' }}>Kết quả Nhiệm vụ (KPI)</h3>
                     <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={styles.filterSelect}>
                         <option value="day">Hôm nay</option>
                         <option value="week">Tuần này</option>
                         <option value="month">Tháng này</option>
                         <option value="year">Năm nay</option>
                         <option value="all">Tất cả</option>
                     </select>
                 </div>

                 {filteredEvalTasks.length === 0 && (
                     <div style={{textAlign:'center', padding:'30px', color:'#9ca3af', fontStyle:'italic', background:'white', borderRadius:'12px', border:'1px dashed #e5e7eb'}}>
                         Không có nhiệm vụ nào trong khoảng thời gian này.
                     </div>
                 )}

                 {filteredEvalTasks.map(task => {
                     const evalResult = getTaskEvaluation(task);
                     return (
                         <div key={task.id} style={styles.kpiCard}>
                             <div style={{flex: 1}}>
                                 <div style={{fontWeight:'700', fontSize:'1rem', color:'#1f2937', marginBottom:'4px'}}>
                                     {task.title}
                                 </div>
                                 <div style={{fontSize:'0.85rem', color:'#64748b', marginBottom:'8px'}}>
                                     Hạn chót: {new Date(task.endTime).toLocaleDateString('vi-VN')}
                                 </div>
                                 
                                 {/* Progress Bar */}
                                 <div style={{width:'100%', height:'8px', background:'#f1f5f9', borderRadius:'4px', marginBottom:'8px', overflow:'hidden'}}>
                                     <div style={{width: `${task.progress}%`, height:'100%', background: evalResult.color, borderRadius:'4px'}}></div>
                                 </div>
                                 <div style={{fontSize:'0.85rem', color:'#6b7280'}}>
                                     Tiến độ: <strong>{task.progress}%</strong>
                                 </div>
                             </div>
                             <div style={{textAlign:'right', minWidth: '120px'}}>
                                 <div style={{fontSize:'1.4rem', marginBottom:'4px'}}>{evalResult.icon}</div>
                                 <div style={{
                                     color: evalResult.color, 
                                     fontWeight:'700', 
                                     fontSize:'0.85rem',
                                     background: `${evalResult.color}15`, 
                                     padding: '4px 10px',
                                     borderRadius: '6px',
                                     display: 'inline-block'
                                 }}>
                                     {evalResult.grade}
                                 </div>
                                 <div style={{fontSize:'0.75rem', color:'#9ca3af', marginTop:'4px'}}>
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
    tabBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', whiteSpace: 'nowrap' },
    card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
    kpiCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' },
    filterSelect: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', color: '#374151', cursor: 'pointer', background: 'white', fontWeight: '600' }
};

export default Performance;