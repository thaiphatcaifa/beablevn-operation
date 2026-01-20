import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const FacilityCheck = () => {
  const { user } = useAuth();
  const { addFacilityLog } = useData();
  
  const [checkType, setCheckType] = useState('Đầu giờ'); 
  const [selectedArea, setSelectedArea] = useState('');

  // 1. Cấu hình danh sách hạng mục và các tùy chọn trạng thái
  const checklistConfig = [
    { 
      item: 'Máy lạnh', 
      options: ['Mát', 'Chảy nước', 'Không lạnh', 'Mở không lên'],
      goodStatus: 'Mát' 
    },
    { 
      item: 'Máy chiếu', 
      options: ['Tốt', 'Lệch khung', 'Hư hỏng'],
      goodStatus: 'Tốt'
    },
    { 
      item: 'Đèn chiếu sáng', 
      options: ['Tốt', 'Hư hỏng'],
      goodStatus: 'Tốt'
    },
    { 
      item: 'Bàn ghế', 
      options: ['Sạch & Tốt', 'Hư hỏng'],
      goodStatus: 'Sạch & Tốt'
    },
    { 
      item: 'Màn hình CC', 
      options: ['Ổn định', 'Lỗi'],
      goodStatus: 'Ổn định'
    },
    { 
      item: 'Loa', 
      options: ['Còn pin', 'Hết pin', 'Rè', 'Kết nối không ổn định'],
      goodStatus: 'Còn pin'
    },
    { 
      item: 'Cây cối', 
      options: ['Xanh tốt', 'Héo úa'],
      goodStatus: 'Xanh tốt'
    }
  ];

  const areas = [
    'Phòng 1', 'Phòng 2', 'Phòng 3', 'Phòng 4', 'Phòng 5', 
    'Phòng Lab', 'Phòng AM', 'Sảnh OA', 
    'CC Tầng G', 'CC Tầng 1', 
    'Thư Viện', 'Kho Tầng 3', 'Canteen'
  ];

  // 2. State lưu trữ toàn bộ dữ liệu tạm thời (Cache)
  // Cấu trúc: { "Đầu giờ_Phòng 1": { "Máy lạnh": "Mát", ... }, "Cuối giờ_Canteen": { ... } }
  const [tempData, setTempData] = useState({});

  // Tạo key duy nhất dựa trên Thời điểm và Khu vực
  const currentKey = `${checkType}_${selectedArea}`;

  // Lấy dữ liệu của form hiện tại từ cache
  const currentStatusMap = useMemo(() => tempData[currentKey] || {}, [tempData, currentKey]);

  // Xử lý khi tick chọn
  const handleStatusChange = (item, status) => {
    setTempData(prev => ({
      ...prev,
      [currentKey]: {
        ...(prev[currentKey] || {}), // Giữ lại các mục đã tick của phòng này
        [item]: status
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedArea) {
      alert("Vui lòng chọn khu vực kiểm tra!");
      return;
    }

    // Kiểm tra xem đã đánh giá hết các mục chưa
    const missingItems = checklistConfig.filter(config => !currentStatusMap[config.item]);
    if (missingItems.length > 0) {
      alert(`Bạn chưa kiểm tra: ${missingItems.map(c => c.item).join(', ')}`);
      return;
    }

    // Gửi log
    checklistConfig.forEach(config => {
      addFacilityLog({
        staffName: user.name,
        type: checkType,
        area: selectedArea,
        item: config.item,
        status: currentStatusMap[config.item],
        time: new Date()
      });
    });

    alert(`Đã gửi báo cáo kiểm tra ${checkType} tại khu vực ${selectedArea}!`);
    
    // Xóa dữ liệu tạm của phòng này sau khi gửi thành công (để reset form)
    setTempData(prev => {
      const newData = { ...prev };
      delete newData[currentKey]; 
      return newData;
    });
  };

  return (
    <div>
      <h2 style={{ color: '#003366' }}>Kiểm tra CSVC & Tiện ích</h2>
      
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Thời điểm:</label>
          <select 
            value={checkType} 
            onChange={e => setCheckType(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Đầu giờ">☀️ Đầu giờ (Start Shift)</option>
            <option value="Cuối giờ">🌙 Cuối giờ (End Shift)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Khu vực:</label>
          <select 
            value={selectedArea} 
            onChange={e => setSelectedArea(e.target.value)}
            required
            style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
          >
            <option value="">-- Chọn phòng / khu vực --</option>
            {areas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedArea ? (
        <p style={{ fontStyle: 'italic', color: '#666' }}>Vui lòng chọn khu vực để hiện danh sách kiểm tra...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <thead>
              <tr style={{ background: '#eee', textAlign: 'left' }}>
                <th style={{ width: '25%' }}>Hạng mục</th>
                <th>Tình trạng hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {checklistConfig.map((config) => (
                <tr key={config.item}>
                  <td style={{ fontWeight: '500' }}>{config.item}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {config.options.map(option => {
                        // Xác định màu sắc: Tốt -> Xanh, Còn lại -> Đỏ/Cam
                        const isGood = option === config.goodStatus;
                        const color = isGood ? 'green' : '#d9534f';
                        
                        return (
                          <label key={option} style={{ cursor: 'pointer', color: color }}>
                            <input 
                              type="radio" 
                              name={`${currentKey}_${config.item}`} // Name unique để không bị trùng radio group
                              value={option} 
                              checked={currentStatusMap[config.item] === option}
                              onChange={() => handleStatusChange(config.item, option)} 
                              style={{ marginRight: '5px' }}
                            /> 
                            <span style={{ fontWeight: isGood ? 'bold' : 'normal' }}>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button 
            type="submit"
            style={{ 
              background: '#003366', color: 'white', border: 'none', 
              padding: '12px 30px', borderRadius: '5px', 
              fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 3px 6px rgba(0,0,0,0.2)'
            }}
          >
            GỬI BÁO CÁO
          </button>
        </form>
      )}
    </div>
  );
};

export default FacilityCheck;