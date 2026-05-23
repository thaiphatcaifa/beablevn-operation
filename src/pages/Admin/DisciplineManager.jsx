import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- ICONS MINIMALIST ---
const Icons = {
  Discipline: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>),
  Add: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>),
  Trash: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>),
  Restore: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>),
  Check: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
  XMark: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  ProposeDelete: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>),
  Folder: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>),
  ChevronDown: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>),
  ChevronRight: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>)
};

const DisciplineManager = () => {
  const { user } = useAuth();
  const { 
    disciplineTypes, 
    addDisciplineType, 
    updateDisciplineTypeStatus, 
    softDeleteDisciplineType, 
    proposeDeleteDisciplineType,
    deleteDisciplineType, 
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

  const [newType, setNewType] = useState({ 
      name: '', 
      description: '', 
      level: DISC_LEVELS[0]
  });

  // State quản lý việc đóng mở các nhóm vi phạm (Mặc định mở hết)
  const [expandedFolders, setExpandedFolders] = useState([...DISC_LEVELS, 'Khác']);

  const toggleFolder = (lvl) => {
      setExpandedFolders(prev => 
          prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
      );
  };

  // --- PHÂN QUYỀN ---
  const isChief = user?.role === 'chief';
  const isReg = user?.role === 'reg';
  const isOp = user?.role === 'op'; 
  const canApprove = isChief || isReg; 

  // --- LỌC DANH SÁCH ---
  const displayedTypes = disciplineTypes.filter(t => {
      if (t.status === 'Deleted') return false;
      if (isOp) {
          return t.status === 'Active' || t.createdBy === user.username;
      }
      return true;
  });

  const deletedTypes = disciplineTypes.filter(t => t.status === 'Deleted');

  // --- HANDLERS ---
  const handleAdd = (e) => {
      e.preventDefault();
      if (!newType.name) return alert("Vui lòng nhập tên hình thức!");
      
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

  const handleRestore = (id) => {
      if(window.confirm("Khôi phục hình thức này?")) {
          updateDisciplineTypeStatus(id, 'Active');
      }
  };

  const handleHardDelete = (id) => {
      if(window.confirm("CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn dữ liệu này khỏi hệ thống.\nBạn có chắc chắn muốn tiếp tục?")) {
          if (deleteDisciplineType) {
              deleteDisciplineType(id);
          } else {
              alert("Lỗi: Hàm xóa vĩnh viễn chưa được cấu hình trong DataContext!");
          }
      }
  };

  const renderStatusBadge = (t) => {
      if (t.status === 'Pending') return <span style={styles.badgeWarning}>⏳ Chờ duyệt</span>;
      if (t.status === 'Suspended') return <span style={styles.badgeError}>⛔ Đình chỉ</span>;
      if (t.isDeleteProposed) return <span style={styles.badgeOrange}>⚠️ Đề xuất xóa</span>;
      return <span style={styles.badgeSuccess}>● Đã duyệt</span>;
  };

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box' }}>
      <style>{`
          .input-modern {
              padding: 12px 16px; border-radius: 10px; border: 1px solid #e5e7eb; outline: none; font-size: 0.95rem; background: white; transition: all 0.2s; box-sizing: border-box; width: 100%;
          }
          .input-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
          .table-row { transition: background 0.2s; }
          .table-row:hover { background: #f1f5f9 !important; }
          .action-btn { transition: all 0.2s; flex-shrink: 0; }
          .action-btn:hover { transform: scale(1.1); filter: brightness(0.95); }
          
          .form-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
              gap: 16px; 
              align-items: end; 
          }
          
          .table-responsive {
              width: 100%;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              border-radius: 8px;
          }
          .td-wrap {
              word-break: break-word; 
              white-space: normal;
              line-height: 1.5;
              min-width: 160px; 
          }
          
          /* Hiệu ứng hover cho thẻ Folder */
          .folder-row:hover {
              background: #f1f5f9 !important;
          }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
              <Icons.Discipline />
          </div>
          <div>
              <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>QUẢN LÝ KỶ LUẬT</h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Ban hành và theo dõi vi phạm (Regulations)</span>
          </div>
      </div>

      {/* 1. FORM TẠO MỚI / ĐỀ XUẤT */}
      <div style={styles.card}>
          <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                  {isOp ? 'Đề xuất hình thức kỷ luật mới' : 'Ban hành hình thức kỷ luật mới'}
              </h3>
          </div>
          <div style={styles.cardBody}>
              <form onSubmit={handleAdd} className="form-grid">
                  <div>
                      <label style={styles.label}>Tên vi phạm</label>
                      <input className="input-modern" placeholder="VD: Đi trễ, Quên thẻ..." value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} required />
                  </div>
                  <div>
                      <label style={styles.label}>Mức độ áp dụng</label>
                      <select className="input-modern" value={newType.level} onChange={e => setNewType({...newType, level: e.target.value})} style={{appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2364748b" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '40px'}}>
                          {DISC_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                      </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Mô tả / Quy định chi tiết</label>
                      <input className="input-modern" placeholder="Mô tả cụ thể hướng xử lý..." value={newType.description} onChange={e => setNewType({...newType, description: e.target.value})} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                      <button type="submit" style={styles.btnAdd}>
                          <Icons.Add /> <span>{isOp ? 'Đề xuất duyệt' : 'Tạo mới'}</span>
                      </button>
                  </div>
              </form>
          </div>
      </div>

      {/* 2. DANH SÁCH HIỆN HÀNH DẠNG FOLDER */}
      <div style={styles.card}>
          <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>1. Danh mục hình thức kỷ luật (Hiện hành)</h3>
          </div>
          <div className="table-responsive">
              <table style={styles.table}>
                  <thead>
                      <tr style={styles.tableHeadRow}>
                          <th style={{...styles.th, minWidth: '220px'}}>Vi phạm</th>
                          <th style={styles.th}>Mức độ Kỷ luật</th>
                          <th style={{...styles.th, minWidth: '220px'}}>Mô tả chi tiết</th>
                          <th style={styles.th}>Tình trạng</th>
                          <th style={{...styles.th, textAlign: 'right', paddingRight: '24px', minWidth: '130px'}}>Hành động</th>
                      </tr>
                  </thead>
                  <tbody>
                      {DISC_LEVELS.map(lvl => {
                          const items = displayedTypes.filter(t => t.level === lvl);
                          const isExpanded = expandedFolders.includes(lvl);
                          return (
                              <React.Fragment key={lvl}>
                                  <tr className="folder-row" onClick={() => toggleFolder(lvl)} style={{ cursor: 'pointer', background: '#f8fafc', transition: 'background 0.2s' }}>
                                      <td colSpan="5" style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#003366', fontWeight: '800', fontSize: '1.05rem' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
                                                  {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                                              </div>
                                              <Icons.Folder />
                                              <span>{lvl}</span>
                                              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', marginLeft: 'auto', border: '1px solid #bae6fd' }}>
                                                  {items.length} quy định
                                              </span>
                                          </div>
                                      </td>
                                  </tr>
                                  {isExpanded && items.map(t => (
                                      <tr key={t.id} className="table-row">
                                          <td style={{...styles.td, fontWeight:'700', color: '#111827'}} className="td-wrap">{t.name}</td>
                                          <td style={styles.td}>
                                              <span style={styles.levelBadge}>{t.level || '---'}</span>
                                          </td>
                                          <td style={{...styles.td, color:'#475569'}} className="td-wrap">{t.description}</td>
                                          <td style={styles.td}>
                                              <div style={{display:'flex', flexDirection:'column', gap:'6px', alignItems:'flex-start'}}>
                                                  {renderStatusBadge(t)}
                                                  {t.isDeleteProposed && (
                                                      <div style={{fontSize:'0.75rem', color:'#ea580c', fontWeight: '600'}} className="td-wrap">
                                                          Lý do xóa: {t.deleteProposalReason}
                                                      </div>
                                                  )}
                                              </div>
                                          </td>
                                          <td style={{...styles.td, textAlign: 'right', paddingRight: '24px'}}>
                                              <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                                                  {canApprove && t.status === 'Pending' && (
                                                      <>
                                                          <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleApprove(t.id); }} style={styles.btnActionGreen} title="Phê duyệt">
                                                              <Icons.Check />
                                                          </button>
                                                          <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleReject(t.id); }} style={styles.btnActionRed} title="Đình chỉ (Từ chối)">
                                                              <Icons.XMark />
                                                          </button>
                                                      </>
                                                  )}
                                                  {isReg && t.status === 'Active' && !t.isDeleteProposed && (
                                                      <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleDeleteAction(t); }} style={styles.btnActionOrange} title="Đề xuất xóa">
                                                          <Icons.ProposeDelete />
                                                      </button>
                                                  )}
                                                  {isChief && t.isDeleteProposed && (
                                                      <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleDeleteAction(t); }} style={styles.btnActionRed} title="Chuyển vào thùng rác">
                                                          <Icons.Trash />
                                                      </button>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                                  {isExpanded && items.length === 0 && (
                                      <tr>
                                          <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem', borderBottom: '1px solid #f1f5f9' }}>
                                              Chưa có quy định nào trong nhóm này.
                                          </td>
                                      </tr>
                                  )}
                              </React.Fragment>
                          );
                      })}

                      {/* Các hình thức chưa phân loại (Nếu có) */}
                      {(() => {
                          const otherItems = displayedTypes.filter(t => !DISC_LEVELS.includes(t.level));
                          if (otherItems.length === 0) return null;
                          const isExpanded = expandedFolders.includes('Khác');
                          return (
                              <React.Fragment key="Khác">
                                  <tr className="folder-row" onClick={() => toggleFolder('Khác')} style={{ cursor: 'pointer', background: '#f8fafc', transition: 'background 0.2s' }}>
                                      <td colSpan="5" style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontWeight: '800', fontSize: '1.05rem' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
                                                  {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                                              </div>
                                              <Icons.Folder />
                                              <span>Khác (Chưa phân loại)</span>
                                              <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', marginLeft: 'auto', border: '1px solid #e2e8f0' }}>
                                                  {otherItems.length} quy định
                                              </span>
                                          </div>
                                      </td>
                                  </tr>
                                  {isExpanded && otherItems.map(t => (
                                      <tr key={t.id} className="table-row">
                                          <td style={{...styles.td, fontWeight:'700', color: '#111827'}} className="td-wrap">{t.name}</td>
                                          <td style={styles.td}>
                                              <span style={styles.levelBadge}>{t.level || '---'}</span>
                                          </td>
                                          <td style={{...styles.td, color:'#475569'}} className="td-wrap">{t.description}</td>
                                          <td style={styles.td}>
                                              <div style={{display:'flex', flexDirection:'column', gap:'6px', alignItems:'flex-start'}}>
                                                  {renderStatusBadge(t)}
                                              </div>
                                          </td>
                                          <td style={{...styles.td, textAlign: 'right', paddingRight: '24px'}}>
                                              <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
                                                  {canApprove && t.status === 'Pending' && (
                                                      <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleApprove(t.id); }} style={styles.btnActionGreen} title="Phê duyệt"><Icons.Check /></button>
                                                  )}
                                                  {isChief && (
                                                      <button className="action-btn" onClick={(e) => { e.stopPropagation(); softDeleteDisciplineType(t.id, { deletedBy: user.username }); }} style={styles.btnActionRed} title="Xóa"><Icons.Trash /></button>
                                                  )}
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </React.Fragment>
                          );
                      })()}
                      
                      {displayedTypes.length === 0 && <tr><td colSpan="5" style={styles.emptyTd}>Hệ thống chưa thiết lập quy định kỷ luật nào.</td></tr>}
                  </tbody>
              </table>
          </div>
      </div>

      {/* 3. DANH SÁCH HỒ SƠ VI PHẠM */}
      <div style={styles.card}>
          <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>2. Hồ sơ nhân sự vi phạm</h3>
          </div>
          <div className="table-responsive">
              <table style={styles.table}>
                  <thead>
                      <tr style={styles.tableHeadRow}>
                          <th style={{...styles.th, width: '50px'}}>STT</th>
                          <th style={styles.th}>Nhân sự vi phạm</th>
                          <th style={styles.th}>Nhiệm vụ / Ca làm</th>
                          <th style={styles.th}>Mức độ Kỷ luật</th>
                          <th style={styles.th}>Ngày ghi nhận</th>
                      </tr>
                  </thead>
                  <tbody>
                      {disciplineRecords.map((rec, idx) => {
                          const staff = staffList.find(s => s.id === rec.staffId);
                          const discType = disciplineTypes.find(d => d.id === rec.disciplineId);
                          return (
                              <tr key={rec.id} className="table-row">
                                  <td style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af'}}>{idx + 1}</td>
                                  <td style={{...styles.td, fontWeight:'700', color: '#111827'}} className="td-wrap">
                                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                          <div style={{width:'32px', height:'32px', background:'#f1f5f9', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#475569', fontWeight:'800', fontSize:'0.9rem', flexShrink: 0}}>
                                              {(staff ? staff.name : 'U').charAt(0).toUpperCase()}
                                          </div>
                                          {staff ? staff.name : 'Unknown'}
                                      </div>
                                  </td>
                                  <td style={{...styles.td, color: '#475569', fontWeight: '600'}} className="td-wrap">{rec.taskTitle || '---'}</td>
                                  <td style={styles.td}>
                                      <span style={{...styles.levelBadge, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', whiteSpace: 'nowrap'}}>
                                          {discType ? discType.level : (rec.disciplineName || '---')}
                                      </span>
                                  </td>
                                  <td style={{...styles.td, color:'#64748b'}}>
                                      {new Date(rec.date).toLocaleDateString('vi-VN')}
                                  </td>
                              </tr>
                          );
                      })}
                      {disciplineRecords.length === 0 && <tr><td colSpan="5" style={styles.emptyTd}>Tuyệt vời! Không có hồ sơ vi phạm nào được ghi nhận.</td></tr>}
                  </tbody>
              </table>
          </div>
      </div>

      {/* 4. LỊCH SỬ HIỆU CHỈNH (CHỈ CHIEF & REG THẤY) */}
      {!isOp && deletedTypes.length > 0 && (
          <div style={{...styles.card, border: '1px solid #fecaca'}}>
              <div style={{...styles.cardHeader, background: '#fef2f2', borderBottom: '1px solid #fecaca'}}>
                  <h3 style={{...styles.cardTitle, color: '#b91c1c'}}>3. Thùng rác (Hình thức đã hiệu chỉnh/xóa)</h3>
              </div>
              <div className="table-responsive">
                  <table style={styles.table}>
                      <thead>
                          <tr style={{background: '#fff5f5'}}>
                              <th style={{...styles.th, color: '#991b1b'}}>Hình thức</th>
                              <th style={{...styles.th, color: '#991b1b'}}>Mức độ</th>
                              <th style={{...styles.th, color: '#991b1b'}}>Lý do hủy</th>
                              <th style={{...styles.th, color: '#991b1b'}}>Người hủy</th>
                              <th style={{...styles.th, color: '#991b1b', textAlign: 'right', paddingRight: '24px'}}>Hành động</th>
                          </tr>
                      </thead>
                      <tbody>
                          {deletedTypes.map(t => (
                              <tr key={t.id} className="table-row">
                                  <td style={{...styles.td, fontWeight:'700', color: '#4b5563', textDecoration: 'line-through'}} className="td-wrap">{t.name}</td>
                                  <td style={styles.td}><span style={{...styles.levelBadge, opacity: 0.7}}>{t.level}</span></td>
                                  <td style={{...styles.td, fontStyle:'italic', color: '#ef4444'}} className="td-wrap">{t.deleteReason}</td>
                                  <td style={{...styles.td, color: '#64748b'}}>{t.deletedBy}</td>
                                  <td style={{...styles.td, textAlign: 'right', paddingRight: '24px'}}>
                                      {isChief ? (
                                          <div style={{display:'flex', gap:'8px', justifyContent: 'flex-end', flexWrap:'wrap'}}>
                                              <button className="action-btn" onClick={() => handleRestore(t.id)} style={styles.btnActionBlue} title="Khôi phục">
                                                  <Icons.Restore />
                                              </button>
                                              <button className="action-btn" onClick={() => handleHardDelete(t.id)} style={styles.btnActionRed} title="Xóa vĩnh viễn">
                                                  <Icons.XMark />
                                              </button>
                                          </div>
                                      ) : <span style={{fontSize:'0.8rem', color:'#94a3b8'}}>Chỉ xem</span>}
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
    card: { background: 'white', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '32px', overflow: 'hidden' },
    cardHeader: { padding: '24px', borderBottom: '1px solid #f1f5f9', background: '#ffffff' },
    cardTitle: { margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.01em' },
    cardBody: { padding: '24px' },
    
    label: { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px' },
    btnAdd: { background: '#003366', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)', transition: 'all 0.2s', height: '46px' },
    
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px', tableLayout: 'auto' },
    tableHeadRow: { background: '#f8fafc' },
    th: { padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
    td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155', verticalAlign: 'middle' },
    emptyTd: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem' },
    
    levelBadge: { background: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid #e2e8f0', display: 'inline-block' },
    
    badgeSuccess: { background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #a7f3d0', whiteSpace: 'nowrap', display: 'inline-block' },
    badgeWarning: { background: '#fffbeb', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #fde68a', whiteSpace: 'nowrap', display: 'inline-block' },
    badgeError: { background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #fecaca', whiteSpace: 'nowrap', display: 'inline-block' },
    badgeOrange: { background: '#fff7ed', color: '#ea580c', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #fed7aa', whiteSpace: 'nowrap', display: 'inline-block' },
    
    btnActionGreen: { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    btnActionRed: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    btnActionBlue: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    btnActionOrange: { background: '#fff7ed', border: '1px solid #fed7aa', color: '#ea580c', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
};

export default DisciplineManager;