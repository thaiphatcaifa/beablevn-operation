import React, { useState } from 'react';
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

// --- BỘ ICON MINIMALIST MỚI (#003366) ---
const Icons = {
  // Icon Lịch cho Chấm công Scheduler
  Schedule: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  // Icon Check-in/out cho Ca làm việc cũ
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
  ButtonIconIn: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" /></svg>),
  ButtonIconOut: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>)
};

const Attendance = () => {
  const { user } = useAuth();
  const { shifts, attendanceLogs, addAttendance, updateAttendanceLog, tasks, updateTaskProgress } = useData();

  // --- STATE BỘ LỌC THỜI GIAN ---
  const [timeFilter, setTimeFilter] = useState('month'); 

  // ==========================================
  // PHẦN 1: LOGIC CHẤM CÔNG THEO LỊCH SCHEDULER
  // ==========================================
  const myScheduleTasks = tasks.filter(t => t.assigneeId === user.id && t.fromScheduleId);
  const filteredScheduleTasks = myScheduleTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const now = new Date();
      if (timeFilter === 'day') return isSameDay(taskDate, now);
      if (timeFilter === 'week') return isSameWeek(taskDate, now);
      if (timeFilter === 'month') return isSameMonth(taskDate, now);
      return true;
  });
  filteredScheduleTasks.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const handleSchedulerCheck = (task) => {
      if(window.confirm("Xác nhận hoàn thành ca làm việc này?")) {
          updateTaskProgress(task.id, 100, "Check-out attendance");
      }
  };

  // ==========================================
  // PHẦN 2: LOGIC CA LÀM VIỆC (GIỮ NGUYÊN ĐỂ TƯƠNG THÍCH)
  // ==========================================
  const myShifts = shifts.filter(s => s.staffId === user.id);
  const handleCheckIn = (shiftId) => {
    if (window.confirm('Xác nhận Check-in?')) {
      addAttendance({
        shiftId, staffId: user.id, date: new Date().toISOString(),
        checkIn: new Date().toISOString(), status: 'Present'
      });
    }
  };
  const handleCheckOut = (logId) => {
    if (window.confirm('Xác nhận Check-out?')) {
      updateAttendanceLog(logId, { checkOut: new Date().toISOString() });
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* HEADER + DROPBOX LỌC */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom: '1px solid #e5e7eb', paddingBottom:'15px'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icons.Schedule />
              <div>
                  <h2 style={{ color: '#003366', margin: 0, fontWeight: '700' }}>Chấm công cá nhân</h2>
                  <p style={{fontSize:'0.85rem', color:'#6b7280', margin:'4px 0 0 0'}}>Theo lịch công tác (Scheduler)</p>
              </div>
          </div>
          <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              style={styles.filterSelect}
          >
              <option value="day">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
          </select>
      </div>

      {/* --- SECTION: DANH SÁCH LỊCH LÀM VIỆC SCHEDULER --- */}
      <div style={{display: 'grid', gap: '15px', marginBottom: '40px'}}>
           {filteredScheduleTasks.length > 0 ? filteredScheduleTasks.map(task => {
               const start = new Date(task.startTime);
               const end = new Date(task.endTime);
               const isCompleted = task.status === 'completed' || task.progress === 100;
               const isFuture = start > new Date();

               return (
                   <div key={task.id} style={{
                       ...styles.scheduleItem,
                       borderLeft: `5px solid ${isCompleted ? '#10b981' : (isFuture ? '#cbd5e1' : '#003366')}`
                   }}>
                       <div>
                           <div style={{fontWeight:'700', color:'#1e293b', fontSize:'1rem'}}>{task.title}</div>
                           <div style={{fontSize:'0.85rem', color:'#64748b', marginTop:'4px'}}>
                               📅 {start.toLocaleDateString('vi-VN')} &nbsp;|&nbsp; 
                               ⏰ {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                           <div style={{marginTop:'8px', display:'flex', gap:'8px'}}>
                               <span style={styles.roleBadge}>Vai trò: {task.assignedRole}</span>
                               {isCompleted && <span style={styles.doneBadge}>✓ Đã chấm công</span>}
                           </div>
                       </div>

                       {!isCompleted && !isFuture && (
                           <button onClick={() => handleSchedulerCheck(task)} style={styles.mainBtn}>
                               Chấm công
                           </button>
                       )}
                       {isFuture && <span style={styles.futureText}>Chưa diễn ra</span>}
                       {isCompleted && (
                           <div style={styles.checkCircle}>
                               <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                           </div>
                       )}
                   </div>
               )
           }) : (
               <div style={styles.emptyState}>
                   Không có lịch làm việc (Scheduler) trong khoảng thời gian này.
               </div>
           )}
      </div>

      {/* --- SECTION: CA LÀM VIỆC CŨ (GIỮ NGUYÊN CODE CŨ) --- */}
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
                          <button onClick={() => handleCheckIn(shift.id)} style={styles.mainBtn}>
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
                                  <button onClick={() => handleCheckOut(todayLog.id)} style={styles.outBtn}>
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
    filterSelect: {
        padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', 
        outline: 'none', fontWeight: '600', color: '#003366', cursor: 'pointer', background: 'white'
    },
    scheduleItem: {
        background: 'white', padding: '18px', borderRadius: '12px', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s'
    },
    shiftCard: {
        background: 'white', padding: '20px', borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderLeft: '5px solid #003366'
    },
    mainBtn: {
        background: '#003366', color: 'white', border: 'none', padding: '10px 18px', 
        borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem',
        boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)'
    },
    outBtn: {
        background: 'white', border: '1px solid #ef4444', color: '#ef4444', 
        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem'
    },
    roleBadge: { fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#475569', fontWeight: '600' },
    doneBadge: { fontSize: '0.75rem', color: '#10b981', fontWeight: '700', marginLeft: '5px' },
    badgeSuccess: { background: '#ecfdf5', color: '#059669', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' },
    badgeActive: { background: '#e0f2fe', color: '#003366', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' },
    checkCircle: { width: '36px', height: '36px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    futureText: { fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: '500' },
    emptyState: { textAlign: 'center', padding: '50px', color: '#94a3b8', fontStyle: 'italic', background: 'white', borderRadius: '16px', border: '1px dashed #e2e8f0' }
};

export default Attendance;