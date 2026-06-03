import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- ICON MINIMALIST ---
const Icons = {
  Facility: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>),
  Add: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>),
  Edit: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>),
  Trash: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244 2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>),
  Close: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>),
  Save: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>),
  Duplicate: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>),
};

const FacilityManager = () => {
  const { user } = useAuth();
  const { areas, addArea, updateArea, deleteArea } = useData();

  // Kiểm tra quyền (Chỉ Chief hoặc Reg Admin)
  const canManage = user?.role === 'chief' || user?.role === 'reg';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      checklist: [] // [{ item: '', optionsStr: '', goodStatus: '' }]
  });

  if (!canManage) {
      return <div style={{padding:'24px', color:'#dc2626', fontWeight:'bold'}}>Bạn không có quyền truy cập trang quản lý Cơ sở hạ tầng.</div>;
  }

  // --- HANDLERS ---
  const handleOpenModal = (area = null) => {
      if (area) {
          setEditingArea(area);
          // Parse mảng options thành chuỗi để dễ edit trong 1 ô input
          const parsedChecklist = (area.checklist || []).map(c => ({
              ...c,
              optionsStr: Array.isArray(c.options) ? c.options.join(', ') : c.options
          }));
          setFormData({ name: area.name || '', description: area.description || '', checklist: parsedChecklist });
      } else {
          setEditingArea(null);
          setFormData({ name: '', description: '', checklist: [] });
      }
      setIsModalOpen(true);
  };

  const handleDuplicate = (area) => {
      // Set editingArea to null so handleSave knows this is a NEW entry
      setEditingArea(null);
      
      const parsedChecklist = (area.checklist || []).map(c => ({
          ...c,
          optionsStr: Array.isArray(c.options) ? c.options.join(', ') : c.options
      }));

      // Copy form data from existing area and suffix name to identify it as a copy
      setFormData({ 
          name: `${area.name} - Bản sao`, 
          description: area.description || '', 
          checklist: parsedChecklist 
      });

      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingArea(null);
      setFormData({ name: '', description: '', checklist: [] });
  };

  // Quản lý hạng mục Checklist
  const addChecklistItem = () => {
      setFormData(prev => ({
          ...prev,
          checklist: [...prev.checklist, { item: '', optionsStr: '', goodStatus: '' }]
      }));
  };

  const removeChecklistItem = (index) => {
      setFormData(prev => ({
          ...prev,
          checklist: prev.checklist.filter((_, i) => i !== index)
      }));
  };

  const updateChecklistItem = (index, field, value) => {
      const newList = [...formData.checklist];
      newList[index][field] = value;
      setFormData({ ...formData, checklist: newList });
  };

  // Lưu Khu vực
  const handleSave = async (e) => {
      e.preventDefault();
      if (!formData.name.trim()) return alert("Vui lòng nhập tên khu vực!");
      
      // Chuẩn hóa checklist trước khi lưu
      const finalChecklist = formData.checklist.map(c => ({
          item: c.item.trim(),
          options: c.optionsStr.split(',').map(opt => opt.trim()).filter(opt => opt !== ''), // Tách chuỗi thành mảng
          goodStatus: c.goodStatus.trim()
      })).filter(c => c.item !== '' && c.options.length > 0 && c.goodStatus !== ''); // Loại bỏ các hạng mục điền thiếu

      const areaData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          checklist: finalChecklist,
          updatedBy: user.username,
          updatedAt: new Date().toISOString()
      };

      try {
          if (editingArea) {
              await updateArea(editingArea.id, areaData);
              alert("Cập nhật khu vực thành công!");
          } else {
              await addArea(areaData);
              alert("Thêm khu vực mới thành công!");
          }
          handleCloseModal();
      } catch (err) {
          alert("Lỗi khi lưu dữ liệu: " + err.message);
      }
  };

  const handleDelete = (id, name) => {
      if(window.confirm(`Xác nhận xóa hoàn toàn khu vực "${name}" khỏi hệ thống?\nHành động này không thể hoàn tác.`)) {
          deleteArea(id).then(() => alert("Đã xóa khu vực!")).catch(err => alert("Lỗi: " + err.message));
      }
  };

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box' }}>
      <style>{`
          .input-modern { padding: 12px 16px; border-radius: 10px; border: 1px solid #e5e7eb; outline: none; font-size: 0.95rem; background: white; transition: all 0.2s; box-sizing: border-box; width: 100%; margin-top: 6px; }
          .input-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
          
          /* --- NÂNG CẤP NÚT BẤM (ĐỒNG BỘ VỚI NÚT THIẾT LẬP LUẬT) --- */
          .btn-primary { 
              background: #003366; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              height: 46px;
              border-radius: 10px; 
              font-weight: 700; 
              font-size: 0.95rem;
              cursor: pointer; 
              display: inline-flex; 
              align-items: center; 
              justify-content: center;
              gap: 8px; 
              box-shadow: 0 4px 6px rgba(0, 51, 102, 0.2);
              transition: all 0.2s; 
              box-sizing: border-box;
          }
          .btn-primary:hover { 
              background: #002244; 
              transform: translateY(-2px); 
              box-shadow: 0 6px 12px rgba(0, 51, 102, 0.25);
          }

          .action-btn { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; display: inline-flex; transition: all 0.2s; }
          .action-btn:hover { background: #f1f5f9; }
          
          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
          .modal-content { background: white; width: 100%; max-width: 700px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
          .modal-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
          .modal-body { padding: 24px; overflow-y: auto; background: #ffffff; }
          .modal-footer { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }
      `}</style>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
                  <Icons.Facility />
              </div>
              <div>
                  <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>CƠ SỞ HẠ TẦNG</h2>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Quản lý khu vực & Hạng mục kiểm tra</span>
              </div>
          </div>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
              <Icons.Add /> <span>Thêm Khu vực mới</span>
          </button>
      </div>

      {/* LIST AREAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {areas.map(area => (
              <div key={area.id} style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '16px' }}>
                      <div>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>📍 {area.name}</h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{area.description || 'Không có mô tả'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="action-btn" style={{ color: '#10b981' }} onClick={() => handleDuplicate(area)} title="Sao chép"><Icons.Duplicate /></button>
                          <button className="action-btn" style={{ color: '#0284c7' }} onClick={() => handleOpenModal(area)} title="Chỉnh sửa"><Icons.Edit /></button>
                          <button className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(area.id, area.name)} title="Xóa khu vực"><Icons.Trash /></button>
                      </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Hạng mục cần kiểm tra:</div>
                      {area.checklist && area.checklist.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {area.checklist.map((item, idx) => (
                                  <div key={idx} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', color: '#334155', border: '1px solid #e2e8f0' }}>
                                      <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{item.item}</div>
                                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Trạng thái chuẩn: <span style={{ color: '#10b981', fontWeight: '600' }}>{item.goodStatus}</span></div>
                                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>Thuộc tính: {item.options?.join(' / ')}</div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa thiết lập hạng mục nào.</div>
                      )}
                  </div>
              </div>
          ))}
          {areas.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
                  Chưa có khu vực nào được thiết lập. Hãy thêm mới để bắt đầu.
              </div>
          )}
      </div>

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>
                          {editingArea ? 'Chỉnh sửa Khu vực' : 'Thêm Khu vực mới'}
                      </h3>
                      <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          <Icons.Close />
                      </button>
                  </div>
                  
                  <form id="areaForm" onSubmit={handleSave} className="modal-body">
                      <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Tên khu vực / Tên phòng <span style={{color: '#ef4444'}}>*</span></label>
                          <input className="input-modern" placeholder="VD: Canteen, Phòng Lab..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                      </div>
                      <div style={{ marginBottom: '24px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Mô tả ngắn</label>
                          <input className="input-modern" placeholder="VD: Khu vực ăn uống tầng trệt" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>

                      <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '20px', marginTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Danh sách Thiết bị cần kiểm tra</h4>
                              <button type="button" onClick={addChecklistItem} style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                                  + Thêm hạng mục
                              </button>
                          </div>

                          {formData.checklist.length === 0 && (
                              <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                                  Vui lòng thêm các thiết bị/tài sản cần kiểm tra tại khu vực này.
                              </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {formData.checklist.map((item, index) => (
                                  <div key={index} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', position: 'relative' }}>
                                      <button type="button" onClick={() => removeChecklistItem(index)} style={{ position: 'absolute', top: '12px', right: '12px', background: '#fef2f2', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                                          <Icons.Trash />
                                      </button>
                                      
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', paddingRight: '30px' }}>
                                          <div>
                                              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Tên thiết bị (Item)</label>
                                              <input className="input-modern" placeholder="VD: Máy lạnh, Màn hình..." value={item.item} onChange={e => updateChecklistItem(index, 'item', e.target.value)} required />
                                          </div>
                                          <div>
                                              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Các lựa chọn tình trạng (Cách nhau bởi dấu phẩy)</label>
                                              <input className="input-modern" placeholder="VD: Tốt, Hư hỏng, Cần sửa..." value={item.optionsStr} onChange={e => updateChecklistItem(index, 'optionsStr', e.target.value)} required />
                                          </div>
                                          <div>
                                              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Tình trạng CHUẨN (Good Status)</label>
                                              <input className="input-modern" placeholder="Nhập đúng 1 từ trong các lựa chọn trên (VD: Tốt)" value={item.goodStatus} onChange={e => updateChecklistItem(index, 'goodStatus', e.target.value)} required />
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </form>
                  
                  <div className="modal-footer">
                      <button type="button" onClick={handleCloseModal} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '10px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>Hủy bỏ</button>
                      <button type="submit" form="areaForm" className="btn-primary" style={{ padding: '10px 24px' }}><Icons.Save /> <span>Lưu cấu hình</span></button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FacilityManager;