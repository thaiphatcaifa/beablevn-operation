import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const DisciplineManager = () => {
  const { user } = useAuth();
  const { 
    staffList, 
    disciplineTypes, addDisciplineType, removeDisciplineType, 
    proposals, addProposal, updateProposalStatus, deleteProposal 
  } = useData();

  // Phân quyền
  const isChief = user?.role === 'chief';
  const isReg = user?.role === 'reg';
  const isOp = user?.role === 'op';

  // Op: Chỉ đề xuất. Reg/Chief: Toàn quyền.
  const canManageRules = isChief || isReg;
  const canApprove = isChief || isReg;

  const [newType, setNewType] = useState('');
  const [proposalForm, setProposalForm] = useState({ staffId: '', type: '', reason: '' });

  // --- 1. BAN HÀNH QUY ĐỊNH (Reg/Chief) ---
  const handleAddType = () => {
    if (newType) { addDisciplineType(newType); setNewType(''); }
  };

  // --- 2. ĐỀ XUẤT KỶ LUẬT (Op) ---
  const handlePropose = (e) => {
    e.preventDefault();
    if (!proposalForm.staffId || !proposalForm.type) return;
    const targetStaff = staffList.find(s => s.id === proposalForm.staffId);
    
    addProposal({
        ...proposalForm,
        staffName: targetStaff?.name || 'Unknown',
        proposer: user.name,
        roleProposer: user.role,
        date: new Date().toISOString().split('T')[0]
    });
    setProposalForm({ staffId: '', type: '', reason: '' });
    alert("Đã gửi đề xuất kỷ luật!");
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #003366', paddingBottom: '10px' }}>Quản lý Kỷ luật (Regulatory & Op)</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* CỘT TRÁI: DANH MỤC HÌNH THỨC KỶ LUẬT */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#003366' }}>📋 Danh sách Hình thức Kỷ luật</h4>
            <div style={{marginBottom: '10px', fontSize: '0.85rem', color: '#666', fontStyle: 'italic'}}>
                (Do Regulatory Administrator ban hành)
            </div>
            
            <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                {disciplineTypes.map((t, idx) => (
                    <li key={idx} style={{ marginBottom: '5px' }}>
                        {t} 
                        {canManageRules && (
                            <span onClick={() => removeDisciplineType(t)} style={{ marginLeft: '10px', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>[x]</span>
                        )}
                    </li>
                ))}
            </ul>

            {canManageRules && (
                <div style={{ display: 'flex', gap: '5px' }}>
                    <input value={newType} onChange={e => setNewType(e.target.value)} placeholder="Nhập hình thức mới..." style={{ flex: 1, padding: '5px' }} />
                    <button onClick={handleAddType} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Thêm</button>
                </div>
            )}
            {!canManageRules && <div style={{ fontSize: '0.8rem', color: '#999' }}>* Bạn chỉ có quyền xem danh sách này.</div>}
        </div>

        {/* CỘT PHẢI: TẠO ĐỀ XUẤT (Op) */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>⚠ Đề xuất Kỷ luật Nhân sự</h4>
            <form onSubmit={handlePropose} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select value={proposalForm.staffId} onChange={e => setProposalForm({...proposalForm, staffId: e.target.value})} required style={styles.input}>
                    <option value="">-- Chọn nhân sự vi phạm --</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={proposalForm.type} onChange={e => setProposalForm({...proposalForm, type: e.target.value})} required style={styles.input}>
                    <option value="">-- Chọn hình thức --</option>
                    {disciplineTypes.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
                </select>
                <textarea placeholder="Lý do vi phạm..." value={proposalForm.reason} onChange={e => setProposalForm({...proposalForm, reason: e.target.value})} style={styles.input} />
                <button type="submit" style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>Gửi đề xuất</button>
            </form>
        </div>

      </div>

      {/* DANH SÁCH DUYỆT (Reg/Chief) */}
      <div style={{ marginTop: '30px' }}>
         <h3 style={{ color: '#003366' }}>Phê duyệt Đề xuất ({proposals.filter(p => p.status === 'Pending').length} chờ duyệt)</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ background: '#eee', textAlign: 'left' }}>
                <tr>
                    <th style={{ padding: '10px' }}>Nhân sự</th>
                    <th style={{ padding: '10px' }}>Hình thức</th>
                    <th style={{ padding: '10px' }}>Lý do</th>
                    <th style={{ padding: '10px' }}>Người đề xuất</th>
                    <th style={{ padding: '10px' }}>Trạng thái</th>
                    <th style={{ padding: '10px' }}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {proposals.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.staffName}</td>
                        <td style={{ padding: '10px', color: '#d32f2f' }}>{p.type}</td>
                        <td style={{ padding: '10px' }}>{p.reason}</td>
                        <td style={{ padding: '10px' }}><small>{p.proposer} ({p.roleProposer})</small></td>
                        <td style={{ padding: '10px' }}>
                            <span style={{ 
                                padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'white',
                                background: p.status === 'Pending' ? '#ff9800' : p.status === 'Approved' ? '#28a745' : '#999' 
                            }}>{p.status}</span>
                        </td>
                        <td style={{ padding: '10px' }}>
                            {p.status === 'Pending' && canApprove && (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={() => updateProposalStatus(p.id, 'Approved')} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px', borderRadius: '3px', cursor: 'pointer' }}>✔</button>
                                    <button onClick={() => updateProposalStatus(p.id, 'Rejected')} style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '5px', borderRadius: '3px', cursor: 'pointer' }}>✘</button>
                                </div>
                            )}
                            {(!canApprove && p.status === 'Pending') && <small style={{color:'#999'}}>Chờ duyệt</small>}
                            {isChief && <button onClick={() => deleteProposal(p.id)} style={{marginLeft: '10px', background: 'transparent', border: 'none', color: '#999', cursor: 'pointer'}}>🗑</button>}
                        </td>
                    </tr>
                ))}
                {proposals.length === 0 && <tr><td colSpan="6" style={{padding:'20px', textAlign:'center', color:'#999'}}>Chưa có đề xuất nào</td></tr>}
            </tbody>
         </table>
      </div>
    </div>
  );
};

const styles = {
    input: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }
};

export default DisciplineManager;