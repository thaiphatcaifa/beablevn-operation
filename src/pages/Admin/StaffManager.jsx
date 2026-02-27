import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import bcrypt from 'bcryptjs';

// --- BỘ ICON MINIMALIST ---
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
  ),
  Search: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
};

// --- HELPER AN TOÀN SỐ ---
const safeNumber = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

const StaffManager = () => {
  const { user } = useAuth();
  const { staffList, addStaff, deleteStaff, updateStaffInfo } = useData();

  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [editMode, setEditMode] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterRole, setFilterRole] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  const POSITIONS = ['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'];

  const isChief = user?.role === 'chief';
  if (!isChief) return <div style={{padding:'20px', color:'#d32f2f'}}>Bạn không có quyền truy cập quản lý nhân sự cấp cao.</div>;

  const getLastName = (fullName) => {
      if (!fullName) return '';
      const parts = fullName.trim().split(' ');
      return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const filteredStaffList = staffList.filter(staff => {
      if (filterRole === 'admin') {
          if (['staff'].includes(staff.role)) return false;
      } else if (filterRole === 'staff') {
          if (staff.role !== 'staff') return false;
      }
      if (searchTerm) {
          const namePart = getLastName(staff.name);
          if (!namePart.includes(searchTerm.toLowerCase().trim())) return false;
      }
      return true;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;
    
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(formData.password, salt);

    addStaff({ 
        ...formData, 
        password: hashedPassword,
        role: 'staff', positions: [], 
        minWorkHours: 0, // Giá trị mặc định
        ubi1Base: 0, ubi1Percent: 100, ubi2Base: 0, ubi2Percent: 100,
        remunerations: [], 
        status: 'active' 
    });
    setFormData({ name: '', username: '', password: '' });
    alert("Tạo tài khoản thành công (Mật khẩu đã được mã hóa)!");
  };

  const startEdit = (staff) => {
    setEditMode(staff.id);
    const currentRems = Array.isArray(staff.remunerations) ? staff.remunerations : [];
    setEditForm({ 
        ...staff, 
        newPassword: '',
        remunerations: currentRems
    }); 
  };

  const handleRemunerationChange = (index, field, value) => {
      const newRems = [...editForm.remunerations];
      newRems[index] = { ...newRems[index], [field]: value };
      setEditForm({ ...editForm, remunerations: newRems });
  };

  const handleAddRemuneration = () => {
      const newRems = [...(editForm.remunerations || []), { amount: 0, position: '', keywords: '' }];
      setEditForm({ ...editForm, remunerations: newRems });
  };

  const handleRemoveRemuneration = (index) => {
      const newRems = [...editForm.remunerations];
      newRems.splice(index, 1);
      setEditForm({ ...editForm, remunerations: newRems });
  };

  const saveEdit = async (id) => {
    try {
        const { newPassword, ...rest } = editForm;
        const updates = { ...rest };
        
        if (newPassword && newPassword.trim() !== '') {
            const salt = bcrypt.genSaltSync(10);
            updates.password = bcrypt.hashSync(newPassword, salt);
        }
        
        // Xử lý số liệu
        updates.minWorkHours = safeNumber(updates.minWorkHours);
        updates.ubi1Base = safeNumber(updates.ubi1Base);
        updates.ubi1Percent = safeNumber(updates.ubi1Percent);
        updates.ubi2Base = safeNumber(updates.ubi2Base);
        updates.ubi2Percent = safeNumber(updates.ubi2Percent);
        
        if (Array.isArray(updates.remunerations)) {
            updates.remunerations = updates.remunerations.map(r => ({ 
                ...r, 
                amount: safeNumber(r.amount) 
            }));
        } else {
            updates.remunerations = [];
        }

        await updateStaffInfo(id, updates);
        
        setEditMode(null);
        setEditForm({});
        alert("Cập nhật thông tin thành công!");

    } catch (error) {
        console.error("Lỗi khi lưu:", error);
        alert("Có lỗi xảy ra: " + error.message);
    }
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
          case 'scheduler': return 'Scheduler';
          default: return 'Staff';
      }
  };

  const calculateUBITotal = (s) => {
      const ubi1 = safeNumber(s.ubi1Base) * safeNumber(s.ubi1Percent) / 100;
      const ubi2 = safeNumber(s.ubi2Base) * safeNumber(s.ubi2Percent) / 100;
      return ubi1 + ubi2;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.5rem' }}>
        QUẢN LÝ NHÂN SỰ - CHIEF
      </h2>

      {/* FORM TẠO MỚI */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #f0f0f0' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#003366', fontWeight: '600' }}>Khởi tạo tài khoản mới</h4>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input placeholder="Họ và Tên" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{...styles.input, flex: '1 1 200px'}} />
          <input placeholder="ID Đăng nhập" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required style={{...styles.input, flex: '1 1 150px'}}/>
          <input placeholder="Mật khẩu" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required style={{...styles.input, flex: '1 1 150px'}}/>
          <button type="submit" style={{...styles.btnAdd, background: '#003366', color: 'white', flex: '0 0 auto'}}><Icons.Add /> Tạo mới</button>
        </form>
      </div>

      {/* CÔNG CỤ LỌC */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{...styles.filterSelect, flex: '1 1 200px'}}>
              <option value="all">Tất cả tài khoản</option>
              <option value="admin">Nhóm Admin (Quản trị)</option>
              <option value="staff">Nhóm Staff (Nhân viên)</option>
          </select>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
              <input type="text" placeholder="Tìm theo tên (vd: Lan, Viet...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.input, width: '100%', paddingLeft: '38px', boxSizing: 'border-box' }} />
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}><Icons.Search /></div>
          </div>
      </div>

      {/* DANH SÁCH NHÂN SỰ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredStaffList.map(staff => (
          <div key={staff.id} style={{ 
              background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '20px', 
              border: editMode === staff.id ? '2px solid #003366' : '1px solid #f0f0f0',
              opacity: (staff.status === 'suspended' && editMode !== staff.id) ? 0.6 : 1, transition: 'all 0.2s ease'
          }}>
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

            <div style={{ flex: 1 }}>
              {editMode === staff.id ? (
                  // --- MODE EDIT ---
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={styles.sectionBox}>
                          <div style={styles.sectionTitle}>1. Định danh</div>
                          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                              <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Tên hiển thị" style={styles.inputFull} />
                              <div style={{display:'flex', gap: '8px', flexWrap: 'wrap'}}>
                                  <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} placeholder="ID Account" style={{...styles.inputFull, flex: 1, minWidth: '120px'}} />
                                  <div style={{position:'relative', width: '100%', flex: 1, minWidth: '150px'}}>
                                      <input value={editForm.newPassword} onChange={e => setEditForm({...editForm, newPassword: e.target.value})} placeholder="Reset mật khẩu..." style={{...styles.inputFull, paddingLeft: '28px'}} />
                                      <div style={{position:'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)'}}><Icons.Key /></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div style={styles.sectionBox}>
                          <div style={styles.sectionTitle}>2. Quyền & Vị trí</div>
                          <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={styles.inputFull}>
                              <option value="staff">Staff (Nhân viên)</option>
                              <option value="op">Operational Admin</option>
                              <option value="reg">Regulatory Admin</option>
                              <option value="chief">Chief Admin</option>
                              <option value="scheduler">Scheduler (Lên lịch)</option>
                          </select>
                          <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'8px'}}>
                              {POSITIONS.map(r => (
                                  <label key={r} style={styles.checkboxLabel}>
                                      <input type="checkbox" checked={editForm.positions?.includes(r)} onChange={() => handlePositionToggle(r)} /> {r}
                                  </label>
                              ))}
                          </div>
                          
                          {/* SỐ GIỜ LÀM TỐI THIỂU */}
                          <div style={{marginTop: '12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px dashed #e5e7eb', paddingTop:'10px'}}>
                              <span style={{fontSize:'0.8rem', fontWeight:'600', color:'#4b5563'}}>Số giờ làm tối thiểu/tháng:</span>
                              <input 
                                  type="number" 
                                  placeholder="0" 
                                  value={editForm.minWorkHours || 0} 
                                  onChange={e => setEditForm({...editForm, minWorkHours: e.target.value})} 
                                  style={{...styles.inputFull, width: '80px', textAlign:'center'}} 
                              />
                          </div>

                          <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{marginTop: '12px', ...styles.inputFull, borderColor: editForm.status==='suspended'?'red':'#d1d5db', color: editForm.status==='suspended'?'red':'inherit'}}>
                              <option value="active">Active (Hoạt động)</option>
                              <option value="suspended">Suspended (Đình chỉ)</option>
                          </select>
                      </div>

                      {/* --- PHẦN 3: TÀI CHÍNH --- */}
                      <div style={styles.sectionBox}>
                          <div style={styles.sectionTitle}>3. Tài chính</div>
                          <div style={{...styles.financeRow, flexWrap: 'wrap'}}>
                              <span style={styles.financeLabel}>UBI 1</span>
                              <div style={{display:'flex', gap:'5px', flex: 1, minWidth: '150px'}}>
                                  <input type="number" placeholder="VNĐ" value={editForm.ubi1Base} onChange={e => setEditForm({...editForm, ubi1Base: e.target.value})} style={{...styles.inputFull, flex: 2}} />
                                  <input type="number" placeholder="%" value={editForm.ubi1Percent} onChange={e => setEditForm({...editForm, ubi1Percent: e.target.value})} style={{...styles.inputFull, flex: 1}} />
                              </div>
                          </div>
                          <div style={{...styles.financeRow, flexWrap: 'wrap'}}>
                              <span style={styles.financeLabel}>UBI 2</span>
                              <div style={{display:'flex', gap:'5px', flex: 1, minWidth: '150px'}}>
                                  <input type="number" placeholder="VNĐ" value={editForm.ubi2Base} onChange={e => setEditForm({...editForm, ubi2Base: e.target.value})} style={{...styles.inputFull, flex: 2}} />
                                  <input type="number" placeholder="%" value={editForm.ubi2Percent} onChange={e => setEditForm({...editForm, ubi2Percent: e.target.value})} style={{...styles.inputFull, flex: 1}} />
                              </div>
                          </div>
                          
                          <div style={{height: '1px', background: '#e5e7eb', margin: '10px 0'}}></div>
                          
                          {/* DANH SÁCH REMUNERATION */}
                          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                  <span style={{fontSize: '0.75rem', fontWeight:'600', color:'#4b5563'}}>Remuneration (Theo việc)</span>
                                  <button 
                                      type="button" 
                                      onClick={handleAddRemuneration} 
                                      style={{fontSize:'0.75rem', color:'#003366', background:'white', border:'1px solid #003366', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', fontWeight:'bold'}}
                                  >
                                      + THÊM R
                                  </button>
                              </div>
                              
                              {editForm.remunerations && editForm.remunerations.map((rem, idx) => (
                                  <div key={idx} style={{
                                      display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center', 
                                      background:'white', padding:'8px', borderRadius:'6px', border:'1px solid #e5e7eb'
                                  }}>
                                      <span style={{fontSize: '0.75rem', color: '#6b7280', fontWeight:'bold', minWidth: '20px'}}>R{idx+1}</span>
                                      
                                      <div style={{display:'flex', gap:'5px', flex: '1 1 140px'}}>
                                          <input 
                                              type="number" 
                                              placeholder="VNĐ/Giờ" 
                                              value={rem.amount} 
                                              onChange={(e) => handleRemunerationChange(idx, 'amount', e.target.value)} 
                                              style={{...styles.inputFull, flex: 1.5}} 
                                          />
                                          <select 
                                              value={rem.position} 
                                              onChange={(e) => handleRemunerationChange(idx, 'position', e.target.value)} 
                                              style={{...styles.inputFull, flex: 1, padding: '8px 2px'}}
                                          >
                                              <option value="">--</option>
                                              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                          </select>
                                      </div>
                                      
                                      <input 
                                          placeholder="Keywords" 
                                          value={rem.keywords} 
                                          onChange={(e) => handleRemunerationChange(idx, 'keywords', e.target.value)} 
                                          style={{...styles.inputFull, flex: '1 1 100%', minWidth: '100px'}} 
                                      />

                                      <button 
                                          type="button" 
                                          onClick={() => handleRemoveRemuneration(idx)}
                                          style={{border:'none', background:'none', cursor:'pointer', padding:'4px', color:'#ef4444'}}
                                          title="Xóa"
                                      >
                                          <Icons.Trash />
                                      </button>
                                  </div>
                              ))}
                              
                              {(!editForm.remunerations || editForm.remunerations.length === 0) && (
                                  <div style={{fontSize:'0.8rem', color:'#9ca3af', fontStyle:'italic', textAlign:'center', padding:'10px'}}>Chưa có cấu hình Remuneration.</div>
                              )}
                          </div>
                      </div>

                      <div style={{display:'flex', gap:'8px', marginTop: '5px'}}>
                          <button onClick={() => saveEdit(staff.id)} style={styles.btnSave}><Icons.Save/> Lưu thay đổi</button>
                          <button onClick={() => setEditMode(null)} style={styles.btnCancel}>Hủy</button>
                      </div>
                  </div>
              ) : (
                  // --- MODE VIEW ---
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <div style={{fontSize: '0.9rem', color: '#4b5563'}}>
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                              <div style={{display:'flex', flexWrap:'wrap', gap:'5px', minHeight: '24px'}}>
                                  {staff.positions && staff.positions.length > 0 ? staff.positions.map(p => (
                                      <span key={p} style={{fontSize:'0.75rem', background:'#f3f4f6', color:'#1f2937', padding:'3px 8px', borderRadius:'4px', border:'1px solid #e5e7eb'}}>{p}</span>
                                  )) : <span style={{fontSize:'0.75rem', color:'#9ca3af', fontStyle:'italic'}}>Chưa xét vị trí</span>}
                              </div>
                              <div style={{fontSize:'0.75rem', background:'#fffbeb', color:'#d97706', padding:'3px 8px', borderRadius:'4px', border:'1px solid #fde68a', fontWeight:'600'}}>
                                  Min: {staff.minWorkHours || 0}h
                              </div>
                          </div>
                          
                          <div style={{marginTop: '15px', padding:'10px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #f3f4f6'}}>
                               <div style={{fontSize: '0.7rem', color:'#6b7280', textTransform:'uppercase', letterSpacing: '0.5px', marginBottom:'4px'}}>Tổng UBI (Cố định)</div>
                               <div style={{color: '#059669', fontWeight:'700', fontSize:'1.1rem'}}>
                                  {calculateUBITotal(staff).toLocaleString()} <span style={{fontSize:'0.75rem', color:'#374151', fontWeight: '400'}}>VNĐ</span>
                               </div>
                               <div style={{marginTop: '10px', borderTop: '1px dashed #e5e7eb', paddingTop: '8px'}}>
                                   <div style={{fontSize: '0.7rem', color:'#6b7280', marginBottom:'4px'}}>Remuneration (Theo việc):</div>
                                   {staff.remunerations && staff.remunerations.length > 0 ? (
                                       staff.remunerations.map((r, idx) => (
                                           r.amount > 0 && (
                                               <div key={idx} style={{fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: '#374151', marginBottom:'2px'}}>
                                                   <span><b style={{color:'#003366'}}>R{idx+1}:</b> {Number(r.amount).toLocaleString()}/h</span>
                                                   <span style={{color: '#6b7280', fontStyle: 'italic'}}>{r.position} / {r.keywords || 'All'}</span>
                                               </div>
                                           )
                                       ))
                                   ) : ( <div style={{fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic'}}>Chưa cấu hình mức thù lao</div> )}
                               </div>
                          </div>
                      </div>

                      <div style={{marginTop:'20px', paddingTop:'15px', borderTop:'1px solid #f3f4f6', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                          <button onClick={() => startEdit(staff)} style={styles.btnEdit}><Icons.Edit/> Điều chỉnh</button>
                          <button onClick={() => { if(window.confirm('Xóa nhân sự này?')) deleteStaff(staff.id) }} style={styles.btnDelete}><Icons.Delete/> Xóa</button>
                      </div>
                  </div>
              )}
            </div>
          </div>
        ))}
        {filteredStaffList.length === 0 && <div style={{textAlign: 'center', gridColumn: '1/-1', color: '#9ca3af', padding: '20px'}}>Không tìm thấy nhân sự phù hợp.</div>}
      </div>
    </div>
  );
};

const styles = {
    input: { padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' },
    filterSelect: { padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', background: 'white', color: '#374151', minWidth: '180px' },
    inputFull: { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '5px', width: '100%', boxSizing: 'border-box', fontSize: '0.85rem', outline: 'none' },
    sectionBox: { background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' },
    sectionTitle: { fontSize: '0.75rem', fontWeight: '700', color: '#003366', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    checkboxLabel: { fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer' },
    financeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
    financeLabel: { fontSize: '0.8rem', fontWeight: '600', color: '#4b5563', width: '90px' },
    btnAdd: { border: 'none', borderRadius: '6px', padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' },
    btnSave: { background: '#003366', color: 'white', border: 'none', borderRadius: '5px', padding: '8px', flex: 1, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontWeight: '500', fontSize: '0.85rem' },
    btnCancel: { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '5px', padding: '8px 15px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
    btnEdit: { background: 'white', border: '1px solid #003366', color: '#003366', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' },
    btnDelete: { background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '600' }
};

export default StaffManager;