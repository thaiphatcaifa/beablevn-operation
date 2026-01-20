import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const StaffManager = () => {
  const context = useData();
  const staffList = context?.staffList || [];
  const addStaff = context?.addStaff || (() => {});
  const deleteStaff = context?.deleteStaff || (() => {});
  // [MỚI] Lấy hàm updatePassword
  const updatePassword = context?.updatePassword || (() => {});

  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;
    addStaff({ ...formData, role: 'staff' });
    setFormData({ name: '', username: '', password: '' });
    alert("Đã tạo tài khoản thành công");
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân sự này?")) {
      deleteStaff(id);
    }
  };

  // [MỚI] Hàm xử lý đặt lại mật khẩu
  const handleResetPassword = (id) => {
    const newPass = prompt("Nhập mật khẩu mới cho nhân sự này:", "123456");
    if (newPass) {
      updatePassword(id, newPass);
      alert("Đã đặt lại mật khẩu thành công!");
    }
  };

  return (
    <div>
      <h2>Quản lý Tài khoản Nhân sự</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Form tạo mới */}
        <form onSubmit={handleAdd} style={{ padding: '15px', background: '#f9f9f9', height: 'fit-content', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h4>Thêm nhân sự mới</h4>
          <input placeholder="Họ tên" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{display: 'block', marginBottom: '10px', width: '200px', padding: '5px'}}/>
          <input placeholder="Tên đăng nhập" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={{display: 'block', marginBottom: '10px', width: '200px', padding: '5px'}}/>
          <input placeholder="Mật khẩu" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{display: 'block', marginBottom: '10px', width: '200px', padding: '5px'}}/>
          <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
            Tạo tài khoản
          </button>
        </form>

        {/* Danh sách */}
        <div style={{ flex: 1 }}>
          <p>Tổng số: <strong>{staffList.length}</strong> nhân sự</p>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#eee' }}>
              <tr>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>Họ tên</th>
                <th style={{ padding: '10px' }}>Username</th>
                <th style={{ padding: '10px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length > 0 ? (
                staffList.map(staff => (
                  <tr key={staff.id}>
                    <td style={{ padding: '10px' }}>{staff.id}</td>
                    <td style={{ padding: '10px' }}>{staff.name}</td>
                    <td style={{ padding: '10px' }}>{staff.username}</td>
                    <td style={{ padding: '10px' }}>
                      {/* [MỚI] Nút Đặt lại mật khẩu */}
                      <button 
                        onClick={() => handleResetPassword(staff.id)}
                        style={{ background: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        Đổi MK
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(staff.id)}
                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Chưa có nhân sự nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManager;