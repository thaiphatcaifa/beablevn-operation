import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- HELPER FUNCTIONS ---
const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
const isSameWeek = (d1, d2) => {
    const start = new Date(d2);
    start.setHours(0,0,0,0);
    start.setDate(start.getDate() - start.getDay() + 1); 
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return d1 >= start && d1 <= end;
};

const formatDateTime = (isoString) => {
    if (!isoString) return '---';
    const d = new Date(isoString);
    return `${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ${d.getDate()}/${d.getMonth()+1}`;
};

// --- CẬP NHẬT: LOGIC TÍNH GIỜ THEO YÊU CẦU ---
// Công thức: EndTime (Scheduler) - Max(StartTime, ActualCheckIn)
const calculateWorkHours = (schedStart, schedEnd, actualCheckIn) => {
    if (!schedStart || !schedEnd) return '---';
    
    const start = new Date(schedStart);
    const end = new Date(schedEnd);
    let effectiveStart = start;

    // Nếu có check-in thực tế và check-in trễ hơn giờ quy định
    if (actualCheckIn) {
        const checkIn = new Date(actualCheckIn);
        if (checkIn > start) {
            effectiveStart = checkIn; // Tính giờ bắt đầu từ lúc check-in thực tế
        }
    }

    const diffMs = end - effectiveStart;
    
    if (diffMs < 0) return '0h 00p'; // Trường hợp check-in sau khi ca đã kết thúc (quá trễ)

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes < 10 ? '0' + minutes : minutes}p`;
};

// --- ICONS ---
const Icons = {
  Finance: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Facility: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Task: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  Schedule: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Print: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
  )
};

const Reports = () => {
  const { user } = useAuth();
  const { tasks, staffList, facilityLogs } = useData();
  
  // --- STATES BỘ LỌC ---
  const [attendanceFilter, setAttendanceFilter] = useState('month'); 
  const [financeStaffFilter, setFinanceStaffFilter] = useState('all'); 
  const [facilityAreaFilter, setFacilityAreaFilter] = useState('all'); 
  const [facilityStaffFilter, setFacilityStaffFilter] = useState('all'); 
  const [facilityTimeFilter, setFacilityTimeFilter] = useState('month'); 
  
  const [taskStaffFilter, setTaskStaffFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');

  // --- HÀM XỬ LÝ IN ---
  const handlePrint = () => {
    window.print();
  };

  // --- PHÂN TÁCH DỮ LIỆU ---
  const opAdminTasks = tasks.filter(t => !t.fromScheduleId);
  const scheduleTasks = tasks.filter(t => t.fromScheduleId);

  // 1. TÀI CHÍNH
  let totalEstimatedCost = 0;
  const financeRows = [];

  staffList.forEach(staff => {
      if (financeStaffFilter !== 'all' && staff.id !== financeStaffFilter) return;

      const ubi1 = (staff.ubi1Base || 0) * (staff.ubi1Percent || 100) / 100;
      const ubi2 = (staff.ubi2Base || 0) * (staff.ubi2Percent || 100) / 100;
      const totalUBI = ubi1 + ubi2;

      const opTasksCount = opAdminTasks.filter(t => t.assigneeId === staff.id).length;
      const taskRemuneration = (staff.remuneration || 0) * opTasksCount;

      if (totalUBI > 0) {
          financeRows.push({
              item: `UBI - ${staff.name}`,
              type: 'Cố định (Tháng)',
              amount: totalUBI,
              date: new Date().toLocaleDateString('vi-VN')
          });
          totalEstimatedCost += totalUBI;
      }

      if (taskRemuneration > 0) {
          financeRows.push({
              item: `Thù lao - ${staff.name}`,
              type: `Theo việc (${opTasksCount} task)`,
              amount: taskRemuneration,
              date: new Date().toLocaleDateString('vi-VN')
          });
          totalEstimatedCost += taskRemuneration;
      }
  });

  // 2. CSVC
  const availableAreas = [...new Set(facilityLogs.map(l => l.area).filter(Boolean))];
  const availableReporters = [...new Set(facilityLogs.map(l => l.staffName).filter(Boolean))];

  const filteredFacilityLogs = facilityLogs.filter(log => {
      if (facilityAreaFilter !== 'all' && log.area !== facilityAreaFilter) return false;
      if (facilityStaffFilter !== 'all' && log.staffName !== facilityStaffFilter) return false;
      
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (facilityTimeFilter === 'day' && !isSameDay(logDate, now)) return false;
      if (facilityTimeFilter === 'week' && !isSameWeek(logDate, now)) return false;
      if (facilityTimeFilter === 'month' && !isSameMonth(logDate, now)) return false;
      
      return true;
  });

  // 3. TIẾN ĐỘ CÔNG VIỆC
  const filteredOpTasks = opAdminTasks.filter(t => {
      if (taskStaffFilter !== 'all' && t.assigneeId !== taskStaffFilter) return false;
      
      const isCompleted = t.status === 'completed';
      const isOverdue = new Date() > new Date(t.endTime) && !isCompleted;
      
      if (taskStatusFilter === 'completed' && !isCompleted) return false;
      if (taskStatusFilter === 'overdue' && !isOverdue) return false;
      if (taskStatusFilter === 'inprogress' && (isCompleted || isOverdue)) return false; 

      return true;
  });

  const totalTasks = filteredOpTasks.length;
  const completedTasks = filteredOpTasks.filter(t => t.status === 'completed').length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // 4. CHẤM CÔNG
  const filteredAttendance = scheduleTasks.filter(t => {
      const taskDate = new Date(t.startTime);
      const now = new Date();
      if (attendanceFilter === 'day') return isSameDay(taskDate, now);
      if (attendanceFilter === 'week') return isSameWeek(taskDate, now);
      if (attendanceFilter === 'month') return isSameMonth(taskDate, now);
      return true;
  });

  return (
    <div style={{ paddingBottom: '40px' }} className="reports-page">
      {/* CSS CHO IN ẤN & RESPONSIVE */}
      <style>{`
        @media print {
          .admin-sidebar, .admin-header-mobile, .admin-bottom-nav, .btn-print, .filter-select {
            display: none !important;
          }
          .admin-content { margin: 0 !important; padding: 20px !important; width: 100% !important; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
        }
        .filter-group { display: flex; gap: 8px; flex-wrap: wrap; }
      `}</style>

      {/* HEADER + NÚT IN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
         <h2 style={{ color: '#003366', margin: 0, fontWeight: 'bold', fontSize: '1.5rem' }}>Báo cáo Quản trị</h2>
         <button onClick={handlePrint} className="btn-print" style={styles.printBtn}>
            <Icons.Print /> Xuất Báo cáo
         </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
        
        {/* --- CARD 1: TÀI CHÍNH --- */}
        {user?.role === 'chief' && (
            <div style={styles.card} className="card">
               <div style={{...styles.cardHeader, flexWrap: 'wrap', gap: '15px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px', flex: '1 1 auto', minWidth: '200px'}}>
                      <div style={styles.iconBox}><Icons.Finance /></div>
                      <h3 style={styles.cardTitle}>Tài chính & Thu nhập (Chief Admin)</h3>
                  </div>
                  <select 
                      value={financeStaffFilter} 
                      onChange={(e) => setFinanceStaffFilter(e.target.value)}
                      style={{...styles.filterSelect, flex: '1 1 200px'}} 
                      className="filter-select"
                  >
                      <option value="all">Tất cả nhân sự</option>
                      {staffList.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
               </div>
               <div style={{...styles.cardBody, overflowX: 'auto'}}>
                  <div style={{...styles.statRow, marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #eee'}}>
                     <span style={{fontWeight: '600'}}>Tổng chi dự kiến:</span>
                     <strong style={{fontSize: '1.2rem', color: '#059669'}}>{totalEstimatedCost.toLocaleString('vi-VN')} VNĐ</strong>
                  </div>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={styles.th}>Khoản mục</th>
                        <th style={styles.th}>Loại</th>
                        <th style={styles.th}>Số tiền</th>
                        <th style={styles.th}>Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeRows.length > 0 ? financeRows.map((row, idx) => (
                        <tr key={idx} style={styles.tr}>
                            <td style={styles.td}>{row.item}</td>
                            <td style={styles.td}>{row.type}</td>
                            <td style={{...styles.td, fontWeight: 'bold'}}>{row.amount.toLocaleString()}</td>
                            <td style={styles.td}>{row.date}</td>
                        </tr>
                      )) : (
                        <tr>
                            <td colSpan="4" style={styles.emptyTd}>Không có dữ liệu hiển thị.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
        )}

        {/* --- CARD 2: TÌNH TRẠNG CƠ SỞ VẬT CHẤT --- */}
        <div style={styles.card} className="card">
           <div style={{...styles.cardHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px', width: '100%'}}>
                  <div style={styles.iconBox}><Icons.Facility /></div>
                  <h3 style={styles.cardTitle}>Tình trạng Cơ sở vật chất</h3>
              </div>
              <div className="filter-group" style={{width: '100%'}}>
                  <select 
                      value={facilityAreaFilter} 
                      onChange={(e) => setFacilityAreaFilter(e.target.value)}
                      style={{...styles.filterSelect, flex: 1}}
                      className="filter-select"
                  >
                      <option value="all">Khu vực: Tất cả</option>
                      {availableAreas.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                  <select 
                      value={facilityStaffFilter} 
                      onChange={(e) => setFacilityStaffFilter(e.target.value)}
                      style={{...styles.filterSelect, flex: 1}}
                      className="filter-select"
                  >
                      <option value="all">Nhân sự: Tất cả</option>
                      {availableReporters.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  <select 
                      value={facilityTimeFilter} 
                      onChange={(e) => setFacilityTimeFilter(e.target.value)}
                      style={{...styles.filterSelect, flex: 1}}
                      className="filter-select"
                  >
                      <option value="day">Hôm nay</option>
                      <option value="week">Tuần này</option>
                      <option value="month">Tháng này</option>
                  </select>
              </div>
           </div>
           <div style={{...styles.cardBody, overflowX: 'auto'}}>
               <table style={styles.table}>
                 <thead>
                   <tr style={styles.tableHeadRow}>
                     <th style={styles.th}>Khu vực</th>
                     <th style={styles.th}>Tình trạng trước</th>
                     <th style={styles.th}>Tình trạng sau</th>
                     <th style={styles.th}>Nhân sự báo cáo</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredFacilityLogs.length > 0 ? (
                     [...filteredFacilityLogs].reverse().map((log, index) => (
                       <tr key={index} style={styles.tr}>
                         <td style={{...styles.td, fontWeight: '600'}}>{log.area || '---'}</td>
                         
                         <td style={styles.td}>
                             <div style={{fontWeight:'700', fontSize:'0.9rem', marginBottom:'4px', color:'#1f2937'}}>
                                 {log.itemName || log.item || log.category || 'Hạng mục'}
                             </div>
                             <div style={{color:'#4b5563'}}>
                                 {log.prevStatus ? log.prevStatus : <span style={{fontStyle:'italic', color:'#9ca3af'}}>---</span>}
                             </div>
                             <div style={{fontSize:'0.75rem', color:'#9ca3af', marginTop:'2px'}}>{formatDateTime(log.prevTime)}</div>
                         </td>

                         <td style={styles.td}>
                             <div style={{fontWeight:'700', fontSize:'0.9rem', marginBottom:'4px', color:'#1f2937'}}>
                                 {log.itemName || log.item || log.category || 'Hạng mục'}
                             </div>
                             <div style={{color: '#003366', fontWeight:'500'}}>
                                 {log.status || log.note || 'Đã kiểm tra'}
                             </div>
                             <div style={{fontSize:'0.75rem', color:'#6b7280', marginTop:'2px'}}>{formatDateTime(log.timestamp)}</div>
                         </td>

                         <td style={styles.td}>{log.staffName || 'Unknown'}</td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan="4" style={styles.emptyTd}>Chưa có báo cáo kiểm tra phù hợp.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
           </div>
        </div>

        {/* --- CARD 3: BÁO CÁO CHẤM CÔNG --- */}
        <div style={styles.card} className="card">
          <div style={{ ...styles.cardHeader, justifyContent: 'space-between' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={styles.iconBox}><Icons.Schedule /></div>
                <h3 style={styles.cardTitle}>Báo cáo Chấm công (Theo Lịch Scheduler)</h3>
             </div>
             <select 
                  value={attendanceFilter} 
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  style={styles.filterSelect}
                  className="filter-select"
              >
                  <option value="day">Hôm nay</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
              </select>
          </div>
          <div style={{...styles.cardBody, overflowX: 'auto'}}>
             <table style={styles.table}>
                <thead>
                   <tr style={styles.tableHeadRow}>
                     <th style={{ ...styles.th, borderRadius: '8px 0 0 8px' }}>Nhân sự</th>
                     <th style={styles.th}>Ca làm việc</th>
                     <th style={styles.th}>Thời gian</th>
                     <th style={styles.th}>Số giờ</th> {/* CỘT MỚI: SỐ GIỜ */}
                     <th style={styles.th}>Trạng thái</th>
                     <th style={{ ...styles.th, borderRadius: '0 8px 8px 0' }}>Kết quả</th>
                   </tr>
                </thead>
                <tbody>
                   {filteredAttendance.length > 0 ? filteredAttendance.map(t => {
                     const isLate = t.checkInStatus === 'Late';
                     return (
                         <tr key={t.id} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: '600' }}>{t.assigneeName}</td>
                            <td style={styles.td}>
                                <div>{t.title}</div>
                                <div style={{fontSize:'0.75rem', color:'#6b7280'}}>{t.assignedRole}</div>
                            </td>
                            <td style={styles.td}>
                               {new Date(t.startTime).toLocaleDateString('vi-VN')} <br/>
                               <span style={{fontSize:'0.75rem', color:'#64748b'}}>
                                 {new Date(t.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(t.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                               </span>
                            </td>
                            {/* DỮ LIỆU CỘT SỐ GIỜ: TÍNH THEO START-END & XỬ LÝ TRỄ */}
                            <td style={{...styles.td, fontWeight: 'bold', color: isLate ? '#b91c1c' : '#059669'}}>
                                {calculateWorkHours(t.startTime, t.endTime, t.checkInTime)}
                            </td>
                            <td style={styles.td}>
                               {t.status === 'completed' || t.progress === 100 ? 
                                 <span style={styles.badgeSuccess}>Đã chấm công</span> : 
                                 (isLate ? <span style={styles.badgeError}>Trễ</span> : <span style={styles.badgePending}>Chưa hoàn thành</span>)
                               }
                            </td>
                            <td style={styles.td}>{t.progress}%</td>
                         </tr>
                     );
                   }) : (
                     <tr><td colSpan="6" style={styles.emptyTd}>Không có dữ liệu chấm công.</td></tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>

        {/* --- CARD 4: TIẾN ĐỘ CÔNG VIỆC --- */}
        <div style={styles.card} className="card">
          <div style={{...styles.cardHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '15px'}}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                 <div style={styles.iconBox}><Icons.Task /></div>
                 <h3 style={styles.cardTitle}>Tiến độ Công việc (Operational Admin giao)</h3>
             </div>
             <div className="filter-group" style={{width: '100%'}}>
                 <select 
                      value={taskStaffFilter} 
                      onChange={(e) => setTaskStaffFilter(e.target.value)}
                      style={{...styles.filterSelect, flex: 1}}
                      className="filter-select"
                  >
                      <option value="all">Nhân sự: Tất cả</option>
                      {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select 
                      value={taskStatusFilter} 
                      onChange={(e) => setTaskStatusFilter(e.target.value)}
                      style={{...styles.filterSelect, flex: 1}}
                      className="filter-select"
                  >
                      <option value="all">Trạng thái: Tất cả</option>
                      <option value="inprogress">Đang làm</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="overdue">Quá hạn</option>
                  </select>
             </div>
          </div>

          <div style={styles.cardBody}>
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={styles.statBoxBlue}>
                    <div style={{fontSize:'0.8rem', color:'#6b7280'}}>Tổng nhiệm vụ</div>
                    <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#003366'}}>{totalTasks}</div>
                </div>
                <div style={styles.statBoxGreen}>
                    <div style={{fontSize:'0.8rem', color:'#6b7280'}}>Hoàn thành</div>
                    <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#059669'}}>{completedTasks}</div>
                </div>
                <div style={styles.statBoxGray}>
                    <div style={{fontSize:'0.8rem', color:'#6b7280'}}>Tỷ lệ</div>
                    <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#003366'}}>{taskProgress}%</div>
                </div>
            </div>

            <div style={{overflowX: 'auto'}}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Nhiệm vụ</th>
                    <th style={styles.th}>Phụ trách</th>
                    <th style={styles.th}>Hạn chót</th>
                    <th style={styles.th}>Tiến độ</th>
                    <th style={styles.th}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredOpTasks.map(task => {
                      let statusElement;
                      const isOverdue = new Date() > new Date(task.endTime) && task.status !== 'completed';

                      if (task.status === 'completed') {
                          statusElement = <span style={styles.badgeSuccess}>Hoàn thành</span>;
                      } else if (isOverdue) {
                          statusElement = <span style={styles.badgeError}>Quá hạn / Giải trình</span>;
                      } else {
                          statusElement = <span style={styles.badgeInfo}>Đang làm</span>;
                      }

                      return (
                        <tr key={task.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: '500' }}>{task.title}</td>
                          <td style={styles.td}>{task.assigneeName}</td>
                          <td style={styles.td}>{new Date(task.endTime).toLocaleDateString('vi-VN')}</td>
                          <td style={styles.td}>
                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                <div style={{flex:1, height:'6px', background:'#e5e7eb', borderRadius:'3px', minWidth:'60px'}}>
                                  <div style={{width:`${task.progress}%`, background:'#003366', height:'100%', borderRadius:'3px'}}></div>
                                </div>
                                <span style={{fontSize:'0.8em', fontWeight:'bold'}}>{task.progress}%</span>
                            </div>
                          </td>
                          <td style={styles.td}>{statusElement}</td>
                        </tr>
                      );
                    })}
                    {filteredOpTasks.length === 0 && <tr><td colSpan="5" style={styles.emptyTd}>Không tìm thấy nhiệm vụ phù hợp.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', marginBottom: '30px', overflow: 'hidden' },
  cardHeader: { padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb' },
  iconBox: { width: '36px', height: '36px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#003366' },
  cardTitle: { margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1f2937' },
  cardBody: { padding: '20px' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem', color: '#4b5563' },
  filterSelect: { padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', fontWeight: '600', color: '#4b5563', cursor: 'pointer', fontSize: '0.85rem' },
  printBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#003366', border: '1px solid #003366', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' },
  tableHeadRow: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' },
  tr: { transition: 'background 0.2s' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#334155' },
  emptyTd: { padding: '30px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' },
  badgeSuccess: { background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  badgePending: { background: '#fff7ed', color: '#ea580c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  badgeError: { background: '#fef2f2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  badgeInfo: { background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' },
  statBoxBlue: { flex: 1, background: '#f0f9ff', padding: '15px', borderRadius: '12px', border: '1px solid #bae6fd', minWidth: '120px' },
  statBoxGreen: { flex: 1, background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #bbf7d0', minWidth: '120px' },
  statBoxGray: { flex: 1, background: '#f9fafb', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', minWidth: '120px' }
};

export default Reports;