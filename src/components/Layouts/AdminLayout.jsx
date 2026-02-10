import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- BỘ ICON ADMIN TINH TẾ (MINIMALIST SVG) ---
const Icons = {
  // Staff Manager: Users Group
  Staff: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  // Task Manager: Clipboard Document
  Task: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.485m1.5 0v.908l4.5 4.5m-4.5-4.5l4.5 4.5" />
    </svg>
  ),
  // Discipline: Shield Warning
  Discipline: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  // Reports: Chart Pie
  Report: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={active ? "#003366" : "#9ca3af"} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/" />;

  const isActive = (path) => location.pathname.includes(path);
  const isScheduler = user?.role === 'scheduler';

  // Style cho Sidebar Desktop
  const sidebarLinkStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', textDecoration: 'none',
    color: isActive(path) ? '#003366' : '#4b5563',
    background: isActive(path) ? '#f0f9ff' : 'transparent',
    borderRadius: '8px', marginBottom: '8px',
    fontWeight: isActive(path) ? '600' : '500',
    transition: 'all 0.2s'
  });

  // Style cho Mobile Bottom Nav
  const mobileNavItemStyle = (path) => ({ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', 
    color: isActive(path) ? '#003366' : '#9ca3af',
    flex: 1, padding: '10px 0',
    borderTop: isActive(path) ? '2px solid #003366' : '2px solid transparent'
  });

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* CSS RESPONSIVE INJECTED TRỰC TIẾP */}
      <style>{`
        /* Mặc định (Desktop): Hiện Sidebar, Ẩn Bottom Nav */
        .admin-container { display: flex; }
        .admin-sidebar { width: 260px; height: 100vh; position: fixed; left: 0; top: 0; background: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; z-index: 50; }
        .admin-content { margin-left: 260px; padding: 24px; flex: 1; }
        .admin-bottom-nav { display: none; }
        .admin-header-mobile { display: none; }

        /* Mobile (Màn hình < 768px): Ẩn Sidebar, Hiện Bottom Nav */
        @media (max-width: 768px) {
          .admin-container { display: block; }
          .admin-sidebar { display: none; }
          .admin-content { margin-left: 0; padding: 16px; padding-bottom: 80px; } /* Padding bottom để tránh bị nav che */
          .admin-bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-top: 1px solid #e5e7eb; height: 60px; z-index: 1000; justify-content: space-around; padding-bottom: env(safe-area-inset-bottom); }
          
          /* Header mobile đơn giản */
          .admin-header-mobile { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 100; }
        }
      `}</style>

      {/* 1. SIDEBAR (DESKTOP ONLY) */}
      <aside className="admin-sidebar">
        <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/BA LOGO.png" alt="Logo" style={{ height: '32px' }} />
          <div>
             <h2 style={{ margin: 0, fontSize: '1rem', color: '#003366' }}>Admin Portal</h2>
             <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quản lý hệ thống</span>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '24px' }}>
          {!isScheduler && (
             <Link to="/admin/staff-manager" style={sidebarLinkStyle('staff-manager')}>
                <Icons.Staff active={isActive('staff-manager')} /> <span>Nhân sự</span>
             </Link>
          )}
          
          <Link to="/admin/task-manager" style={sidebarLinkStyle('task-manager')}>
            <Icons.Task active={isActive('task-manager')} /> <span>Nhiệm vụ</span>
          </Link>

          {!isScheduler && (
             <>
               <Link to="/admin/discipline-manager" style={sidebarLinkStyle('discipline-manager')}>
                  <Icons.Discipline active={isActive('discipline-manager')} /> <span>Kỷ luật</span>
               </Link>
               <Link to="/admin/reports" style={sidebarLinkStyle('reports')}>
                  <Icons.Report active={isActive('reports')} /> <span>Báo cáo</span>
               </Link>
             </>
          )}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            <Icons.Logout /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER */}
      <div className="admin-header-mobile">
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/BA LOGO.png" alt="Logo" style={{ height: '28px' }} />
            <span style={{ fontWeight: 'bold', color: '#003366' }}>Admin Portal</span>
         </div>
         <button onClick={logout} style={{ fontSize: '0.8rem', padding: '4px 10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '4px' }}>Thoát</button>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="admin-content">
        <Outlet />
      </div>

      {/* 4. MOBILE BOTTOM NAV (MOBILE ONLY) */}
      <nav className="admin-bottom-nav">
        {!isScheduler && (
            <Link to="/admin/staff-manager" style={mobileNavItemStyle('staff-manager')}>
                <Icons.Staff active={isActive('staff-manager')} />
                <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('staff-manager') ? '600' : '500' }}>Nhân sự</span>
            </Link>
        )}
        <Link to="/admin/task-manager" style={mobileNavItemStyle('task-manager')}>
            <Icons.Task active={isActive('task-manager')} />
            <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('task-manager') ? '600' : '500' }}>Nhiệm vụ</span>
        </Link>
        {!isScheduler && (
           <>
              <Link to="/admin/discipline-manager" style={mobileNavItemStyle('discipline-manager')}>
                  <Icons.Discipline active={isActive('discipline-manager')} />
                  <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('discipline-manager') ? '600' : '500' }}>Kỷ luật</span>
              </Link>
              <Link to="/admin/reports" style={mobileNavItemStyle('reports')}>
                  <Icons.Report active={isActive('reports')} />
                  <span style={{ fontSize: '0.65rem', marginTop: '4px', fontWeight: isActive('reports') ? '600' : '500' }}>Báo cáo</span>
              </Link>
           </>
        )}
      </nav>
    </div>
  );
};

export default AdminLayout;