import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// Icons Minimalist
const Icons = {
  Finance: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Facility: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>),
  Task: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#003366" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>),
  Print: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.198-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 001.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>)
};

const Reports = () => {
  const { user } = useAuth();
  const { tasks, staffList, facilityLogs } = useData();
  const isChief = user?.role === 'chief';

  const [filterStaff, setFilterStaff] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const calculateIncome = (staff) => {
      const ubi1 = (staff.ubi1Base || 0) * (staff.ubi1Percent || 0) / 100;
      const ubi2 = (staff.ubi2Base || 0) * (staff.ubi2Percent || 0) / 100;
      return ubi1 + ubi2 + (staff.remuneration || 0);
  };
  const totalCompanyIncome = staffList.reduce((acc, s) => acc + calculateIncome(s), 0);

  const filteredTasks = tasks.filter(t => {
    let matchStaff = filterStaff ? (t.assigneeId === filterStaff) : true;
    let matchTime = filterMonth ? t.endTime.startsWith(filterMonth) : true;
    return matchStaff && matchTime;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
        <h2 style={{ color: '#003366', margin: 0, fontWeight: '300', fontSize: '1.8rem' }}>Báo cáo Tổng hợp</h2>
        <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#003366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <Icons.Print /> Xuất báo cáo / In
        </button>
      </div>

      {/* 1. TỔNG THU NHẬP */}
      {isChief && (
          <div style={styles.card}>
              <div style={styles.cardHeader}>
                 <Icons.Finance />
                 <h3 style={styles.cardTitle}>Tài chính & Thu nhập (Chief Admin)</h3>
              </div>
              
              <div style={{ padding: '20px' }}>
                <h1 style={{ margin: '0 0 15px 0', color: '#111827', fontSize: '1.5rem', fontWeight: '600' }}>
                   Tổng quỹ lương: <span style={{color: '#059669'}}>{totalCompanyIncome.toLocaleString()} VNĐ</span>
                </h1>
                
                <details style={{border: '1px solid #f3f4f6', borderRadius: '6px', padding: '10px'}}>
                    <summary style={{cursor:'pointer', fontWeight:'600', color: '#4b5563', fontSize: '0.9rem'}}>Xem chi tiết từng nhân sự ▼</summary>
                    <table style={{width:'100%', marginTop:'15px', background:'white', borderCollapse:'collapse', fontSize: '0.9rem'}}>
                        <thead>
                            <tr style={{textAlign:'left', background:'#f9fafb', color: '#6b7280'}}>
                              <th style={{padding:'10px', fontWeight: '600'}}>Nhân sự</th>
                              <th style={{padding:'10px', fontWeight: '600'}}>UBI 1</th>
                              <th style={{padding:'10px', fontWeight: '600'}}>UBI 2</th>
                              <th style={{padding:'10px', fontWeight: '600'}}>Thù lao</th>
                              <th style={{padding:'10px', fontWeight: '600'}}>Tổng nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map(s => {
                                const ubi1 = (s.ubi1Base||0)*(s.ubi1Percent||0)/100;
                                const ubi2 = (s.ubi2Base||0)*(s.ubi2Percent||0)/100;
                                return (
                                    <tr key={s.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                                        <td style={{padding:'10px', fontWeight: '500'}}>{s.name}</td>
                                        <td style={{padding:'10px'}}>{ubi1.toLocaleString()}</td>
                                        <td style={{padding:'10px'}}>{ubi2.toLocaleString()}</td>
                                        <td style={{padding:'10px'}}>{(s.remuneration||0).toLocaleString()}</td>
                                        <td style={{padding:'10px', fontWeight:'bold', color: '#003366'}}>{calculateIncome(s).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </details>
              </div>
          </div>
      )}

      {/* 2. BÁO CÁO CSVC */}
      <div style={styles.card}>
          <div style={styles.cardHeader}>
              <Icons.Facility />
              <h3 style={styles.cardTitle}>Tình trạng Cơ sở vật chất</h3>
          </div>

          <div style={{ maxHeight:'350px', overflowY:'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1}}>
                  <tr style={{textAlign:'left', color: '#6b7280'}}>
                    <th style={{padding:'12px 20px', fontWeight: '600'}}>Thời gian</th>
                    <th style={{padding:'12px 20px', fontWeight: '600'}}>Khu vực</th>
                    <th style={{padding:'12px 20px', fontWeight: '600'}}>Người check</th>
                    <th style={{padding:'12px 20px', fontWeight: '600'}}>Hạng mục</th>
                    <th style={{padding:'12px 20px', fontWeight: '600'}}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                    {facilityLogs.length === 0 ? 
                      <tr><td colSpan="5" style={{padding:'20px', textAlign:'center', color: '#9ca3af'}}>Chưa có dữ liệu ghi nhận</td></tr> : 
                      facilityLogs.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(log => (
                        <tr key={log.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'12px 20px', color: '#4b5563'}}>{new Date(log.timestamp).toLocaleString()}</td>
                            <td style={{padding:'12px 20px', fontWeight: '500'}}>{log.area} <span style={{fontSize:'0.8em', color: '#9ca3af'}}>({log.type})</span></td>
                            <td style={{padding:'12px 20px'}}>{log.staffName}</td>
                            <td style={{padding:'12px 20px'}}>{log.item}</td>
                            <td style={{padding:'12px 20px'}}>
                              <span style={{
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                                background: (log.status.includes('Tốt') || log.status.includes('Mát') || log.status.includes('Ổn định') || log.status.includes('Xanh') || log.status.includes('Sạch sẽ') || log.status.includes('Đã kiểm')) ? '#ecfdf5' : '#fef2f2',
                                color: (log.status.includes('Tốt') || log.status.includes('Mát') || log.status.includes('Ổn định') || log.status.includes('Xanh') || log.status.includes('Sạch sẽ') || log.status.includes('Đã kiểm')) ? '#047857' : '#b91c1c'
                              }}>
                                {log.status}
                              </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>

      {/* 3. BÁO CÁO TIẾN ĐỘ */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
            <Icons.Task />
            <h3 style={styles.cardTitle}>Tiến độ công việc</h3>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div className="no-print" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <span style={{color: '#4b5563'}}>Lọc theo nhân sự:</span>
              <select onChange={e => setFilterStaff(e.target.value)} style={{padding:'6px 10px', borderRadius:'4px', border:'1px solid #d1d5db', outline: 'none'}}>
                  <option value="">-- Tất cả --</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign:'left', background: '#f9fafb', color: '#6b7280' }}>
                  <th style={{padding:'12px 15px', fontWeight: '600'}}>Nhân sự</th>
                  <th style={{padding:'12px 15px', fontWeight: '600'}}>Công việc</th>
                  <th style={{padding:'12px 15px', fontWeight: '600'}}>Hạn chót</th>
                  <th style={{padding:'12px 15px', fontWeight: '600'}}>Tiến độ</th>
                  <th style={{padding:'12px 15px', fontWeight: '600'}}>Ghi chú/Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? 
                  <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color: '#9ca3af', fontStyle: 'italic'}}>Không có nhiệm vụ phù hợp</td></tr> :
                  filteredTasks.map(task => {
                    const staff = staffList.find(s => s.id === task.assigneeId);
                    const isOverdue = new Date() > new Date(task.endTime);
                    const isCompleted = task.progress === 100;
                    
                    let statusElement = null;
                    if (isCompleted) {
                        statusElement = <span style={{color: '#059669', fontWeight: '500'}}>Hoàn thành</span>;
                    } else if (isOverdue) {
                        // MỚI: Trạng thái quá hạn theo yêu cầu
                        statusElement = <span style={{color: '#b91c1c', fontWeight: 'bold', background:'#fee2e2', padding:'4px 8px', borderRadius:'4px', fontSize:'0.8rem'}}>Đã quá hạn, tiến hành giải trình</span>;
                    } else {
                        statusElement = <span style={{color: '#003366'}}>Đang thực hiện</span>;
                    }

                    return (
                      <tr key={task.id} style={{borderBottom: '1px solid #f3f4f6'}}>
                        <td style={{ padding: '12px 15px', fontWeight: '500' }}>{staff?.name}</td>
                        <td style={{ padding: '12px 15px' }}>{task.title}</td>
                        <td style={{ padding: '12px 15px', color: '#4b5563' }}>{new Date(task.endTime).toLocaleString()}</td>
                        <td style={{ padding: '12px 15px' }}>
                           <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                              <div style={{flex:1, height:'6px', background:'#e5e7eb', borderRadius:'3px', minWidth:'60px'}}>
                                <div style={{width:`${task.progress}%`, background:'#003366', height:'100%', borderRadius:'3px'}}></div>
                              </div>
                              <span style={{fontSize:'0.8em', fontWeight:'bold'}}>{task.progress}%</span>
                           </div>
                        </td>
                        <td style={{ padding: '12px 15px' }}>{statusElement}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #f3f4f6',
    marginBottom: '30px',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff'
  },
  cardTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#003366', 
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  }
};

export default Reports;