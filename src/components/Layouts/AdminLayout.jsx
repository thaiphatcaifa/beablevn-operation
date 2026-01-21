import React from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Icons SVG Minimalist (Stroke 1.5px)
const Icons = {
  Staff: ({ active }) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#003366" : "#6b7280"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Task: ({ active }) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#003366" : "#6b7280"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
  Discipline: ({ active }) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#003366" : "#6b7280"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
  Report: ({ active }) => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={active ? "#003366" : "#6b7280"} strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || !['chief', 'reg', 'op'].includes(user.role)) return <Navigate to="/" />;

  const isActive = (path) => location.pathname === path;
  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#003366' : '#4b5563',
    fontWeight: isActive(path) ? '600' : '400',
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px',
    borderRadius: '8px',
    background: isActive(path) ? '#e6f7ff' : 'transparent',
    transition: 'all 0.2s',
    marginBottom: '5px'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9fafb' }}>
      <header style={{ background: '#ffffff', color: '#003366', padding: '0 20px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/BA LOGO.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.025em' }}>Be Able VN</h1>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role} Dashboard</span>
          </div>
        </div>
        <button onClick={logout} style={{ border: '1px solid #e5e7eb', background: 'white', color: '#374151', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'all 0.2s' }}>Đăng xuất</button>
      </header>
      <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <aside style={{ width: '260px', background: '#fff', padding: '24px 16px', borderRight: '1px solid #f3f4f6', display: 'none' }} className="desktop-sidebar">
          <nav>
            <Link to="/admin/staff-manager" style={linkStyle('/admin/staff-manager')}>
              <Icons.Staff active={isActive('/admin/staff-manager')} /> Quản lý Nhân sự
            </Link>
            {(user.role === 'op' || user.role === 'chief') && (
              <Link to="/admin/task-manager" style={linkStyle('/admin/task-manager')}>
                <Icons.Task active={isActive('/admin/task-manager')} /> Điều phối & Giao việc
              </Link>
            )}
            {(user.role === 'reg' || user.role === 'chief') && (
              <Link to="/admin/discipline-manager" style={linkStyle('/admin/discipline-manager')}>
                <Icons.Discipline active={isActive('/admin/discipline-manager')} /> Quy chế & Duyệt
              </Link>
            )}
            <Link to="/admin/reports" style={linkStyle('/admin/reports')}>
              <Icons.Report active={isActive('/admin/reports')} /> Báo cáo tổng hợp
            </Link>
          </nav>
        </aside>
        <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}><Outlet /></main>
      </div>
      <style>{`.desktop-sidebar{display:block!important}@media(max-width:768px){.desktop-sidebar{display:none!important}}`}</style>
    </div>
  );
};

export default AdminLayout;