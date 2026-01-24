import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- BỘ ICON MINIMALIST (Tối giản, Thẩm mỹ) ---
const Icons = {
  Edit: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  Save: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Delete: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Add: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Key: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  )
};

const StaffManager = () => {
  const { user } = useAuth();
  const { staffList, addStaff, deleteStaff, updateStaffInfo } = useData();

  // State cho Form tạo mới (Quick Add)
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  
  // State cho chế độ chỉnh sửa
  const [editMode, setEditMode] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Chỉ Chief Admin mới được truy cập
  const isChief = user?.role === 'chief';
  if (!isChief) return <div style={{padding:'20px', color:'#d32f2f'}}>Bạn không có quyền truy cập quản lý nhân sự cấp cao.</div>;

  // --- HÀM XỬ LÝ ---

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;
    
    // Khởi tạo nhân sự với các trường tài chính mặc định = 0
    addStaff({ 
        ...formData, 
        role: 'staff', 
        positions: [], 
        ubi1Base: 0, ubi1Percent: 100,
        ubi2Base: 0, ubi2Percent: 100,
        remuneration: 0,
        status: 'active' 
    });
    setFormData({ name: '', username: '', password: '' });
  };

  const startEdit = (staff) => {
    setEditMode(staff.id);
    // Copy data vào form edit, thêm trường newPassword rỗng
    setEditForm({ 
        ...staff, 
        newPassword: '',
        // Đảm bảo các trường số có giá trị để không bị lỗi uncontrolled input
        ubi1Base: staff.ubi1Base || 0,
        ubi1Percent: staff.ubi1Percent || 100,
        ubi2Base: staff.ubi2Base || 0,
        ubi2Percent: staff.ubi2Percent || 100,
        remuneration: staff.remuneration || 0
    }); 
  };

  const saveEdit = (id) => {
    const { newPassword, ...rest } = editForm;
    const updates = { ...rest };
    
    // Chỉ cập nhật mật khẩu nếu có nhập mới
    if (newPassword && newPassword.trim() !== '') {
        updates.password = newPassword;
    }
    
    // Ép kiểu số cho chắc chắn
    updates.ubi1Base = Number(updates.ubi1Base);
    updates.ubi1Percent = Number(updates.ubi1Percent);
    updates.ubi2Base = Number(updates.ubi2Base);
    updates.ubi2Percent = Number(updates.ubi2Percent);
    updates.remuneration = Number(updates.remuneration);

    updateStaffInfo(id, updates);
    setEditMode(null);
    setEditForm({});
    alert("Cập nhật thông tin thành công!");
  };

  const handlePositionToggle = (pos) => {
    const current = editForm.positions || [];
    setEditForm({ 
        ...editForm, 
        positions: current.includes(pos) ? current.filter(p => p !== pos) : [...current, pos] 
    });
  };

  const roleName = (r) => {
      switch(r) {
          case 'chief': return 'Chief Admin';
          case 'reg': return 'Regulatory Admin';
          case 'op': return 'Operational Admin';
          default: return 'Staff';
      }
  };

  // Hàm tính tổng thu nhập ước tính để hiển thị
  const calculateTotal = (s) => {
      const ubi1 = (s.ubi1Base || 0) * (s.ubi1Percent || 0) / 100;
      const ubi2 = (s.ubi2Base || 0) * (s.ubi2Percent || 0) / 100;
      const rem = s.remuneration || 0;
      return ubi1 + ubi2 + rem;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#003366', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px', fontWeight: '300' }}>
        Quản lý Nhân sự (Chief Admin)
      </h2>

      {/* 1. FORM TẠO MỚI (QUICK ADD) - GIỮ NGUYÊN GIAO DIỆN CŨ */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #f0f0f0' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#003366', fontWeight: '600' }}>+ Tạo tài khoản mới</h4>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            placeholder="Họ và Tên" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            required 
            style={styles.input} 
          />
          <input 
            placeholder="ID Đăng nhập" 
            value={formData.username} 
            onChange={e => setFormData({ ...formData, username: e.target.value })} 
            required 
            style={styles.input} 
          />
          <input 
            placeholder="Mật khẩu" 
            type="password" 
            value={formData.password} 
            onChange={e => setFormData({ ...formData, password: e.target.value })} 
            required 
            style={styles.input} 
          />
          <button type="submit" style={styles.btnAdd}>
            <Icons.Add /> Tạo mới
          </button>
        </form>
      </div>

      {/* 2. DANH SÁCH NHÂN SỰ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {staffList.map(staff => (
          <div key={staff.id} style={{ 
              background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', 
              border: editMode === staff.id ? '2px solid #003366' : '1px solid #f0f0f0',
              opacity: (staff.status === 'suspended' && editMode !== staff.id) ? 0.6 : 1,
              transition: 'all 0.2s ease'
          }}>
            
            {/* HEADER CARD: Avatar + Tên + Role */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f5f5f5', paddingBottom: '10px' }}>
               <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                  <div style={{width:'40px', height:'40px', background:'#e6f7ff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#003366', fontWeight:'bold', fontSize:'1rem'}}>
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:'600', color:'#111827'}}>{staff.name}</div>
                    <div style={{fontSize:'0.8rem', color:'#6b7280'}}>@{staff.username}</div>
                  </div>
               </div>
               <span style={{ background: '#f9fafb', color: '#4b5563', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', height: 'fit-content', fontWeight: '500', border: '1px solid #e5e7eb' }}>
                  {roleName(staff.role)}
               </span>
            </div>

            {/* BODY CARD */}
            <div style={{ flex: 1 }}>
              {editMode === staff.id ? (
                  // --- GIAO DIỆN CHỈNH SỬA (LAYOUT 3 PHẦN MỚI) ---
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      
                      {/* PHẦN 1: ĐỊNH DANH */}
                      <div style={styles.sectionBox}>
                          <div style={styles.sectionTitle}>1. Định danh</div>
                          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                              <input 
                                value={editForm.name} 
                                onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                placeholder="Tên hiển thị" 
                                style={styles.inputFull} 
                              />
                              <div style={{display:'flex', gap: '8px'}}>
                                  <input 
                                    value={editForm.username} 
                                    onChange={e => setEditForm({...editForm, username: e.target.value})} 
                                    placeholder="ID Account" 
                                    style={styles.inputFull} 
                                  />
                                  <div style={{position:'relative', width: '100%'}}>
                                      <input 
                                        value={editForm.newPassword} 
                                        onChange={e => setEditForm({...editForm, newPassword: e.target.value})} 
                                        placeholder="Reset mật khẩu..." 
                                        style={{...styles.inputFull, paddingLeft: '28px'}} 
                                      />
                                      <div style={{position:'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)'}}>
                                        <Icons.Key />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* PHẦN 2: QUYỀN & VỊ TRÍ */}
                      <div style={styles.sectionBox}>
                          <div style={styles.sectionTitle}>2. Quyền & Vị trí</div>
                          <select 
                            value={editForm.role} 
                            onChange={e => setEditForm({...editForm, role: e.target.value})} 
                            style={styles.inputFull}
                          >
                              <option value="staff">Staff (Nhân viên)</option>
                              <option value="op">Operational Admin</option>
                              <option value="reg">Regulatory Admin</option>
                              <option value="chief">Chief Admin</option>
                          </select>
                          <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'8px'}}>
                              {['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'].map(r => (
                                  <label key={r} style={styles.checkboxLabel}>
                                      <input 
                                        type="checkbox" 
                                        checked={editForm.positions?.includes(r)} 
                                        onChange={() => handlePositionToggle(r)}
                                      /> {r}
                                  </label>
                              ))}
                          </div>
                          <select 
                            value={editForm.status} 
                            onChange={e => setEditForm({...editForm, status: e.target.value})} 
                            style={{marginTop: '8px', ...styles.inputFull, borderColor: editForm.status==='suspended'?'red':'#d1d5db', color: editForm.status==='suspended'?'red':'inherit'}}
                          >
                              <option value="active">Active (Hoạt động)</option>
                              <option value="suspended">Suspended (Đình chỉ)</option>
                          </select>
                      </div>

                      {/* PHẦN 3: TÀI CHÍNH (CẬP NHẬT MỚI) */}
                      <div style={styles.sectionBox}>
                          <div style={styles.sectionTitle}>3. Tài chính</div>
                          
                          {/* UBI 1 */}
                          <div style={styles.financeRow}>
                              <span style={styles.financeLabel}>UBI 1</span>
                              <input 
                                type="number" 
                                placeholder="Tiền (VNĐ)"
                                value={editForm.ubi1Base} 
                                onChange={e => setEditForm({...editForm, ubi1Base: Number(e.target.value)})} 
                                style={{...styles.inputFull, flex: 2}}
                              />
                              <input 
                                type="number" 
                                placeholder="%"
                                value={editForm.ubi1Percent} 
                                onChange={e => setEditForm({...editForm, ubi1Percent: Number(e.target.value)})} 
                                style={{...styles.inputFull, flex: 1}}
                              />
                          </div>

                          {/* UBI 2 */}
                          <div style={styles.financeRow}>
                              <span style={styles.financeLabel}>UBI 2</span>
                              <input 
                                type="number" 
                                placeholder="Tiền (VNĐ)"
                                value={editForm.ubi2Base} 
                                onChange={e => setEditForm({...editForm, ubi2Base: Number(e.target.value)})} 
                                style={{...styles.inputFull, flex: 2}}
                              />
                              <input 
                                type="number" 
                                placeholder="%"
                                value={editForm.ubi2Percent} 
                                onChange={e => setEditForm({...editForm, ubi2Percent: Number(e.target.value)})} 
                                style={{...styles.inputFull, flex: 1}}
                              />
                          </div>

                          {/* Remuneration */}
                          <div style={styles.financeRow}>
                              <span style={styles.financeLabel}>Remuneration</span>
                              <input 
                                type="number" 
                                placeholder="Thù lao (VNĐ)"
                                value={editForm.remuneration} 
                                onChange={e => setEditForm({...editForm, remuneration: Number(e.target.value)})} 
                                style={{...styles.inputFull, flex: 3}} // Chiếm hết phần còn lại
                              />
                          </div>
                      </div>

                      {/* BUTTONS ACTIONS */}
                      <div style={{display:'flex', gap:'8px', marginTop: '5px'}}>
                          <button onClick={() => saveEdit(staff.id)} style={styles.btnSave}>
                            <Icons.Save/> Lưu thay đổi
                          </button>
                          <button onClick={() => setEditMode(null)} style={styles.btnCancel}>Hủy</button>
                      </div>
                  </div>
              ) : (
                  // --- CHẾ ĐỘ XEM (VIEW MODE) ---
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <div style={{fontSize: '0.9rem', color: '#4b5563'}}>
                          {/* Hiển thị Roles */}
                          <div style={{marginTop:'0px', display:'flex', flexWrap:'wrap', gap:'5px', minHeight: '24px'}}>
                              {staff.positions && staff.positions.length > 0 ? staff.positions.map(p => (
                                  <span key={p} style={{fontSize:'0.75rem', background:'#f3f4f6', color:'#1f2937', padding:'3px 8px', borderRadius:'4px', border:'1px solid #e5e7eb'}}>{p}</span>
                              )) : <span style={{fontSize:'0.75rem', color:'#9ca3af', fontStyle:'italic'}}>Chưa xét vị trí</span>}
                          </div>
                          
                          {/* Tổng quan Tài chính */}
                          <div style={{marginTop: '15px', padding:'10px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #f3f4f6'}}>
                               <div style={{fontSize: '0.7rem', color:'#6b7280', textTransform:'uppercase', letterSpacing: '0.5px', marginBottom:'4px'}}>
                                  Tổng thu nhập ước tính
                               </div>
                               <div style={{color: '#059669', fontWeight:'700', fontSize:'1.1rem'}}>
                                  {calculateTotal(staff).toLocaleString()} <span style={{fontSize:'0.75rem', color:'#374151', fontWeight: '400'}}>VNĐ</span>
                               </div>
                               <div style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px'}}>
                                  UBI 1: {(staff.ubi1Base || 0).toLocaleString()} | UBI 2: {(staff.ubi2Base || 0).toLocaleString()}
                               </div>
                          </div>
                      </div>

                      {/* NÚT THAO TÁC */}
                      <div style={{marginTop:'20px', paddingTop:'15px', borderTop:'1px solid #f3f4f6', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                          <button onClick={() => startEdit(staff)} style={styles.btnEdit}>
                              <Icons.Edit/> Điều chỉnh
                          </button>
                          <button onClick={() => { if(window.confirm('Xóa nhân sự này?')) deleteStaff(staff.id) }} style={styles.btnDelete}>
                              <Icons.Delete/> Xóa
                          </button>
                      </div>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STYLES OBJECT ---
const styles = {
    // Input cơ bản
    input: { padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', flex: 1, fontSize: '0.9rem', outline: 'none' },
    
    // Input full width trong form edit
    inputFull: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '5px', width: '100%', boxSizing: 'border-box', fontSize: '0.85rem', outline: 'none' },
    
    // Khung bao quanh từng phần (Layout 3 phần)
    sectionBox: { background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' },
    sectionTitle: { fontSize: '0.75rem', fontWeight: '700', color: '#003366', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    // Checkbox Label
    checkboxLabel: { fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer' },
    
    // Tài chính Row
    financeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
    financeLabel: { fontSize: '0.8rem', fontWeight: '600', color: '#4b5563', width: '90px' },

    // Buttons
    btnAdd: { background: '#003366', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' },
    
    // Nút Lưu (Xanh dương đậm theo yêu cầu)
    btnSave: { background: '#003366', color: 'white', border: 'none', borderRadius: '5px', padding: '8px', flex: 1, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '0.85rem' },
    btnCancel: { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
    
    btnEdit: { background: 'white', border: '1px solid #003366', color: '#003366', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' },
    btnDelete: { background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }
};

export default StaffManager;