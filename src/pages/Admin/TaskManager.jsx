import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const TaskManager = () => {
  const { user } = useAuth();
  const { staffList, tasks, addTask, updateTask, deleteTask, disciplineTypes } = useData();
  
  // Quyền: Op hoặc Chief
  const isAuthorized = ['op', 'chief'].includes(user?.role);

  const [form, setForm] = useState({ 
    title: '', desc: '', assigneeId: '', deadline: '', 
    repeat: 'none', disciplineType: '' 
  });

  const [filter, setFilter] = useState('all');

  if (!isAuthorized) return <div style={{padding:'20px'}}>Bạn không có quyền Điều phối (Operational).</div>;

  const handleAssign = (e) => {
    e.preventDefault();
    if (!form.assigneeId || !form.title) return alert("Vui lòng nhập đủ thông tin!");
    
    // Tìm thông tin người được giao
    const assignee = staffList.find(s => s.id === form.assigneeId);
    
    addTask({
      ...form,
      assigneeName: assignee ? assignee.name : 'Unknown',
      assignerId: user.id,
      assignerName: user.name,
      createdAt: new Date().toISOString()
    });
    setForm({ title: '', desc: '', assigneeId: '', deadline: '', repeat: 'none', disciplineType: '' });
    alert("Đã giao việc thành công!");
  };

  const handleCover = (task) => {
    const newAssigneeId = prompt("Nhập ID hoặc chọn nhân sự mới để cover (Nhập ID từ danh sách bên dưới):");
    if (!newAssigneeId) return;
    const newStaff = staffList.find(s => s.id === newAssigneeId); // Đơn giản hóa, thực tế nên dùng Select Modal
    if (newStaff) {
        updateTask(task.id, { assigneeId: newStaff.id, assigneeName: newStaff.name, note: `Covered from previous assignee.` });
        alert(`Đã chuyển việc cho ${newStaff.name}`);
    } else {
        alert("Không tìm thấy nhân sự!");
    }
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #003366', paddingBottom: '10px' }}>Điều phối & Giao việc (Operational)</h2>
      
      {/* FORM GIAO VIỆC */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
         <h4 style={{ margin: '0 0 15px 0', color: '#003366' }}>+ Giao nhiệm vụ mới</h4>
         <form onSubmit={handleAssign} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input placeholder="Tên công việc" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} style={styles.input} required />
            <select value={form.assigneeId} onChange={e=>setForm({...form, assigneeId: e.target.value})} style={styles.input} required>
                <option value="">-- Chọn nhân sự thực hiện --</option>
                {staffList.filter(s => s.status === 'active').map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
            </select>
            
            <input placeholder="Mô tả chi tiết" value={form.desc} onChange={e=>setForm({...form, desc: e.target.value})} style={{...styles.input, gridColumn: '1 / -1'}} />
            
            <div style={{display:'flex', flexDirection:'column'}}>
                <label style={styles.label}>Thời hạn / Khung giờ:</label>
                <input type="datetime-local" value={form.deadline} onChange={e=>setForm({...form, deadline: e.target.value})} style={styles.input} />
            </div>

            <div style={{display:'flex', flexDirection:'column'}}>
                <label style={styles.label}>Lặp lại:</label>
                <select value={form.repeat} onChange={e=>setForm({...form, repeat: e.target.value})} style={styles.input}>
                    <option value="none">Không lặp lại</option>
                    <option value="daily">Hàng ngày</option>
                    <option value="weekly">Hàng tuần</option>
                    <option value="monthly">Hàng tháng</option>
                </select>
            </div>

            <div style={{display:'flex', flexDirection:'column', gridColumn: '1 / -1'}}>
                <label style={styles.label}>Hình thức kỷ luật nếu vi phạm (Chọn từ danh sách ban hành):</label>
                <select value={form.disciplineType} onChange={e=>setForm({...form, disciplineType: e.target.value})} style={{...styles.input, borderColor: '#d32f2f'}}>
                    <option value="">-- Chọn hình thức kỷ luật --</option>
                    {disciplineTypes.map((type, idx) => <option key={idx} value={type}>{type}</option>)}
                </select>
            </div>

            <button type="submit" style={{...styles.btn, gridColumn: '1 / -1', marginTop: '10px'}}>Giao việc</button>
         </form>
      </div>

      {/* DANH SÁCH CÔNG VIỆC */}
      <h4 style={{color: '#666'}}>Danh sách công việc đang quản lý</h4>
      <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
         <button onClick={()=>setFilter('all')} style={filter==='all'?styles.activeFilter:styles.filter}>Tất cả</button>
         <button onClick={()=>setFilter('assigned')} style={filter==='assigned'?styles.activeFilter:styles.filter}>Đang thực hiện</button>
      </div>

      <div style={{display:'grid', gap:'15px'}}>
        {tasks.filter(t => filter === 'all' || t.status === filter).map(task => (
            <div key={task.id} style={{background:'white', padding:'15px', borderRadius:'8px', borderLeft: '4px solid #003366', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <strong style={{fontSize:'1.1rem'}}>{task.title}</strong>
                    <span style={{fontSize:'0.8rem', background:'#e6f7ff', padding:'3px 8px', borderRadius:'10px', color:'#003366'}}>{task.repeat !== 'none' ? `🔁 ${task.repeat}` : 'Một lần'}</span>
                </div>
                <div style={{fontSize:'0.9rem', color:'#555', margin:'5px 0'}}>Assignee: <strong>{task.assigneeName}</strong> | Deadline: {task.deadline ? new Date(task.deadline).toLocaleString() : 'N/A'}</div>
                {task.disciplineType && <div style={{fontSize:'0.85rem', color:'#d32f2f'}}>⚠ Kỷ luật: {task.disciplineType}</div>}
                
                <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                    <button onClick={() => handleCover(task)} style={{...styles.smBtn, background:'#ff9800'}}>🔄 Chuyển người (Cover)</button>
                    <button onClick={() => {if(window.confirm('Xóa?')) deleteTask(task.id)}} style={{...styles.smBtn, background:'#f44336'}}>Xóa</button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
    input: { padding: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    label: { fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px', color:'#666' },
    btn: { background: '#003366', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    smBtn: { color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
    filter: { background:'transparent', border:'1px solid #ddd', padding:'5px 15px', borderRadius:'20px', cursor:'pointer' },
    activeFilter: { background:'#003366', color:'white', border:'1px solid #003366', padding:'5px 15px', borderRadius:'20px', cursor:'pointer' }
};

export default TaskManager;