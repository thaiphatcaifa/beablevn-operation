import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const FacilityCheck = () => {
  const { user } = useAuth();
  const { addFacilityLog } = useData();
  
  const [checkType, setCheckType] = useState('Đầu giờ'); 
  const [selectedArea, setSelectedArea] = useState('');

  // --- CẤU HÌNH CHECKLIST THEO KHU VỰC (MỚI) ---
  const defaultChecklist = [
    { item: 'Máy lạnh', options: ['Mát', 'Chảy nước', 'Không lạnh', 'Hỏng'], goodStatus: 'Mát' },
    { item: 'Máy chiếu', options: ['Tốt', 'Lệch khung', 'Hư hỏng'], goodStatus: 'Tốt' },
    { item: 'Đèn chiếu sáng', options: ['Tốt', 'Hư hỏng'], goodStatus: 'Tốt' },
    { item: 'Bàn ghế', options: ['Sạch & Tốt', 'Hư hỏng'], goodStatus: 'Sạch & Tốt' },
    { item: 'Màn hình CC', options: ['Ổn định', 'Lỗi'], goodStatus: 'Ổn định' },
    { item: 'Loa', options: ['Còn pin', 'Hết pin', 'Rè'], goodStatus: 'Còn pin' },
    { item: 'Cây cối', options: ['Xanh tốt', 'Héo úa'], goodStatus: 'Xanh tốt' }
  ];

  const getChecklistForArea = (area) => {
      // 1. CANTEEN (Đã xóa Máy lạnh, Máy chiếu, Màn hình CC. Thêm Sân, Quạt, Quầy, Kệ)
      if (area === 'Canteen') {
          return [
              { item: 'Đèn chiếu sáng', options: ['Tốt', 'Hư hỏng'], goodStatus: 'Tốt' },
              { item: 'Bàn ghế', options: ['Sạch & Tốt', 'Hư hỏng'], goodStatus: 'Sạch & Tốt' },
              { item: 'Loa', options: ['Còn pin', 'Hết pin', 'Rè'], goodStatus: 'Còn pin' },
              { item: 'Cây cối', options: ['Xanh tốt', 'Héo úa'], goodStatus: 'Xanh tốt' },
              
              { item: 'Sân', options: ['Sạch sẽ', 'Chưa đổ rác', 'Bừa bộn'], goodStatus: 'Sạch sẽ' },
              { item: 'Quạt', options: ['Tốt', 'Bám bụi', 'Hư hỏng'], goodStatus: 'Tốt' },
              { item: 'Quầy pha chế', options: ['Sạch sẽ', 'Chưa cất nguyên liệu', 'Chưa rút điện', 'Bừa bộn'], goodStatus: 'Sạch sẽ' },
              { item: 'Kệ nguyên liệu', options: ['Sạch sẽ', 'Chưa lau dọn'], goodStatus: 'Sạch sẽ' }
          ];
      }
      
      // 2. KHO TẦNG 3 (Đã xóa Máy chiếu, Màn hình CC. Thêm Sàn, Kệ tủ, Tủ mát, Tủ đông)
      if (area === 'Kho Tầng 3') {
          return [
              { item: 'Máy lạnh', options: ['Mát', 'Chảy nước', 'Không lạnh', 'Hỏng'], goodStatus: 'Mát' },
              { item: 'Đèn chiếu sáng', options: ['Tốt', 'Hư hỏng'], goodStatus: 'Tốt' },
              { item: 'Bàn ghế', options: ['Sạch & Tốt', 'Hư hỏng'], goodStatus: 'Sạch & Tốt' },
              { item: 'Loa', options: ['Còn pin', 'Hết pin', 'Rè'], goodStatus: 'Còn pin' },
              { item: 'Cây cối', options: ['Xanh tốt', 'Héo úa'], goodStatus: 'Xanh tốt' },
              
              { item: 'Sàn', options: ['Sạch sẽ', 'Chưa lau dọn'], goodStatus: 'Sạch sẽ' },
              { item: 'Kệ tủ', options: ['Sạch sẽ', 'Bừa bộn'], goodStatus: 'Sạch sẽ' },
              { item: 'Tủ mát', options: ['Đã kiểm HSD và lau dọn', 'Chưa kiểm HSD', 'Chưa lau dọn'], goodStatus: 'Đã kiểm HSD và lau dọn' },
              { item: 'Tủ đông', options: ['Đã kiểm HSD', 'Chưa kiểm'], goodStatus: 'Đã kiểm HSD' }
          ];
      }

      // 3. PHÒNG LAB (Đã xóa Máy chiếu, Màn hình CC, Loa. Thêm PC, Tai nghe, Phím)
      if (area === 'Phòng Lab') {
          return [
              { item: 'Máy lạnh', options: ['Mát', 'Chảy nước', 'Không lạnh', 'Hỏng'], goodStatus: 'Mát' },
              { item: 'Đèn chiếu sáng', options: ['Tốt', 'Hư hỏng'], goodStatus: 'Tốt' },
              { item: 'Bàn ghế', options: ['Sạch & Tốt', 'Hư hỏng'], goodStatus: 'Sạch & Tốt' },
              { item: 'Cây cối', options: ['Xanh tốt', 'Héo úa'], goodStatus: 'Xanh tốt' },
              
              { item: 'Máy PC', options: ['Tốt', 'Hư hỏng', 'Mất'], goodStatus: 'Tốt' },
              { item: 'Tai nghe', options: ['Tốt', 'Hư hỏng', 'Mất'], goodStatus: 'Tốt' },
              { item: 'Bàn phím', options: ['Tốt', 'Hư hỏng', 'Mất'], goodStatus: 'Tốt' }
          ];
      }

      return defaultChecklist;
  };

  const areas = ['Phòng 1', 'Phòng 2', 'Phòng 3', 'Phòng Lab', 'Sảnh OA', 'CC Tầng G', 'Kho Tầng 3', 'Canteen'];

  const [tempData, setTempData] = useState({});
  const currentKey = `${checkType}_${selectedArea}`;
  const currentStatusMap = useMemo(() => tempData[currentKey] || {}, [tempData, currentKey]);
  const currentChecklist = useMemo(() => getChecklistForArea(selectedArea), [selectedArea]);

  const handleStatusChange = (item, status) => {
    setTempData(prev => ({
      ...prev,
      [currentKey]: { ...(prev[currentKey] || {}), [item]: status }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedArea) return alert("Vui lòng chọn khu vực!");

    // CHECK ALL ITEMS logic
    const missingItems = currentChecklist.filter(config => !currentStatusMap[config.item]);
    if (missingItems.length > 0) {
      alert(`Bạn chưa kiểm tra: ${missingItems.map(c => c.item).join(', ')}. Vui lòng hoàn thành hết trước khi gửi!`);
      return;
    }

    // Submit to server
    currentChecklist.forEach(config => {
      addFacilityLog({
        staffName: user.name,
        type: checkType,
        area: selectedArea,
        item: config.item,
        status: currentStatusMap[config.item]
      });
    });

    alert("✅ Báo cáo đã gửi thành công về máy chủ!");
    
    // Clear temp data
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
          <select value={checkType} onChange={e => setCheckType(e.target.value)} style={{ padding: '5px' }}>
            <option value="Đầu giờ">☀️ Đầu giờ</option>
            <option value="Cuối giờ">🌙 Cuối giờ</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Khu vực:</label>
          <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} required style={{ padding: '5px', minWidth: '200px' }}>
            <option value="">-- Chọn phòng --</option>
            {areas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
      </div>

      {!selectedArea ? (
        <p style={{ fontStyle: 'italic', color: '#666' }}>Chọn khu vực để hiện danh sách kiểm tra...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px', background: 'white' }}>
            <thead>
              <tr style={{ background: '#eee', textAlign: 'left' }}>
                <th style={{ width: '30%' }}>Hạng mục</th>
                <th>Trạng thái (Bắt buộc chọn hết)</th>
              </tr>
            </thead>
            <tbody>
              {currentChecklist.map((config) => (
                <tr key={config.item}>
                  <td style={{ fontWeight: '500' }}>{config.item}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {config.options.map(option => {
                        const isGood = option === config.goodStatus;
                        const color = isGood ? 'green' : '#d9534f';
                        return (
                          <label key={option} style={{ cursor: 'pointer', color: color }}>
                            <input 
                              type="radio" 
                              name={`${currentKey}_${config.item}`} 
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
          <button type="submit" style={{ background: '#003366', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            GỬI BÁO CÁO
          </button>
        </form>
      )}
    </div>
  );
};

export default FacilityCheck;