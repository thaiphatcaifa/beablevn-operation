import React, { useState } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// Icons SVG Minimalist
const Icons = {
  Home: ({active}) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active?"#003366":"#9ca3af"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  Task: ({active}) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active?"#003366":"#9ca3af"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
  Check: ({active}) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active?"#003366":"#9ca3af"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Facility: ({active}) => <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={active?"#003366":"#9ca3af"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-1.875-5.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V5.375c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v3.5c0 .621-.504 1.125-1.125 1.125H8.25z" /></svg>
};

const StaffLayout = () => {
  const { user, logout } = useAuth();
  const { staffList, updatePassword } = useData();
  const location = useLocation();

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });

  if (!user) return <Navigate to="/" />;

  // SỬA LỖI: So sánh ID dưới dạng chuỗi để tránh lệch kiểu (số vs chữ)
  // Nếu staffList chưa load kịp hoặc không tìm thấy, sử dụng user làm fallback an toàn
  const currentUserInfo = staffList.find(s => String(s.id) === String(user.id)) || user;

  // SỬA LỖI: Đảm bảo positions luôn là mảng, sử dụng Optional Chaining (?.)
  const userPositions = currentUserInfo?.positions || [];

  const isActive = (path) => location.pathname === path;

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (pwdForm.current !== currentUserInfo.password) return alert("Mật khẩu hiện tại không đúng!");
    if (pwdForm.new.length < 1) return alert("Vui lòng nhập mật khẩu mới.");
    if (pwdForm.new !== pwdForm.confirm) return alert("Xác nhận mật khẩu mới không khớp!");
    updatePassword(user.id, pwdForm.new);
    alert("Đổi mật khẩu thành công!");
    setShowPwdModal(false);
    setPwdForm({ current: '', new: '', confirm: '' });
  };

  const navItemStyle = (path) => ({ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', color: isActive(path) ? '#003366' : '#9ca3af',
    flex: 1, padding: '8px 0'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ background: '#ffffff', color: '#003366', padding: '0 20px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/BA LOGO.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
            <div>
                <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Be Able VN</h1>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Staff Portal</span>
            </div>
         </div>
         <button onClick={logout} style={{ border: '1px solid #e5e7eb', background: 'white', color: '#374151', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>Đăng xuất</button>
      </header>

      <main style={{ flex: 1, padding: '16px', paddingBottom: '90px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div onClick={() => setShowPwdModal(true)} style={{ fontSize: '1.2rem', color: '#111827', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {currentUserInfo.name || user.name} <span style={{fontSize: '0.8rem', color: '#003366', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px'}}>✏️</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {/* SỬA LỖI: Dùng biến userPositions đã xử lý an toàn */}
                        {userPositions.length > 0 ? (
                            userPositions.map(p => (
                                <span key={p} style={{ background: '#f3f4f6', color: '#374151', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #e5e7eb' }}>{p}</span>
                            ))
                        ) : <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>Staff</span>}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>UBI ({currentUserInfo.ubiPercentage || 100}%)</div>
                    <strong style={{ color: '#059669', fontSize: '1.25rem' }}>
                        {((currentUserInfo.baseUBI || 0) * (currentUserInfo.ubiPercentage || 100) / 100).toLocaleString()} <span style={{fontSize: '0.8rem', color: '#374151'}}>đ</span>
                    </strong>
                </div>
            </div>
        </div>
        <Outlet />
      </main>

      {/* MODAL */}
      {showPwdModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)' }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '360px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: '#111827', textAlign: 'center', marginBottom: '20px' }}>Đổi mật khẩu</h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="password" placeholder="Mật khẩu hiện tại" required value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="password" placeholder="Mật khẩu mới" required value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="password" placeholder="Xác nhận mật khẩu mới" required value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" style={{ flex: 1, background: '#003366', color: 'white', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Xác nhận</button>
                        <button type="button" onClick={() => setShowPwdModal(false)} style={{ flex: 1, background: '#f3f4f6', color: '#374151', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-around', padding: '8px 0', zIndex: 1000, paddingBottom: '20px' }}>
        <Link to="/staff/my-tasks" style={navItemStyle('/staff/my-tasks')}>
            <Icons.Task active={isActive('/staff/my-tasks')} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Nhiệm vụ</span>
        </Link>
        <Link to="/staff/attendance" style={navItemStyle('/staff/attendance')}>
            <Icons.Check active={isActive('/staff/attendance')} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Chấm công</span>
        </Link>
        <Link to="/staff/facility-check" style={navItemStyle('/staff/facility-check')}>
            <Icons.Facility active={isActive('/staff/facility-check')} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>CSVC</span>
        </Link>
        <Link to="/staff/performance" style={navItemStyle('/staff/performance')}>
            <Icons.Home active={isActive('/staff/performance')} />
            <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>Hiệu suất</span>
        </Link>
      </nav>
    </div>
  );
};

export default StaffLayout;