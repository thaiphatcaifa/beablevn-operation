import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

// --- BỘ ICON MINIMALIST ---
const Icons = {
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="18" height="18">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
};

const TaskManager = () => {
  const { tasks, addTask, updateTask, deleteTask, staffList } = useData();
  
  // State cho Form
  const [newTask, setNewTask] = useState({ title: '', assigneeId: '', deadline: '', description: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigneeId) return alert("Vui lòng nhập tiêu đề và chọn người thực hiện.");
    
    // Lấy tên staff từ ID
    const staff = staffList.find(s => s.id === newTask.assigneeId);
    const assigneeName = staff ? staff.name : 'Unknown';

    addTask({ ...newTask, assigneeName });
    setNewTask({ title: '', assigneeId: '', deadline: '', description: '' });
    alert("Đã giao nhiệm vụ mới!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa nhiệm vụ này?")) {
      deleteTask(id);
    }
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ color: '#111827', marginTop: 0, fontSize: '1.5rem', fontWeight: '600' }}>Quản lý Nhiệm vụ</h2>

      {/* FORM GIAO VIỆC - RESPONSIVE & MINIMALIST */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px', border: '1px solid #f3f4f6' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#374151', fontSize: '1rem' }}>Giao nhiệm vụ mới</h4>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ flex: '1 1 300px' }}>
             <label style={{display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '6px', fontWeight: '500'}}>Tiêu đề công việc</label>
             <input 
                placeholder="Ví dụ: Kiểm tra kho..." 
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }}
             />
          </div>

          <div style={{ flex: '1 1 200px' }}>
             <label style={{display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '6px', fontWeight: '500'}}>Người thực hiện</label>
             <select 
                value={newTask.assigneeId}
                onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', background: 'white' }}
             >
                <option value="">-- Chọn nhân sự --</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} - {s.role}</option>)}
             </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
             <label style={{display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '6px', fontWeight: '500'}}>Hạn chót</label>
             <input 
                type="date"
                value={newTask.deadline}
                onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }}
             />
          </div>

          <div style={{ flex: '1 1 100%' }}>
             <textarea 
                placeholder="Mô tả chi tiết công việc..." 
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', minHeight: '80px', outline: 'none', resize: 'vertical' }}
             />
          </div>

          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#003366', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '4px', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Icons.Plus /> Giao việc
          </button>
        </form>
      </div>

      {/* DANH SÁCH NHIỆM VỤ - RESPONSIVE TABLE */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f3f4f6' }}>
        <h4 style={{ margin: '20px', color: '#374151', fontSize: '1rem' }}>Danh sách đang thực hiện ({tasks.length})</h4>
        
        <div style={{ overflowX: 'auto' }}> 
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nhiệm vụ</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Người làm</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hạn chót</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiến độ</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái</th>
                <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                 <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>Chưa có nhiệm vụ nào.</td></tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{task.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{task.description}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', fontSize: '0.9rem' }}>{task.assigneeName}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563', fontSize: '0.9rem' }}>{task.deadline}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ width: '100px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                         <div style={{ width: `${task.progress || 0}%`, height: '100%', background: '#059669' }}></div>
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '6px', color: '#6b7280', fontWeight: '500' }}>{task.progress || 0}%</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                            background: task.status === 'completed' ? '#ecfdf5' : '#fffbeb',
                            color: task.status === 'completed' ? '#047857' : '#b45309',
                            border: task.status === 'completed' ? '1px solid #a7f3d0' : '1px solid #fde68a'
                        }}>
                            {task.status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
                        </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(task.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                            <Icons.Trash />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;