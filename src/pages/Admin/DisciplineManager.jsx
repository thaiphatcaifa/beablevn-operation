import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

// --- BỘ ICON MINIMALIST ---
const Icons = {
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={size} height={size}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  XMark: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

const DisciplineManager = () => {
  const { disciplineTypes, addDisciplineType, removeDisciplineType, proposals, updateProposalStatus, deleteProposal } = useData();
  const [newType, setNewType] = useState('');

  // 1. Quản lý Loại hình kỷ luật
  const handleAddType = (e) => {
    e.preventDefault();
    if(newType) {
        addDisciplineType(newType);
        setNewType('');
    }
  };

  // 2. Xử lý đề xuất
  const handleApprove = (id) => {
      if(window.confirm("Duyệt đề xuất kỷ luật này?")) updateProposalStatus(id, 'Approved');
  };

  const handleReject = (id) => {
      if(window.confirm("Từ chối đề xuất này?")) updateProposalStatus(id, 'Rejected');
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ color: '#111827', marginTop: 0, fontSize: '1.5rem', fontWeight: '600' }}>Quản lý Kỷ luật</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* CỘT 1: DANH MỤC HÌNH THỨC KỶ LUẬT */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
             <h4 style={{ margin: '0 0 16px 0', color: '#b91c1c', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Hình thức xử lý
             </h4>
             <ul style={{ paddingLeft: '0', listStyle: 'none', margin: '0 0 20px 0' }}>
                {disciplineTypes.map((type, idx) => (
                    <li key={idx} style={{ marginBottom: '10px', padding: '10px 12px', background: '#f9fafb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#374151' }}>
                        {type} 
                        <button onClick={() => removeDisciplineType(type)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                            <Icons.Trash size={16} />
                        </button>
                    </li>
                ))}
             </ul>
             <form onSubmit={handleAddType} style={{ display: 'flex', gap: '8px' }}>
                <input 
                    placeholder="Thêm hình thức mới..." 
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                />
                <button type="submit" style={{ background: '#374151', color: 'white', border: 'none', borderRadius: '8px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icons.Plus />
                </button>
             </form>
          </div>

          {/* CỘT 2: DUYỆT ĐỀ XUẤT */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
             <h4 style={{ margin: '0 0 6px 0', color: '#003366', fontSize: '1rem' }}>📋 Duyệt đề xuất kỷ luật</h4>
             <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '16px' }}>Đề xuất từ bộ phận vận hành (Op).</p>
             
             {/* BẢNG CUỘN NGANG TRÊN MOBILE */}
             <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                            <th style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Nhân sự</th>
                            <th style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Lỗi vi phạm</th>
                            <th style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>TT</th>
                            <th style={{ padding: '12px 8px', fontSize: '0.75rem', color: '#6b7280', textAlign: 'right', textTransform: 'uppercase' }}>Xử lý</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>Không có đề xuất nào.</td></tr>
                        ) : (
                            proposals.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px 8px', fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{p.staffName}</td>
                                    <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: '#4b5563' }}>{p.reason}</td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
                                            background: p.status === 'Pending' ? '#fff7ed' : (p.status === 'Approved' ? '#ecfdf5' : '#fef2f2'),
                                            color: p.status === 'Pending' ? '#c2410c' : (p.status === 'Approved' ? '#047857' : '#b91c1c')
                                        }}>
                                            {p.status === 'Pending' ? 'Chờ' : (p.status === 'Approved' ? 'Duyệt' : 'Hủy')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                        {p.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleApprove(p.id)} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                    <Icons.Check />
                                                </button>
                                                <button onClick={() => handleReject(p.id)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                    <Icons.XMark />
                                                </button>
                                            </div>
                                        )}
                                        {p.status !== 'Pending' && (
                                            <button onClick={() => deleteProposal(p.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                                                <Icons.Trash size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                 </table>
             </div>
          </div>

      </div>
    </div>
  );
};

export default DisciplineManager;