import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Task: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>),
  Schedule: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Clock: () => (<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Check: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>)
};

const formatNotiTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const { tasks, schedules } = useData();
  const [notifications, setNotifications] = useState([]);
  
  // State lưu danh sách ID đã đọc (lấy từ localStorage)
  const [readNotiIds, setReadNotiIds] = useState(() => {
      const saved = localStorage.getItem('readNotifications');
      return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
      if (!user) return;

      // 1. Lấy Task mới
      const recentTasks = tasks
          .filter(t => t.assigneeId === user.id && !t.fromScheduleId)
          .map(t => ({
              id: t.id,
              type: 'task',
              title: `Nhiệm vụ mới: ${t.title}`,
              desc: t.description || 'Không có mô tả chi tiết',
              time: t.createdDate || new Date().toISOString(),
              isNew: (new Date() - new Date(t.createdDate)) < 259200000
          }));

      // 2. Lấy Lịch mới
      const recentSchedules = schedules
          .filter(s => s.assigneeId === user.id)
          .map(s => ({
              id: s.id,
              type: 'schedule',
              title: `Lịch công tác mới: ${s.title}`,
              desc: `Lặp lại ${s.repeatWeeks} tuần vào ${s.repeatDays?.join(', ')}`,
              time: s.createdAt || new Date().toISOString(),
              isNew: (new Date() - new Date(s.createdAt)) < 259200000
          }));

      // 3. Gộp và lọc bỏ các thông báo đã đọc
      const combined = [...recentTasks, ...recentSchedules]
          .filter(n => !readNotiIds.includes(n.id)) // Lọc bỏ đã đọc
          .sort((a, b) => new Date(b.time) - new Date(a.time));

      setNotifications(combined);

  }, [tasks, schedules, user, readNotiIds]);

  // Hàm xử lý khi bấm "Đã xem"
  const markAsRead = (id) => {
      const newReadIds = [...readNotiIds, id];
      setReadNotiIds(newReadIds);
      localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '1.2rem', fontWeight: 'bold' }}>Thông báo</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {notifications.map(notif => (
                <div key={notif.id} style={{
                    background: 'white', padding: '16px', borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    borderLeft: notif.type === 'schedule' ? '4px solid #f59e0b' : '4px solid #003366',
                    position: 'relative'
                }}>
                    {notif.isNew && (
                        <span style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: 'bold',
                            padding: '2px 6px', borderRadius: '4px'
                        }}>Mới</span>
                    )}
                    
                    <div style={{display:'flex', gap:'12px', alignItems: 'flex-start'}}>
                        <div style={{
                            minWidth:'40px', height:'40px', borderRadius:'50%', 
                            background: notif.type === 'schedule' ? '#fffbeb' : '#eff6ff',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            marginTop: '2px'
                        }}>
                            {notif.type === 'schedule' ? <Icons.Schedule /> : <Icons.Task />}
                        </div>
                        <div style={{flex:1}}>
                            <div style={{fontWeight:'700', fontSize:'0.95rem', color:'#1f2937', marginBottom: '4px', paddingRight: '35px'}}>
                                {notif.title}
                            </div>
                            <div style={{fontSize:'0.85rem', color:'#4b5563', marginBottom:'8px', lineHeight: '1.4'}}>
                                {notif.desc}
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}}>
                                <div style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'0.75rem', color:'#9ca3af'}}>
                                    <Icons.Clock /> {formatNotiTime(notif.time)}
                                </div>
                                {/* NÚT ĐÃ XEM */}
                                <button 
                                    onClick={() => markAsRead(notif.id)}
                                    style={{
                                        border: '1px solid #d1d5db', background: 'white', color: '#4b5563',
                                        padding: '4px 8px', borderRadius: '6px', cursor: 'pointer',
                                        fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <Icons.Check /> Đã xem
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {notifications.length === 0 && (
                <div style={{textAlign:'center', color:'#9ca3af', marginTop:'60px', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
                    <div style={{fontSize: '3rem'}}>🎉</div>
                    <div>Bạn đã xem hết các thông báo mới!</div>
                </div>
            )}
        </div>
    </div>
  );
};

export default StaffDashboard;