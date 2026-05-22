import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext'; 
import bcrypt from 'bcryptjs'; // IMPORT THƯ VIỆN MÃ HÓA

const LoginForm = () => {
  // State quản lý form
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // State mới: Quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  // State mới: Quản lý trạng thái hover của nút bấm đăng nhập
  const [isHovered, setIsHovered] = useState(false);
  
  const navigate = useNavigate();
  // Lấy thêm biến 'user' từ useAuth để kiểm tra phiên đăng nhập hiện tại
  const { login, user } = useAuth();
  const { staffList } = useData(); 

  // --- BỔ SUNG: TỰ ĐỘNG ĐIỀU HƯỚNG NẾU ĐÃ ĐĂNG NHẬP (AUTO-LOGIN) ---
  useEffect(() => {
    if (user) {
        // Tương tự logic lúc đăng nhập, điều hướng tuỳ theo role
        if (['chief', 'reg', 'op', 'scheduler'].includes(user.role)) {
            if (user.role === 'scheduler') {
                navigate('/admin/task-manager');
            } else {
                navigate('/admin/staff-manager');
            }
        } else {
            navigate('/staff/attendance');
        }
    }
  }, [user, navigate]);
  // ------------------------------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Giả lập thời gian xử lý một chút để hiệu ứng loading hiển thị (UX)
    setTimeout(() => {
        try {
            const safeStaffList = Array.isArray(staffList) ? staffList : [];

            // --- BƯỚC 1: TÌM TÀI KHOẢN THEO USERNAME TRƯỚC ---
            const account = safeStaffList.find(s => s.username === formData.id);

            // --- BƯỚC 2: KIỂM TRA MẬT KHẨU ---
            let isPasswordValid = false;
            
            if (account) {
                // Kiểm tra xem mật khẩu trong DB có phải là hash bcrypt không (thường bắt đầu bằng $2)
                const storedPass = account.password || "";
                
                if (storedPass.startsWith('$2')) {
                    // Nếu là hash -> dùng bcrypt để so sánh
                    isPasswordValid = bcrypt.compareSync(formData.password, storedPass);
                } else {
                    // Nếu không phải hash (tài khoản cũ) -> so sánh chuỗi thông thường
                    isPasswordValid = storedPass === formData.password;
                }
            }

            if (account && isPasswordValid) {
                // Kiểm tra trạng thái đình chỉ
                if (account.status === 'suspended') {
                    setError('Tài khoản đã bị đình chỉ. Liên hệ Chief Administrator.');
                    setLoading(false);
                    return;
                }

                // Đăng nhập thành công: Lưu thông tin vào AuthContext
                login(account);

                // Điều hướng dựa trên quyền
                if (['chief', 'reg', 'op', 'scheduler'].includes(account.role)) {
                    if (account.role === 'scheduler') {
                        navigate('/admin/task-manager');
                    } else {
                        navigate('/admin/staff-manager');
                    }
                } else {
                    // Các vai trò khác (Staff) chuyển về trang chấm công
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

  // --- STYLES OBJECT ---
  const s = {
    container: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f8fafc', padding: '16px', fontFamily: "'Josefin Sans', sans-serif",
      boxSizing: 'border-box'
    },
    card: {
      backgroundColor: 'white', padding: '32px', borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '100%', maxWidth: '448px', border: '1px solid #f1f5f9',
      boxSizing: 'border-box'
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
      width: '100%', padding: '12px 40px 12px 40px', border: '1px solid #e2e8f0',
      borderRadius: '12px', outline: 'none', transition: 'all 0.2s',
      backgroundColor: 'white', color: '#334155', fontWeight: '500', fontSize: '1rem',
      boxSizing: 'border-box', WebkitAppearance: 'none' // Tối ưu hiển thị input trên iOS di động
    },
    icon: {
      position: 'absolute', left: '12px', top: '14px', color: '#94a3b8', width: '20px', height: '20px'
    },
    eyeButton: {
      position: 'absolute', right: '12px', top: '12px', color: '#94a3b8',
      background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none',
      WebkitTapHighlightColor: 'transparent' // Xóa viền highlight khi chạm trên thiết bị di động
    },
    button: {
      width: '100%', 
      backgroundColor: '#003366', 
      color: 'white', 
      fontWeight: '700',
      padding: '14px', 
      borderRadius: '12px', 
      border: 'none', 
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: '8px',
      transition: 'all 0.2s ease-in-out', 
      fontSize: '1rem',
      boxSizing: 'border-box',
      WebkitTapHighlightColor: 'transparent',
      // Hiệu ứng tương tác Affordance linh hoạt kết hợp từ trạng thái hover và loading
      opacity: loading ? 0.7 : (isHovered ? 0.92 : 1),
      boxShadow: loading 
        ? 'none' 
        : (isHovered 
            ? '0 12px 20px -3px rgba(0, 51, 102, 0.25)' 
            : '0 10px 15px -3px rgba(0, 51, 102, 0.1)'),
      transform: !loading && isHovered ? 'translateY(-1px)' : 'none' // Hiệu ứng nổi nhẹ khi rê chuột
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      width: '18px',
      height: '18px',
      color: 'white'
    }
  };

  return (
    <div style={s.container}>
      {/* Nhúng mã CSS cho animation quay tròn của spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

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
                type={showPassword ? "text" : "password"} 
                style={s.input}
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <span style={s.icon}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              </span>
              
              {/* Nút bấm ẩn/hiện mật khẩu bổ sung */}
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={s.eyeButton}
                tabIndex="-1"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  /* Icon ẩn mật khẩu (Eye Slash) */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  /* Icon hiện mật khẩu (Eye) */
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={s.button}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
          >
            {loading ? (
              <>
                {/* SVG Loading Spinner chuyển động mượt mà */}
                <svg style={s.spinner} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                </svg>
                <span>Đang xử lý...</span>
              </>
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