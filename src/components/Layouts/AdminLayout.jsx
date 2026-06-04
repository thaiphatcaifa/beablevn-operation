import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- BỘ ICON ADMIN TINH TẾ (MINIMALIST SVG) ---
const Icons = {
  Staff: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#2B6830" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Task: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#2B6830" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.485m1.5 0v.908l4.5 4.5m-4.5-4.5l4.5 4.5" />
    </svg>
  ),
  Discipline: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#2B6830" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  // --- BỔ SUNG ICON CHO THẺ CSHT ---
  Facility: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#2B6830" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Report: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke={active ? "#2B6830" : "#9ca3af"} width="22" height="22" style={{ transition: 'all 0.3s ease' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  Switch: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  )
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/" />;

  const isActive = (path) => location.pathname.includes(path);
  const isScheduler = user?.role === 'scheduler';
  const canManageFacility = user?.role === 'chief' || user?.role === 'reg'; // Chỉ có Chief và Reg mới thấy tab CSHT

  // Style cho Sidebar Desktop
  const sidebarLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '14px 18px', textDecoration: 'none',
    color: isActive(path) ? '#2B6830' : '#4b5563',
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
    color: isActive(path) ? '#2B6830' : '#9ca3af',
    flex: 1, padding: '10px 0',
    position: 'relative',
    transition: 'all 0.3s ease'
  });

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', background: '#f4f7f6', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <style>{`
        /* Desktop: Tối ưu Sidebar rộng rãi hơn */
        .admin-container { display: flex; }
        .admin-sidebar { width: 280px; height: 100vh; position: fixed; left: 0; top: 0; background: #ffffff; border-right: 1px solid rgba(0,0,0,0.05); display: flex; flex-direction: column; z-index: 50; }
        .admin-content { margin-left: 280px; padding: 32px; flex: 1; box-sizing: border-box; max-width: 1400px; margin-right: auto; }
        .admin-bottom-nav { display: none; }
        .admin-header-mobile { display: none; }
        
        .sidebar-link:hover:not(.active) {
            background: #f8fafc !important;
            transform: translateX(4px);
        }

        .btn-switch-sidebar {
            display: flex; align-items: center; justify-content: center; gap: 10px;
            padding: 14px 16px; text-decoration: none;
            color: #2B6830; background: #ffffff;
            border-radius: 12px; margin-top: 24px;
            font-weight: 700; font-size: 0.95rem; transition: all 0.2s ease;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .btn-switch-sidebar:hover {
            background: #f0f9ff;
            border-color: #bae6fd;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .btn-logout-sidebar {
            width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; 
            padding: 14px; background: #fef2f2; color: #dc2626; 
            border: 1px solid #fee2e2; border-radius: 12px; cursor: pointer; 
            font-weight: 700; font-size: 0.95rem; transition: all 0.2s ease;
        }
        .btn-logout-sidebar:hover {
            background: #fecaca;
            border-color: #fca5a5;
        }

        /* Mobile Responsive (< 850px) */
        @media (max-width: 850px) {
          .admin-container { display: block; }
          .admin-sidebar { display: none; }
          .admin-content { margin-left: 0; padding: 16px; padding-bottom: 90px; } 
          
          .admin-bottom-nav { 
              display: flex; position: fixed; bottom: 0; left: 0; right: 0; 
              background: rgba(255,255,255,0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
              border-top: 1px solid rgba(0,0,0,0.05); height: 68px; z-index: 1000; 
              justify-content: space-around; padding-bottom: env(safe-area-inset-bottom); 
              box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
          }
          
          .admin-header-mobile { 
              display: flex; align-items: center; justify-content: space-between; 
              padding: 0 20px; height: 64px; 
              background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
              border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; 
          }
        }
      `}</style>

      {/* 1. SIDEBAR (DESKTOP ONLY) */}
      <aside className="admin-sidebar">
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/BA LOGO.png" alt="Logo" style={{ height: '38px', objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
             <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '800', letterSpacing: '-0.02em' }}>BE ABLE VN</h2>
             <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>Quản trị hệ thống</span>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
          {!isScheduler && (
             <Link to="/admin/staff-manager" className={`sidebar-link ${isActive('staff-manager') ? 'active' : ''}`} style={sidebarLinkStyle('staff-manager')}>
                <Icons.Staff active={isActive('staff-manager')} /> <span>Nhân sự</span>
             </Link>
          )}
          
          <Link to="/admin/task-manager" className={`sidebar-link ${isActive('task-manager') ? 'active' : ''}`} style={sidebarLinkStyle('task-manager')}>
            <Icons.Task active={isActive('task-manager')} /> <span>Nhiệm vụ</span>
          </Link>

          {!isScheduler && (
             <>
               <Link to="/admin/discipline-manager" className={`sidebar-link ${isActive('discipline-manager') ? 'active' : ''}`} style={sidebarLinkStyle('discipline-manager')}>
                  <Icons.Discipline active={isActive('discipline-manager')} /> <span>Kỷ luật</span>
               </Link>
               
               {/* --- BỔ SUNG THẺ CSHT VÀO SIDEBAR --- */}
               {canManageFacility && (
                 <Link to="/admin/facility-manager" className={`sidebar-link ${isActive('facility-manager') ? 'active' : ''}`} style={sidebarLinkStyle('facility-manager')}>
                    <Icons.Facility active={isActive('facility-manager')} /> <span>Cơ sở hạ tầng</span>
                 </Link>
               )}

               <Link to="/admin/reports" className={`sidebar-link ${isActive('reports') ? 'active' : ''}`} style={sidebarLinkStyle('reports')}>
                  <Icons.Report active={isActive('reports')} /> <span>Báo cáo</span>
               </Link>
             </>
          )}

          {/* NÚT ĐIỀU HƯỚNG VỀ GIAO DIỆN NHÂN VIÊN */}
          <Link to="/staff" className="btn-switch-sidebar">
             <Icons.Switch /> <span>Giao diện Cá nhân</span>
          </Link>
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
          <button onClick={logout} className="btn-logout-sidebar">
            <Icons.Logout /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER */}
      <div className="admin-header-mobile">
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/BA LOGO.png" alt="Logo" style={{ height: '32px' }} />
            <span style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>BE ABLE VN</span>
         </div>
         <button onClick={logout} style={{ fontSize: '0.85rem', fontWeight: '700', padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px' }}>Thoát</button>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="admin-content">
        <Outlet />
      </div>

      {/* 4. MOBILE BOTTOM NAV (MOBILE ONLY) */}
      <nav className="admin-bottom-nav">
        {!isScheduler && (
            <Link to="/admin/staff-manager" style={mobileNavItemStyle('staff-manager')}>
                {isActive('staff-manager') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#2B6830', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
                <Icons.Staff active={isActive('staff-manager')} />
                <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('staff-manager') ? '700' : '500' }}>Nhân sự</span>
            </Link>
        )}
        <Link to="/admin/task-manager" style={mobileNavItemStyle('task-manager')}>
            {isActive('task-manager') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#2B6830', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
            <Icons.Task active={isActive('task-manager')} />
            <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('task-manager') ? '700' : '500' }}>Nhiệm vụ</span>
        </Link>
        {!isScheduler && (
           <>
              <Link to="/admin/discipline-manager" style={mobileNavItemStyle('discipline-manager')}>
                  {isActive('discipline-manager') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#2B6830', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
                  <Icons.Discipline active={isActive('discipline-manager')} />
                  <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('discipline-manager') ? '700' : '500' }}>Kỷ luật</span>
              </Link>
              
              {/* --- BỔ SUNG THẺ CSHT VÀO BOTTOM NAV --- */}
              {canManageFacility && (
                 <Link to="/admin/facility-manager" style={mobileNavItemStyle('facility-manager')}>
                    {isActive('facility-manager') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#2B6830', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
                    <Icons.Facility active={isActive('facility-manager')} />
                    <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('facility-manager') ? '700' : '500' }}>CSHT</span>
                 </Link>
              )}

              <Link to="/admin/reports" style={mobileNavItemStyle('reports')}>
                  {isActive('reports') && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '3px', background: '#2B6830', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }} />}
                  <Icons.Report active={isActive('reports')} />
                  <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: isActive('reports') ? '700' : '500' }}>Báo cáo</span>
              </Link>
           </>
        )}
        {/* NÚT CHUYỂN QUA GIAO DIỆN NHÂN VIÊN TRÊN ĐIỆN THOẠI */}
        <Link to="/staff" style={mobileNavItemStyle('staff')}>
            <div style={{color: '#2B6830'}}><Icons.Switch /></div>
            <span style={{ fontSize: '0.65rem', marginTop: '6px', fontWeight: '700', color: '#2B6830' }}>Cá nhân</span>
        </Link>
      </nav>
    </div>
  );
};

export default AdminLayout;