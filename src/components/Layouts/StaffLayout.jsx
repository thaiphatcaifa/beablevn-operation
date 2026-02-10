import React, { useState } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import bcrypt from 'bcryptjs'; // IMPORT THƯ VIỆN MÃ HÓA

// --- BỘ ICON TINH TẾ (MINIMALIST SVG) ---
const Icons = {
  Task: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  ),
  Attendance: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565m4.382-2.895A5.986 5.986 0 0122 10.5a8.288 8.288 0 01-1.7 5.23" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 10.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
    </svg>
  ),
  Facility: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Performance: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  ),
  Bell: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#003366" width="16" height="16">
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

  if (!user) return <Navigate to="/" />;

  const safeStaffList = Array.isArray(staffList) ? staffList : [];
  const currentUserInfo = safeStaffList.find(s => String(s.id) === String(user.id)) || user;
  const userPositions = Array.isArray(currentUserInfo?.positions) ? currentUserInfo.positions : [];

  const isActive = (path) => location.pathname === path;

  // --- HÀM TÍNH TỔNG UBI CẤU HÌNH ---
  const calculateTotalConfiguredUBI = (staff) => {
      const ubi1 = (Number(staff?.ubi1Base) || 0) * (Number(staff?.ubi1Percent) || 100) / 100;
      const ubi2 = (Number(staff?.ubi2Base) || 0) * (Number(staff?.ubi2Percent) || 100) / 100;
      return ubi1 + ubi2;
  };

  // --- LOGIC ĐỔI MẬT KHẨU (CÓ HASH) ---
  const handleChangePassword = (e) => {
    e.preventDefault();
    const currentPassHash = currentUserInfo.password || "";
    
    // 1. Kiểm tra mật khẩu cũ
    let isMatch = false;
    // Nếu mật khẩu trong DB bắt đầu bằng $2 (dấu hiệu của bcrypt)
    if (currentPassHash.startsWith('$2')) {
        isMatch = bcrypt.compareSync(pwdForm.current, currentPassHash);
    } else {
        // Fallback: So sánh chuỗi thường cho tài khoản cũ
        isMatch = String(pwdForm.current) === String(currentPassHash);
    }

    if (!isMatch) {
        return alert("Mật khẩu hiện tại không đúng!");
    }
    
    // 2. Kiểm tra mật khẩu mới
    if (pwdForm.new.length < 1) return alert("Vui lòng nhập mật khẩu mới.");
    if (pwdForm.new !== pwdForm.confirm) return alert("Xác nhận mật khẩu mới không khớp!");
    
    // 3. Mã hóa mật khẩu mới
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

  const navItemStyle = (path) => ({ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', 
    color: isActive(path) ? '#003366' : '#9ca3af',
    flex: 1, padding: '12px 0',
    transition: 'all 0.2s ease',
    borderTop: isActive(path) ? '2px solid #003366' : '2px solid transparent'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* HEADER */}
      <header style={{ background: '#ffffff', padding: '0 24px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/BA LOGO.png" alt="Logo" style={{ height: '32px', objectFit: 'contain' }} />
            <div>
                <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#111827', letterSpacing: '-0.025em' }}>Be Able VN</h1>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>Staff Portal</span>
            </div>
         </div>
         <button onClick={logout} style={{ border: '1px solid #e5e7eb', background: 'white', color: '#374151', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = '#f3f4f6'} onMouseOut={e => e.target.style.background = 'white'}>Đăng xuất</button>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '20px', paddingBottom: '100px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* User Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div onClick={() => setShowPwdModal(true)} style={{ fontSize: '1.25rem', color: '#111827', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {currentUserInfo.name || user.name || "Nhân viên"} 
                        <div style={{ background: '#f0f9ff', padding: '4px', borderRadius: '4px', display: 'flex' }}><Icons.Edit /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {userPositions.length > 0 ? (
                            userPositions.map((p, index) => (
                                <span key={index} style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{p}</span>
                            ))
                        ) : <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>Staff</span>}
                    </div>
                </div>
                {/* HIỂN THỊ TỔNG UBI */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '600' }}>
                        UBI ({((Number(currentUserInfo.ubi1Percent) + Number(currentUserInfo.ubi2Percent)) / 2) || 100}%)
                    </div>
                    <strong style={{ color: '#059669', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.025em' }}>
                        {calculateTotalConfiguredUBI(currentUserInfo).toLocaleString()} 
                        <span style={{fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', marginLeft: '3px'}}>đ</span>
                    </strong>
                </div>
            </div>
        </div>
        <Outlet />
      </main>

      {/* MODAL ĐỔI MẬT KHẨU */}
      {showPwdModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#111827', textAlign: 'center', marginBottom: '24px', fontSize: '1.25rem' }}>Đổi mật khẩu</h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="password" placeholder="Mật khẩu hiện tại" required value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem' }} />
                    <input type="password" placeholder="Mật khẩu mới" required value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem' }} />
                    <input type="password" placeholder="Xác nhận mật khẩu mới" required value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box', fontSize: '0.95rem' }} />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button type="submit" style={{ flex: 1, background: '#003366', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>Xác nhận</button>
                        <button type="button" onClick={() => setShowPwdModal(false)} style={{ flex: 1, background: '#f3f4f6', color: '#374151', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around', paddingBottom: 'safe-area-inset-bottom', zIndex: 1000, height: '60px' }}>
        <Link to="/staff/dashboard" style={navItemStyle('/staff/dashboard')}>
            <Icons.Bell active={isActive('/staff/dashboard')} />
            <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('/staff/dashboard') ? '600' : '500' }}>Thông báo</span>
        </Link>
        <Link to="/staff/my-tasks" style={navItemStyle('/staff/my-tasks')}>
            <Icons.Task active={isActive('/staff/my-tasks')} />
            <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('/staff/my-tasks') ? '600' : '500' }}>Nhiệm vụ</span>
        </Link>
        <Link to="/staff/attendance" style={navItemStyle('/staff/attendance')}>
            <Icons.Attendance active={isActive('/staff/attendance')} />
            <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('/staff/attendance') ? '600' : '500' }}>Chấm công</span>
        </Link>
        <Link to="/staff/facility-check" style={navItemStyle('/staff/facility-check')}>
            <Icons.Facility active={isActive('/staff/facility-check')} />
            <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('/staff/facility-check') ? '600' : '500' }}>CSVC</span>
        </Link>
        <Link to="/staff/performance" style={navItemStyle('/staff/performance')}>
            <Icons.Performance active={isActive('/staff/performance')} />
            <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('/staff/performance') ? '600' : '500' }}>Hiệu suất</span>
        </Link>
      </nav>
    </div>
  );
};

export default StaffLayout;