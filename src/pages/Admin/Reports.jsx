import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const Reports = () => {
  const { tasks, staffList } = useData();
  const [filterStaff, setFilterStaff] = useState('');
  const [filterMonth, setFilterMonth] = useState(''); // Format: YYYY-MM
  
  // Logic lọc
  const filteredTasks = tasks.filter(t => {
    let matchStaff = true;
    let matchTime = true;

    if (filterStaff) matchStaff = (t.assigneeId.toString() === filterStaff);
    
    if (filterMonth) {
        const taskMonth = t.deadline.slice(0, 7); // Lấy YYYY-MM
        matchTime = (taskMonth === filterMonth);
    }

    return matchStaff && matchTime;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-container">
      {/* Ẩn thanh công cụ khi in */}
      <style>{`
        @media print {
            .no-print { display: none; }
            .report-container { padding: 0; }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Báo cáo tổng hợp</h2>
        <button onClick={handlePrint} style={{ padding: '10px 20px', background: '#003366', color: 'white', border: 'none', cursor: 'pointer' }}>
            Xuất PDF / In Báo Cáo
        </button>
      </div>

      <div className="no-print" style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', border: '1px solid #ddd' }}>
        <strong>Bộ lọc: </strong>
        <select onChange={e => setFilterStaff(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
            <option value="">-- Tất cả nhân sự --</option>
            {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        <span style={{ marginLeft: '20px' }}>Tháng: </span>
        <input type="month" onChange={e => setFilterMonth(e.target.value)} style={{ padding: '5px' }} />
      </div>

      {/* Nội dung báo cáo */}
      <div id="report-content">
        <h3>Báo cáo Tiến độ & Hiệu suất</h3>
        <p>Thời gian xuất: {new Date().toLocaleString('vi-VN')}</p>
        
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#eee' }}>
              <th>Nhân sự</th>
              <th>Công việc</th>
              <th>Thời hạn</th>
              <th>Tiến độ</th>
              <th>Trạng thái / Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => {
              const staff = staffList.find(s => s.id === task.assigneeId);
              return (
                <tr key={task.id}>
                  <td style={{ padding: '8px' }}>{staff?.name}</td>
                  <td style={{ padding: '8px' }}>{task.title}</td>
                  <td style={{ padding: '8px' }}>{task.deadline}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{task.progress}%</td>
                  <td style={{ padding: '8px' }}>
                     {task.progress === 100 ? 'Hoàn thành' : 
                      (task.progress < 90 ? `Chậm - Lý do: ${task.reason || 'Không có'}` : 'Đang thực hiện')
                     }
                  </td>
                </tr>
              );
            })}
            {filteredTasks.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>Không tìm thấy dữ liệu phù hợp</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;