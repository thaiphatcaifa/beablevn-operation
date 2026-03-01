import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

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

// --- BỘ ICON MINIMALIST (#003366) ---
const Icons = {
  Schedule: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  CheckIn: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  CheckOut: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  ButtonIconIn: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  ButtonIconOut: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  Exclamation: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#b45309" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  )
};

const Attendance = () => {
  const { user } = useAuth();
  const { shifts, attendanceLogs, addAttendance, updateAttendanceLog, tasks, updateTaskProgress, updateTask } = useData();

  const [timeFilter, setTimeFilter] = useState('month'); 
  const [selectedMonthYear, setSelectedMonthYear] = useState('all'); // State mới cho dropbox tháng/năm
  const [now, setNow] = useState(new Date());

  // Cập nhật thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lọc danh sách tasks của nhân viên
  const myScheduleTasks = tasks.filter(t => t.assigneeId === user.id && t.fromScheduleId);
  
  const filteredScheduleTasks = myScheduleTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const currentTime = new Date();

      // Lọc theo Dropbox Tháng/Năm cụ thể (nếu có chọn)
      if (selectedMonthYear !== 'all') {
          const [selYear, selMonth] = selectedMonthYear.split('-');
          if (taskDate.getFullYear() !== parseInt(selYear) || (taskDate.getMonth() + 1) !== parseInt(selMonth)) {
              return false;
          }
      }

      // Lọc theo khoảng thời gian tương đối
      if (timeFilter === 'day' && !isSameDay(taskDate, currentTime)) return false;
      if (timeFilter === 'week' && !isSameWeek(taskDate, currentTime)) return false;
      if (timeFilter === 'month' && !isSameMonth(taskDate, currentTime)) return false;

      return true;
  });
  
  // Sắp xếp theo giờ bắt đầu
  filteredScheduleTasks.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // --- 1. XỬ LÝ CHECK-IN (SCHEDULER) ---
  const handleSchedulerCheckIn = (task) => {
      const startTime = new Date(task.startTime);
      const diffMinutes = (now - startTime) / 60000; 

      if (diffMinutes < -15) {
          alert(`Chưa đến giờ! Bạn chỉ có thể check-in từ ${new Date(startTime.getTime() - 15*60000).toLocaleTimeString()}.`);
          return;
      }

      let updateData = { 
          checkInTime: new Date().toISOString(),
          status: 'in_progress' 
      };
      let msg = "Check-in thành công!";

      if (diffMinutes > 3) {
          updateData.checkInStatus = 'Late';
          updateData.lateReason = 'Trễ quá 3 phút';
          msg = "CẢNH BÁO: Bạn đã check-in TRỄ quá 3 phút! Hệ thống đã ghi nhận.";
      } else {
          updateData.checkInStatus = 'OnTime';
      }

      updateTask(task.id, updateData);
      alert(msg);
  };

  // --- 2. XỬ LÝ CHECK-OUT (SCHEDULER) ---
  const handleSchedulerCheckOut = (task) => {
      const endTime = new Date(task.endTime);
      const diffMinutes = (endTime - now) / 60000; 

      if (diffMinutes > 10) {
          alert(`Chưa đến giờ tan ca! Bạn chỉ được về sớm tối đa 10 phút.`);
          return;
      }

      if (diffMinutes < -15) {
          alert("Đã quá thời gian check-out (15 phút). Vui lòng dùng nút 'Giải trình'.");
          return;
      }

      if(window.confirm("Xác nhận hoàn thành ca làm việc này?")) {
          updateTaskProgress(task.id, 100, "Check-out attendance");
          updateTask(task.id, { 
              checkOutTime: new Date().toISOString(),
              status: 'completed'
          });
          alert("Check-out thành công!");
      }
  };

  // --- 3. XỬ LÝ GIẢI TRÌNH (SCHEDULER) ---
  const handleSchedulerExplain = (task) => {
      const reason = window.prompt("Đã quá giờ check-out quy định. Vui lòng nhập lý do:");
      if (reason && reason.trim() !== "") {
          updateTask(task.id, {
              checkOutTime: new Date().toISOString(),
              status: 'completed',
              progress: 100,
              checkOutStatus: 'MissedWindow',
              explanation: reason
          });
          alert("Đã gửi giải trình. Vui lòng đợi Admin duyệt.");
      }
  };

  const myShifts = shifts.filter(s => s.staffId === user.id);
  const handleCheckInOld = (shiftId) => { 
      if (window.confirm('Xác nhận Check-in?')) {
          addAttendance({ shiftId, staffId: user.id, date: new Date().toISOString(), checkIn: new Date().toISOString(), status: 'Present' }); 
      }
  };
  const handleCheckOutOld = (logId) => { 
      if (window.confirm('Xác nhận Check-out?')) {
          updateAttendanceLog(logId, { checkOut: new Date().toISOString() }); 
      }
  };

  // --- RENDER NÚT BẤM (QUAN TRỌNG) ---
  const renderActionButton = (task, diffStart, diffEnd, isCheckedIn, isCompleted) => {
      if (isCompleted) {
          return (
              <div style={styles.checkCircle}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
              </div>
          );
      }

      if (!isCheckedIn) {
          if (diffStart < -15) {
              return (
                  <button style={{...styles.mainBtn, background: '#e2e8f0', color: '#94a3b8', cursor: 'not-allowed'}}>
                      Chưa đến giờ
                  </button>
              );
          }
          if (diffStart > 3) {
              return (
                  <button onClick={() => handleSchedulerCheckIn(task)} style={{...styles.mainBtn, background: '#ef4444'}}>
                      Vào ca (Trễ)
                  </button>
              );
          }
          return (
              <button onClick={() => handleSchedulerCheckIn(task)} style={styles.mainBtn}>
                  Check-in
              </button>
          );
      }

      if (isCheckedIn) {
          if (diffEnd < -15) {
              return (
                  <button onClick={() => handleSchedulerExplain(task)} style={styles.explainBtn}>
                      <Icons.Exclamation /> Giải trình
                  </button>
              );
          }
          return (
              <button onClick={() => handleSchedulerCheckOut(task)} style={styles.outBtn}>
                  Check-out
              </button>
          );
      }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '15px', marginBottom:'20px', borderBottom: '1px solid #e5e7eb', paddingBottom:'15px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icons.Schedule />
              <div>
                  <h2 style={{ color: '#003366', margin: 0, fontWeight: '700' }}>Chấm công cá nhân</h2>
                  <p style={{fontSize:'0.85rem', color:'#6b7280', margin:'4px 0 0 0'}}>Theo lịch công tác (Scheduler)</p>
              </div>
          </div>
          
          {/* BỘ LỌC */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {/* DROPBOX MỚI: LỌC THEO THÁNG CỤ THỂ (2026-2030) */}
              <select 
                  value={selectedMonthYear} 
                  onChange={(e) => {
                      setSelectedMonthYear(e.target.value);
                      if (e.target.value !== 'all') setTimeFilter('all'); // Tự động tắt lọc thời gian hiện tại
                  }} 
                  style={styles.filterSelect}
              >
                  <option value="all">Tháng cụ thể: Tất cả</option>
                  {monthYearOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
              </select>

              {/* DROPBOX CŨ: LỌC THỜI GIAN HIỆN TẠI (Đã bổ sung mục Tất cả) */}
              <select 
                  value={timeFilter} 
                  onChange={(e) => {
                      setTimeFilter(e.target.value);
                      if (e.target.value !== 'all') setSelectedMonthYear('all'); // Tự động tắt lọc tháng cụ thể
                  }} 
                  style={styles.filterSelect}
              >
                  <option value="all">Thời gian: Tất cả</option>
                  <option value="day">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
              </select>
          </div>
      </div>

      <div style={{display: 'grid', gap: '15px', marginBottom: '40px'}}>
           {filteredScheduleTasks.length > 0 ? filteredScheduleTasks.map(task => {
               const start = new Date(task.startTime);
               const end = new Date(task.endTime);
               const isCompleted = task.status === 'completed' || task.progress === 100;
               const isCheckedIn = !!task.checkInTime; 
               
               const diffStart = (now - start) / 60000;
               const diffEnd = (end - now) / 60000; 

               return (
                   <div key={task.id} style={{ ...styles.scheduleItem, borderLeft: `5px solid ${isCompleted ? '#10b981' : (isCheckedIn ? '#3b82f6' : '#cbd5e1')}` }}>
                       <div style={{flex: 1}}>
                           <div style={{fontWeight:'700', color:'#1e293b', fontSize:'1rem'}}>{task.title}</div>
                           <div style={{fontSize:'0.85rem', color:'#64748b', marginTop:'4px'}}>
                               📅 {start.toLocaleDateString('vi-VN')} &nbsp;|&nbsp; 
                               ⏰ {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                           <div style={{marginTop:'8px', display:'flex', gap:'8px', flexWrap:'wrap', alignItems: 'center'}}>
                               <span style={styles.roleBadge}>{task.assignedRole}</span>
                               {task.checkInStatus === 'Late' && <span style={styles.lateBadge}>⚠️ Trễ giờ</span>}
                               {isCheckedIn && !isCompleted && <span style={styles.workingBadge}>Đang làm việc</span>}
                               
                               {/* NẾU ADMIN CHỈNH SỬA, HIỂN THỊ DÒNG THÔNG BÁO Ở ĐÂY */}
                               {task.adminEdited && (
                                   <span style={{fontSize:'0.75rem', fontStyle:'italic', color:'#c2410c', fontWeight:'bold'}}>
                                       (Được sửa bởi Admin: {task.adminEditReason})
                                   </span>
                               )}
                           </div>
                       </div>
                       <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px'}}>
                           {renderActionButton(task, diffStart, diffEnd, isCheckedIn, isCompleted)}
                       </div>
                   </div>
               )
           }) : (
               <div style={styles.emptyState}>Không có lịch làm việc phù hợp với bộ lọc.</div>
           )}
      </div>

      {myShifts.length > 0 && (
        <div style={{borderTop: '1px solid #e5e7eb', paddingTop: '25px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Icons.CheckIn />
              <h3 style={{ color: '#003366', fontSize:'1.1rem', margin: 0, fontWeight: '700' }}>Ca làm việc đăng ký (Cũ)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {myShifts.map(shift => {
              const todayLog = attendanceLogs.find(l => l.shiftId === shift.id && new Date(l.date).toDateString() === new Date().toDateString());
              return (
                <div key={shift.id} style={styles.shiftCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{shift.shiftName}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{shift.timeRange}</span>
                  </div>
                  <div style={{ marginTop: '15px' }}>
                      {!todayLog ? (
                          <button onClick={() => handleCheckInOld(shift.id)} style={styles.mainBtn}>
                              <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                  <Icons.ButtonIconIn /> Check-in
                              </div>
                          </button>
                      ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={todayLog.checkOut ? styles.badgeSuccess : styles.badgeActive}>
                                  {todayLog.checkOut ? 'Đã hoàn thành' : 'Đang làm việc'}
                              </span>
                              {!todayLog.checkOut && (
                                  <button onClick={() => handleCheckOutOld(todayLog.id)} style={styles.outBtn}>
                                      <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                          <Icons.ButtonIconOut /> Check-out
                                      </div>
                                  </button>
                              )}
                          </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
    filterSelect: { padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontWeight: '600', color: '#003366', cursor: 'pointer', background: 'white' },
    scheduleItem: { background: 'white', padding: '18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s', gap: '10px' },
    shiftCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '5px solid #003366' },
    mainBtn: { background: '#003366', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)', whiteSpace: 'nowrap' },
    outBtn: { background: 'white', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', whiteSpace: 'nowrap' },
    explainBtn: { background: '#fff7ed', border: '1px solid #f97316', color: '#c2410c', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', display:'flex', alignItems:'center', gap:'5px', whiteSpace: 'nowrap' },
    roleBadge: { fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#475569', fontWeight: '600' },
    lateBadge: { fontSize: '0.75rem', background: '#fef2f2', padding: '4px 10px', borderRadius: '6px', color: '#dc2626', fontWeight: '700' },
    workingBadge: { fontSize: '0.75rem', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', color: '#2563eb', fontWeight: '700' },
    checkCircle: { width: '36px', height: '36px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    badgeSuccess: { background: '#ecfdf5', color: '#059669', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' },
    badgeActive: { background: '#e0f2fe', color: '#003366', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' },
    emptyState: { textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic', background: 'white', borderRadius: '16px', border: '1px dashed #e2e8f0' }
};

export default Attendance;