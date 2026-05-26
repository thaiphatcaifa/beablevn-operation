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

// --- BỘ ICON MINIMALIST ĐỒNG BỘ ---
const Icons = {
  Schedule: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  CheckIn: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  ButtonIconIn: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  ButtonIconOut: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  Exclamation: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Check: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
};

const Attendance = () => {
  const { user } = useAuth();
  const { shifts, attendanceLogs, addAttendance, updateAttendanceLog, tasks, updateTaskProgress, updateTask } = useData();

  const [timeFilter, setTimeFilter] = useState('day'); 
  const [selectedMonthYear, setSelectedMonthYear] = useState('all'); 
  const [now, setNow] = useState(new Date());

  // KHẮC PHỤC LỖI IOS BỊ ĐÓNG BĂNG THỜI GIAN
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            setNow(new Date());
        }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
        clearInterval(timer);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const myScheduleTasks = tasks.filter(t => t.assigneeId === user.id && t.fromScheduleId);
  
  const filteredScheduleTasks = myScheduleTasks.filter(t => {
      let safeStartStr = t.startTime;
      if(safeStartStr && safeStartStr.includes('T')) {}
      const taskDate = new Date(t.startTime);
      const currentTime = new Date();

      if (selectedMonthYear !== 'all') {
          const [selYear, selMonth] = selectedMonthYear.split('-');
          if (taskDate.getFullYear() !== parseInt(selYear) || (taskDate.getMonth() + 1) !== parseInt(selMonth)) {
              return false;
          }
      }

      if (timeFilter === 'day' && !isSameDay(taskDate, currentTime)) return false;
      if (timeFilter === 'week' && !isSameWeek(taskDate, currentTime)) return false;
      if (timeFilter === 'month' && !isSameMonth(taskDate, currentTime)) return false;

      return true;
  });
  
  filteredScheduleTasks.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  // --- 1. XỬ LÝ CHECK-IN ---
  const handleSchedulerCheckIn = (task) => {
      const exactNow = new Date();
      const startTime = new Date(task.startTime);
      const diffMinutes = (exactNow - startTime) / 60000; 

      let updateData = { 
          ...task, // BẢO TOÀN DỮ LIỆU CŨ TRÁNH GHI ĐÈ KÉP
          checkInTime: exactNow.toISOString(),
          status: 'in_progress' 
      };
      let msg = "Check-in thành công!";

      // Kiểm tra hợp lệ: Đi sớm hoặc đi đúng giờ thì ok, quá 3 phút thì tính là trễ
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

  // --- 2. XỬ LÝ CHECK-OUT ---
  const handleSchedulerCheckOut = (task) => {
      const exactNow = new Date();
      const endTime = new Date(task.endTime);
      const diffMinutes = (endTime - exactNow) / 60000; 

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
              ...task, // BẢO TOÀN DỮ LIỆU CŨ BAO GỒM GIỜ VÀO CA TRÁNH GHI ĐÈ
              checkOutTime: exactNow.toISOString(),
              status: 'completed'
          });
          alert("Check-out thành công!");
      }
  };

  // --- 3. XỬ LÝ GIẢI TRÌNH ---
  const handleSchedulerExplain = (task) => {
      const exactNow = new Date();
      const reason = window.prompt("Đã quá giờ check-out quy định. Vui lòng nhập lý do:");
      if (reason && reason.trim() !== "") {
          updateTask(task.id, {
              ...task, // BẢO TOÀN DỮ LIỆU CŨ BAO GỒM GIỜ VÀO CA
              checkOutTime: exactNow.toISOString(),
              status: 'completed',
              progress: 100,
              checkOutStatus: 'MissedWindow',
              explanation: reason
          });
          alert("Đã gửi giải trình. Vui lòng đợi Admin duyệt.");
      }
  };

  // --- CA LÀM VIỆC CỐ ĐỊNH (HỆ CŨ) ---
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

  // --- RENDER NÚT BẤM ---
  const renderActionButton = (task, diffStart, diffEnd, isCheckedIn, isCompleted) => {
      if (isCompleted) {
          return (
              <div style={styles.checkCircle}>
                  <Icons.Check />
              </div>
          );
      }

      if (!isCheckedIn) {
          // Cho phép check-in sớm bất kì lúc nào. Chỉ hiển thị cảnh báo nếu trễ > 3 phút
          if (diffStart > 3) {
              return (
                  <button className="btn-danger" onClick={() => handleSchedulerCheckIn(task)} style={{...styles.mainBtn, background: '#ef4444'}}>
                      Vào ca (Trễ)
                  </button>
              );
          }
          return (
              <button className="btn-primary" onClick={() => handleSchedulerCheckIn(task)} style={styles.mainBtn}>
                  Check-in
              </button>
          );
      }

      if (isCheckedIn) {
          if (diffEnd < -15) {
              return (
                  <button className="btn-warning" onClick={() => handleSchedulerExplain(task)} style={styles.explainBtn}>
                      <Icons.Exclamation /> Giải trình
                  </button>
              );
          }
          return (
              <button className="btn-danger-outline" onClick={() => handleSchedulerCheckOut(task)} style={styles.outBtn}>
                  Check-out
              </button>
          );
      }
  };

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
      {/* CSS CHO HOVER EFFECTS & LAYOUT */}
      <style>{`
          .attendance-card {
              transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              box-sizing: border-box;
          }
          .attendance-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1) !important;
          }
          .btn-primary:hover { background: #002244 !important; transform: translateY(-1px); }
          .btn-danger:hover { background: #dc2626 !important; transform: translateY(-1px); }
          .btn-warning:hover { background: #ffedd5 !important; border-color: #ea580c !important; transform: translateY(-1px); }
          .btn-danger-outline:hover { background: #fef2f2 !important; transform: translateY(-1px); }
          
          .filter-modern {
              padding: 10px 14px; border-radius: 12px; border: 1px solid #e5e7eb; outline: none;
              font-weight: 600; color: #374151; background: #ffffff; cursor: pointer; font-size: 0.9rem;
              transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); appearance: none; -webkit-appearance: none;
              background-image: url('data:image/svg+xml;utf8,<svg fill="%239ca3af" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
              background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
          }
          .filter-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }

          @media (max-width: 500px) {
              .filter-container { flex-direction: column; width: 100%; }
              .filter-modern { width: 100%; box-sizing: border-box; }
              .schedule-item-mobile { flex-direction: column !important; align-items: stretch !important; gap: 16px !important; }
              .card-actions { flex-direction: row !important; width: 100%; justify-content: flex-end !important; margin-top: 0; border-top: 1px dashed #e2e8f0; padding-top: 16px; align-items: center;}
          }
      `}</style>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap', gap: '16px', marginBottom:'24px', borderBottom: '2px solid #e5e7eb', paddingBottom:'16px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
                  <Icons.Schedule />
              </div>
              <div>
                  <h2 style={{ color: '#111827', margin: 0, fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>CHẤM CÔNG CÁ NHÂN</h2>
                  <span style={{fontSize:'0.85rem', color:'#6b7280', fontWeight: '500'}}>Theo lịch công tác (Scheduler)</span>
              </div>
          </div>
          
          {/* BỘ LỌC HIỆN ĐẠI */}
          <div className="filter-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select 
                  value={selectedMonthYear} 
                  onChange={(e) => {
                      setSelectedMonthYear(e.target.value);
                      if (e.target.value !== 'all') setTimeFilter('all'); 
                  }} 
                  className="filter-modern"
              >
                  <option value="all">Tháng: Tất cả</option>
                  {monthYearOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
              </select>

              <select 
                  value={timeFilter} 
                  onChange={(e) => {
                      setTimeFilter(e.target.value);
                      if (e.target.value !== 'all') setSelectedMonthYear('all'); 
                  }} 
                  className="filter-modern"
              >
                  <option value="all">Thời gian: Tất cả</option>
                  <option value="day">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
              </select>
          </div>
      </div>

      {/* DANH SÁCH SCHEDULER TASK */}
      <div style={{display: 'grid', gap: '20px', marginBottom: '40px'}}>
           {filteredScheduleTasks.length > 0 ? filteredScheduleTasks.map(task => {
               const start = new Date(task.startTime);
               const end = new Date(task.endTime);
               const isCompleted = task.status === 'completed' || task.progress === 100;
               const isCheckedIn = !!task.checkInTime; 
               
               const diffStart = (now - start) / 60000;
               const diffEnd = (end - now) / 60000; 

               return (
                   <div key={task.id} className="attendance-card schedule-item-mobile" style={{ ...styles.scheduleItem, borderLeft: `6px solid ${isCompleted ? '#10b981' : (isCheckedIn ? '#3b82f6' : '#cbd5e1')}` }}>
                       <div style={{flex: 1, minWidth: 0}}>
                           <div style={{fontWeight:'800', color:'#1e293b', fontSize:'1.1rem', marginBottom: '12px', letterSpacing: '-0.01em', wordBreak: 'break-word', lineHeight: '1.4'}}>{task.title}</div>
                           <div style={{fontSize:'0.85rem', color:'#475569', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                               <span style={{background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', fontWeight: '600', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px'}}>📅 {start.toLocaleDateString('vi-VN')}</span>
                               <span style={{background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', fontWeight: '600', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px'}}>⏰ {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                           <div style={{marginTop:'12px', display:'flex', gap:'8px', flexWrap:'wrap', alignItems: 'center'}}>
                               <span style={styles.roleBadge}>{task.assignedRole}</span>
                               {task.checkInStatus === 'Late' && <span style={styles.lateBadge}>⚠️ Trễ giờ</span>}
                               {isCheckedIn && !isCompleted && <span style={styles.workingBadge}>Đang trong ca</span>}
                               
                               {task.adminEdited && (
                                   <span style={{fontSize:'0.8rem', background: '#ffedd5', color:'#c2410c', fontWeight:'700', padding: '4px 10px', borderRadius: '8px', border: '1px solid #fed7aa', marginTop: '4px'}}>
                                       *Sửa bởi Admin: {task.adminEditReason}
                                   </span>
                               )}
                           </div>
                       </div>
                       <div className="card-actions" style={{display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent: 'center', minWidth: '120px'}}>
                           {renderActionButton(task, diffStart, diffEnd, isCheckedIn, isCompleted)}
                       </div>
                   </div>
               )
           }) : (
               <div style={styles.emptyState}>
                   <div style={{fontSize: '3rem', marginBottom: '12px', opacity: 0.8}}>📅</div>
                   <div style={{fontWeight: '700', color: '#475569', fontSize: '1.05rem'}}>Không có lịch làm việc!</div>
                   <div style={{fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px'}}>Chưa có dữ liệu nào phù hợp với bộ lọc hiện tại.</div>
                </div>
           )}
      </div>

      {/* DANH SÁCH CA CỐ ĐỊNH CŨ */}
      {myShifts.length > 0 && (
        <div style={{borderTop: '2px solid #e5e7eb', paddingTop: '24px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', display: 'flex', color: '#475569' }}>
                  <Icons.CheckIn />
              </div>
              <h3 style={{ color: '#111827', fontSize:'1.25rem', margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>Ca làm việc cố định (Hệ cũ)</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '24px' }}>
            {myShifts.map(shift => {
              const todayLog = attendanceLogs.find(l => l.shiftId === shift.id && new Date(l.date).toDateString() === new Date().toDateString());
              return (
                <div key={shift.id} className="attendance-card" style={{...styles.shiftCard, display: 'flex', flexDirection: 'column', height: '100%'}}>
                  <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                          <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem', lineHeight: '1.4', wordBreak: 'break-word' }}>{shift.shiftName}</span>
                          <span style={{ fontSize: '0.8rem', color: '#475569', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontWeight: '700', whiteSpace: 'nowrap' }}>{shift.timeRange}</span>
                      </div>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                      {!todayLog ? (
                          <button className="btn-primary" onClick={() => handleCheckInOld(shift.id)} style={{...styles.mainBtn, width: '100%'}}>
                              <div style={{display:'flex', alignItems:'center', justifyContent: 'center', gap:'8px'}}>
                                  <Icons.ButtonIconIn /> Check-in vào ca
                              </div>
                          </button>
                      ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={todayLog.checkOut ? styles.badgeSuccess : styles.badgeActive}>
                                  {todayLog.checkOut ? 'Đã hoàn thành' : 'Đang làm việc'}
                              </span>
                              {!todayLog.checkOut && (
                                  <button className="btn-danger-outline" onClick={() => handleCheckOutOld(todayLog.id)} style={{...styles.outBtn, flex: 1, minWidth: '120px', display: 'flex', justifyContent: 'center'}}>
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
    scheduleItem: { background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', gap: '16px', border: '1px solid #f1f5f9' },
    shiftCard: { background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', borderTop: '5px solid #003366' },
    mainBtn: { background: '#003366', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)', whiteSpace: 'nowrap', transition: 'all 0.2s', boxSizing: 'border-box' },
    outBtn: { background: 'white', border: '1px solid #ef4444', color: '#ef4444', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', transition: 'all 0.2s', boxSizing: 'border-box' },
    explainBtn: { background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:'6px', whiteSpace: 'nowrap', transition: 'all 0.2s', boxSizing: 'border-box' },
    roleBadge: { fontSize: '0.75rem', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', color: '#334155', fontWeight: '700', letterSpacing: '0.01em' },
    lateBadge: { fontSize: '0.75rem', background: '#fef2f2', padding: '6px 12px', borderRadius: '8px', color: '#dc2626', fontWeight: '700', border: '1px solid #fecaca' },
    workingBadge: { fontSize: '0.75rem', background: '#eff6ff', padding: '6px 12px', borderRadius: '8px', color: '#2563eb', fontWeight: '700', border: '1px solid #bfdbfe' },
    checkCircle: { width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #a7f3d0' },
    badgeSuccess: { background: '#ecfdf5', color: '#059669', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #a7f3d0', whiteSpace: 'nowrap' },
    badgeActive: { background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' },
    emptyState: { textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' }
};

export default Attendance;