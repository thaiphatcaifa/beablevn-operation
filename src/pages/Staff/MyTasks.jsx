import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// --- BỘ ICON MINIMALIST ĐỒNG BỘ ---
const Icons = {
  InProgress: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  Upcoming: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Completed: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
};

// --- COMPONENT CON: TASK CARD HIỆN ĐẠI ---
const TaskCard = ({ task, isCompletedMode, onUpdate, onFinish }) => {
    const [progressInput, setProgressInput] = useState(task.progress || 0);
    const [reasonInput, setReasonInput] = useState(task.reason || '');

    const now = new Date();
    const deadline = new Date(task.endTime);
    const isOverdue = now > deadline && !isCompletedMode;
    const isUrgent = !isOverdue && !isCompletedMode && (deadline - now) < 86400000; 

    const handleUpdate = () => {
        onUpdate(task, progressInput, reasonInput);
    };

    return (
        <div className="task-card" style={{ 
            border: isOverdue ? '1px solid #fecaca' : (isUrgent ? '1px solid #fed7aa' : '1px solid #e2e8f0'),
            padding: '24px', 
            borderRadius: '20px', 
            background: '#ffffff', 
            opacity: isCompletedMode ? 0.85 : 1, 
            position: 'relative', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)',
            display: 'flex',             
            flexDirection: 'column',     
            height: '100%',              
            boxSizing: 'border-box'
        }}>
            
            <div style={{ flex: 1 }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: '12px'}}>
                    <h3 style={{margin:0, color: '#111827', fontSize: '1.15rem', fontWeight: '800', lineHeight: '1.4', letterSpacing: '-0.01em', wordBreak: 'break-word'}}>{task.title}</h3>
                    <div style={{display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'flex-end'}}>
                        {isCompletedMode && <span style={{background:'#ecfdf5', color:'#059669', padding:'4px 12px', borderRadius:'8px', fontSize:'0.75rem', fontWeight:'800', border: '1px solid #a7f3d0', whiteSpace: 'nowrap'}}>ĐÃ HOÀN THÀNH</span>}
                        {isUrgent && <span style={{background:'#fff7ed', color:'#ea580c', padding:'4px 12px', borderRadius:'8px', fontSize:'0.75rem', fontWeight:'800', border: '1px solid #fed7aa', whiteSpace: 'nowrap'}}>GẤP</span>}
                        {isOverdue && <span style={{background:'#fef2f2', color:'#dc2626', padding:'4px 12px', borderRadius:'8px', fontSize:'0.75rem', fontWeight:'800', border: '1px solid #fecaca', whiteSpace: 'nowrap'}}>QUÁ HẠN</span>}
                    </div>
                </div>
                
                {isOverdue && (
                    <div style={{color: '#b91c1c', fontWeight: '700', fontSize:'0.85rem', marginTop: '16px', background:'#fef2f2', padding:'12px 16px', borderRadius:'10px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fecaca', flexWrap: 'wrap'}}>
                        <Icons.Alert /> KỶ LUẬT: {task.disciplineName || 'Chưa quy định'}
                    </div>
                )}

                <div style={{fontSize:'0.9rem', color:'#475569', marginTop: '16px', lineHeight: '1.6'}}>
                    <div><strong style={{color:'#1e293b'}}>Bắt đầu:</strong> {new Date(task.startTime).toLocaleString('vi-VN')}</div>
                    <div><strong style={{color:'#1e293b'}}>Hạn chót:</strong> {new Date(task.endTime).toLocaleString('vi-VN')}</div>
                    <div style={{marginTop: '4px'}}><strong style={{color:'#1e293b'}}>Vai trò:</strong> {task.assignedRole} &bull; <strong style={{color:'#1e293b'}}>Thù lao:</strong> {task.paymentType}</div>
                </div>
                
                {task.description && (
                    <p style={{fontSize: '0.9rem', color:'#64748b', background:'#f8fafc', padding:'16px', borderRadius:'12px', fontStyle:'italic', border: '1px dashed #cbd5e1', marginTop: '16px', lineHeight: '1.5', margin: '16px 0 0 0', wordBreak: 'break-word'}}>
                        {task.description}
                    </p>
                )}
            </div>

            <div style={{ marginTop: 'auto' }}>
                <hr style={{margin:'24px 0', border: 'none', borderTop:'1px solid #e2e8f0'}}/>
                
                <label style={{fontSize: '0.95rem', fontWeight: '800', color: '#111827', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap'}}>
                    Tiến độ công việc: 
                    <span style={{color: '#003366'}}>{progressInput}%</span>
                </label>
                
                <input 
                    type="range" min="0" max="100" 
                    value={progressInput} 
                    onChange={(e) => setProgressInput(Number(e.target.value))}
                    disabled={isCompletedMode}
                    style={{width:'100%', opacity: isCompletedMode ? 0.6 : 1, margin: '16px 0 24px 0', accentColor: '#003366', cursor: isCompletedMode ? 'not-allowed' : 'pointer'}} 
                />
                
                {!isCompletedMode && (
                    <div style={{background:'#f8fafc', padding:'20px', borderRadius:'16px', border: '1px solid #f1f5f9'}}>
                        <div style={{display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap'}}>
                            <span style={{fontSize:'0.9rem', color: '#475569', fontWeight: '700'}}>Nhập mức %:</span>
                            <input 
                                className="input-modern"
                                type="number" min="0" max="100" 
                                value={progressInput}
                                onChange={(e) => setProgressInput(Number(e.target.value))}
                                style={{padding:'10px', width: '80px', fontWeight: '800', textAlign: 'center', fontSize: '1rem', marginTop: 0}}
                            />
                        </div>

                        {(progressInput < 90) && (
                            <div style={{marginTop:'16px'}}>
                                <div style={{color:'#d97706', fontSize:'0.85rem', marginBottom:'8px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap'}}>
                                    <span>*</span> Bắt buộc nhập lý do giải trình (Tiến độ &lt; 90%)
                                </div>
                                <textarea 
                                    className="input-modern"
                                    placeholder="Nhập lý do thực tế..."
                                    value={reasonInput}
                                    onChange={(e) => setReasonInput(e.target.value)}
                                    style={{width:'100%', height:'80px', border: '1px solid #fcd34d', background: '#fffbeb', resize: 'vertical', marginTop: 0}}
                                />
                            </div>
                        )}

                        <div style={{display:'flex', gap:'12px', marginTop:'24px', flexWrap: 'wrap'}}>
                            <button className="btn-modern-primary" onClick={handleUpdate} style={{flex:1, background:'#003366', color:'white', padding:'14px', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(0, 51, 102, 0.2)', minWidth: '100px', boxSizing: 'border-box'}}>
                                Lưu cập nhật
                            </button>
                            <button className="btn-modern-success" onClick={() => onFinish(task)} style={{flex:1, background:'#10b981', color:'white', padding:'14px', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)', minWidth: '100px', boxSizing: 'border-box'}}>
                                Kết thúc ngay
                            </button>
                        </div>
                    </div>
                )}
                
                {isCompletedMode && task.finishedAt && (
                    <div style={{marginTop:'16px', fontSize:'0.85rem', color:'#059669', fontWeight:'700', textAlign:'center', background: '#ecfdf5', padding: '12px', borderRadius: '10px', border: '1px solid #a7f3d0'}}>
                        Hoàn thành lúc: {new Date(task.finishedAt).toLocaleString('vi-VN')}
                    </div>
                )}
            </div>
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
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
      {/* CSS CHO HOVER EFFECTS & INPUTS */}
      <style>{`
          .task-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
          .task-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1) !important; }
          
          .input-modern { padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem; background: white; transition: all 0.2s; box-sizing: border-box; }
          .input-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
          
          .btn-modern-primary { transition: all 0.2s; }
          .btn-modern-primary:hover { background: #002244 !important; transform: translateY(-1px); }
          
          .btn-modern-success { transition: all 0.2s; }
          .btn-modern-success:hover { background: #059669 !important; transform: translateY(-1px); }
      `}</style>

      {/* ĐỒNG BỘ MARGIN CỦA HEADER ĐỂ TRÁNH NHẢY TRANG */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
              <Icons.InProgress />
          </div>
          <div>
              <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>NHIỆM VỤ CỦA TÔI</h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Danh sách nhiệm vụ từ Quản trị viên (Op Admin)</span>
          </div>
      </div>
      
      {/* 1. ĐANG DIỄN RA */}
      <div style={{marginBottom: '40px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9'}}>
             <div style={{color: '#003366'}}><Icons.InProgress /></div>
             <h3 style={{color:'#111827', margin: 0, fontSize: '1.15rem', fontWeight: '800'}}>Đang diễn ra <span style={{color: '#64748b', fontSize: '1rem', fontWeight: '600'}}>({categorizedTasks.inProgress.length})</span></h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {categorizedTasks.inProgress.length === 0 ? <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', color:'#94a3b8', fontStyle:'italic', border: '1px dashed #cbd5e1'}}>🎉 Không có nhiệm vụ đang diễn ra.</div> : 
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
      <div style={{marginBottom: '40px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9'}}>
             <div style={{color: '#003366'}}><Icons.Upcoming /></div>
             <h3 style={{color:'#111827', margin: 0, fontSize: '1.15rem', fontWeight: '800'}}>Sắp đến <span style={{color: '#64748b', fontSize: '1rem', fontWeight: '600'}}>({categorizedTasks.upcoming.length})</span></h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {categorizedTasks.upcoming.length === 0 ? <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', color:'#94a3b8', fontStyle:'italic', border: '1px dashed #cbd5e1'}}>Chưa có nhiệm vụ mới sắp tới.</div> : 
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
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9'}}>
             <div style={{color: '#003366'}}><Icons.Completed /></div>
             <h3 style={{color:'#111827', margin: 0, fontSize: '1.15rem', fontWeight: '800'}}>Đã hoàn thành <span style={{color: '#64748b', fontSize: '1rem', fontWeight: '600'}}>({categorizedTasks.completed.length})</span></h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
              {categorizedTasks.completed.length === 0 ? <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px', color:'#94a3b8', fontStyle:'italic', border: '1px dashed #cbd5e1'}}>Chưa có dữ liệu hoàn thành.</div> : 
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