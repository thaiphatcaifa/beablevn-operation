// src/pages/Staff/MyTasks.jsx
import React, { useState } from 'react';

const MyTasks = () => {
  // Giả lập dữ liệu công việc được giao
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Soạn giáo án lớp Tiếng Anh', progress: 30 },
    { id: 2, title: 'Kiểm kê kho sách', progress: 0 },
  ]);

  const handleProgressChange = (id, newProgress) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, progress: newProgress } : t
    ));
  };

  const handleSave = () => {
    alert("Đã cập nhật tiến độ lên hệ thống!");
    // Gọi API để lưu dữ liệu xuống database
  };

  return (
    <div className="task-container">
      <h2>Danh sách đầu việc cần làm</h2>
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{task.title}</h3>
            <label>Tiến độ: {task.progress}%</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={task.progress} 
              onChange={(e) => handleProgressChange(task.id, parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSave} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Lưu báo cáo
      </button>
    </div>
  );
};

export default MyTasks;