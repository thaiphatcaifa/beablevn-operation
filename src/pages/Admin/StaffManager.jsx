import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// Icons SVG Minimalist
const Icons = {
  Edit: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
  Save: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
  Delete: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  Add: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Key: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
};

const StaffManager = () => {
  const { user } = useAuth();
  const { staffList, addStaff, deleteStaff, updateStaffInfo } = useData();

  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [editMode, setEditMode] = useState(null);
  const [editForm, setEditForm] = useState({});

  const isChief = user?.role === 'chief';

  if (!isChief) return <div style={{padding:'20px', color:'#d32f2f'}}>Bạn không có quyền truy cập quản lý nhân sự cấp cao.</div>;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;
    addStaff({ ...formData, role: 'staff', positions: [], baseUBI: 0, ubiPercentage: 100, status: 'active' });
    setFormData({ name: '', username: '', password: '' });
  };

  const startEdit = (staff) => {
    setEditMode(staff.id);
    setEditForm({ ...staff, newPassword: '' }); 
  };

  const saveEdit = (id) => {
    const { newPassword, ...rest } = editForm;
    const updates = { ...rest };
    if (newPassword && newPassword.trim() !== '') {
        updates.password = newPassword;
    }
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
      if(r==='chief') return 'Chief Admin';
      if(r==='reg') return 'Reg Admin';
      if(r==='op') return 'Op Admin';
      return 'Staff';
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#003366', borderBottom: '1px solid #e0e0e0', paddingBottom: '15px', fontWeight: '300' }}>Quản lý Nhân sự</h2>

      {/* FORM TẠO MỚI */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #f0f0f0' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#003366', fontWeight: '600' }}>+ Tạo tài khoản mới</h4>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input placeholder="Họ và Tên" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={styles.input} />
          <input placeholder="ID Đăng nhập" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required style={styles.input} />
          <input placeholder="Mật khẩu" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required style={styles.input} />
          <button type="submit" style={styles.btnAdd}><Icons.Add /> Tạo mới</button>
        </form>
      </div>

      {/* DANH SÁCH NHÂN SỰ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {staffList.map(staff => (
          <div key={staff.id} style={{ 
              background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', 
              border: editMode === staff.id ? '1px solid #003366' : '1px solid #f0f0f0',
              opacity: (staff.status === 'suspended' && editMode !== staff.id) ? 0.6 : 1,
              display: 'flex', flexDirection: 'column',
              transition: 'all 0.2s ease'
          }}>
            
            {/* HEADER CARD */}
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

            {/* BODY & FOOTER */}
            <div style={{ flex: 1 }}>
              {editMode === staff.id ? (
                  // --- CHẾ ĐỘ SỬA ---
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={styles.group}>
                          <label style={styles.label}>Định danh</label>
                          <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Tên hiển thị" style={styles.inputFull} />
                          <div style={{display:'flex', gap: '8px', marginTop: '8px'}}>
                              <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} placeholder="ID" style={styles.inputFull} />
                              <div style={{position:'relative', width: '100%'}}>
                                  <input value={editForm.newPassword} onChange={e => setEditForm({...editForm, newPassword: e.target.value})} placeholder="Reset mật khẩu..." style={{...styles.inputFull, paddingLeft: '28px'}} />
                                  <div style={{position:'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)'}}><Icons.Key /></div>
                              </div>
                          </div>
                      </div>

                      <div style={styles.group}>
                          <label style={styles.label}>Quyền & Vị trí</label>
                          <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={styles.inputFull}>
                              <option value="staff">Staff</option><option value="op">Operational Admin</option><option value="reg">Regulatory Admin</option><option value="chief">Chief Admin</option>
                          </select>
                          <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'8px'}}>
                              {['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'].map(r => (
                                  <label key={r} style={styles.checkboxLabel}>
                                      <input type="checkbox" checked={editForm.positions?.includes(r)} onChange={() => handlePositionToggle(r)}/> {r}
                                  </label>
                              ))}
                          </div>
                      </div>

                      <div style={styles.group}>
                          <label style={styles.label}>Tài chính & Trạng thái</label>
                          <div style={{display:'flex', gap:'5px'}}>
                              <input type="number" value={editForm.baseUBI} onChange={e => setEditForm({...editForm, baseUBI: Number(e.target.value)})} placeholder="UBI" style={styles.inputFull}/>
                              <select value={editForm.ubiPercentage} onChange={e => setEditForm({...editForm, ubiPercentage: Number(e.target.value)})} style={{width: '90px', ...styles.inputFull}}>
                                  <option value={100}>100%</option><option value={75}>75%</option><option value={50}>50%</option><option value={25}>25%</option>
                              </select>
                          </div>
                          <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{marginTop: '8px', ...styles.inputFull, borderColor: editForm.status==='suspended'?'red':'#ddd'}}>
                              <option value="active">Active</option><option value="suspended">Suspended</option>
                          </select>
                      </div>

                      <div style={{display:'flex', gap:'8px', marginTop: '5px'}}>
                          <button onClick={() => saveEdit(staff.id)} style={styles.btnSave}><Icons.Save/> Lưu</button>
                          <button onClick={() => setEditMode(null)} style={styles.btnCancel}>Hủy</button>
                      </div>
                  </div>
              ) : (
                  // --- CHẾ ĐỘ XEM ---
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <div style={{fontSize: '0.9rem', color: '#4b5563'}}>
                          {staff.phone && <div>📞 {staff.phone}</div>}
                          {staff.email && <div>✉️ {staff.email}</div>}
                          
                          {/* Hiển thị Roles */}
                          <div style={{marginTop:'12px', display:'flex', flexWrap:'wrap', gap:'5px'}}>
                              {staff.positions && staff.positions.length > 0 ? staff.positions.map(p => (
                                  <span key={p} style={{fontSize:'0.75rem', background:'#f3f4f6', color:'#1f2937', padding:'3px 8px', borderRadius:'4px', border:'1px solid #e5e7eb'}}>{p}</span>
                              )) : <span style={{fontSize:'0.75rem', color:'#9ca3af', fontStyle:'italic'}}>Chưa xét vị trí</span>}
                          </div>
                          
                          {/* Hiển thị UBI */}
                          <div style={{marginTop: '15px', padding:'10px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #f3f4f6'}}>
                               <div style={{fontSize: '0.7rem', color:'#6b7280', textTransform:'uppercase', letterSpacing: '0.5px'}}>Thu nhập UBI ({staff.ubiPercentage}%)</div>
                               <div style={{color: '#059669', fontWeight:'700', fontSize:'1rem'}}>
                                  {((staff.baseUBI || 0) * (staff.ubiPercentage || 100) / 100).toLocaleString()} <span style={{fontSize:'0.75rem', color:'#374151', fontWeight: '400'}}>VNĐ</span>
                               </div>
                          </div>
                      </div>

                      {/* NÚT THAO TÁC (NẰM TRONG THẺ) */}
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

const styles = {
    input: { padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', flex: 1, fontSize: '0.9rem', outline: 'none' },
    inputFull: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '5px', width: '100%', boxSizing: 'border-box', fontSize: '0.85rem' },
    group: { background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' },
    label: { fontSize: '0.7rem', fontWeight: '700', color: '#4b5563', marginBottom: '6px', display: 'block', textTransform: 'uppercase' },
    checkboxLabel: { fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer' },
    
    btnAdd: { background: '#003366', color: 'white', border: 'none', borderRadius: '6px', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' },
    btnSave: { background: '#003366', color: 'white', border: 'none', borderRadius: '5px', padding: '8px', flex: 1, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '0.85rem' },
    btnCancel: { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
    
    btnEdit: { background: 'white', border: '1px solid #003366', color: '#003366', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' },
    btnDelete: { background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }
};

export default StaffManager;