import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div>
      <header style={{ background: '#003366', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src="/BA LOGO.png" 
            alt="Be Able VN Logo" 
            style={{ height: '50px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '8px', padding: '2px' }} 
          />
          <h3 style={{ margin: 0 }}>Be Able VN - Admin</h3>
        </div>
        <div>
          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Xin chào, {user.name}</span>
          <button 
            onClick={logout}
            style={{ padding: '6px 15px', cursor: 'pointer', borderRadius: '4px', border: 'none', fontWeight: 'bold' }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: '220px', background: '#f4f4f4', padding: '20px', borderRight: '1px solid #ddd' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{marginBottom: '15px'}}>
              <Link to="/admin/staff-manager" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>👥 Quản lý Nhân sự</Link>
            </li>
            <li style={{marginBottom: '15px'}}>
              <Link to="/admin/task-manager" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>📋 Giao đầu việc</Link>
            </li>
            <li style={{marginBottom: '15px'}}>
              <Link to="/admin/reports" style={{ textDecoration: 'none', color: '#333', fontWeight: '500' }}>📊 Báo cáo tổng hợp</Link>
            </li>
          </ul>
        </aside>
        <main style={{ flex: 1, padding: '20px', backgroundColor: '#fff' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;