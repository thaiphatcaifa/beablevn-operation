import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// --- ICONS MINIMALIST (#003366) ---
const Icons = {
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
  Clock: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ButtonIconIn: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
       <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  ButtonIconOut: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
       <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
};

const Attendance = () => {
  const { user } = useAuth();
  const { tasks, attendanceLogs, addAttendance, updateAttendanceLog } = useData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myTasks = tasks
    .filter(t => t.assigneeId === user.id)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const handleCheckIn = (task) => {
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);

    if (now < start) {
      alert(`Chưa đến giờ bắt đầu nhiệm vụ! Vui lòng đợi đến ${start.toLocaleTimeString()}`);
      return;
    }

    if (now > end) {
       if(!window.confirm("Đã quá giờ kết thúc nhiệm vụ! Bạn có chắc chắn muốn Check-in muộn không?")) return;
    }

    addAttendance({
      taskId: task.id,
      taskTitle: task.title,
      staffId: user.id,
      staffName: user.name,
      checkIn: new Date().toISOString(),
      checkOut: null,
      status: 'Working'
    });
    alert(`✅ Check-in thành công: ${task.title}`);
  };

  const handleCheckOut = (logId) => {
    if(window.confirm("Xác nhận kết thúc ca làm việc này?")) {
        updateAttendanceLog(logId, {
            checkOut: new Date().toISOString(),
            status: 'Completed'
        });
        alert("👋 Check-out thành công!");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#003366', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', fontWeight: '700' }}>
        Chấm công theo Nhiệm vụ
      </h2>
      
      <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Icons.Clock /> Thời gian hiện tại: <strong style={{color: '#111827'}}>{now.toLocaleString('vi-VN')}</strong>
      </div>

      {myTasks.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: '#9ca3af' }}>Bạn chưa được giao nhiệm vụ nào.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {myTasks.map(task => {
            const start = new Date(task.startTime);
            const end = new Date(task.endTime);
            
            const logsForTask = attendanceLogs.filter(l => l.taskId === task.id && l.staffId === user.id);
            const activeLog = logsForTask.length > 0 ? logsForTask[logsForTask.length - 1] : null;
            
            const isCheckedIn = activeLog && !activeLog.checkOut; 
            const isCompleted = activeLog && activeLog.checkOut;

            const isUpcoming = now < start;
            const isExpired = now > end;

            return (
              <div key={task.id} style={{
                background: 'white', borderRadius: '12px', padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                borderLeft: isCompleted ? '5px solid #059669' : (isCheckedIn ? '5px solid #003366' : '5px solid #d1d5db'),
                opacity: isExpired && !isCheckedIn && !isCompleted ? 0.7 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#003366' }}>{task.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#4b5563' }}>
                      <Icons.Clock />
                      <span>{start.toLocaleString()}</span> 
                      <span>➝</span>
                      <span>{end.toLocaleString()}</span>
                    </div>
                    <div style={{fontSize: '0.8rem', marginTop: '5px', color: '#6b7280'}}>
                        Vai trò: <strong>{task.assignedRole}</strong> | Loại: {task.paymentType}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                     {isCompleted ? (
                         <span style={styles.badgeSuccess}>Đã hoàn thành</span>
                     ) : isCheckedIn ? (
                         <span style={styles.badgeActive}>Đang làm việc</span>
                     ) : (
                         <span style={styles.badgePending}>Chưa Check-in</span>
                     )}
                  </div>
                </div>

                <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #f3f4f6' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', flex: 1 }}>
                        {activeLog ? (
                            <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'6px', color: '#059669', fontWeight: '500'}}>
                                    <Icons.CheckIn /> 
                                    Vào: {new Date(activeLog.checkIn).toLocaleTimeString()} 
                                </div>
                                {activeLog.checkOut && (
                                    <div style={{display:'flex', alignItems:'center', gap:'6px', color: '#b91c1c', fontWeight: '500'}}>
                                        <Icons.CheckOut />
                                        Ra: {new Date(activeLog.checkOut).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {isUpcoming && <span style={{color: '#d97706', fontStyle:'italic'}}>⏳ Chưa đến giờ làm việc</span>}
                                {isExpired && <span style={{color: '#ef4444', fontStyle:'italic'}}>⛔ Đã quá hạn check-in</span>}
                                {!isUpcoming && !isExpired && <span style={{color: '#003366', fontWeight:'500'}}>✨ Sẵn sàng check-in</span>}
                            </>
                        )}
                    </div>

                    <div>
                        {!isCheckedIn && !isCompleted && (
                            <button 
                                onClick={() => handleCheckIn(task)}
                                disabled={isUpcoming}
                                style={{
                                    ...styles.btn,
                                    background: isUpcoming ? '#e5e7eb' : '#003366',
                                    color: isUpcoming ? '#9ca3af' : 'white',
                                    cursor: isUpcoming ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                    <Icons.ButtonIconIn /> Check-in
                                </div>
                            </button>
                        )}

                        {isCheckedIn && (
                            <button 
                                onClick={() => handleCheckOut(activeLog.id)}
                                style={{
                                    ...styles.btn,
                                    background: 'white',
                                    border: '1px solid #b91c1c',
                                    color: '#b91c1c'
                                }}
                            >
                                <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                                    <Icons.ButtonIconOut /> Check-out
                                </div>
                            </button>
                        )}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
    btn: {
        padding: '8px 20px',
        borderRadius: '6px',
        border: 'none',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    badgeSuccess: {
        background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
    },
    badgeActive: {
        background: '#e0f2fe', color: '#003366', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
    },
    badgePending: {
        background: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
    }
};

export default Attendance;