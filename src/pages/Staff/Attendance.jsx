import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/helpers';

const Attendance = () => {
  const { user } = useAuth();
  const { addAttendance, attendanceLogs, staffList, shifts } = useData();
  const [currentShift, setCurrentShift] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Lấy thông tin Ca làm việc của User hiện tại
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const currentUserData = staffList.find(s => s.id === user.id);
    if (currentUserData && currentUserData.shiftId) {
      const shift = shifts.find(s => String(s.id) === String(currentUserData.shiftId));
      setCurrentShift(shift);
    }
    return () => clearInterval(timer);
  }, [user.id, staffList, shifts]);

  const getTodayWithTime = (timeString) => {
    if (!timeString) return new Date();
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  };

  const handleCheck = (type) => {
    if (!currentShift) {
      alert("LỖI: Bạn chưa được xếp ca làm việc. Vui lòng liên hệ Admin!");
      return;
    }

    const now = new Date();
    const startTime = getTodayWithTime(currentShift.start);
    const endTime = getTodayWithTime(currentShift.end);
    let statusNote = "Đúng giờ";

    // --- LOGIC CHECK-IN ---
    if (type === 'Check-in') {
      const diffMinutes = (now - startTime) / 60000; 
      if (diffMinutes > 3) {
        const lateMins = Math.floor(diffMinutes);
        statusNote = `Trễ ${lateMins} phút`;
        alert(`⚠️ THÔNG BÁO: Bạn đã đi trễ ${lateMins} phút so với giờ bắt đầu (${currentShift.start}).\nHệ thống vẫn ghi nhận Check-in.`);
      } else {
        alert("✅ Check-in thành công! Chúc bạn một ngày làm việc tốt lành.");
      }
    }

    // --- LOGIC CHECK-OUT ---
    if (type === 'Check-out') {
      const diffMinutes = (now - endTime) / 60000;
      if (diffMinutes < -10) {
        alert(`⛔ KHÔNG THỂ CHECK-OUT!\n\nChưa đến giờ về. Bạn chỉ được phép về sớm tối đa 10 phút trước giờ kết thúc ca (${currentShift.end}).`);
        return; 
      }
      if (diffMinutes > 15) {
        alert(`⛔ ĐÃ ĐÓNG CỔNG CHECK-OUT!\n\nBạn đã quá hạn check-out hơn 15 phút so với giờ kết thúc ca.\nHệ thống từ chối ghi nhận.\nVui lòng gửi giải trình cho quản lý trong vòng 24 giờ.`);
        return; 
      }
      alert("✅ Check-out thành công! Hẹn gặp lại.");
    }

    addAttendance({
      staffName: user.name,
      staffId: user.id,
      type: type,
      shiftName: currentShift.name,
      statusNote: statusNote, 
      time: now
    });
  };

  const myHistory = attendanceLogs.filter(l => l.staffId === user.id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#003366' }}>Điểm danh Nhân sự</h2>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E67E22', background: '#fff', padding: '5px 15px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          {currentTime.toLocaleTimeString('vi-VN')}
        </div>
      </div>
      
      {currentShift ? (
        <div style={{ background: '#e6f7ff', padding: '20px', borderRadius: '8px', border: '1px solid #91d5ff', marginBottom: '25px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#0050b3' }}>Ca làm việc hiện tại: {currentShift.name}</h4>
          <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
            ⏰ Thời gian: <strong>{currentShift.start}</strong> - <strong>{currentShift.end}</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>
            <li>Check-in trễ quá <strong>3 phút</strong> sẽ bị hệ thống ghi nhận là <strong>Trễ</strong>.</li>
            <li>Được phép Check-out sớm tối đa <strong>10 phút</strong>.</li>
            <li>Cổng Check-out sẽ <strong>đóng</strong> sau <strong>15 phút</strong> kết thúc ca.</li>
          </ul>
        </div>
      ) : (
        <div style={{ padding: '20px', background: '#fff1f0', border: '1px solid #ffccc7', color: '#cf1322', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
          ⚠️ Bạn chưa được phân công Ca làm việc. Vui lòng liên hệ Admin.
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <button 
          onClick={() => handleCheck('Check-in')} 
          disabled={!currentShift}
          style={{ 
            padding: '20px', 
            background: !currentShift ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: !currentShift ? 'not-allowed' : 'pointer', 
            flex: 1, 
            fontSize: '1.2rem', 
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #1e7e34',
            transition: 'transform 0.1s'
          }}
        >
          CHECK-IN (Vào ca)
        </button>
        <button 
          onClick={() => handleCheck('Check-out')}
          disabled={!currentShift}
          style={{ 
            padding: '20px', 
            background: !currentShift ? '#ccc' : '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: !currentShift ? 'not-allowed' : 'pointer', 
            flex: 1, 
            fontSize: '1.2rem', 
            fontWeight: 'bold',
            boxShadow: '0 4px 0 #bd2130',
            transition: 'transform 0.1s'
          }}
        >
          CHECK-OUT (Tan ca)
        </button>
      </div>

      <h3>Lịch sử chấm công</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {myHistory.length === 0 && <p style={{ fontStyle: 'italic', color: '#999' }}>Chưa có dữ liệu điểm danh.</p>}
        {myHistory.slice().reverse().map((h, i) => {
          // --- SỬA LỖI Ở ĐÂY: Kiểm tra nếu statusNote không tồn tại thì gán chuỗi rỗng ---
          const safeNote = h.statusNote || 'Dữ liệu cũ';
          const isLate = safeNote.includes('Trễ');
          
          return (
            <li key={i} style={{ padding: '15px', borderBottom: '1px solid #eee', background: '#fff', marginBottom: '10px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: h.type === 'Check-in' ? '#28a745' : '#dc3545' }}>{h.type}</strong>
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '3px' }}>
                  {formatDate(h.time)} - Ca: {h.shiftName || 'N/A'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '5px 10px', 
                  borderRadius: '15px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold',
                  background: isLate ? '#fff1f0' : '#f6ffed',
                  color: isLate ? '#cf1322' : '#389e0d',
                  border: isLate ? '1px solid #ffccc7' : '1px solid #b7eb8f'
                }}>
                  {safeNote}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Attendance;