import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const MyTasks = () => {
  const { user } = useAuth();
  const { tasks, updateTaskProgress } = useData();
  const [tempReasons, setTempReasons] = useState({});

  // Lọc task của user hiện tại
  const myTasks = tasks.filter(t => t.assigneeId === user.id);

  // PHÂN LOẠI TASK CHO BẢNG TỔNG HỢP
  const categorizedTasks = {
    // Hoàn thành: progress = 100%
    completed: myTasks.filter(t => t.progress === 100),
    
    // Đang diễn ra: chưa xong (progress < 100) VÀ đã đến ngày bắt đầu (startDate <= now)
    inProgress: myTasks.filter(t => {
      const start = new Date(t.startDate);
      const now = new Date();
      // Reset giờ để so sánh ngày chính xác
      start.setHours(0,0,0,0);
      now.setHours(0,0,0,0);
      return t.progress < 100 && start <= now;
    }),

    // Sắp đến: chưa xong (progress < 100) VÀ chưa đến ngày bắt đầu (startDate > now)
    upcoming: myTasks.filter(t => {
      const start = new Date(t.startDate);
      const now = new Date();
      start.setHours(0,0,0,0);
      now.setHours(0,0,0,0);
      return t.progress < 100 && start > now;
    }),
  };

  const handleConfirmUpdate = (taskId, currentProgress) => {
    const reason = tempReasons[taskId] || '';
    if (currentProgress < 90 && !reason.trim()) {
      alert("Thông báo: Bạn bắt buộc phải nhập lý do giải thích khi mức độ hoàn thành dưới 90%!");
      return;
    }
    updateTaskProgress(taskId, currentProgress, reason);
    alert("Cập nhật tiến độ thành công!");
  };

  return (
    <div>
      {/* 1. MẢNG TỔNG HỢP TASK PERFORMANCE */}
      <h2 style={{ color: '#003366', marginTop: 0 }}>Tổng quan hiệu suất công việc</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        
        {/* Thẻ: Đã hoàn thành */}
        <div style={{ flex: 1, background: '#f6ffed', border: '1px solid #b7eb8f', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, color: '#52c41a', fontSize: '3rem' }}>{categorizedTasks.completed.length}</h2>
          <span style={{ fontWeight: 'bold', color: '#555', fontSize: '1.1rem' }}>Đã hoàn thành</span>
        </div>

        {/* Thẻ: Đang diễn ra */}
        <div style={{ flex: 1, background: '#e6f7ff', border: '1px solid #91d5ff', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, color: '#1890ff', fontSize: '3rem' }}>{categorizedTasks.inProgress.length}</h2>
          <span style={{ fontWeight: 'bold', color: '#555', fontSize: '1.1rem' }}>Đang diễn ra</span>
        </div>

        {/* Thẻ: Sắp đến */}
        <div style={{ flex: 1, background: '#fff7e6', border: '1px solid #ffd591', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, color: '#fa8c16', fontSize: '3rem' }}>{categorizedTasks.upcoming.length}</h2>
          <span style={{ fontWeight: 'bold', color: '#555', fontSize: '1.1rem' }}>Sắp đến</span>
        </div>
      </div>

      <h2 style={{ borderBottom: '2px solid #003366', paddingBottom: '10px', display: 'inline-block', marginBottom: '20px', color: '#003366' }}>
        Danh sách công việc chi tiết
      </h2>

      {myTasks.length === 0 ? <p>Hiện chưa có công việc được giao.</p> : (
        <div style={{ display: 'grid', gap: '25px' }}>
          {myTasks.map(task => {
            const today = new Date();
            today.setHours(0,0,0,0);
            const deadlineDate = new Date(task.deadline);
            const isOverdue = today > deadlineDate && task.progress < 100;

            return (
              <div key={task.id} style={{ 
                border: isOverdue ? '2px solid #ff4d4f' : '1px solid #ccc', 
                padding: '20px', 
                borderRadius: '8px', 
                background: 'white', 
                position: 'relative',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                
                {/* Cảnh báo Kỷ luật */}
                {isOverdue && (
                  <div style={{ 
                    background: '#fff1f0', 
                    border: '1px solid #ffccc7', 
                    color: '#cf1322', 
                    padding: '10px', 
                    borderRadius: '5px', 
                    marginBottom: '15px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    ⚠️ QUÁ HẠN - KỶ LUẬT: {task.discipline ? task.discipline.toUpperCase() : 'ĐANG CẬP NHẬT'}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ marginTop: 0, color: '#003366' }}>{task.title}</h3>
                    <span style={{ 
                        background: task.progress === 100 ? '#f6ffed' : '#e6f7ff', 
                        color: task.progress === 100 ? '#52c41a' : '#1890ff',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        border: '1px solid'
                    }}>
                        {task.progress === 100 ? 'Đã hoàn thành' : 'Đang thực hiện'}
                    </span>
                </div>

                <p style={{ color: '#555' }}>
                  <strong>Thời gian:</strong> {task.startDate} <span style={{ margin: '0 5px' }}>➝</span> 
                  <strong style={{ color: isOverdue ? 'red' : 'black' }}>{task.deadline}</strong>
                </p>
                
                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />

                <label>Mức độ hoàn thành: <strong>{task.progress}%</strong></label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={task.progress} 
                  onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value), task.reason)}
                  style={{ width: '100%', marginTop: '10px', accentColor: '#003366' }}
                  disabled={task.progress === 100} 
                />

                {task.progress < 90 && task.progress !== 100 && (
                  <div style={{ marginTop: '15px' }}>
                    <p style={{ color: '#fa8c16', fontSize: '0.9rem', marginBottom: '5px', fontStyle: 'italic' }}>
                      * Bạn cần nhập lý do vì tiến độ dưới 90%
                    </p>
                    <textarea
                      placeholder="Nhập lý do chậm trễ tại đây..."
                      value={tempReasons[task.id] !== undefined ? tempReasons[task.id] : task.reason}
                      onChange={(e) => setTempReasons({ ...tempReasons, [task.id]: e.target.value })}
                      style={{ width: '100%', height: '60px', padding: '10px', borderRadius: '4px', borderColor: '#fa8c16' }}
                    />
                  </div>
                )}

                <button 
                  onClick={() => handleConfirmUpdate(task.id, task.progress)}
                  style={{ 
                    marginTop: '15px', 
                    padding: '10px 25px', 
                    background: '#003366', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  Cập nhật tiến độ
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasks;