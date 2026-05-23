import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- BỘ ICONS MINIMALIST ĐỒNG BỘ ---
const Icons = {
  Bell: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={active ? "#003366" : "currentColor"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Task: () => (<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>),
  Schedule: () => (<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  EditAdmin: () => (<svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>),
  Clock: () => (<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Check: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>)
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
  
  // State quản lý việc bung rộng nội dung mô tả (Xem thêm / Thu gọn)
  const [expandedNotifIds, setExpandedNotifIds] = useState([]);

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
              isNew: (new Date() - new Date(t.createdDate)) < 259200000 // 3 ngày
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

      // 3. Lấy thông báo Admin chỉnh sửa
      const adminEdits = tasks
          .filter(t => t.assigneeId === user.id && t.adminEdited)
          .map(t => ({
              id: `edit_${t.id}_${t.adminEditTime}`, 
              type: 'admin_edit',
              title: `Quản trị viên đã chỉnh sửa chấm công`,
              desc: `Ca làm: ${t.title} - Lý do: ${t.adminEditReason}`,
              time: t.adminEditTime || new Date().toISOString(),
              isNew: (new Date() - new Date(t.adminEditTime)) < 259200000
          }));

      // Gộp và sắp xếp
      const combined = [...recentTasks, ...recentSchedules, ...adminEdits]
          .sort((a, b) => new Date(b.time) - new Date(a.time));

      setNotifications(combined);

  }, [tasks, schedules, user]);

  const markAsRead = (id) => {
      const newReadIds = [...readNotiIds, id];
      setReadNotiIds(newReadIds);
      localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
  };

  const toggleExpand = (id) => {
      if (expandedNotifIds.includes(id)) {
          setExpandedNotifIds(expandedNotifIds.filter(item => item !== id));
      } else {
          setExpandedNotifIds([...expandedNotifIds, id]);
      }
  };

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box' }}>
        <style>{`
            .notif-item {
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .notif-item:not(.read):hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1) !important;
                border-color: #bae6fd !important;
            }
            .btn-action {
                transition: all 0.2s ease;
            }
            .btn-action:hover:not(:disabled) {
                background: #f1f5f9 !important;
            }
            .btn-expand {
                transition: color 0.2s ease;
            }
            .btn-expand:hover {
                color: #0369a1 !important;
            }
        `}</style>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
                <Icons.Bell active={true} />
            </div>
            <div>
                <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>THÔNG BÁO</h2>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Cập nhật công việc mới nhất</span>
            </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {notifications.map(notif => {
                const isRead = readNotiIds.includes(notif.id);
                const isExpanded = expandedNotifIds.includes(notif.id);

                const lineClampStyle = isExpanded ? {
                    fontSize: '0.9rem', color: isRead ? '#9ca3af' : '#475569', marginBottom: '8px', lineHeight: '1.6'
                } : {
                    fontSize: '0.9rem', color: isRead ? '#9ca3af' : '#475569', marginBottom: '8px', lineHeight: '1.6',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'
                };

                return (
                    <div key={notif.id} className={`notif-item ${isRead ? 'read' : ''}`} style={{
                        background: isRead ? '#f8fafc' : '#ffffff', 
                        opacity: isRead ? 0.75 : 1,
                        padding: '24px', 
                        borderRadius: '16px',
                        boxShadow: isRead ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)',
                        border: isRead ? '1px solid #f1f5f9' : '1px solid #e2e8f0',
                        borderLeft: notif.type === 'schedule' ? '6px solid #f59e0b' : (notif.type === 'admin_edit' ? '6px solid #10b981' : '6px solid #003366'),
                        position: 'relative'
                    }}>
                        {/* BADGE "MỚI" HIỆN ĐẠI */}
                        {!isRead && notif.isNew && (
                            <span style={{
                                position: 'absolute', top: '24px', right: '24px',
                                background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', fontWeight: '800',
                                padding: '4px 10px', borderRadius: '8px', letterSpacing: '0.02em', border: '1px solid #fecaca'
                            }}>MỚI</span>
                        )}
                        
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            {/* AVATAR/ICON */}
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px', 
                                background: notif.type === 'schedule' ? '#fffbeb' : (notif.type === 'admin_edit' ? '#ecfdf5' : '#e0f2fe'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {notif.type === 'schedule' ? <Icons.Schedule /> : (notif.type === 'admin_edit' ? <Icons.EditAdmin /> : <Icons.Task />)}
                            </div>
                            
                            <div style={{ flex: 1, minWidth: 0 }}> 
                                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: isRead ? '#64748b' : '#1e293b', marginBottom: '8px', paddingRight: notif.isNew && !isRead ? '50px' : '0', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                    {notif.title}
                                </div>
                                
                                <div style={lineClampStyle}>
                                    {notif.desc}
                                </div>

                                {(notif.desc && notif.desc.length > 60) && (
                                    <button 
                                        type="button"
                                        className="btn-expand"
                                        onClick={() => toggleExpand(notif.id)}
                                        style={{
                                            background: 'none', border: 'none', padding: '0',
                                            color: isRead ? '#94a3b8' : '#0284c7', fontSize: '0.85rem', fontWeight: '700',
                                            cursor: 'pointer', marginBottom: '12px', display: 'block',
                                            outline: 'none', WebkitTapHighlightColor: 'transparent'
                                        }}
                                    >
                                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                                    </button>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '10px', flexWrap: 'wrap', borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>
                                        <Icons.Clock /> {formatNotiTime(notif.time)}
                                    </div>
                                    
                                    <button 
                                        className="btn-action"
                                        onClick={() => !isRead && markAsRead(notif.id)}
                                        disabled={isRead}
                                        style={{
                                            border: isRead ? 'none' : '1px solid #cbd5e1', 
                                            background: isRead ? '#f1f5f9' : 'white', 
                                            color: isRead ? '#94a3b8' : '#475569',
                                            padding: '8px 14px', borderRadius: '10px', 
                                            cursor: isRead ? 'not-allowed' : 'pointer',
                                            fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px',
                                            WebkitTapHighlightColor: 'transparent',
                                            boxShadow: isRead ? 'none' : '0 1px 2px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        <Icons.Check /> {isRead ? 'Đã đọc' : 'Đánh dấu đã xem'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {notifications.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 20px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '3.5rem', opacity: 0.8 }}>🎉</div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#475569' }}>Bạn đã xem hết thông báo!</div>
                    <div style={{ fontSize: '0.9rem' }}>Không có công việc hay lịch trình nào mới cần xử lý.</div>
                </div>
            )}
        </div>
    </div>
  );
};

export default StaffDashboard;