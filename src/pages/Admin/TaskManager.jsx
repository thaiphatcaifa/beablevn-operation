import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const TaskManager = () => {
  const { user } = useAuth();
  const { tasks, addTask, deleteTask, staffList, disciplineTypes, schedules, addSchedule, deleteSchedule, updateSchedule } = useData();
  
  const activeDisciplines = disciplineTypes.filter(d => d.status === 'Active');
  
  // --- PHÂN QUYỀN ---
  const isScheduler = user?.role === 'scheduler';
  const isApprover = ['chief', 'reg', 'op'].includes(user?.role);

  // --- STATE ---
  const [newTask, setNewTask] = useState({ 
      title: '', assigneeId: '', description: '',
      startTime: '', endTime: '', 
      assignedRole: 'ST',
      paymentType: 'UBI 1', 
      disciplineId: ''
  });

  const [scheduleConfig, setScheduleConfig] = useState({
      repeatWeeks: 1,
      days: [] 
  });

  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const daysOfWeek = [
      { key: 'Mon', label: 'T2', val: 1 }, { key: 'Tue', label: 'T3', val: 2 }, { key: 'Wed', label: 'T4', val: 3 },
      { key: 'Thu', label: 'T5', val: 4 }, { key: 'Fri', label: 'T6', val: 5 }, { key: 'Sat', label: 'T7', val: 6 },
      { key: 'Sun', label: 'CN', val: 0 }
  ];

  // --- LOGIC FUNCTIONS ---
  const generateTasksFromSchedule = (scheduleData, schedId) => {
    const { startTime, endTime, repeatWeeks, repeatDays } = scheduleData;
    const startObj = new Date(startTime);
    const endObj = new Date(endTime);
    const duration = endObj - startObj;

    const targetDayVals = daysOfWeek.filter(d => repeatDays.includes(d.key)).map(d => d.val);

    for (let w = 0; w < repeatWeeks; w++) {
        for (let d = 0; d < 7; d++) {
            const currentCheckDate = new Date(startObj);
            currentCheckDate.setDate(startObj.getDate() + (w * 7) + d);

            if (targetDayVals.includes(currentCheckDate.getDay())) {
                const taskStart = new Date(currentCheckDate);
                const taskEnd = new Date(taskStart.getTime() + duration);

                const taskPayload = {
                    title: scheduleData.title,
                    assigneeId: scheduleData.assigneeId,
                    assigneeName: scheduleData.assigneeName,
                    description: scheduleData.description,
                    assignedRole: scheduleData.assignedRole,
                    startTime: taskStart.toISOString(),
                    endTime: taskEnd.toISOString(),
                    paymentType: 'Theo lịch', 
                    disciplineId: '', 
                    disciplineName: '',
                    deadline: taskEnd.toISOString(),
                    fromScheduleId: schedId,
                    generatedDate: new Date().toISOString()
                };
                addTask(taskPayload);
            }
        }
    }
  };

  const deleteRelatedTasks = (schedId) => {
      const relatedTasks = tasks.filter(t => t.fromScheduleId === schedId);
      relatedTasks.forEach(t => deleteTask(t.id));
  };

  const handleRequestAdjustmentClick = (sched) => {
      const action = window.prompt("Bạn muốn thực hiện hành động gì?\n- Nhập 'delete' để xin XÓA\n- Nhập 'edit' để xin SỬA");
      if (!action) return;

      if (action.toLowerCase() === 'delete') {
          const reason = window.prompt("Vui lòng nhập lý do muốn xóa (Bắt buộc):");
          if (!reason || reason.trim() === "") return alert("Bắt buộc phải có lý do để xin xóa!");

          updateSchedule(sched.id, {
              request: {
                  type: 'delete',
                  reason: reason,
                  requestedBy: user.username,
                  requestedAt: new Date().toISOString()
              }
          });
          alert("Đã gửi yêu cầu xóa. Vui lòng đợi Admin phê duyệt.");

      } else if (action.toLowerCase() === 'edit') {
          setEditingScheduleId(sched.id);
          setNewTask({
              title: sched.title, assigneeId: sched.assigneeId, description: sched.description,
              startTime: sched.startTime, endTime: sched.endTime, assignedRole: sched.assignedRole,
              paymentType: 'UBI 1', disciplineId: ''
          });
          setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
          window.scrollTo({ top: 0, behavior: 'smooth' });
          alert("Dữ liệu đã được tải lên form. Hãy chỉnh sửa và nhấn nút 'Gửi yêu cầu điều chỉnh'.");
      } else {
          alert("Lệnh không hợp lệ. Vui lòng nhập 'delete' hoặc 'edit'.");
      }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigneeId || !newTask.endTime) return alert("Vui lòng điền đủ thông tin!");
    
    const staff = staffList.find(s => s.id === newTask.assigneeId);
    
    if (isScheduler) {
        if (scheduleConfig.days.length === 0) return alert("Vui lòng chọn ít nhất một ngày trong tuần!");
        
        const scheduleData = {
            ...newTask,
            assigneeName: staff ? staff.name : 'Unknown',
            paymentType: null, disciplineId: null, disciplineName: null,
            repeatWeeks: Number(scheduleConfig.repeatWeeks),
            repeatDays: scheduleConfig.days,
            createdBy: user.username
        };

        if (editingScheduleId) {
            updateSchedule(editingScheduleId, {
                request: {
                    type: 'edit',
                    reason: 'Điều chỉnh thông tin', 
                    draftData: scheduleData, 
                    requestedBy: user.username,
                    requestedAt: new Date().toISOString()
                }
            });
            alert("Đã gửi yêu cầu điều chỉnh. Admin sẽ xem xét và phê duyệt.");
        } else {
            const savedId = addSchedule(scheduleData);
            generateTasksFromSchedule(scheduleData, savedId);
            alert(`Đã lên lịch và tạo tasks cho ${scheduleData.assigneeName}!`);
        }

        setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: 'UBI 1', disciplineId: '' });
        setScheduleConfig({ repeatWeeks: 1, days: [] });
        setEditingScheduleId(null);

    } else {
        const disc = activeDisciplines.find(d => d.id === newTask.disciplineId);
        addTask({ 
            ...newTask, 
            assigneeName: staff ? staff.name : 'Unknown',
            disciplineName: disc ? disc.name : 'Chưa quy định',
            deadline: newTask.endTime
        });
        
        setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: 'UBI 1', disciplineId: '' });
        alert("Đã giao việc thành công!");
    }
  };

  const handleApproveRequest = (sched) => {
      const { request } = sched;
      if (!request) return;

      if (window.confirm(`Xác nhận phê duyệt yêu cầu "${request.type}" của ${request.requestedBy}?`)) {
          deleteRelatedTasks(sched.id);

          if (request.type === 'delete') {
              deleteSchedule(sched.id);
          } else if (request.type === 'edit') {
              const newScheduleData = { ...request.draftData, request: null };
              updateSchedule(sched.id, newScheduleData);
              generateTasksFromSchedule(newScheduleData, sched.id);
          }
      }
  };

  const handleRejectRequest = (sched) => {
      const reason = window.prompt("Lý do từ chối (tùy chọn):");
      if (window.confirm("Từ chối yêu cầu này?")) {
          updateSchedule(sched.id, { request: null, rejectionReason: reason || '' });
      }
  };

  const handleDeleteTask = (id) => { if (window.confirm("Xóa nhiệm vụ này?")) deleteTask(id); };
  
  const handleDayToggle = (dayKey) => {
      setScheduleConfig(prev => {
          const exists = prev.days.includes(dayKey);
          return { ...prev, days: exists ? prev.days.filter(d => d !== dayKey) : [...prev.days, dayKey] };
      });
  };

  const handleEditSchedule = (sched) => {
      setEditingScheduleId(sched.id);
      setNewTask({
          title: sched.title, assigneeId: sched.assigneeId, description: sched.description,
          startTime: sched.startTime, endTime: sched.endTime, assignedRole: sched.assignedRole,
          paymentType: 'UBI 1', disciplineId: ''
      });
      setScheduleConfig({ repeatWeeks: sched.repeatWeeks, days: sched.repeatDays || [] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSchedule = (id) => {
      if(window.confirm("Admin xóa lịch này sẽ xóa cả các tasks liên quan. Tiếp tục?")) {
          deleteRelatedTasks(id);
          deleteSchedule(id);
      }
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ 
          color: '#003366', 
          borderBottom: '2px solid #e5e7eb', 
          paddingBottom: '15px', 
          marginBottom: '20px', 
          fontWeight: 'bold', 
          fontSize: '1.5rem' 
      }}>
          {isScheduler ? 'Lên lịch công tác (Scheduler)' : 'Quản lý Nhiệm vụ (Op Admin)'}
      </h2>

      {/* --- PHẦN 1: DUYỆT YÊU CẦU --- */}
      {isApprover && schedules.some(s => s.request) && (
          <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '16px', border: '1px solid #fed7aa', marginBottom: '24px' }}>
              <h4 style={{ color: '#c2410c', marginTop: 0 }}>⚠️ Yêu cầu điều chỉnh từ Scheduler</h4>
              <div style={{overflowX: 'auto'}}>
                  <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', minWidth: '600px' }}>
                      <thead>
                          <tr style={{ textAlign: 'left', color: '#9a3412' }}>
                              <th>Scheduler</th>
                              <th>Lịch trình</th>
                              <th>Loại yêu cầu</th>
                              <th>Lý do</th>
                              <th>Hành động</th>
                          </tr>
                      </thead>
                      <tbody>
                          {schedules.filter(s => s.request).map(s => (
                              <tr key={s.id} style={{ borderTop: '1px solid #ffedd5' }}>
                                  <td style={{ padding: '8px' }}>{s.request.requestedBy}</td>
                                  <td>{s.title}</td>
                                  <td>
                                      <span style={{ 
                                          padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem',
                                          background: s.request.type === 'delete' ? '#fee2e2' : '#dbeafe',
                                          color: s.request.type === 'delete' ? '#991b1b' : '#1e40af'
                                      }}>
                                          {s.request.type === 'delete' ? 'XIN XÓA' : 'XIN SỬA'}
                                      </span>
                                  </td>
                                  <td>{s.request.reason}</td>
                                  <td>
                                      <button onClick={() => handleApproveRequest(s)} style={{ marginRight: '8px', cursor: 'pointer', background: '#16a34a', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>Duyệt</button>
                                      <button onClick={() => handleRejectRequest(s)} style={{ cursor: 'pointer', background: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>Từ chối</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* --- PHẦN 2: FORM NHẬP LIỆU (RESPONSIVE GRID) --- */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 20px 0' }}>
            {isScheduler ? (editingScheduleId ? 'Đang soạn yêu cầu điều chỉnh' : 'Lên lịch công tác mới') : 'Giao nhiệm vụ & Thiết lập Kỷ luật'}
        </h4>
        
        {/* Responsive Grid: auto-fit để tự xuống dòng trên mobile */}
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          
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

          {!isScheduler && (
            <>
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
                    <option value="">-- Chọn hình thức --</option>
                    {activeDisciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </select>
              </div>
            </>
          )}

          {isScheduler && (
             <div style={{ gridColumn: '1 / -1', background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h5 style={{margin:'0 0 10px 0', fontSize:'0.9rem', color:'#003366'}}>Cấu hình lặp lại</h5>
                <div style={{display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap'}}>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <label style={styles.label}>Số tuần lặp lại:</label>
                        <input 
                            type="number" min="1" max="52" 
                            value={scheduleConfig.repeatWeeks} 
                            onChange={e => setScheduleConfig({...scheduleConfig, repeatWeeks: e.target.value})}
                            style={{...styles.input, width: '100px'}} 
                        />
                    </div>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <label style={styles.label}>Chọn thứ trong tuần:</label>
                        <div style={{display:'flex', gap:'8px', marginTop:'5px', flexWrap: 'wrap'}}>
                            {daysOfWeek.map(d => (
                                <div 
                                    key={d.key} onClick={() => handleDayToggle(d.key)}
                                    style={{
                                        width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', 
                                        fontSize:'0.8rem', cursor:'pointer', fontWeight:'bold', border: '1px solid #d1d5db',
                                        background: scheduleConfig.days.includes(d.key) ? '#003366' : 'white',
                                        color: scheduleConfig.days.includes(d.key) ? 'white' : '#6b7280',
                                    }}
                                >
                                    {d.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          )}

          <div style={{ gridColumn: '1 / -1' }}>
             <label style={styles.label}>Mô tả chi tiết</label>
             <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} style={{...styles.input, height: '80px'}} />
          </div>

          <button type="submit" style={styles.btnSubmit}>
              {isScheduler ? (editingScheduleId ? 'Gửi yêu cầu điều chỉnh' : 'Lưu lịch & Tạo Tasks') : 'Giao việc'}
          </button>
          
          {isScheduler && editingScheduleId && (
              <button 
                type="button" 
                onClick={() => { setEditingScheduleId(null); setNewTask({ title: '', assigneeId: '', description: '', startTime: '', endTime: '', assignedRole: 'ST', paymentType: 'UBI 1', disciplineId: '' }); setScheduleConfig({ repeatWeeks: 1, days: [] }); }}
                style={{ ...styles.btnSubmit, background: '#9ca3af', marginTop: '-10px' }}
              >
                  Hủy thao tác
              </button>
          )}
        </form>
      </div>

      {/* --- PHẦN 3: DANH SÁCH (CÓ THANH CUỘN NGANG) --- */}
      
      {!isScheduler ? (
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px' }}>
             <h4>Danh sách đang thực hiện</h4>
             <div style={{overflowX: 'auto'}}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
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
                            <td><button onClick={()=>handleDeleteTask(t.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Xóa</button></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
             </div>
             <div style={{marginTop: '40px', overflowX: 'auto'}}>
                <h4>Danh sách lịch gốc (Schedules)</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '500px' }}>
                  <thead>
                     <tr style={{textAlign:'left', borderBottom: '1px solid #eee'}}>
                       <th style={{padding:'10px'}}>Tiêu đề</th>
                       <th>Hành động</th>
                     </tr>
                  </thead>
                  <tbody>
                     {schedules.map(s => (
                       <tr key={s.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                          <td style={{padding:'10px'}}>{s.title}</td>
                          <td>
                              <button onClick={()=>handleEditSchedule(s)} style={{color:'#003366', border:'none', background:'none', cursor:'pointer', marginRight:'10px'}}>Sửa</button>
                              <button onClick={()=>handleDeleteSchedule(s.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Xóa</button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
             </div>
          </div>
      ) : (
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px' }}>
             <h4>Danh sách lịch đã thiết lập</h4>
             <div style={{overflowX: 'auto'}}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                    <thead>
                       <tr style={{textAlign:'left', borderBottom: '1px solid #eee'}}>
                         <th style={{padding:'10px'}}>Tiêu đề</th>
                         <th>Người thực hiện</th>
                         <th>Lặp lại</th>
                         <th>Các ngày</th>
                         <th>Thao tác</th>
                       </tr>
                    </thead>
                    <tbody>
                       {schedules.map(s => (
                         <tr key={s.id} style={{ borderBottom: '1px solid #f9f9f9', background: s.request ? '#fefce8' : 'transparent' }}>
                            <td style={{padding:'10px'}}>
                                <strong>{s.title}</strong>
                                <div style={{fontSize:'0.75rem', color:'#6b7280'}}>{s.description?.substring(0, 30)}...</div>
                                {s.request && <div style={{fontSize:'0.7rem', color:'#d97706', fontWeight:'bold', marginTop:'4px'}}>⏳ Đang chờ duyệt: {s.request.type === 'delete' ? 'XÓA' : 'SỬA'}</div>}
                            </td>
                            <td>{s.assigneeName} ({s.assignedRole})</td>
                            <td>{s.repeatWeeks} tuần</td>
                            <td>
                                <div style={{display:'flex', gap:'4px', flexWrap: 'wrap'}}>
                                    {s.repeatDays && s.repeatDays.map(d => (
                                        <span key={d} style={{fontSize:'0.7rem', background:'#e5e7eb', padding:'2px 6px', borderRadius:'4px'}}>{d}</span>
                                    ))}
                                </div>
                            </td>
                            <td>
                                {!s.request ? (
                                    <button 
                                        onClick={() => handleRequestAdjustmentClick(s)} 
                                        style={{color:'#003366', border:'1px solid #003366', background:'white', cursor:'pointer', fontWeight:'600', padding:'4px 8px', borderRadius:'6px', fontSize:'0.8rem', whiteSpace: 'nowrap'}}
                                    >
                                        Xin điều chỉnh
                                    </button>
                                ) : (
                                    <span style={{fontSize:'0.8rem', color:'#9ca3af', fontStyle:'italic'}}>Đã gửi yêu cầu</span>
                                )}
                            </td>
                         </tr>
                       ))}
                       {schedules.length === 0 && (
                           <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color:'#9ca3af'}}>Chưa có lịch nào được thiết lập</td></tr>
                       )}
                    </tbody>
                 </table>
             </div>
          </div>
      )}
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