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

// --- ICON MINIMALIST ---
const Icons = {
  History: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  )
};

const Performance = () => {
  const { user } = useAuth();
  const { staffList, tasks } = useData();
  
  const safeStaffList = Array.isArray(staffList) ? staffList : [];
  const currentUser = safeStaffList.find(s => String(s.id) === String(user.id)) || user;
  
  const [incomeFilter, setIncomeFilter] = useState('Month'); 
  const now = new Date();

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const myTasks = safeTasks.filter(t => String(t.assigneeId) === String(user.id));
  const completedTasks = myTasks.filter(t => t.status === 'completed' && t.finishedAt);

  const evaluateTask = (task) => {
      const deadline = new Date(task.endTime);
      const finished = new Date(task.finishedAt);
      const progress = task.progress || 0;
      const diffTime = deadline - finished; 
      const diffDaysEarly = diffTime / (1000 * 3600 * 24); 
      const diffDaysLate = -diffDaysEarly;

      if (progress === 100 && diffDaysEarly >= 1) return { grade: "Xuất sắc", color: "#6f42c1", icon: "🏆", desc: "Sớm hơn 1 ngày" };
      if (progress >= 90 && diffDaysEarly >= 0) return { grade: "Tốt", color: "#198754", icon: "🌟", desc: "Đúng hạn" };
      if (progress >= 70 && progress <= 85 && diffDaysEarly >= 0) return { grade: "Cần điều chỉnh", color: "#fd7e14", icon: "⚠️", desc: "Đạt mức trung bình" };
      if (progress >= 60 && progress <= 70 && diffDaysLate > 3) return { grade: "Cảnh cáo", color: "#dc3545", icon: "⛔", desc: "Trễ quá 3 ngày" };
      return { grade: "Kỷ luật / Không đạt", color: "#343a40", icon: "🔨", desc: "Không đạt yêu cầu" };
  };

  // --- LOGIC TÍNH LƯƠNG NHÂN VỚI GIỜ LÀM VIỆC ---
  let ubiMultiplier = 1;
  const myScheduleTasks = myTasks.filter(t => t.fromScheduleId);

  const filteredScheduleTasks = myScheduleTasks.filter(t => {
      if (!t.startTime) return false;
      const d = new Date(t.startTime);
      if (isNaN(d.getTime())) return false;
      
      if (incomeFilter === 'Day') return isSameDay(d, now);
      if (incomeFilter === 'Week') return isSameWeek(d, now);
      if (incomeFilter === 'Month') return isSameMonth(d, now);
      if (incomeFilter === 'Year') return isSameYear(d, now);
      return true;
  });

  if (incomeFilter === 'Day') ubiMultiplier = 1 / 30;
  if (incomeFilter === 'Week') ubiMultiplier = 1 / 4;
  if (incomeFilter === 'Month') ubiMultiplier = 1;
  if (incomeFilter === 'Year') ubiMultiplier = 12;

  // 1. Tính UBI
  const ubi1Month = parseAmount(currentUser.ubi1Base) * getPercent(currentUser.ubi1Percent) / 100;
  const ubi2Month = parseAmount(currentUser.ubi2Base) * getPercent(currentUser.ubi2Percent) / 100;
  
  const activeUbi1 = ubi1Month * ubiMultiplier;
  const activeUbi2 = ubi2Month * ubiMultiplier;
  const totalUBI = activeUbi1 + activeUbi2;

  // 2. Tính Tổng giờ & Lưu danh sách mức lương
  let totalMatchedHours = 0;
  let matchedTasksList = [];

  filteredScheduleTasks.forEach(task => {
      if (!currentUser.remunerations || !Array.isArray(currentUser.remunerations)) return;
      if (!task.checkInTime || !task.checkOutTime) return;

      const matchedRule = currentUser.remunerations.find(rem => {
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

  // 3. ÁP DỤNG THUẬT TOÁN GIỜ TỐI THIỂU
  let activeRemuneration = 0;
  const minHoursThreshold = parseAmount(currentUser.minWorkHours) * ubiMultiplier;

  if (totalMatchedHours >= minHoursThreshold) {
      // Đạt tối thiểu: Sắp xếp theo Rate TĂNG DẦN (thấp bù trước)
      matchedTasksList.sort((a, b) => a.rate - b.rate);
      
      let hoursToOffset = minHoursThreshold;

      matchedTasksList.forEach(t => {
          if (hoursToOffset > 0) {
              if (t.hours <= hoursToOffset) {
                  hoursToOffset -= t.hours;
                  t.hours = 0; // Đã dùng để bù UBI
              } else {
                  t.hours -= hoursToOffset;
                  hoursToOffset = 0; // Đã bù đủ
              }
          }
          // Giờ vượt mức được nhân với rate
          if (t.hours > 0) {
              activeRemuneration += t.hours * t.rate;
          }
      });
  } else {
      // Dưới tối thiểu: Không được tính Remuneration
      activeRemuneration = 0;
  }

  const estimatedIncome = totalUBI + activeRemuneration;
  const excessHours = Math.max(0, totalMatchedHours - minHoursThreshold);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{color:'#003366', fontSize:'1.5rem', fontWeight:'700'}}>Hiệu suất & Thu nhập</h2>
      
      {/* 1. TỔNG QUAN THU NHẬP */}
      <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '30px', border: '1px solid #f3f4f6'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'15px', marginBottom:'15px'}}>
            <h4 style={{margin:0, color:'#374151', fontSize:'1rem'}}>Tổng thu nhập ước tính</h4>
            <select value={incomeFilter} onChange={e => setIncomeFilter(e.target.value)} style={{padding:'8px', borderRadius:'6px', border:'1px solid #d1d5db', outline:'none', fontSize:'0.9rem'}}>
                <option value="Day">Hôm nay</option>
                <option value="Week">Tuần này</option>
                <option value="Month">Tháng này</option>
                <option value="Year">Năm nay</option>
            </select>
          </div>
          
          <div style={{textAlign:'center', marginBottom:'20px'}}>
             <h1 style={{color: '#059669', fontSize:'2.2rem', margin:0, fontWeight:'700'}}>{Math.round(estimatedIncome).toLocaleString('vi-VN')} VNĐ</h1>
             <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Thu nhập dự kiến ({incomeFilter})</span>
          </div>

          <div style={{background:'#f9fafb', padding:'15px', borderRadius:'8px', display:'grid', gap:'12px', border:'1px solid #f3f4f6'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                  <span style={{color:'#4b5563'}}>UBI 1 (Cơ bản):</span>
                  <strong style={{color:'#111827'}}>{Math.round(activeUbi1).toLocaleString()} đ</strong>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                  <span style={{color:'#4b5563'}}>UBI 2 (Hiệu suất):</span>
                  <strong style={{color:'#111827'}}>{Math.round(activeUbi2).toLocaleString()} đ</strong>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                  <span style={{color:'#4b5563'}}>Giờ làm thực tế (Tối thiểu {minHoursThreshold.toFixed(1)}h):</span>
                  <strong style={{color: totalMatchedHours >= minHoursThreshold ? '#059669' : '#dc2626'}}>{totalMatchedHours.toFixed(1)} giờ</strong>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                  <span style={{color:'#4b5563'}}>Thù lao vượt mức ({excessHours.toFixed(1)} giờ):</span>
                  <strong style={{color:'#003366'}}>{Math.round(activeRemuneration).toLocaleString()} đ</strong>
              </div>
          </div>
      </div>

      {/* 2. ĐÁNH GIÁ CHI TIẾT THEO TASK */}
      <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6'}}>
         <div style={{display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #f3f4f6', paddingBottom:'15px', marginBottom:'20px'}}>
             <Icons.History />
             <h3 style={{margin:0, color:'#003366', fontSize:'1.1rem', fontWeight:'600'}}>Lịch sử đánh giá nhiệm vụ</h3>
         </div>
         
         {completedTasks.length === 0 ? (
             <p style={{color:'#9ca3af', fontStyle:'italic', textAlign:'center', padding:'20px'}}>Chưa có dữ liệu đánh giá.</p>
         ) : (
             <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                 {completedTasks.sort((a,b) => new Date(b.finishedAt) - new Date(a.finishedAt)).map(task => {
                     const evalResult = evaluateTask(task);
                     return (
                         <div key={task.id} style={{
                             border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px',
                             borderLeft: `5px solid ${evalResult.color}`,
                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                             background: '#fff'
                         }}>
                             <div>
                                 <div style={{fontWeight:'600', color:'#111827', fontSize:'1rem'}}>{task.title}</div>
                                 <div style={{fontSize:'0.85rem', color:'#6b7280', marginTop:'4px'}}>
                                     Hoàn thành: {new Date(task.finishedAt).toLocaleString()}
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

export default Performance;