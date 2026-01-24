import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const TaskManager = () => {
  const { tasks, addTask, deleteTask, staffList, disciplineTypes } = useData();
  
  const activeDisciplines = disciplineTypes.filter(d => d.status === 'Active');

  const [newTask, setNewTask] = useState({ 
      title: '', assigneeId: '', description: '',
      startTime: '', endTime: '', // Time
      assignedRole: 'ST',
      paymentType: 'UBI 1', // UBI 1, UBI 2, Remuneration
      disciplineId: '' // Hình thức kỷ luật
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigneeId || !newTask.endTime) return alert("Vui lòng điền đủ thông tin!");
    
    const staff = staffList.find(s => s.id === newTask.assigneeId);
    const disc = activeDisciplines.find(d => d.id === newTask.disciplineId);

    addTask({ 
        ...newTask, 
        assigneeName: staff ? staff.name : 'Unknown',
        disciplineName: disc ? disc.name : 'Chưa quy định',
        deadline: newTask.endTime // Map vào field deadline cũ để tương thích
    });
    
    setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: 'UBI 1', disciplineId: '' });
    alert("Đã giao việc thành công!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Xóa nhiệm vụ này?")) deleteTask(id);
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ color: '#003366' }}>Quản lý Nhiệm vụ (Op Admin)</h2>

      {/* FORM GIAO VIỆC */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 20px 0' }}>Giao nhiệm vụ & Thiết lập Kỷ luật</h4>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
             <label style={styles.label}>Tiêu đề công việc</label>
             <input value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={styles.input} required />
          </div>

          <div>
             <label style={styles.label}>Người thực hiện</label>
             <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})} style={styles.select} required>
                <option value="">-- Chọn nhân sự --</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
             </select>
          </div>

          <div>
             <label style={styles.label}>Vai trò thực hiện</label>
             <select value={newTask.assignedRole} onChange={e => setNewTask({...newTask, assignedRole: e.target.value})} style={styles.select}>
                {['ST','TT','CCS','CCO','CCA','FFM','FFS','FFA'].map(r => <option key={r} value={r}>{r}</option>)}
             </select>
          </div>

          <div>
             <label style={styles.label}>Bắt đầu (Check-in)</label>
             <input type="datetime-local" value={newTask.startTime} onChange={e => setNewTask({...newTask, startTime: e.target.value})} style={styles.input} required />
          </div>

          <div>
             <label style={styles.label}>Kết thúc (Check-out)</label>
             <input type="datetime-local" value={newTask.endTime} onChange={e => setNewTask({...newTask, endTime: e.target.value})} style={styles.input} required />
          </div>

          <div>
             <label style={styles.label}>Loại chi trả</label>
             <select value={newTask.paymentType} onChange={e => setNewTask({...newTask, paymentType: e.target.value})} style={styles.select}>
                <option value="UBI 1">UBI 1</option>
                <option value="UBI 2">UBI 2</option>
                <option value="Remuneration">Remuneration</option>
             </select>
          </div>

          <div>
             <label style={styles.label}>Kỷ luật (nếu trễ)</label>
             <select value={newTask.disciplineId} onChange={e => setNewTask({...newTask, disciplineId: e.target.value})} style={{...styles.select, borderColor: 'red', color: '#b91c1c'}}>
                <option value="">-- Chọn hình thức (Đã duyệt) --</option>
                {activeDisciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
             </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
             <label style={styles.label}>Mô tả chi tiết</label>
             <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{...styles.input, height: '80px'}} />
          </div>

          <button type="submit" style={styles.btnSubmit}>Giao việc</button>
        </form>
      </div>

      {/* DANH SÁCH NHIỆM VỤ */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '16px' }}>
         <h4>Danh sách đang thực hiện</h4>
         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
               <tr style={{textAlign:'left', borderBottom: '1px solid #eee'}}>
                 <th style={{padding:'10px'}}>Nhiệm vụ</th>
                 <th>Người làm</th>
                 <th>Vai trò</th>
                 <th>Hạn chót</th>
                 <th>Tiến độ</th>
                 <th>Xóa</th>
               </tr>
            </thead>
            <tbody>
               {tasks.map(t => (
                 <tr key={t.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td style={{padding:'10px'}}>
                        <strong>{t.title}</strong><br/>
                        <span style={{fontSize:'0.75rem', color:'#666'}}>{t.paymentType}</span>
                    </td>
                    <td>{t.assigneeName}</td>
                    <td>{t.assignedRole}</td>
                    <td>{new Date(t.endTime).toLocaleString()}</td>
                    <td>{t.progress}%</td>
                    <td><button onClick={()=>handleDelete(t.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Xóa</button></td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

const styles = {
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '5px', background: 'white' },
    label: { fontSize: '0.8rem', fontWeight: 'bold', color: '#555' },
    btnSubmit: { gridColumn: '1 / -1', padding: '12px', background: '#003366', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default TaskManager;