import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Add: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>),
  Trash: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>),
  Restore: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>),
  Check: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
  XMark: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  ProposeDelete: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>)
};

const DisciplineManager = () => {
  const { user } = useAuth();
  const { 
    disciplineTypes, 
    addDisciplineType, 
    updateDisciplineTypeStatus, 
    softDeleteDisciplineType, 
    proposeDeleteDisciplineType,
    deleteDisciplineType, // Cần hàm này từ Context để xóa vĩnh viễn
    disciplineRecords, 
    staffList 
  } = useData();

  // --- CONSTANTS ---
  const DISC_LEVELS = [
      "1. Nhắc nhở",
      "2. Khiển trách",
      "3. Cảnh cáo",
      "4. Xem xét cách chức",
      "5. Xem xét sa thải"
  ];

  // State cho form tạo mới
  const [newType, setNewType] = useState({ 
      name: '', 
      description: '', 
      level: DISC_LEVELS[0]
  });

  // --- PHÂN QUYỀN ---
  const isChief = user?.role === 'chief';
  const isReg = user?.role === 'reg';
  const isOp = user?.role === 'op'; // Operational Admin
  const canApprove = isChief || isReg; // Người có quyền duyệt (Reg/Chief)

  // --- LỌC DANH SÁCH (MỤC 1) ---
  const displayedTypes = disciplineTypes.filter(t => {
      // 1. Không hiển thị các mục đã xóa mềm (Deleted)
      if (t.status === 'Deleted') return false;

      // 2. Operational Admin:
      // - Thấy Active (để áp dụng cho nhân sự)
      // - Thấy Pending/Suspended DO MÌNH TẠO (để theo dõi tình trạng)
      if (isOp) {
          return t.status === 'Active' || t.createdBy === user.username;
      }

      // 3. Reg/Chief: Thấy tất cả (Active, Pending, Suspended) để quản lý
      return true;
  });

  const deletedTypes = disciplineTypes.filter(t => t.status === 'Deleted');

  // --- HANDLERS ---
  const handleAdd = (e) => {
      e.preventDefault();
      if (!newType.name) return alert("Vui lòng nhập tên hình thức!");
      
      // LOGIC TRẠNG THÁI KHI TẠO MỚI
      const initialStatus = isOp ? 'Pending' : 'Active';

      addDisciplineType({
          ...newType,
          status: initialStatus,
          createdBy: user.username,
          createdAt: new Date().toISOString()
      });
      
      setNewType({ name: '', description: '', level: DISC_LEVELS[0] });
      alert(isOp ? "Đã gửi đề xuất hình thức kỷ luật!" : "Đã ban hành hình thức kỷ luật mới!");
  };

  const handleApprove = (id) => {
      if(window.confirm("Phê duyệt hình thức này?")) {
          updateDisciplineTypeStatus(id, 'Active');
      }
  };

  const handleReject = (id) => {
      if(window.confirm("Đình chỉ (Từ chối) hình thức này?")) {
          updateDisciplineTypeStatus(id, 'Suspended');
      }
  };

  const handleDeleteAction = (type) => {
      // 1. Logic cho Reg Admin: Đề xuất xóa
      if (isReg) {
          const reason = window.prompt("Nhập lý do ĐỀ XUẤT XÓA hình thức này:");
          if (!reason) return;
          
          proposeDeleteDisciplineType(type.id, {
              reason: reason,
              by: user.username
          });
          alert("Đã gửi đề xuất xóa lên Chief Admin.");
          return;
      }

      // 2. Logic cho Chief Admin: Xóa mềm (Chuyển sang thùng rác)
      if (isChief) {
          if (!type.isDeleteProposed) {
              alert("Chỉ có thể xóa các hình thức đã được Regulatory đề xuất xóa!");
              return;
          }
          if(window.confirm(`Xác nhận xóa hình thức này (Chuyển vào thùng rác)?\nLý do đề xuất: ${type.deleteProposalReason}`)) {
              const info = {
                  deletedBy: user.username,
                  deleteReason: type.deleteProposalReason
              };
              softDeleteDisciplineType(type.id, info);
          }
      }
  };

  // Hàm khôi phục từ thùng rác
  const handleRestore = (id) => {
      if(window.confirm("Khôi phục hình thức này?")) {
          updateDisciplineTypeStatus(id, 'Active');
      }
  };

  // Hàm xóa vĩnh viễn (Cho mục 3)
  const handleHardDelete = (id) => {
      if(window.confirm("CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn dữ liệu này khỏi hệ thống.\nBạn có chắc chắn muốn tiếp tục?")) {
          // Lưu ý: Đảm bảo Context DataContext có hàm deleteDisciplineType
          if (deleteDisciplineType) {
              deleteDisciplineType(id);
          } else {
              alert("Lỗi: Hàm xóa vĩnh viễn chưa được cấu hình trong DataContext!");
          }
      }
  };

  const renderStatusBadge = (t) => {
      if (t.status === 'Pending') return <span style={{color:'blue', fontSize:'0.8rem'}}>⏳ Chờ duyệt</span>;
      if (t.status === 'Suspended') return <span style={{color:'red', fontSize:'0.8rem'}}>⛔ Đình chỉ</span>;
      if (t.isDeleteProposed) return <span style={{color:'yellow', fontSize:'0.8rem'}}>⚠️ Đề xuất xóa</span>;
      return <span style={{color:'green', fontSize:'0.8rem'}}>● Đã duyệt</span>;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ 
          color: '#003366', 
          borderBottom: '2px solid #e5e7eb', 
          paddingBottom: '15px', 
          marginBottom: '20px', 
          fontWeight: 'bold', 
          fontSize: '1.5rem' 
      }}>
        QUẢN LÝ KỶ LUẬT - REGULATIONS
      </h2>

      {/* 1. FORM TẠO MỚI / ĐỀ XUẤT */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '25px', border: '1px solid #f0f0f0' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#003366', fontWeight: '600' }}>
              {isOp ? '+ Đề xuất hình thức kỷ luật mới' : 'Ban hành hình thức kỷ luật mới'}
          </h4>
          {/* Responsive Grid */}
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <input 
                  placeholder="Tên vi phạm (VD: Đi trễ)" 
                  value={newType.name}
                  onChange={e => setNewType({...newType, name: e.target.value})}
                  style={styles.input}
                  required
              />
              <select 
                  value={newType.level}
                  onChange={e => setNewType({...newType, level: e.target.value})}
                  style={styles.select}
              >
                  {DISC_LEVELS.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
              </select>
              <input 
                  placeholder="Mô tả / Quy định áp dụng..." 
                  value={newType.description}
                  onChange={e => setNewType({...newType, description: e.target.value})}
                  style={styles.input}
              />
              <button type="submit" style={styles.btnAdd}>
                  <Icons.Add /> {isOp ? 'Đề xuất' : 'Lưu'}
              </button>
          </form>
      </div>

      {/* 2. DANH SÁCH HIỆN HÀNH */}
      <div style={{...styles.card, marginTop: '20px'}}>
          <h4 style={{ margin: '0 0 15px 0', color: '#003366', fontWeight: '600' }}>1. Danh mục hình thức kỷ luật (Hiện hành)</h4>
          <div style={{overflowX: 'auto'}}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                  <thead>
                      <tr style={{textAlign:'left', background:'#f9fafb', color:'#6b7280'}}>
                          <th style={{padding:'10px'}}>Vi phạm</th>
                          <th style={{padding:'10px'}}>Mức độ Kỷ luật</th>
                          <th style={{padding:'10px'}}>Mô tả</th>
                          <th style={{padding:'10px'}}>Tình trạng</th>
                          <th style={{padding:'10px'}}>Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {displayedTypes.map(t => (
                          <tr key={t.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                              <td style={{padding:'10px', fontWeight:'600'}}>{t.name}</td>
                              <td style={{padding:'10px'}}>
                                  <span style={styles.levelBadge}>{t.level || '---'}</span>
                              </td>
                              <td style={{padding:'10px', color:'#4b5563', fontSize:'0.9rem'}}>{t.description}</td>
                              <td style={{padding:'10px'}}>
                                  {renderStatusBadge(t)}
                                  {t.isDeleteProposed && (
                                      <div style={{fontSize:'0.75rem', color:'#666', marginTop:'4px', fontStyle:'italic'}}>
                                          Lý do xóa: {t.deleteProposalReason}
                                      </div>
                                  )}
                              </td>
                              <td style={{padding:'10px'}}>
                                  <div style={{display:'flex', gap:'8px'}}>
                                      {/* DUYỆT / TỪ CHỐI (Chỉ Reg/Chief thấy với Pending) */}
                                      {canApprove && t.status === 'Pending' && (
                                          <>
                                              <button onClick={() => handleApprove(t.id)} style={styles.btnIconGreen} title="Duyệt">
                                                  <Icons.Check />
                                              </button>
                                              <button onClick={() => handleReject(t.id)} style={styles.btnIconRed} title="Đình chỉ">
                                                  <Icons.XMark />
                                              </button>
                                          </>
                                      )}

                                      {/* ĐỀ XUẤT XÓA (Reg Admin) */}
                                      {isReg && t.status === 'Active' && !t.isDeleteProposed && (
                                          <button onClick={() => handleDeleteAction(t)} style={styles.btnIconOrange} title="Đề xuất xóa">
                                              <Icons.ProposeDelete />
                                          </button>
                                      )}

                                      {/* XÓA THẬT (Chief Admin - Chỉ xóa khi có đề xuất) */}
                                      {isChief && t.isDeleteProposed && (
                                          <button onClick={() => handleDeleteAction(t)} style={styles.btnIconRed} title="Chuyển vào thùng rác">
                                              <Icons.Trash />
                                          </button>
                                      )}
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {displayedTypes.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#9ca3af'}}>Chưa có dữ liệu</td></tr>}
                  </tbody>
              </table>
          </div>
      </div>

      {/* 3. DANH SÁCH HỒ SƠ VI PHẠM */}
      <div style={{...styles.card, marginTop: '20px'}}>
          <h4 style={{ margin: '0 0 15px 0', color: '#003366', fontWeight: '600' }}>2. Hồ sơ nhân sự vi phạm</h4>
          <div style={{overflowX: 'auto'}}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                  <thead>
                      <tr style={{textAlign:'left', background:'#f9fafb', color:'#6b7280'}}>
                          <th style={{padding:'10px'}}>Nhân sự</th>
                          <th style={{padding:'10px'}}>Vi phạm</th>
                          <th style={{padding:'10px'}}>Mức độ Kỷ luật</th>
                          <th style={{padding:'10px'}}>Ngày ghi nhận</th>
                      </tr>
                  </thead>
                  <tbody>
                      {disciplineRecords.map(rec => {
                          const staff = staffList.find(s => s.id === rec.staffId);
                          const discType = disciplineTypes.find(d => d.id === rec.disciplineId);
                          
                          return (
                              <tr key={rec.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                                  <td style={{padding:'10px', fontWeight:'600'}}>{staff ? staff.name : 'Unknown'}</td>
                                  <td style={{padding:'10px'}}>{rec.taskTitle || '---'}</td>
                                  <td style={{padding:'10px'}}>
                                      <span style={styles.levelBadge}>
                                          {discType ? discType.level : (rec.disciplineName || '---')}
                                      </span>
                                  </td>
                                  <td style={{padding:'10px', color:'#6b7280'}}>
                                      {new Date(rec.date).toLocaleDateString('vi-VN')}
                                  </td>
                              </tr>
                          );
                      })}
                      {disciplineRecords.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#9ca3af'}}>Chưa có hồ sơ vi phạm</td></tr>}
                  </tbody>
              </table>
          </div>
      </div>

      {/* 4. LỊCH SỬ HIỆU CHỈNH (CHỈ CHIEF & REG THẤY) */}
      {!isOp && deletedTypes.length > 0 && (
          <div style={{...styles.card, marginTop: '20px', background:'#fff1f2', border:'1px solid #fecdd3'}}>
              <h4 style={{ margin: '0 0 15px 0', color: '#991b1b', fontWeight: '600' }}>3. Danh mục các hình thức kỷ luật đã được hiệu chỉnh (Deleted)</h4>
              <div style={{overflowX: 'auto'}}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                      <thead>
                          <tr style={{textAlign:'left', color:'#991b1b'}}>
                              <th style={{padding:'10px'}}>Hình thức</th>
                              <th style={{padding:'10px'}}>Mức độ</th>
                              <th style={{padding:'10px'}}>Lý do hủy</th>
                              <th style={{padding:'10px'}}>Người hủy</th>
                              <th style={{padding:'10px'}}>Hành động</th> {/* Thêm cột Hành động */}
                          </tr>
                      </thead>
                      <tbody>
                          {deletedTypes.map(t => (
                              <tr key={t.id} style={{borderBottom:'1px solid #fecdd3'}}>
                                  <td style={{padding:'10px', fontWeight:'600'}}>{t.name}</td>
                                  <td style={{padding:'10px'}}>{t.level}</td>
                                  <td style={{padding:'10px', fontStyle:'italic'}}>{t.deleteReason}</td>
                                  <td style={{padding:'10px'}}>{t.deletedBy}</td>
                                  <td style={{padding:'10px'}}>
                                      {isChief && (
                                          <div style={{display:'flex', gap:'8px'}}>
                                              <button onClick={() => handleRestore(t.id)} style={styles.btnIconBlue} title="Khôi phục">
                                                  <Icons.Restore />
                                              </button>
                                              {/* NÚT XÓA VĨNH VIỄN */}
                                              <button onClick={() => handleHardDelete(t.id)} style={styles.btnIconRed} title="Xóa vĩnh viễn">
                                                  <Icons.XMark />
                                              </button>
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

const styles = {
    card: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' },
    select: { padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', background: 'white' },
    btnAdd: { background: '#003366', color: 'white', border: 'none', borderRadius: '6px', padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
    btnIconRed: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' },
    btnIconGreen: { background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', padding: '4px' },
    btnIconBlue: { background: 'none', border: 'none', color: '#003366', cursor: 'pointer', padding: '4px' },
    btnIconOrange: { background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', padding: '4px' },
    levelBadge: { background: '#f3f4f6', color: '#374151', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500', border: '1px solid #e5e7eb' }
};

export default DisciplineManager;