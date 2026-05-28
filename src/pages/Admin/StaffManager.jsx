import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import bcrypt from 'bcryptjs';

// --- BỘ ICON ĐÃ BỔ SUNG ĐẦY ĐỦ ---
const Icons = {
  Staff: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Edit: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>),
  Save: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
  Delete: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>),
  Add: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>),
  Key: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>),
  Search: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>),
  Trash: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>),
  Close: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  Warning: () => (<svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>)
};

const safeNumber = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

const POSITIONS = [
  'Chief Admin',
  'Regulatory Admin',
  'Operational Admin',
  'Scheduler',
  'Senior Teacher',
  'Tenured Teacher',
  'Customer Care Specialist',
  'Customer Care Officer',
  'Accountant',
  'Infrastructure Officer / Technician',
  'Bartender / Chef',
  'Waiter / Waitress',
  'Junior Marketing'
];

const AREAS = ['Phòng 1', 'Phòng 2', 'Phòng 3', 'Phòng Lab', 'Sảnh OA', 'CC Tầng G', 'Kho Tầng 3', 'Canteen'];

const StaffManager = () => {
  const { user } = useAuth();
  const { staffList, addStaff, deleteStaff, updateStaffInfo } = useData();

  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [editMode, setEditMode] = useState(null); 
  const [editForm, setEditForm] = useState({});
  const [filterRole, setFilterRole] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const isChief = user?.role === 'chief';
  if (!isChief) return <div style={{padding:'20px', color:'#ef4444', fontWeight: 'bold'}}>Bạn không có quyền truy cập quản lý nhân sự cấp cao.</div>;

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
        minWorkHours: 0,
        ubiBase: 0, 
        primaryRole: '',
        defaultArea: '', // Thêm trường Area mặc định
        secondaryUBIs: [], 
        specificAllowance: 0, 
        remunerations: [], 
        status: 'active' 
    });
    setFormData({ name: '', username: '', password: '' });
    alert("Tạo tài khoản thành công (Mật khẩu đã được mã hóa)!");
  };

  const startEdit = (staff) => {
    setEditMode(staff.id);
    const currentRems = Array.isArray(staff.remunerations) ? staff.remunerations : [];
    const currentSecUbis = Array.isArray(staff.secondaryUBIs) ? staff.secondaryUBIs : [];
    
    let initialUbiBase = staff.ubiBase;
    if (initialUbiBase === undefined) {
        initialUbiBase = safeNumber(staff.ubi1Base) * (safeNumber(staff.ubi1Percent)/100 || 1);
    }

    setEditForm({ 
        ...staff, 
        newPassword: '',
        remunerations: currentRems,
        secondaryUBIs: currentSecUbis,
        ubiBase: initialUbiBase,
        primaryRole: staff.primaryRole || '',
        defaultArea: staff.defaultArea || '', // Khởi tạo trường khu vực
        specificAllowance: staff.specificAllowance || 0
    }); 
  };

  const handleRemunerationChange = (index, field, value) => {
      const newRems = [...editForm.remunerations];
      newRems[index] = { ...newRems[index], [field]: value };
      setEditForm({ ...editForm, remunerations: newRems });
  };
  const handleAddRemuneration = () => {
      const newRems = [...(editForm.remunerations || []), { amount: 0, position: '', jobCode: '' }];
      setEditForm({ ...editForm, remunerations: newRems });
  };
  const handleRemoveRemuneration = (index) => {
      const newRems = [...editForm.remunerations];
      newRems.splice(index, 1);
      setEditForm({ ...editForm, remunerations: newRems });
  };

  const handleSecUbiChange = (index, field, value) => {
      const newUbis = [...editForm.secondaryUBIs];
      newUbis[index] = { ...newUbis[index], [field]: value };
      setEditForm({ ...editForm, secondaryUBIs: newUbis });
  };
  const handleAddSecUbi = () => {
      const newUbis = [...(editForm.secondaryUBIs || []), { amount: 0, loadFactor: 0.75, role: '', type: 'ubi' }];
      setEditForm({ ...editForm, secondaryUBIs: newUbis });
  };
  const handleRemoveSecUbi = (index) => {
      const newUbis = [...editForm.secondaryUBIs];
      newUbis.splice(index, 1);
      setEditForm({ ...editForm, secondaryUBIs: newUbis });
  };

  const saveEdit = async (id) => {
    try {
        const { newPassword, ...rest } = editForm;
        const updates = { ...rest };
        
        if (newPassword && newPassword.trim() !== '') {
            const salt = bcrypt.genSaltSync(10);
            updates.password = bcrypt.hashSync(newPassword, salt);
        }
        
        updates.minWorkHours = safeNumber(updates.minWorkHours);
        updates.ubiBase = safeNumber(updates.ubiBase);
        updates.specificAllowance = safeNumber(updates.specificAllowance);
        updates.primaryRole = editForm.primaryRole || '';
        updates.defaultArea = editForm.defaultArea || ''; // Cập nhật khu vực
        
        if (Array.isArray(updates.secondaryUBIs)) {
            updates.secondaryUBIs = updates.secondaryUBIs.map(u => ({ 
                ...u, 
                amount: safeNumber(u.amount), 
                loadFactor: safeNumber(u.loadFactor),
                type: u.type || 'ubi'
            }));
        } else { updates.secondaryUBIs = []; }

        if (Array.isArray(updates.remunerations)) {
            updates.remunerations = updates.remunerations.map(r => ({ 
                ...r, amount: safeNumber(r.amount), jobCode: r.jobCode !== undefined ? r.jobCode : (r.keywords || '') 
            }));
        } else { updates.remunerations = []; }

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

  const calculateFixedSalary = (s) => {
      const base = s.ubiBase !== undefined ? safeNumber(s.ubiBase) : (safeNumber(s.ubi1Base) * (safeNumber(s.ubi1Percent)/100 || 1));
      let secTotal = 0;
      if (s.secondaryUBIs && s.secondaryUBIs.length > 0) {
          secTotal = s.secondaryUBIs.reduce((sum, u) => {
              if (!u.type || u.type === 'ubi') {
                  const lf = Number(u.loadFactor);
                  const actualLf = lf > 1 ? lf / 100 : lf;
                  return sum + (safeNumber(u.amount) * actualLf);
              }
              return sum;
          }, 0);
      } else if (s.ubi2Base !== undefined) {
          secTotal = safeNumber(s.ubi2Base) * (safeNumber(s.ubi2Percent)/100 || 1);
      }
      const allowance = safeNumber(s.specificAllowance);
      return base + secTotal + allowance;
  };

  const executeDelete = () => {
    if (deleteTarget) {
        deleteStaff(deleteTarget);
        setDeleteTarget(null);
        alert("Đã xóa nhân sự thành công!");
    }
  };

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box' }}>
      <style>{`
        .add-staff-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; width: 100%; }
        @media (max-width: 600px) {
          .add-staff-form { grid-template-columns: 1fr; }
          .add-staff-btn { width: 100%; justify-content: center; }
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; box-sizing: border-box;
        }
        .modal-content {
          background: white; width: 100%; max-width: 700px; max-height: 90vh;
          border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex; flex-direction: column; overflow: hidden;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; background: #ffffff; }
        .modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; background: #f8fafc; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid rgba(0,0,0,0.05); display: flex; gap: 12px; justify-content: flex-end; background: #ffffff; }
        
        .input-modern { padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; outline: none; background: white; transition: all 0.2s; box-sizing: border-box; width: 100%; }
        .input-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
        
        .staff-card { transition: all 0.25s ease; cursor: default; }
        .staff-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1) !important; border-color: #bae6fd !important; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
              <Icons.Staff active={true} />
          </div>
          <div>
              <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>QUẢN LÝ NHÂN SỰ</h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Quyền hạn cấp cao (Chief Admin)</span>
          </div>
      </div>

      {/* FORM TẠO MỚI RESPONSIVE */}
      <div style={{ background: '#ffffff', padding: '28px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', marginBottom: '32px', border: '1px solid rgba(0,0,0,0.05)' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#111827', fontWeight: '800', fontSize: '1.15rem' }}>Khởi tạo tài khoản mới</h4>
        <form onSubmit={handleAdd} className="add-staff-form">
          <input className="input-modern" placeholder="Họ và Tên" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <input className="input-modern" placeholder="ID Đăng nhập" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
          <input className="input-modern" placeholder="Mật khẩu" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
          <button type="submit" className="add-staff-btn" style={{...styles.btnAdd, background: '#003366', color: 'white'}}><Icons.Add /> <span>Tạo mới</span></button>
        </form>
      </div>

      {/* CÔNG CỤ LỌC */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="input-modern" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{flex: '1 1 200px', cursor: 'pointer', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2364748b" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'}}>
              <option value="all">Tất cả tài khoản</option>
              <option value="admin">Nhóm Admin (Quản trị)</option>
              <option value="staff">Nhóm Staff (Nhân viên)</option>
          </select>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
              <input className="input-modern" type="text" placeholder="Tìm kiếm theo tên (vd: Lan, Viet...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '44px' }} />
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}><Icons.Search /></div>
          </div>
      </div>

      {/* DANH SÁCH NHÂN SỰ KẾT HỢP GIAO DIỆN THẺ (CARD UI) MỚI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {filteredStaffList.map(staff => {
          const validPositions = staff.positions ? staff.positions.filter(p => POSITIONS.includes(p)) : [];
          return (
            <div className="staff-card" key={staff.id} style={{ 
                background: '#ffffff', borderRadius: '20px', padding: '24px', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)',
                border: editMode === staff.id ? '2px solid #0284c7' : '1px solid rgba(0,0,0,0.05)',
                opacity: (staff.status === 'suspended' && editMode !== staff.id) ? 0.6 : 1,
                display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '16px' }}>
                 <div style={{display:'flex', alignItems:'center', gap: '12px'}}>
                    <div style={{width:'48px', height:'48px', background:'#f0f9ff', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', color:'#0369a1', fontWeight:'800', fontSize:'1.2rem'}}>
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontWeight:'800', color:'#111827', fontSize: '1.05rem', letterSpacing: '-0.01em'}}>{staff.name}</div>
                      <div style={{fontSize:'0.85rem', color:'#64748b', fontWeight: '500'}}>@{staff.username}</div>
                    </div>
                 </div>
                 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                    <span style={{ background: '#f8fafc', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', height: 'fit-content', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                        {roleName(staff.role)}
                    </span>
                    {/* HIỂN THỊ KHU VỰC NẾU CÓ */}
                    {staff.defaultArea && (
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', height: 'fit-content', fontWeight: '700', border: '1px solid #fde68a' }}>
                            📍 {staff.defaultArea}
                        </span>
                    )}
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: '16px'}}>
                      <div style={{display:'flex', flexWrap:'wrap', gap:'6px', minHeight: '24px'}}>
                          {validPositions.length > 0 ? validPositions.map(p => (
                              <span key={p} style={{fontSize:'0.75rem', background:'#f1f5f9', color:'#334155', padding: '4px 8px', borderRadius:'6px', fontWeight: '600'}}>{p}</span>
                          )) : <span style={{fontSize:'0.75rem', color:'#94a3b8', fontStyle:'italic'}}>Chưa xét vị trí</span>}
                      </div>
                      <div style={{fontSize:'0.75rem', background:'#fffbeb', color:'#d97706', padding:'4px 8px', borderRadius:'6px', fontWeight:'700'}}>
                          Min: {staff.minWorkHours || 0}h
                      </div>
                  </div>
                  
                  <div style={{padding:'16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9'}}>
                       <div style={{fontSize: '0.75rem', color:'#64748b', fontWeight: '600', textTransform:'uppercase', letterSpacing: '0.05em', marginBottom:'6px'}}>
                           Lương cố định {staff.primaryRole ? `(${staff.primaryRole})` : ''}
                       </div>
                       <div style={{color: '#059669', fontWeight:'800', fontSize:'1.25rem', letterSpacing: '-0.02em'}}>
                          {calculateFixedSalary(staff).toLocaleString()} <span style={{fontSize:'0.85rem', color:'#64748b', fontWeight: '600'}}>đ</span>
                       </div>
                       
                       <div style={{marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px'}}>
                           <div style={{fontSize: '0.75rem', color:'#64748b', fontWeight: '600', marginBottom:'8px'}}>Thù lao vượt mức (R):</div>
                           {staff.remunerations && staff.remunerations.length > 0 ? (
                               staff.remunerations.map((r, idx) => (
                                   r.amount > 0 && (
                                       <div key={idx} style={{fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155', marginBottom:'6px'}}>
                                           <span><b style={{color:'#0369a1'}}>R{idx+1}:</b> {Number(r.amount).toLocaleString()}/h</span>
                                           <span style={{color: '#64748b', fontWeight: '500'}}>{r.position} / {r.jobCode !== undefined ? r.jobCode : (r.keywords || 'All')}</span>
                                       </div>
                                   )
                               ))
                           ) : ( <div style={{fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic'}}>Chưa cấu hình mức thù lao</div> )}
                       </div>
                  </div>
              </div>

              {/* ACTION BUTTONS */}
              <div style={styles.cardActions}>
                  <button onClick={() => startEdit(staff)} style={styles.btnEdit}>
                      <Icons.Edit/> <span>Sửa đổi</span>
                  </button>
                  <button onClick={() => setDeleteTarget(staff.id)} style={styles.btnDelete}>
                      <Icons.Delete/> <span>Xóa</span>
                  </button>
              </div>

            </div>
          );
        })}
        {filteredStaffList.length === 0 && <div style={{textAlign: 'center', gridColumn: '1/-1', color: '#94a3b8', padding: '40px', fontSize: '1rem', fontStyle: 'italic'}}>Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm.</div>}
      </div>

      {/* MODAL PHỦ MỜ CHỈNH SỬA THÔNG TIN (EDIT MODE) */}
      {editMode && (
        <div className="modal-overlay" onClick={() => setEditMode(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.01em' }}>Điều chỉnh Thông số Nhân sự</h3>
              <button onClick={() => setEditMode(null)} style={styles.closeBtn}><Icons.Close /></button>
            </div>
            
            <div className="modal-body">
              <div style={styles.sectionBox}>
                  <div style={styles.sectionTitle}>1. Định danh</div>
                  <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                      <input className="input-modern" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Tên hiển thị" style={{marginTop: 0}} />
                      <div style={{display:'flex', gap: '12px', flexWrap: 'wrap'}}>
                          <input className="input-modern" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} placeholder="ID Account" style={{flex: 1, minWidth: '150px', marginTop: 0}} />
                          <div style={{position:'relative', width: '100%', flex: 1, minWidth: '150px'}}>
                              <input className="input-modern" value={editForm.newPassword} onChange={e => setEditForm({...editForm, newPassword: e.target.value})} placeholder="Reset mật khẩu..." style={{paddingLeft: '40px', marginTop: 0}} />
                              <div style={{position:'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)'}}><Icons.Key /></div>
                          </div>
                      </div>
                  </div>
              </div>

              <div style={styles.sectionBox}>
                  <div style={styles.sectionTitle}>2. Quyền & Vị trí</div>
                  <select className="input-modern" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={{marginTop: 0}}>
                      <option value="staff">Staff (Nhân viên)</option>
                      <option value="op">Operational Admin</option>
                      <option value="reg">Regulatory Admin</option>
                      <option value="chief">Chief Admin</option>
                      <option value="scheduler">Scheduler (Lên lịch)</option>
                  </select>
                  
                  {/* BỔ SUNG YÊU CẦU: GÁN KHU VỰC CỤ THỂ CHO NHÂN SỰ */}
                  <div style={{marginTop: '16px'}}>
                      <label style={styles.label}>Khu vực làm việc mặc định (Area/Zone)</label>
                      <select className="input-modern" value={editForm.defaultArea || ''} onChange={e => setEditForm({...editForm, defaultArea: e.target.value})} style={{marginTop: 0}}>
                          <option value="">-- Cấu hình này sẽ bỏ qua nếu điền rỗng --</option>
                          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                  </div>

                  <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'16px'}}>
                      {POSITIONS.map(r => (
                          <label key={r} style={styles.checkboxLabel}>
                              <input type="checkbox" checked={editForm.positions?.includes(r)} onChange={() => handlePositionToggle(r)} style={{accentColor: '#003366'}} /> {r}
                          </label>
                      ))}
                  </div>
                  
                  <div style={{marginTop: '20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px dashed #cbd5e1', paddingTop:'16px'}}>
                      <span style={{fontSize:'0.9rem', fontWeight:'600', color:'#334155'}}>Số giờ làm tối thiểu/tháng:</span>
                      <input 
                          className="input-modern"
                          type="number" 
                          placeholder="0" 
                          value={editForm.minWorkHours || 0} 
                          onChange={e => setEditForm({...editForm, minWorkHours: e.target.value})} 
                          style={{width: '90px', textAlign:'center', marginTop: 0, fontWeight: '700'}} 
                      />
                  </div>

                  <select className="input-modern" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} style={{marginTop: '16px', borderColor: editForm.status==='suspended'?'#fca5a5':'#e2e8f0', color: editForm.status==='suspended'?'#ef4444':'inherit', fontWeight: '600'}}>
                      <option value="active">Active (Hoạt động)</option>
                      <option value="suspended">Suspended (Đình chỉ)</option>
                  </select>
              </div>

              <div style={styles.sectionBox}>
                  <div style={styles.sectionTitle}>3. Tài chính (Lương Cố Định)</div>
                  
                  <div style={{...styles.financeRow, flexWrap: 'wrap'}}>
                      <span style={styles.financeLabel}>Vị trí chính</span>
                      <select className="input-modern" value={editForm.primaryRole || ''} onChange={e => setEditForm({...editForm, primaryRole: e.target.value})} style={{flex: 1, marginTop: 0}}>
                          <option value="">-- Chọn vị trí --</option>
                          {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>

                  <div style={{...styles.financeRow, flexWrap: 'wrap'}}>
                      <span style={styles.financeLabel}>Lương cứng / UBI 1</span>
                      <input className="input-modern" type="number" placeholder="VNĐ" value={editForm.ubiBase} onChange={e => setEditForm({...editForm, ubiBase: e.target.value})} style={{flex: 1, marginTop: 0, fontWeight: '600'}} />
                  </div>
                  
                  <div style={{...styles.financeRow, flexWrap: 'wrap'}}>
                      <span style={styles.financeLabel}>Phụ cấp đặc thù</span>
                      <input className="input-modern" type="number" placeholder="VNĐ" value={editForm.specificAllowance} onChange={e => setEditForm({...editForm, specificAllowance: e.target.value})} style={{flex: 1, marginTop: 0, fontWeight: '600'}} />
                  </div>
                  
                  <div style={{height: '1px', background: '#e2e8f0', margin: '20px 0'}}></div>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize: '0.9rem', fontWeight:'700', color:'#1e293b'}}>UBI Phụ (Thứ cấp)</span>
                          <button 
                              type="button" 
                              onClick={handleAddSecUbi} 
                              style={{fontSize:'0.75rem', color:'#0369a1', background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', fontWeight:'700', transition: 'all 0.2s'}}
                          >
                              + Thêm UBI Phụ
                          </button>
                      </div>
                      
                      {editForm.secondaryUBIs && editForm.secondaryUBIs.map((ubi, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background:'white', padding:'16px', borderRadius:'12px', border:'1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                  <span style={{fontSize: '0.85rem', color: '#0369a1', fontWeight:'800'}}>UBI phụ thứ {idx+1}</span>
                                  <button type="button" onClick={() => handleRemoveSecUbi(idx)} style={{border:'none', background:'#fef2f2', cursor:'pointer', padding:'6px', borderRadius: '6px', color:'#ef4444', transition: 'all 0.2s'}}>
                                      <Icons.Trash />
                                  </button>
                              </div>

                              <div style={{display:'flex', gap:'12px', flexWrap: 'wrap'}}>
                                  <div style={{flex: 1, minWidth: '120px'}}>
                                      <label style={styles.label}>Loại hình</label>
                                      <select className="input-modern" value={ubi.type || 'ubi'} onChange={(e) => handleSecUbiChange(idx, 'type', e.target.value)}>
                                          <option value="ubi">UBI Phụ</option>
                                          <option value="parttime">Part-time</option>
                                      </select>
                                  </div>
                                  
                                  {(!ubi.type || ubi.type === 'ubi') ? (
                                      <>
                                          <div style={{flex: 1.5, minWidth: '140px'}}>
                                              <label style={styles.label}>Mức tiền (VNĐ)</label>
                                              <input className="input-modern" type="number" placeholder="VNĐ" value={ubi.amount} onChange={(e) => handleSecUbiChange(idx, 'amount', e.target.value)} style={{fontWeight: '600'}} />
                                          </div>
                                          <div style={{flex: 1, minWidth: '120px'}}>
                                              <label style={styles.label}>Hệ số (Load)</label>
                                              <select className="input-modern" value={ubi.loadFactor} onChange={(e) => handleSecUbiChange(idx, 'loadFactor', e.target.value)}>
                                                  <option value="0.75">0.75 (100%)</option>
                                                  <option value="0.50">0.50 (75%)</option>
                                                  <option value="0.30">0.30 (50%)</option>
                                                  <option value="0.15">0.15 (25%)</option>
                                              </select>
                                          </div>
                                      </>
                                  ) : (
                                      <div style={{flex: 2.5, display:'flex', alignItems:'center', background: '#f8fafc', padding: '0 12px', borderRadius: '10px', border: '1px dashed #cbd5e1', marginTop: '6px'}}>
                                          <span style={{fontSize:'0.8rem', color:'#64748b', fontStyle:'italic', fontWeight: '500'}}>Lương = Tổng giờ làm thực tế x Mức thù lao R</span>
                                      </div>
                                  )}
                              </div>
                              <div>
                                  <label style={styles.label}>Tên vai trò / Vị trí</label>
                                  <select className="input-modern" value={ubi.role} onChange={(e) => handleSecUbiChange(idx, 'role', e.target.value)}>
                                      <option value="">-- Chọn vai trò --</option>
                                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                              </div>
                          </div>
                      ))}
                      
                      {(!editForm.secondaryUBIs || editForm.secondaryUBIs.length === 0) && (
                          <div style={{fontSize:'0.85rem', color:'#94a3b8', fontStyle:'italic', textAlign:'center', padding:'10px'}}>Chưa thiết lập UBI phụ.</div>
                      )}
                  </div>

                  <div style={{height: '1px', background: '#e2e8f0', margin: '20px 0'}}></div>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize: '0.9rem', fontWeight:'700', color:'#1e293b'}}>Thù lao vượt mức (R)</span>
                          <button 
                              type="button" 
                              onClick={handleAddRemuneration} 
                              style={{fontSize:'0.75rem', color:'#0369a1', background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', fontWeight:'700', transition: 'all 0.2s'}}
                          >
                              + Thêm R
                          </button>
                      </div>
                      
                      {editForm.remunerations && editForm.remunerations.map((rem, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background:'white', padding:'12px', borderRadius:'12px', border:'1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              <span style={{fontSize: '0.9rem', color: '#64748b', fontWeight:'800', minWidth: '24px'}}>R{idx+1}</span>
                              
                              <div style={{display:'flex', gap:'10px', flex: '1 1 180px'}}>
                                  <input className="input-modern" type="number" placeholder="VNĐ/Giờ" value={rem.amount} onChange={(e) => handleRemunerationChange(idx, 'amount', e.target.value)} style={{flex: 1.5, marginTop: 0, fontWeight: '600'}} />
                                  <select className="input-modern" value={rem.position} onChange={(e) => handleRemunerationChange(idx, 'position', e.target.value)} style={{flex: 1, marginTop: 0}}>
                                      <option value="">-- Chọn vị trí --</option>
                                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                              </div>
                              
                              <input className="input-modern" placeholder="Mã công việc (VD: IELTS, Basic...)" value={rem.jobCode !== undefined ? rem.jobCode : (rem.keywords || '')} onChange={(e) => handleRemunerationChange(idx, 'jobCode', e.target.value)} style={{flex: '1 1 100%', minWidth: '120px', marginTop: 0}} />

                              <button type="button" onClick={() => handleRemoveRemuneration(idx)} style={{border:'none', background:'#fef2f2', cursor:'pointer', padding:'8px', borderRadius: '8px', color:'#ef4444', transition: 'all 0.2s'}}>
                                  <Icons.Trash />
                              </button>
                          </div>
                      ))}
                      
                      {(!editForm.remunerations || editForm.remunerations.length === 0) && (
                          <div style={{fontSize:'0.85rem', color:'#94a3b8', fontStyle:'italic', textAlign:'center', padding:'16px'}}>Chưa cấu hình mức thù lao R.</div>
                      )}
                  </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setEditMode(null)} style={styles.btnModalCancel}>Hủy bỏ</button>
              <button onClick={() => saveEdit(editForm.id)} style={styles.btnModalSave}><Icons.Save/> <span>Lưu thay đổi</span></button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM POPUP MODAL CẢNH BÁO NGUY HIỂM KHI XÓA */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '32px 24px 24px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '50%' }}>
                  <Icons.Warning />
              </div>
              <h3 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.35rem' }}>Xác nhận xóa nhân sự</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.5' }}>
                Hành động này mang tính chất <b>nguy hiểm</b> và không thể hoàn tác. Bạn có chắc chắn muốn xóa tài khoản nhân sự này khỏi hệ thống quản lý?
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => setDeleteTarget(null)} style={{...styles.btnModalCancel, flex: 1}}>Hủy, quay lại</button>
              <button onClick={executeDelete} style={{...styles.btnDangerConfirm, flex: 1}}>Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
    sectionBox: { background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' },
    sectionTitle: { fontSize: '0.85rem', fontWeight: '800', color: '#003366', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    checkboxLabel: { fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155', transition: 'all 0.2s' },
    financeRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', width: '100%' },
    financeLabel: { fontSize: '0.85rem', fontWeight: '700', color: '#334155', width: '150px', minWidth: '150px' },
    btnAdd: { border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)' },
    label: { fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' },
    closeBtn: { background: '#f1f5f9', border: 'none', color: '#64748b', borderRadius: '50%', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
    btnModalCancel: { background: 'white', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', transition: 'all 0.2s', WebkitTapHighlightColor: 'transparent' },
    btnModalSave: { background: '#003366', border: 'none', color: 'white', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)', WebkitTapHighlightColor: 'transparent' },
    btnDangerConfirm: { background: '#dc2626', border: 'none', color: 'white', borderRadius: '10px', padding: '12px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)', WebkitTapHighlightColor: 'transparent' },
    
    cardActions: { 
      marginTop: 'auto', 
      paddingTop: '20px', 
      borderTop: '1px dashed #e2e8f0', 
      display: 'flex', 
      gap: '12px', 
      background: 'transparent',
      boxSizing: 'border-box'
    },
    btnEdit: { 
      flex: 1,
      background: '#f0f9ff', 
      border: '1px solid #bae6fd', 
      color: '#0369a1', 
      borderRadius: '10px', 
      padding: '10px 14px', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '8px', 
      fontSize: '0.9rem', 
      fontWeight: '700', 
      whiteSpace: 'nowrap',
      minWidth: 0,
      flexShrink: 0,
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      WebkitTapHighlightColor: 'transparent' 
    },
    btnDelete: { 
      flex: 1,
      background: '#fef2f2', 
      border: '1px solid #fecaca', 
      color: '#ef4444', 
      borderRadius: '10px', 
      padding: '10px 14px', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '8px', 
      fontSize: '0.9rem', 
      fontWeight: '700', 
      whiteSpace: 'nowrap',
      minWidth: 0,
      flexShrink: 0,
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      WebkitTapHighlightColor: 'transparent' 
    }
};

export default StaffManager;