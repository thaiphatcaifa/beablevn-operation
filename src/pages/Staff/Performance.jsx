import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Performance = () => {
  const { user } = useAuth();
  const { tasks } = useData();
  const [viewMode, setViewMode] = useState('month'); // 'week' or 'month'

  const myTasks = tasks.filter(t => t.assigneeId === user.id);

  // 3. Logic xếp hạng
  const evaluateTask = (task) => {
    const today = new Date();
    const deadline = new Date(task.deadline);
    const completedDate = task.completedDate ? new Date(task.completedDate) : null;
    
    // Xuất sắc: 100% xong + xong trước hạn > 1 ngày
    if (task.progress === 100 && completedDate) {
        const diffTime = deadline - completedDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 1) return { rank: 'Xuất sắc', color: 'purple', score: 10 };
        // Tốt: 90% trở lên + đúng hạn (hoặc xong đúng hạn)
        if (diffDays >= 0) return { rank: 'Tốt', color: 'green', score: 8 };
    }

    // Nếu chưa xong (progress < 100)
    // Tốt (định nghĩa lại cho task đang chạy): > 90% và chưa quá hạn
    if (task.progress >= 90 && today <= deadline) return { rank: 'Tốt', color: 'green', score: 8 };

    // Cần điều chỉnh: 70-85% + đúng hạn (chưa quá hạn)
    if (task.progress >= 70 && task.progress <= 89 && today <= deadline) return { rank: 'Cần điều chỉnh', color: 'orange', score: 6 };

    // Cảnh cáo: 60-70% + trễ > 3 ngày
    const lateDays = Math.ceil((today - deadline) / (1000 * 60 * 60 * 24));
    if (task.progress >= 60 && task.progress <= 70 && lateDays > 3) return { rank: 'Cảnh cáo', color: 'red', score: 4 };

    // Kỷ luật: Không hoàn thành (quá hạn lâu hoặc progress quá thấp) - Fallback
    if (lateDays > 0 && task.progress < 60) return { rank: 'Kỷ luật', color: 'black', score: 0 };

    return { rank: 'Đang theo dõi', color: 'gray', score: 5 }; // Trường hợp bình thường khác
  };

  // 4. Tổng kết theo thời gian
  const filterTasksByTime = (taskList) => {
    const now = new Date();
    return taskList.filter(t => {
      const tDate = new Date(t.deadline);
      if (viewMode === 'week') {
        // Lấy tasks có deadline trong 7 ngày gần đây hoặc tới
        const diff = Math.abs(tDate - now) / (1000 * 3600 * 24);
        return diff <= 7;
      } else {
        // Lấy tasks trong tháng hiện tại
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
    });
  };

  const filteredTasks = filterTasksByTime(myTasks);
  const evaluatedTasks = filteredTasks.map(t => ({ ...t, eval: evaluateTask(t) }));

  // Thống kê đơn giản
  const stats = evaluatedTasks.reduce((acc, curr) => {
    acc[curr.eval.rank] = (acc[curr.eval.rank] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h2>Performance & Đánh giá</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setViewMode('week')}
          style={{ padding: '10px 20px', background: viewMode === 'week' ? '#003366' : '#eee', color: viewMode === 'week' ? 'white' : 'black', border: 'none', marginRight: '5px' }}
        >
          Theo Tuần
        </button>
        <button 
          onClick={() => setViewMode('month')}
          style={{ padding: '10px 20px', background: viewMode === 'month' ? '#003366' : '#eee', color: viewMode === 'month' ? 'white' : 'black', border: 'none' }}
        >
          Theo Tháng
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
        {/* Bảng thống kê */}
        <div style={{ border: '1px solid #ddd', padding: '15px', height: 'fit-content' }}>
          <h4>Tổng kết ({viewMode === 'week' ? 'Tuần này' : 'Tháng này'})</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li>Xuất sắc: <strong>{stats['Xuất sắc'] || 0}</strong></li>
            <li>Tốt: <strong>{stats['Tốt'] || 0}</strong></li>
            <li>Cần điều chỉnh: <strong>{stats['Cần điều chỉnh'] || 0}</strong></li>
            <li>Cảnh cáo: <strong>{stats['Cảnh cáo'] || 0}</strong></li>
            <li>Kỷ luật: <strong>{stats['Kỷ luật'] || 0}</strong></li>
          </ul>
        </div>

        {/* Danh sách chi tiết */}
        <div>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th>Công việc</th>
                <th>Deadline</th>
                <th>Tiến độ</th>
                <th>Xếp hạng</th>
              </tr>
            </thead>
            <tbody>
              {evaluatedTasks.map(t => (
                <tr key={t.id}>
                  <td style={{ padding: '8px' }}>{t.title}</td>
                  <td style={{ padding: '8px' }}>{t.deadline}</td>
                  <td style={{ padding: '8px' }}>{t.progress}%</td>
                  <td style={{ padding: '8px', color: t.eval.color, fontWeight: 'bold' }}>
                    {t.eval.rank}
                  </td>
                </tr>
              ))}
              {evaluatedTasks.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '10px'}}>Không có dữ liệu trong khoảng thời gian này</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Performance;