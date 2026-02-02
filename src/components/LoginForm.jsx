import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext'; // Import DataContext để lấy dữ liệu cũ

const LoginForm = () => {
  // State quản lý form
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { staffList } = useData(); // Lấy danh sách nhân sự từ Realtime DB (CÁCH CŨ)

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Giả lập thời gian xử lý một chút để hiệu ứng loading hiển thị (UX)
    setTimeout(() => {
        try {
            // --- LOGIC CŨ: KIỂM TRA TRONG DANH SÁCH NHÂN SỰ ---
            const safeStaffList = Array.isArray(staffList) ? staffList : [];

            // Tìm tài khoản khớp username VÀ password (như code cũ)
            // formData.id ở đây đóng vai trò là username
            const account = safeStaffList.find(s => s.username === formData.id && s.password === formData.password);

            if (account) {
                // Kiểm tra trạng thái đình chỉ
                if (account.status === 'suspended') {
                    setError('Tài khoản đã bị đình chỉ. Liên hệ Chief Administrator.');
                    setLoading(false);
                    return;
                }

                // Đăng nhập thành công: Lưu thông tin vào AuthContext
                login(account);

                // Điều hướng phân quyền (Logic cũ)
                if (['chief', 'reg', 'op'].includes(account.role)) {
                    navigate('/admin/staff-manager');
                } else {
                    navigate('/staff/attendance');
                }
            } else {
                setError('Sai tên đăng nhập hoặc mật khẩu!');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
            setLoading(false);
        }
    }, 600); // Delay 0.6s
  };

  // --- STYLES OBJECT (GIAO DIỆN MỚI) ---
  const s = {
    container: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f8fafc', padding: '16px', fontFamily: "'Josefin Sans', sans-serif"
    },
    card: {
      backgroundColor: 'white', padding: '32px', borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%', maxWidth: '448px', border: '1px solid #f1f5f9'
    },
    logoWrapper: {
      textAlign: 'center', marginBottom: '32px'
    },
    logoBox: {
      width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '16px',
      margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f8fafc'
    },
    logoImg: {
      width: '56px', height: '56px', objectFit: 'contain'
    },
    title: {
      fontSize: '1.5rem', fontWeight: '800', color: '#003366', margin: 0
    },
    subtitle: {
      color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px', fontWeight: '500'
    },
    errorBox: {
      backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '12px',
      fontSize: '0.875rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
      border: '1px solid #fee2e2', fontWeight: '500'
    },
    formGroup: { marginBottom: '20px' },
    label: {
      display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#003366',
      textTransform: 'uppercase', marginBottom: '6px', marginLeft: '4px'
    },
    inputWrapper: { position: 'relative' },
    input: {
      width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #e2e8f0',
      borderRadius: '12px', outline: 'none', transition: 'all 0.2s',
      backgroundColor: 'white', color: '#334155', fontWeight: '500', fontSize: '1rem',
      boxSizing: 'border-box'
    },
    icon: {
      position: 'absolute', left: '12px', top: '14px', color: '#94a3b8', width: '20px', height: '20px'
    },
    button: {
      width: '100%', backgroundColor: '#003366', color: 'white', fontWeight: '700',
      padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
      transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(0, 51, 102, 0.1)',
      opacity: loading ? 0.7 : 1, fontSize: '1rem'
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.logoWrapper}>
          <div style={s.logoBox}>
            <img src="/BA LOGO.png" alt="Logo" style={s.logoImg} />
          </div>
          <h1 style={s.title}>BE ABLE VN</h1>
          <p style={s.subtitle}>Hệ thống Quản trị Nhân sự</p>
        </div>

        {error && (
          <div style={s.errorBox}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={s.formGroup}>
            <label style={s.label}>Tên đăng nhập / Mã HV</label>
            <div style={s.inputWrapper}>
              <input 
                type="text" 
                style={s.input}
                placeholder="Ví dụ: admin, gv01..." 
                value={formData.id} 
                onChange={(e) => setFormData({...formData, id: e.target.value})} 
                required 
              />
              <span style={s.icon}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </span>
            </div>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Mật khẩu</label>
            <div style={s.inputWrapper}>
              <input 
                type="password" 
                style={s.input}
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <span style={s.icon}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              </span>
            </div>
          </div>

          <button type="submit" disabled={loading} style={s.button}>
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span>Đăng Nhập</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;