import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// --- BỘ ICON MINIMALIST (#003366) ---
const Icons = {
  InProgress: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  Upcoming: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Completed: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

// --- COMPONENT CON: TASK CARD (TÁCH RA ĐỂ GIỮ FOCUS) ---
const TaskCard = ({ task, isCompletedMode, onUpdate, onFinish }) => {
    // Local state để quản lý input nhập liệu
    const [progressInput, setProgressInput] = useState(task.progress || 0);
    const [reasonInput, setReasonInput] = useState(task.reason || '');

    const now = new Date();
    const deadline = new Date(task.endTime);
    const isOverdue = now > deadline && !isCompletedMode;
    const isUrgent = !isOverdue && !isCompletedMode && (deadline - now) < 86400000; 

    // Hàm xử lý cập nhật (gọi hàm từ cha)
    const handleUpdate = () => {
        onUpdate(task, progressInput, reasonInput);
    };

    return (
        <div style={{ 
            border: isOverdue ? '2px solid #ef4444' : (isUrgent ? '2px solid #f97316' : '1px solid #e5e7eb'),
            padding: '20px', borderRadius: '12px', background: 'white', marginBottom: '15px',
            opacity: isCompletedMode ? 0.8 : 1, position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <h3 style={{margin:0, color: '#003366', fontSize: '1.1rem'}}>{task.title}</h3>
                <div style={{display:'flex', gap:'5px', flexWrap:'wrap', justifyContent:'flex-end'}}>
                    {isCompletedMode && <span style={{background:'#059669', color:'white', padding:'4px 8px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:'600'}}>ĐÃ HOÀN THÀNH</span>}
                    {isUrgent && <span style={{background:'#f97316', color:'white', padding:'4px 8px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:'600'}}>GẤP</span>}
                    {isOverdue && <span style={{background:'#ef4444', color:'white', padding:'4px 8px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:'600'}}>QUÁ HẠN</span>}
                </div>
            </div>
            
            {isOverdue && <div style={{color: '#b91c1c', fontWeight: '500', fontSize:'0.85rem', marginTop: '10px', background:'#fef2f2', padding:'8px', borderRadius:'6px'}}>KỶ LUẬT: {task.disciplineName || 'Chưa quy định'}</div>}

            <div style={{fontSize:'0.9rem', color:'#4b5563', marginTop: '10px', lineHeight: '1.5'}}>
                <div><strong>Bắt đầu:</strong> {new Date(task.startTime).toLocaleString()}</div>
                <div><strong>Hạn chót:</strong> {new Date(task.endTime).toLocaleString()}</div>
                <div style={{marginTop: '4px'}}><strong>Vai trò:</strong> {task.assignedRole} &bull; <strong>Thù lao:</strong> {task.paymentType}</div>
            </div>
            <p style={{fontSize: '0.9rem', color:'#6b7280', background:'#f9fafb', padding:'10px', borderRadius:'8px', fontStyle:'italic', border: '1px solid #f3f4f6'}}>{task.description}</p>

            <hr style={{margin:'15px 0', border: 'none', borderTop:'1px solid #f3f4f6'}}/>
            
            <label style={{fontSize: '0.9rem', fontWeight: '600', color: '#374151'}}>Tiến độ: {progressInput}%</label>
            <input 
                type="range" min="0" max="100" 
                value={progressInput} 
                onChange={(e) => setProgressInput(Number(e.target.value))}
                disabled={isCompletedMode}
                style={{width:'100%', opacity: isCompletedMode ? 0.6 : 1, margin: '10px 0', accentColor: '#003366'}} 
            />
            
            {!isCompletedMode && (
                <>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center', background:'#f9fafb', padding:'10px', borderRadius:'8px', border: '1px solid #e5e7eb'}}>
                        <span style={{fontSize:'0.85rem', color: '#374151'}}>Cập nhật %:</span>
                        <input 
                            type="number" min="0" max="100" 
                            value={progressInput}
                            onChange={(e) => setProgressInput(Number(e.target.value))}
                            style={{padding:'6px', width: '60px', fontWeight: '600', border:'1px solid #d1d5db', borderRadius:'6px', outline: 'none', textAlign: 'center'}}
                        />
                    </div>

                    {(progressInput < 90) && (
                        <div style={{marginTop:'10px'}}>
                            <div style={{color:'#f59e0b', fontSize:'0.8rem', marginBottom:'4px', fontWeight: '500'}}>* Yêu cầu lý do (Tiến độ &lt; 90%)</div>
                            <textarea 
                                placeholder="Nhập lý do..."
                                value={reasonInput}
                                onChange={(e) => setReasonInput(e.target.value)}
                                style={{width:'100%', height:'60px', borderColor: '#fcd34d', padding:'10px', boxSizing:'border-box', borderRadius:'6px', fontSize: '0.9rem', outline: 'none'}}
                            />
                        </div>
                    )}

                    <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                        <button onClick={handleUpdate} style={{flex:1, background:'#003366', color:'white', padding:'10px', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600', fontSize: '0.9rem', transition: '0.2s'}}>
                            Cập nhật
                        </button>
                        <button onClick={() => onFinish(task)} style={{flex:1, background:'#059669', color:'white', padding:'10px', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600', fontSize: '0.9rem', transition: '0.2s'}}>
                            Kết thúc
                        </button>
                    </div>
                </>
            )}
            
            {isCompletedMode && task.finishedAt && (
                <div style={{marginTop:'10px', fontSize:'0.85rem', color:'#059669', fontWeight:'600', textAlign:'center', background: '#ecfdf5', padding: '8px', borderRadius: '6px'}}>
                    Hoàn thành: {new Date(task.finishedAt).toLocaleString()}
                </div>
            )}
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const MyTasks = () => {
  const { user } = useAuth();
  const { tasks, updateTaskProgress, finishTask } = useData();
  
  // --- LỌC TASK ---
  const opAdminTasks = tasks.filter(t => t.assigneeId === user.id && !t.fromScheduleId);
  const now = new Date();
  
  const categorizedTasks = { inProgress: [], upcoming: [], completed: [] };

  opAdminTasks.forEach(task => {
    const start = new Date(task.startTime);
    if (task.status === 'completed') {
      categorizedTasks.completed.push(task);
    } else if (now < start) {
      categorizedTasks.upcoming.push(task);
    } else {
      categorizedTasks.inProgress.push(task);
    }
  });

  categorizedTasks.inProgress.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

  // --- HANDLERS ---
  const handleUpdateClick = (task, newProg, reason) => {
      if (newProg < 90 && !reason.trim()) {
          alert("CẢNH BÁO: Tiến độ dưới 90% bắt buộc phải nhập lý do giải trình!");
          return;
      }
      updateTaskProgress(task.id, newProg, reason);
      alert("Cập nhật tiến độ thành công!");
  };

  const handleFinishClick = (task) => {
    if(window.confirm(`Xác nhận hoàn thành nhiệm vụ "${task.title}"?`)){
      finishTask(task.id);
    }
  };

  return (
    <div style={{paddingBottom: '20px'}}>
      <h2 style={{ color: '#003366', fontSize: '1.5rem', fontWeight: '700', marginBottom: '25px' }}>Nhiệm vụ của tôi</h2>
      <p style={{fontSize:'0.9rem', color:'#6b7280', marginBottom:'20px'}}>Danh sách các nhiệm vụ được giao bởi Operational Admin.</p>
      
      {/* 1. ĐANG DIỄN RA */}
      <div style={{marginBottom: '35px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px'}}>
             <Icons.InProgress />
             <h3 style={{color:'#003366', margin: 0, fontSize: '1.1rem', fontWeight: '600'}}>Đang diễn ra ({categorizedTasks.inProgress.length})</h3>
          </div>
          <div>
              {categorizedTasks.inProgress.length === 0 ? <p style={{color:'#9ca3af', fontStyle:'italic'}}>Không có nhiệm vụ.</p> : 
                categorizedTasks.inProgress.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onUpdate={handleUpdateClick}
                        onFinish={handleFinishClick}
                    />
                ))
              }
          </div>
      </div>

      {/* 2. SẮP ĐẾN */}
      <div style={{marginBottom: '35px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px'}}>
             <Icons.Upcoming />
             <h3 style={{color:'#003366', margin: 0, fontSize: '1.1rem', fontWeight: '600'}}>Sắp đến ({categorizedTasks.upcoming.length})</h3>
          </div>
          <div>
              {categorizedTasks.upcoming.length === 0 ? <p style={{color:'#9ca3af', fontStyle:'italic'}}>Không có nhiệm vụ.</p> : 
                categorizedTasks.upcoming.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onUpdate={handleUpdateClick}
                        onFinish={handleFinishClick}
                    />
                ))
              }
          </div>
      </div>

      {/* 3. ĐÃ HOÀN THÀNH */}
      <div style={{marginBottom: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px'}}>
             <Icons.Completed />
             <h3 style={{color:'#003366', margin: 0, fontSize: '1.1rem', fontWeight: '600'}}>Đã hoàn thành ({categorizedTasks.completed.length})</h3>
          </div>
          <div>
              {categorizedTasks.completed.length === 0 ? <p style={{color:'#9ca3af', fontStyle:'italic'}}>Chưa có dữ liệu.</p> : 
                categorizedTasks.completed.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        isCompletedMode={true} 
                    />
                ))
              }
          </div>
      </div>
    </div>
  );
};

export default MyTasks;