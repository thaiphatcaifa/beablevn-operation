import React, { useState } from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const StaffLayout = () => {
  const { user, logout } = useAuth();
  const { updatePassword } = useData();
  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm] = useState({ newPass: '', confirmPass: '' });
  const location = useLocation();

  if (!user || user.role !== 'staff') return <Navigate to="/" />;

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passForm.newPass !== passForm.confirmPass) return alert("Mật khẩu xác nhận không khớp!");
    if (passForm.newPass.length < 3) return alert("Mật khẩu quá ngắn!");
    
    updatePassword(user.id, passForm.newPass);
    alert("Đổi mật khẩu thành công!");
    setShowChangePass(false);
    setPassForm({ newPass: '', confirmPass: '' });
  };

  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? '#003366' : '#555',
    fontWeight: 'bold',
    padding: '10px 15px',
    borderBottom: location.pathname === path ? '3px solid #003366' : '3px solid transparent',
    transition: 'all 0.3s'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* HEADER: Màu xanh đậm giống Admin */}
      <header style={{ background: '#003366', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Logo BA LOGO.png */}
            <img 
              src="/BA LOGO.png" 
              alt="Be Able VN Logo" 
              style={{ 
                height: '50px', 
                width: 'auto', 
                objectFit: 'contain', 
                background: 'white', 
                borderRadius: '8px', 
                padding: '5px' 
              }} 
            />
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Be Able VN - Nhân sự</h3>
        </div>
        
        <div style={{ position: 'relative' }}>
          <span 
            onClick={() => setShowChangePass(!showChangePass)}
            style={{ marginRight: '15px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Xin chào, {user.name} ▾
          </span>
          <button onClick={logout} style={{ padding: '6px 12px', cursor: 'pointer', border: 'none', borderRadius: '4px', background: 'white', color: '#003366', fontWeight: 'bold' }}>Đăng xuất</button>

          {/* Popup Đổi mật khẩu */}
          {showChangePass && (
            <div style={{ position: 'absolute', top: '120%', right: 0, background: 'white', color: 'black', padding: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderRadius: '8px', zIndex: 1000, width: '260px' }}>
              <h4 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Đổi mật khẩu</h4>
              <form onSubmit={handleChangePassword}>
                <input type="password" placeholder="Mật khẩu mới" value={passForm.newPass} onChange={e => setPassForm({...passForm, newPass: e.target.value})} style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} required />
                <input type="password" placeholder="Xác nhận mật khẩu" value={passForm.confirmPass} onChange={e => setPassForm({...passForm, confirmPass: e.target.value})} style={{ width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }} required />
                <button type="submit" style={{ width: '100%', background: '#28a745', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Lưu thay đổi</button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* NAVIGATION BAR - Giữ nguyên 4 thẻ */}
      <nav style={{ background: '#fff', padding: '0 20px', borderBottom: '1px solid #ddd', display: 'flex', gap: '10px' }}>
        <Link to="/staff/attendance" style={linkStyle('/staff/attendance')}>1. Điểm danh</Link>
        <Link to="/staff/my-tasks" style={linkStyle('/staff/my-tasks')}>2. Công việc của tôi</Link>
        <Link to="/staff/performance" style={linkStyle('/staff/performance')}>3. Performance</Link>
        <Link to="/staff/facility-check" style={linkStyle('/staff/facility-check')}>4. Kiểm tra CSVC</Link>
      </nav>

      <main style={{ padding: '20px', flex: 1, background: '#fffaf5' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;