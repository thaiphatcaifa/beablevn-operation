import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// --- ICON MINIMALIST (#003366) ---
const Icons = {
  History: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  )
};

const Performance = () => {
  const { user } = useAuth();
  const { staffList, tasks } = useData();
  const currentUser = staffList.find(s => s.id === user.id) || user;
  const [incomeFilter, setIncomeFilter] = useState('Month'); 

  const myTasks = tasks.filter(t => t.assigneeId === user.id);
  const completedTasks = myTasks.filter(t => t.status === 'completed' && t.finishedAt);

  const evaluateTask = (task) => {
      const deadline = new Date(task.endTime);
      const finished = new Date(task.finishedAt);
      const progress = task.progress || 0;
      const diffTime = deadline - finished; 
      const diffDaysEarly = diffTime / (1000 * 3600 * 24); 
      const diffDaysLate = -diffDaysEarly;

      if (progress === 100 && diffDaysEarly >= 1) return { grade: "Xuất sắc", color: "#6f42c1", icon: "🏆", desc: "Sớm hơn 1 ngày" };
      if (progress >= 90 && diffDaysEarly >= 0) return { grade: "Tốt", color: "#198754", icon: "🌟", desc: "Đúng hạn" };
      if (progress >= 70 && progress <= 85 && diffDaysEarly >= 0) return { grade: "Cần điều chỉnh", color: "#fd7e14", icon: "⚠️", desc: "Đạt mức trung bình" };
      if (progress >= 60 && progress <= 70 && diffDaysLate > 3) return { grade: "Cảnh cáo", color: "#dc3545", icon: "⛔", desc: "Trễ quá 3 ngày" };
      return { grade: "Kỷ luật / Không đạt", color: "#343a40", icon: "🔨", desc: "Không đạt yêu cầu" };
  };

  const ubi1 = (currentUser.ubi1Base || 0) * (currentUser.ubi1Percent || 0) / 100;
  const ubi2 = (currentUser.ubi2Base || 0) * (currentUser.ubi2Percent || 0) / 100;
  const remuneration = currentUser.remuneration || 0;
  const totalBaseMonth = ubi1 + ubi2 + remuneration;
  
  let divider = 1;
  if (incomeFilter === 'Week') divider = 4;
  if (incomeFilter === 'Day') divider = 30;
  if (incomeFilter === 'Year') divider = 1/12;
  const estimatedIncome = totalBaseMonth / divider;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{color:'#003366', fontSize:'1.5rem', fontWeight:'700'}}>Hiệu suất & Thu nhập</h2>
      
      {/* 1. TỔNG QUAN THU NHẬP */}
      <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '30px', border: '1px solid #f3f4f6'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'15px', marginBottom:'15px'}}>
            <h4 style={{margin:0, color:'#374151', fontSize:'1rem'}}>Tổng thu nhập ước tính</h4>
            <select value={incomeFilter} onChange={e => setIncomeFilter(e.target.value)} style={{padding:'8px', borderRadius:'6px', border:'1px solid #d1d5db', outline:'none', fontSize:'0.9rem'}}>
                <option value="Day">Theo Ngày</option>
                <option value="Week">Theo Tuần</option>
                <option value="Month">Theo Tháng</option>
                <option value="Year">Theo Năm</option>
            </select>
          </div>
          
          <div style={{textAlign:'center', marginBottom:'20px'}}>
             <h1 style={{color: '#059669', fontSize:'2.2rem', margin:0, fontWeight:'700'}}>{estimatedIncome.toLocaleString('vi-VN')} VNĐ</h1>
             <span style={{color:'#6b7280', fontSize:'0.9rem'}}>Thu nhập ({incomeFilter})</span>
          </div>

          <div style={{background:'#f9fafb', padding:'15px', borderRadius:'8px', display:'grid', gap:'12px', border:'1px solid #f3f4f6'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                  <span style={{color:'#4b5563'}}>UBI 1 (Cơ bản):</span>
                  <strong style={{color:'#111827'}}>{(ubi1/divider).toLocaleString()} đ</strong>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                  <span style={{color:'#4b5563'}}>UBI 2 (Hiệu suất):</span>
                  <strong style={{color:'#111827'}}>{(ubi2/divider).toLocaleString()} đ</strong>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem'}}>
                  <span style={{color:'#4b5563'}}>Thù lao (Role):</span>
                  <strong style={{color:'#003366'}}>{(remuneration/divider).toLocaleString()} đ</strong>
              </div>
          </div>
      </div>

      {/* 2. ĐÁNH GIÁ CHI TIẾT THEO TASK */}
      <div style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6'}}>
         <div style={{display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #f3f4f6', paddingBottom:'15px', marginBottom:'20px'}}>
             <Icons.History />
             <h3 style={{margin:0, color:'#003366', fontSize:'1.1rem', fontWeight:'600'}}>Lịch sử đánh giá nhiệm vụ</h3>
         </div>
         
         {completedTasks.length === 0 ? (
             <p style={{color:'#9ca3af', fontStyle:'italic', textAlign:'center', padding:'20px'}}>Chưa có dữ liệu đánh giá.</p>
         ) : (
             <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                 {completedTasks.sort((a,b) => new Date(b.finishedAt) - new Date(a.finishedAt)).map(task => {
                     const evalResult = evaluateTask(task);
                     return (
                         <div key={task.id} style={{
                             border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px',
                             borderLeft: `5px solid ${evalResult.color}`,
                             display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                             background: '#fff'
                         }}>
                             <div>
                                 <div style={{fontWeight:'600', color:'#111827', fontSize:'1rem'}}>{task.title}</div>
                                 <div style={{fontSize:'0.85rem', color:'#6b7280', marginTop:'4px'}}>
                                     Hoàn thành: {new Date(task.finishedAt).toLocaleString()}
                                 </div>
                                 <div style={{fontSize:'0.85rem', color:'#6b7280'}}>
                                     Tiến độ: <strong>{task.progress}%</strong>
                                 </div>
                             </div>
                             <div style={{textAlign:'right', minWidth: '120px'}}>
                                 <div style={{fontSize:'1.4rem', marginBottom:'4px'}}>{evalResult.icon}</div>
                                 <div style={{
                                     color: evalResult.color, 
                                     fontWeight:'700', 
                                     fontSize:'0.85rem',
                                     background: `${evalResult.color}15`, 
                                     padding: '4px 10px',
                                     borderRadius: '6px',
                                     display: 'inline-block'
                                 }}>
                                     {evalResult.grade}
                                 </div>
                                 <div style={{fontSize:'0.75rem', color:'#9ca3af', marginTop:'4px'}}>
                                    {evalResult.desc}
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
         )}
      </div>
    </div>
  );
};

export default Performance;