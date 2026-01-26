import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const DisciplineManager = () => {
  const { user } = useAuth();
  const { 
      disciplineTypes, addDisciplineType, updateDisciplineTypeStatus, softDeleteDisciplineType,
      disciplineRecords, updateDisciplineRecordStatus, deleteDisciplineRecord,
      staffList 
  } = useData();
  
  const [newType, setNewType] = useState('');

  const isOp = user.role === 'op';
  const isReg = user.role === 'reg';
  const isChief = user.role === 'chief';

  // --- LOGIC HÌNH THỨC KỶ LUẬT ---
  const handleAddType = (e) => {
      e.preventDefault();
      // Op đề xuất -> Pending, Reg/Chief -> Active
      const status = isOp ? 'Pending' : 'Active';
      addDisciplineType({ 
          name: newType, 
          status, 
          createdBy: user.name || user.username 
      });
      setNewType('');
  };

  // MỚI: Xử lý xóa hình thức kỷ luật (Chỉ Chief)
  const handleDeleteType = (id) => {
      const reason = window.prompt("Nhập lý do xóa hình thức kỷ luật này:");
      if (reason) {
          softDeleteDisciplineType(id, {
              deletedBy: user.name || user.username,
              deleteReason: reason
          });
          alert("Đã xóa thành công!");
      }
  };

  // --- LOGIC HỒ SƠ VI PHẠM ---
  const handleRequestRemoval = (recordId) => {
      if(window.confirm('Bạn muốn đề xuất xóa vi phạm này?')) {
          updateDisciplineRecordStatus(recordId, 'PendingRemoval');
      }
  };

  const handleApproveRemoval = (recordId) => {
      if(window.confirm('Chấp thuận xóa vĩnh viễn vi phạm này?')) {
          deleteDisciplineRecord(recordId);
      }
  };

  // Lọc danh sách hiển thị ở mục 1 (Chỉ hiện cái chưa xóa)
  const activeDisciplineTypes = disciplineTypes.filter(d => d.status !== 'Deleted');

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ color: '#b91c1c' }}>Quản lý Kỷ luật</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          
          {/* CỘT 1: DANH MỤC HÌNH THỨC (HIỆN HÀNH) */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
             <h4 style={{color: '#003366'}}>1. Danh mục hình thức xử lý (Hiện hành)</h4>
             <ul style={{ listStyle: 'none', padding: 0 }}>
                {activeDisciplineTypes.map(d => (
                    <li key={d.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            {d.name} 
                            <span style={{ fontSize: '0.7rem', marginLeft: '10px', padding: '2px 6px', borderRadius: '4px', background: d.status==='Active'?'#ecfdf5':'#fff7ed', color: d.status==='Active'?'green':'orange' }}>
                                {d.status === 'Active' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                        </span>
                        
                        {/* Action Buttons */}
                        <div style={{display:'flex', gap:'5px'}}>
                            {/* Reg Admin duyệt đề xuất của Op */}
                            {isReg && d.status === 'Pending' && (
                                <>
                                    <button onClick={() => updateDisciplineTypeStatus(d.id, 'Active')} style={{color: 'white', background:'green', border:'none', padding:'2px 5px', borderRadius:'3px', cursor:'pointer'}}>✓</button>
                                    <button onClick={() => updateDisciplineTypeStatus(d.id, 'Rejected')} style={{color: 'white', background:'red', border:'none', padding:'2px 5px', borderRadius:'3px', cursor:'pointer'}}>✕</button>
                                </>
                            )}
                            
                            {/* MỚI: Chief Admin xóa hình thức đã ban hành */}
                            {isChief && (
                                <button onClick={() => handleDeleteType(d.id)} style={{color: 'white', background:'#ef4444', border:'none', padding:'4px 8px', borderRadius:'3px', cursor:'pointer', fontSize:'0.75rem', fontWeight:'bold'}}>
                                    Xóa
                                </button>
                            )}
                        </div>
                    </li>
                ))}
             </ul>
             {(isOp || isReg || isChief) && (
                 <form onSubmit={handleAddType} style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                    <input value={newType} onChange={e => setNewType(e.target.value)} placeholder={isOp ? "Đề xuất hình thức..." : "Thêm hình thức..."} style={{ flex: 1, padding: '8px', borderRadius:'4px', border:'1px solid #ccc' }} />
                    <button type="submit" style={{ padding: '8px 15px', background:'#333', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>{isOp ? 'Đề xuất' : 'Thêm'}</button>
                 </form>
             )}
          </div>

          {/* CỘT 2: HỒ SƠ VI PHẠM (GIỮ NGUYÊN) */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
             <h4 style={{color: '#003366'}}>2. Hồ sơ nhân sự vi phạm</h4>
             <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{textAlign:'left', borderBottom: '2px solid #eee'}}><th>Nhân sự</th><th>Vi phạm</th><th>Hình thức</th><th>Xử lý</th></tr>
                </thead>
                <tbody>
                    {disciplineRecords.map(rec => {
                        const staff = staffList.find(s => s.id === rec.staffId);
                        return (
                            <tr key={rec.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{padding:'10px 0'}}>{staff?.name}</td>
                                <td>{rec.violation}</td>
                                <td style={{color:'#b91c1c', fontWeight:'bold'}}>{rec.penaltyName}</td>
                                <td>
                                    {rec.status === 'Active' && isReg && (
                                        <button onClick={() => handleRequestRemoval(rec.id)} style={{fontSize:'0.75rem', background:'orange', color:'white', border:'none', padding:'3px 6px', borderRadius:'3px', cursor:'pointer'}}>Đề xuất xóa</button>
                                    )}
                                    {rec.status === 'PendingRemoval' && (
                                        <span style={{color: 'orange', fontSize: '0.75rem'}}>Chờ Chief duyệt</span>
                                    )}
                                    {rec.status === 'PendingRemoval' && isChief && (
                                        <button onClick={() => handleApproveRemoval(rec.id)} style={{fontSize:'0.75rem', background:'red', color:'white', border:'none', padding:'3px 6px', borderRadius:'3px', cursor:'pointer', fontWeight:'bold'}}>DUYỆT XÓA</button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
             </table>
          </div>
      </div>

      {/* MỚI: MỤC 3 - DANH MỤC HIỆU CHỈNH (CHỈ DÀNH CHO CHIEF HOẶC REG) */}
      {(isChief || isReg) && (
          <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h4 style={{color: '#003366', marginTop: 0}}>3. Danh mục các hình thức kỷ luật đã được hiệu chỉnh</h4>
              <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{textAlign:'left', background: '#f9fafb', color:'#666'}}>
                            <th style={{padding:'10px'}}>Hình thức kỷ luật</th>
                            <th style={{padding:'10px'}}>Ngày ban hành</th>
                            <th style={{padding:'10px'}}>Người ban hành</th>
                            <th style={{padding:'10px'}}>Trạng thái</th>
                            <th style={{padding:'10px'}}>Ngày xóa</th>
                            <th style={{padding:'10px'}}>Người xóa</th>
                            <th style={{padding:'10px'}}>Lý do xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disciplineTypes.length === 0 ? (
                            <tr><td colSpan="7" style={{padding:'20px', textAlign:'center'}}>Chưa có dữ liệu</td></tr>
                        ) : (
                            disciplineTypes.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(d => (
                                <tr key={d.id} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={{padding:'10px', fontWeight:'500'}}>{d.name}</td>
                                    <td style={{padding:'10px'}}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                                    <td style={{padding:'10px'}}>{d.createdBy || 'System'}</td>
                                    <td style={{padding:'10px'}}>
                                        <span style={{
                                            padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem', fontWeight:'bold',
                                            background: d.status === 'Deleted' ? '#fee2e2' : '#ecfdf5',
                                            color: d.status === 'Deleted' ? '#b91c1c' : '#047857'
                                        }}>
                                            {d.status === 'Deleted' ? 'Đã xóa' : (d.status === 'Active' ? 'Hiệu lực' : 'Chờ duyệt')}
                                        </span>
                                    </td>
                                    <td style={{padding:'10px', color: '#666'}}>
                                        {d.status === 'Deleted' && d.deletedAt ? new Date(d.deletedAt).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td style={{padding:'10px'}}>{d.deletedBy || '-'}</td>
                                    <td style={{padding:'10px', fontStyle: 'italic', color: '#666'}}>{d.deleteReason || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default DisciplineManager;