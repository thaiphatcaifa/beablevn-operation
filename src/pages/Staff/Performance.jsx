import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const Performance = () => {
  const { user } = useAuth();
  const { staffList } = useData();

  // Lấy data mới nhất từ staffList dựa trên user.id để đảm bảo realtime
  const currentUserData = staffList.find(s => s.id === user?.id) || user;

  if (!currentUserData) return <div>Đang tải dữ liệu...</div>;

  // Tính toán lương
  const ubiBase = Number(currentUserData.ubiBase) || 0;
  const ubiPercent = Number(currentUserData.ubiPercent) || 0;
  const ubiReal = ubiBase * (ubiPercent / 100);
  
  const remuneration = currentUserData.remunerationStatus === 'Approved' 
    ? (Number(currentUserData.remuneration) || 0) 
    : 0;

  const totalIncome = ubiReal + remuneration;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#003366', borderBottom: '2px solid #003366', paddingBottom: '10px' }}>
        Hiệu suất & Thu nhập
      </h2>

      {/* CARD 1: THU NHẬP (MỚI CẬP NHẬT) */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#28a745' }}>💰 Bảng Lương (UBI & Thù Lao)</h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed #eee', paddingBottom: '10px' }}>
            <span>Định mức UBI ({ubiPercent}%):</span>
            <strong>{ubiReal.toLocaleString('vi-VN')} VNĐ</strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed #eee', paddingBottom: '10px' }}>
            <span>Thù lao (Remuneration):</span>
            <div style={{textAlign: 'right'}}>
                <strong>{remuneration.toLocaleString('vi-VN')} VNĐ</strong>
                {currentUserData.remunerationStatus === 'Pending' && (
                    <div style={{fontSize: '0.8rem', color: '#ffc107'}}>*(Đang chờ duyệt: {Number(currentUserData.remuneration).toLocaleString()} đ)</div>
                )}
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '1.1rem', color: '#003366' }}>
            <span><strong>TỔNG THỰC LÃNH:</strong></span>
            <span><strong>{totalIncome.toLocaleString('vi-VN')} VNĐ</strong></span>
        </div>
      </div>

      {/* CARD 2: CÁC VAI TRÒ ĐẢM NHẬN */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#007bff' }}>🏷️ Vai trò & Nhiệm vụ</h4>
        
        <div style={{marginBottom: '10px'}}>
            <strong>System Role:</strong> <span style={{textTransform: 'uppercase'}}>{currentUserData.role}</span>
        </div>

        <div>
            <strong>Job Titles Assigned:</strong>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px'}}>
                {currentUserData.jobTitles && currentUserData.jobTitles.length > 0 ? (
                    currentUserData.jobTitles.map((title, index) => (
                        <span key={index} style={{
                            background: '#e3f2fd', color: '#0d47a1', 
                            padding: '5px 10px', borderRadius: '15px', fontSize: '0.9rem'
                        }}>
                            {title}
                        </span>
                    ))
                ) : (
                    <span style={{color: '#999', fontStyle: 'italic'}}>Chưa được phân công vị trí cụ thể.</span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;