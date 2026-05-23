import React, { useState, useEffect } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import bcrypt from 'bcryptjs'; 

// --- IMPORT CÁC HÀM TỪ FIREBASE ĐỂ NHẬN THÔNG BÁO ---
import { requestForToken, onMessageListener } from '../../firebase';

// --- BỘ ICON TINH TẾ (MINIMALIST SVG) ĐỒNG BỘ ADMIN ---
const Icons = {
  Bell: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#003366" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Task: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#003366" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  ),
  Attendance: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#003366" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Facility: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#003366" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Performance: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#003366" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  ),
  Switch: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#003366" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
};

const StaffLayout = () => {
  const { user, logout } = useAuth();
  const { staffList, updateStaffInfo } = useData();
  const location = useLocation();

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });

  // --- LOGIC XỬ LÝ VÀ LƯU THÔNG BÁO (GIỮ NGUYÊN) ---
  useEffect(() => {
    if (user) {
      requestForToken().then((token) => {
        if (token && typeof updateStaffInfo === 'function') {
          updateStaffInfo(user.id, { fcmToken: token });
        }
      }).catch(err => console.error('Lỗi lấy token:', err));

      const listenForMessages = async () => {
        try {
          const payload = await onMessageListener();
          console.log('Nhận được thông báo:', payload);
          
          if (Notification.permission === 'granted') {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/BA LOGO.png'
            });
          }
        } catch (err) {
          console.log('Lỗi nhận thông báo:', err);
        }
      };

      listenForMessages();
    }
  }, [user]); 
  // ----------------------------------------------

  if (!user) return <Navigate to="/" />;

  const isAdminRole = ['admin', 'chief', 'reg', 'op', 'scheduler'].includes(user?.role);

  const safeStaffList = Array.isArray(staffList) ? staffList : [];
  const currentUserInfo = safeStaffList.find(s => String(s.id) === String(user.id)) || user;
  const userPositions = Array.isArray(currentUserInfo?.positions) ? currentUserInfo.positions : [];

  const isActive = (path) => location.pathname === path || location.pathname.includes(path);

  const calculateTotalConfiguredUBI = (staff) => {
      const ubi1 = (Number(staff?.ubi1Base) || 0) * (Number(staff?.ubi1Percent) || 100) / 100;
      const ubi2 = (Number(staff?.ubi2Base) || 0) * (Number(staff?.ubi2Percent) || 100) / 100;
      return ubi1 + ubi2;
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const currentPassHash = currentUserInfo.password || "";
    
    let isMatch = false;
    if (currentPassHash.startsWith('$2')) {
        isMatch = bcrypt.compareSync(pwdForm.current, currentPassHash);
    } else {
        isMatch = String(pwdForm.current) === String(currentPassHash);
    }

    if (!isMatch) {
        return alert("Mật khẩu hiện tại không đúng!");
    }
    
    if (pwdForm.new.length < 1) return alert("Vui lòng nhập mật khẩu mới.");
    if (pwdForm.new !== pwdForm.confirm) return alert("Xác nhận mật khẩu mới không khớp!");
    
    const salt = bcrypt.genSaltSync(10);
    const newHashedPassword = bcrypt.hashSync(pwdForm.new, salt);

    if (typeof updateStaffInfo === 'function') {
        updateStaffInfo(user.id, { password: newHashedPassword });
        alert("Đổi mật khẩu thành công!");
        setShowPwdModal(false);
        setPwdForm({ current: '', new: '', confirm: '' });
    } else {
        alert("Lỗi hệ thống: Không tìm thấy hàm cập nhật.");
    }
  };

  // Style cho Sidebar Desktop
  const sidebarLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 18px', textDecoration: 'none',
    color: isActive(path) ? '#003366' : '#4b5563',
    background: isActive(path) ? '#f0f9ff' : 'transparent',
    borderRadius: '12px', marginBottom: '8px',
    fontWeight: isActive(path) ? '700' : '600',
    fontSize: '0.95rem',
    transition: 'all 0.25s ease',
    boxShadow: isActive(path) ? '0 1px 3px rgba(0,0,0,0.02)' : 'none',
    border: isActive(path) ? '1px solid #e0f2fe' : '1px solid transparent'
  });

  // Style cho Mobile Bottom Nav
  const mobileNavItemStyle = (path) => ({ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', 
    color: isActive(path) ? '#003366' : '#9ca3af',
    flex: 1, padding: '10px 0',
    position: 'relative',
    transition: 'all 0.3s ease'
  });

  return (
    <div className="layout-container" style={{ minHeight: '100vh', background: '#f4f7f6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* CSS CHO GIAO DIỆN TỐI GIẢN & ĐỒNG BỘ ADMIN RESPONSIVE */}
      <style>{`
        .layout-container { display: flex; }
        .staff-sidebar { width: 280px; height: 100vh; position: fixed; left: 0; top: 0; background: #ffffff; border-right: 1px solid rgba(0,0,0,0.05); display: flex; flex-direction: column; z-index: 50; }
        .staff-content { margin-left: 280px; padding: 32px; flex: 1; box-sizing: border-box; max-width: 1400px; margin-right: auto; }
        .staff-bottom-nav { display: none; }
        .staff-header-mobile { display: none; }

        .sidebar-link:hover:not(.active) { background: #f8fafc !important; transform: translateX(4px); }

        .btn-switch-sidebar { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 16px; text-decoration: none; color: #003366; background: #ffffff; border-radius: 12px; margin-top: 24px; font-weight: 700; font-size: 0.95rem; transition: all 0.2s ease; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        .btn-switch-sidebar:hover { background: #f0f9ff; border-color: #bae6fd; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

        .btn-logout-sidebar { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 0.95rem; transition: all 0.2s ease; }
        .btn-logout-sidebar:hover { background: #fecaca; border-color: #fca5a5; }

        .pwd-modal-overlay { animation: fadeIn 0.2s ease-out forwards; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.4); z-index: 2000; display: flex; justify-content: center; alignItems: center; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); padding: 20px; box-sizing: border-box; }
        .pwd-modal-content { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; background: white; padding: 32px; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: scale(0.95) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }

        @media (max-width: 850px) {
          .layout-container { display: block; }
          .staff-sidebar { display: none; }
          .staff-content { margin-left: 0; padding: 16px; padding-bottom: 90px; }
          .staff-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(0,0,0,0.05); height: 68px; z-index: 1000; justify-content: space-around; padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -4px 20px rgba(0,0,0,0.03); }
          .staff-header-mobile { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 64px; background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; }
        }
      `}</style>

      {/* 1. SIDEBAR (DESKTOP ONLY) */}
      <aside className="staff-sidebar">
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/BA LOGO.png" alt="Logo" style={{ height: '38px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '800', letterSpacing: '-0.02em' }}>BE ABLE VN</h2>
             <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>Nhân sự</span>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
          <Link to="/staff/dashboard" className={`sidebar-link ${isActive('/staff/dashboard') ? 'active' : ''}`} style={sidebarLinkStyle('/staff/dashboard')}>
            <Icons.Bell active={isActive('/staff/dashboard')} /> <span>Thông báo</span>
          </Link>
          <Link to="/staff/my-tasks" className={`sidebar-link ${isActive('/staff/my-tasks') ? 'active' : ''}`} style={sidebarLinkStyle('/staff/my-tasks')}>
            <Icons.Task active={isActive('/staff/my-tasks')} /> <span>Nhiệm vụ</span>
          </Link>
          <Link to="/staff/attendance" className={`sidebar-link ${isActive('/staff/attendance') ? 'active' : ''}`} style={sidebarLinkStyle('/staff/attendance')}>
            <Icons.Attendance active={isActive('/staff/attendance')} /> <span>Chấm công</span>
          </Link>
          <Link to="/staff/facility-check" className={`sidebar-link ${isActive('/staff/facility-check') ? 'active' : ''}`} style={sidebarLinkStyle('/staff/facility-check')}>
            <Icons.Facility active={isActive('/staff/facility-check')} /> <span>Cơ sở vật chất</span>
          </Link>
          <Link to="/staff/performance" className={`sidebar-link ${isActive('/staff/performance') ? 'active' : ''}`} style={sidebarLinkStyle('/staff/performance')}>
            <Icons.Performance active={isActive('/staff/performance')} /> <span>Hiệu suất</span>
          </Link>

          {isAdminRole && (
             <Link to="/admin" className="btn-switch-sidebar">
                <Icons.Switch /> <span>Quyền Quản trị</span>
             </Link>
          )}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
          <button onClick={logout} className="btn-logout-sidebar">
            <Icons.Logout /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER */}
      <div className="staff-header-mobile">
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/BA LOGO.png" alt="Logo" style={{ height: '32px' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '800', color: '#111827', fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: '1.2' }}>BE ABLE VN</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Nhân sự</span>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '8px' }}>
             {isAdminRole && (
                 <Link to="/admin" style={{ padding: '8px', background: '#f0f9ff', color: '#003366', border: '1px solid #bae6fd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Switch />
                 </Link>
             )}
            <button onClick={logout} style={{ fontSize: '0.85rem', fontWeight: '700', padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px' }}>Thoát</button>
         </div>
      </div>

      {/* 3. MAIN CONTENT CÓ CHỨA USER CARD */}
      <main className="staff-content">
        
        {/* User Card - Tinh gọn, Bóng đổ mềm, Bo góc lớn */}
        <div style={{ 
            background: '#ffffff', 
            padding: '24px', 
            borderRadius: '20px', 
            marginBottom: '32px', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03), 0 8px 10px -6px rgba(0,0,0,0.01)', 
            border: '1px solid rgba(0,0,0,0.04)',
            display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center'
        }}>
            <div style={{ flex: '1 1 min-content' }}>
                <div onClick={() => setShowPwdModal(true)} style={{ fontSize: '1.35rem', color: '#111827', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s', letterSpacing: '-0.01em' }} onMouseOver={e=>e.currentTarget.style.opacity=0.7} onMouseOut={e=>e.currentTarget.style.opacity=1}>
                    {currentUserInfo.name || user.name || "Nhân viên"} 
                    <div style={{ background: '#f0f9ff', padding: '6px', borderRadius: '50%', display: 'flex', border: '1px solid #e0f2fe' }}><Icons.Edit /></div>
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {userPositions.length > 0 ? (
                        userPositions.map((p, index) => (
                            <span key={index} style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' }}>{p}</span>
                        ))
                    ) : <span style={{fontSize: '0.8rem', color: '#9ca3af', fontWeight: '500', fontStyle: 'italic'}}>Chưa thiết lập vị trí</span>}
                </div>
            </div>
            
            {/* Thu nhập */}
            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.05em' }}>
                    UBI CỐ ĐỊNH GỐC ({((Number(currentUserInfo.ubi1Percent) + Number(currentUserInfo.ubi2Percent)) / 2) || 100}%)
                </div>
                <strong style={{ color: '#059669', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                    {calculateTotalConfiguredUBI(currentUserInfo).toLocaleString()} 
                    <span style={{fontSize: '1rem', color: '#9ca3af', fontWeight: '600', marginLeft: '4px'}}>đ</span>
                </strong>
            </div>
        </div>
        
        <Outlet />
      </main>

      {/* 4. MODAL ĐỔI MẬT KHẨU TỐI ƯU */}
      {showPwdModal && (
        <div className="pwd-modal-overlay" onClick={() => setShowPwdModal(false)}>
            <div className="pwd-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 24px 0', color: '#111827', textAlign: 'center', fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.01em' }}>Đổi mật khẩu</h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="password" placeholder="Mật khẩu hiện tại" required value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem', background: '#f8fafc', transition: 'all 0.2s' }} onFocus={e=>{e.target.style.borderColor='#003366'; e.target.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'}} onBlur={e=>{e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'}}/>
                    <input type="password" placeholder="Mật khẩu mới" required value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem', background: '#f8fafc', transition: 'all 0.2s' }} onFocus={e=>{e.target.style.borderColor='#003366'; e.target.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'}} onBlur={e=>{e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'}}/>
                    <input type="password" placeholder="Xác nhận mật khẩu mới" required value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} style={{ width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem', background: '#f8fafc', transition: 'all 0.2s' }} onFocus={e=>{e.target.style.borderColor='#003366'; e.target.style.boxShadow='0 0 0 3px rgba(0, 51, 102, 0.1)'}} onBlur={e=>{e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'}}/>
                    
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => setShowPwdModal(false)} style={{ flex: 1, background: 'white', color: '#475569', padding: '14px', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.2s' }} onMouseOver={e=>e.target.style.background='#f1f5f9'} onMouseOut={e=>e.target.style.background='white'}>Hủy</button>
                        <button type="submit" style={{ flex: 1, background: '#003366', color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)' }} onMouseOver={e=>{e.target.style.background='#002244'; e.target.style.transform='translateY(-1px)'}} onMouseOut={e=>{e.target.style.background='#003366'; e.target.style.transform='translateY(0)'}}>Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* 5. MOBILE BOTTOM NAVIGATION */}
      <nav className="staff-bottom-nav">
        <Link to="/staff/dashboard" style={mobileNavItemStyle('/staff/dashboard')}>
            {isActive('/staff/dashboard') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#003366', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
            <Icons.Bell active={isActive('/staff/dashboard')} />
            <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('/staff/dashboard') ? '700' : '500' }}>Thông báo</span>
        </Link>
        <Link to="/staff/my-tasks" style={mobileNavItemStyle('/staff/my-tasks')}>
            {isActive('/staff/my-tasks') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#003366', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
            <Icons.Task active={isActive('/staff/my-tasks')} />
            <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('/staff/my-tasks') ? '700' : '500' }}>Nhiệm vụ</span>
        </Link>
        <Link to="/staff/attendance" style={mobileNavItemStyle('/staff/attendance')}>
            {isActive('/staff/attendance') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#003366', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
            <Icons.Attendance active={isActive('/staff/attendance')} />
            <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('/staff/attendance') ? '700' : '500' }}>Chấm công</span>
        </Link>
        <Link to="/staff/facility-check" style={mobileNavItemStyle('/staff/facility-check')}>
            {isActive('/staff/facility-check') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#003366', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
            <Icons.Facility active={isActive('/staff/facility-check')} />
            <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('/staff/facility-check') ? '700' : '500' }}>CSVC</span>
        </Link>
        <Link to="/staff/performance" style={mobileNavItemStyle('/staff/performance')}>
            {isActive('/staff/performance') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#003366', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
            <Icons.Performance active={isActive('/staff/performance')} />
            <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('/staff/performance') ? '700' : '500' }}>Hiệu suất</span>
        </Link>
      </nav>
    </div>
  );
};

export default StaffLayout;