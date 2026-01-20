import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const TaskManager = () => {
  const { staffList, tasks, addTask } = useData();
  const [taskTitle, setTaskTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dates, setDates] = useState({ startDate: '', deadline: '' });
  const [discipline, setDiscipline] = useState(''); // State lưu hình thức kỷ luật

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!assigneeId) return alert("Vui lòng chọn nhân sự!");
    if (!dates.startDate || !dates.deadline) return alert("Vui lòng chọn đầy đủ ngày tháng!");
    if (!discipline) return alert("Vui lòng nhập hình thức kỷ luật!");

    addTask({ 
      title: taskTitle, 
      assigneeId: parseInt(assigneeId),
      startDate: dates.startDate,
      deadline: dates.deadline,
      discipline: discipline // Lưu vào dữ liệu task
    });

    // Reset form
    setTaskTitle('');
    setDates({ startDate: '', deadline: '' });
    setDiscipline('');
    alert("Đã giao việc thành công");
  };

  return (
    <div>
      <h2>Giao đầu việc & Thiết lập kỷ luật</h2>
      <form onSubmit={handleCreateTask} style={{ marginBottom: '30px', padding: '20px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <input 
              placeholder="Tên đầu việc (Ví dụ: Thiết kế Banner)" 
              value={taskTitle} 
              onChange={e => setTaskTitle(e.target.value)} 
              required 
              style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <select 
              value={assigneeId} 
              onChange={e => setAssigneeId(e.target.value)} 
              required 
              style={{ padding: '10px', width: '250px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">-- Chọn nhân sự --</option>
              {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ngày bắt đầu:</label>
                <input type="date" value={dates.startDate} onChange={e => setDates({...dates, startDate: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Deadline (Hạn chót):</label>
                <input type="date" value={dates.deadline} onChange={e => setDates({...dates, deadline: e.target.value})} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          </div>

          <div>
             <label style={{ display: 'block', marginBottom: '5px', color: '#d32f2f', fontWeight: 'bold' }}>⚠️ Hình thức kỷ luật nếu vi phạm:</label>
             <input 
                placeholder="Nhập hình thức kỷ luật (Ví dụ: Trừ 10% KPI, Cảnh cáo toàn công ty...)" 
                value={discipline} 
                onChange={e => setDiscipline(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ffcccc', background: '#fff5f5', borderRadius: '4px', color: '#d32f2f' }}
             />
          </div>

          <button 
            type="submit" 
            style={{ background: '#003366', color: 'white', border: 'none', padding: '12px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '1rem' }}
          >
            KHỞI TẠO CÔNG VIỆC
          </button>
        </div>
      </form>

      <h3>Danh sách công việc đang theo dõi</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(t => {
          const staff = staffList.find(s => s.id === t.assigneeId);
          return (
            <li key={t.id} style={{ padding: '15px', borderBottom: '1px solid #eee', background: 'white', marginBottom: '10px', borderRadius: '5px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#003366' }}>{t.title}</div>
              <div style={{ margin: '5px 0' }}>Nhân sự: <strong>{staff?.name}</strong> | Tiến độ: <strong>{t.progress}%</strong></div>
              <div style={{ fontSize: '0.9rem', color: '#555' }}>📅 {t.startDate} ➝ {t.deadline}</div>
              <div style={{ color: '#d32f2f', fontSize: '0.9rem', marginTop: '5px', fontWeight: '500' }}>❌ Kỷ luật: {t.discipline}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TaskManager;