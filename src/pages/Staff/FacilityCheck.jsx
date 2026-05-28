import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// --- ICON MINIMALIST ĐỒNG BỘ ---
const Icons = {
  Facility: () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
};

const FacilityCheck = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // NẠP DỮ LIỆU KHU VỰC (AREAS) TỪ CONTEXT
  const { 
      areas, 
      addFacilityLog, 
      updateTask, 
      updateTaskProgress, 
      autoDisciplineRules, 
      tasks, 
      addDisciplineRecord 
  } = useData();

  // --- KIỂM TRA LUỒNG ĐIỂM DANH (NAVIGATE TỪ ATTENDANCE) ---
  const stateParams = location.state || {};
  const isAttendanceFlow = stateParams.isAttendanceFlow || false;
  const action = stateParams.action || ''; // 'checkin' hoặc 'checkout'
  const targetTask = stateParams.task || null;
  
  const [checkType, setCheckType] = useState(isAttendanceFlow ? (action === 'checkin' ? 'Đầu giờ' : 'Cuối giờ') : 'Đầu giờ'); 
  const [selectedArea, setSelectedArea] = useState(isAttendanceFlow && targetTask?.area ? targetTask.area : '');

  // --- TẢI CHECKLIST ĐỘNG THEO KHU VỰC ĐÃ CHỌN TỪ FIREBASE ---
  const selectedAreaObj = useMemo(() => {
      return areas.find(a => a.name === selectedArea);
  }, [areas, selectedArea]);

  const currentChecklist = useMemo(() => {
      return selectedAreaObj && selectedAreaObj.checklist ? selectedAreaObj.checklist : [];
  }, [selectedAreaObj]);

  const [tempData, setTempData] = useState({});
  const currentKey = `${checkType}_${selectedArea}`;
  const currentStatusMap = useMemo(() => tempData[currentKey] || {}, [tempData, currentKey]);

  const handleStatusChange = (item, status) => {
    setTempData(prev => ({
      ...prev,
      [currentKey]: { ...(prev[currentKey] || {}), [item]: status }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedArea) return alert("Vui lòng chọn khu vực!");
    if (currentChecklist.length === 0) return alert("Khu vực này chưa có hạng mục kiểm tra nào được cấu hình!");

    // Yêu cầu tích đủ các thiết bị
    const missingItems = currentChecklist.filter(config => !currentStatusMap[config.item]);
    if (missingItems.length > 0) {
      alert(`Bạn chưa kiểm tra: ${missingItems.map(c => c.item).join(', ')}. Vui lòng hoàn thành hết trước khi gửi!`);
      return;
    }

    // Submit báo cáo CSVT
    currentChecklist.forEach(config => {
      addFacilityLog({
        staffName: user.name,
        type: checkType,
        area: selectedArea,
        item: config.item,
        status: currentStatusMap[config.item],
        timestamp: new Date().toISOString()
      });
    });

    // --- LOGIC: TỰ ĐỘNG CHỐT ĐIỂM DANH KHI NẰM TRONG LUỒNG ATTENDANCE FLOW ---
    if (isAttendanceFlow && targetTask) {
        const exactNow = new Date();

        // 1. Xử lý Check-in
        if (action === 'checkin') {
            const startTime = new Date(targetTask.startTime);
            const diffMinutes = (exactNow - startTime) / 60000; 

            let updateData = { 
                ...targetTask,
                checkInTime: exactNow.toISOString(),
                status: 'in_progress' 
            };
            let msg = "Báo cáo CSVT hoàn tất và Check-in vào ca thành công!";

            if (diffMinutes > 3) {
                updateData.checkInStatus = 'Late';
                updateData.lateReason = 'Trễ quá 3 phút';
                msg = "Báo cáo CSVT thành công!\nCẢNH BÁO: Bạn đã check-in TRỄ quá 3 phút! Hệ thống đã ghi nhận.";

                // Check luật kỷ luật tự động
                const lateRule = autoDisciplineRules?.find(r => r.triggerType === 'late_attendance');
                if (lateRule) {
                    const pastLates = tasks.filter(t => t.assigneeId === user.id && t.checkInStatus === 'Late').length;
                    const currentLateCount = pastLates + 1; 

                    if (currentLateCount > 0 && currentLateCount % lateRule.threshold === 0) {
                        addDisciplineRecord({
                            staffId: user.id,
                            disciplineId: lateRule.disciplineId,
                            disciplineName: lateRule.disciplineName,
                            taskTitle: `Điểm danh trễ lần thứ ${currentLateCount} (Ca: ${targetTask.title})`,
                            date: exactNow.toISOString(),
                            isAutoAssigned: true 
                        });
                        msg += `\n\n🚨 LƯU Ý: Bạn đã tích lũy đủ ${lateRule.threshold} lần đi trễ. Hệ thống tự động kích hoạt kỷ luật: ${lateRule.disciplineName}.`;
                    }
                }
            } else {
                updateData.checkInStatus = 'OnTime';
            }

            updateTask(targetTask.id, updateData);
            alert(msg);
        } 
        
        // 2. Xử lý Check-out
        else if (action === 'checkout') {
            updateTaskProgress(targetTask.id, 100, "Check-out attendance");
            updateTask(targetTask.id, { 
                ...targetTask, 
                checkOutTime: exactNow.toISOString(),
                status: 'completed'
            });
            alert("Báo cáo CSVT cuối giờ hoàn tất. Đã Check-out tan ca thành công!");
        }

        // Quay lại trang điểm danh sau khi xong xuôi
        navigate(-1);
        return;
    }

    // Nếu chỉ báo cáo CSVT thông thường
    alert("✅ Báo cáo đã gửi thành công về máy chủ!");
    setTempData(prev => {
      const newData = { ...prev };
      delete newData[currentKey]; 
      return newData;
    });
  };

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box' }}>
      <style>{`
          .filter-modern {
              padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none;
              font-weight: 600; color: #111827; background: #ffffff; width: 100%; box-sizing: border-box;
              font-size: 0.95rem; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
              appearance: none; -webkit-appearance: none;
              background-image: url('data:image/svg+xml;utf8,<svg fill="%239ca3af" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
              background-repeat: no-repeat; background-position: right 12px center; padding-right: 40px;
          }
          .filter-modern:focus { border-color: #003366; box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.1); }
          .filter-modern:disabled { background: #f1f5f9; cursor: not-allowed; color: #64748b; }
          
          .radio-pill {
              padding: 10px 16px; border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
              border: 1px solid #e2e8f0; transition: all 0.2s; background: #f8fafc; color: #475569;
              display: inline-flex; align-items: center; justify-content: center;
              user-select: none; -webkit-tap-highlight-color: transparent;
          }
          .radio-pill:hover:not(.selected-good):not(.selected-bad) { background: #f1f5f9; border-color: #cbd5e1; }
          .radio-pill input[type="radio"] { display: none; }
          
          .radio-pill.selected-good { background: #10b981; color: white; border-color: #10b981; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }
          .radio-pill.selected-bad { background: #ef4444; color: white; border-color: #ef4444; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2); }
          
          .checklist-row { display: flex; flex-direction: column; gap: 12px; padding: 20px 0; border-bottom: 1px dashed #e2e8f0; }
          .checklist-row:last-child { border-bottom: none; padding-bottom: 0; }
          
          @media (min-width: 600px) {
              .checklist-row { flex-direction: row; justify-content: space-between; align-items: flex-center; }
              .item-label { width: 35%; flex-shrink: 0; margin-top: 8px; }
          }
          
          .btn-submit { background: #003366; color: white; border: none; padding: 16px; border-radius: 12px; font-size: 1rem; font-weight: 800; cursor: pointer; width: 100%; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0, 51, 102, 0.2); letter-spacing: 0.02em; margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 8px;}
          .btn-submit:hover { background: #002244; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0, 51, 102, 0.25); }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '12px', display: 'flex', color: '#003366' }}>
              <Icons.Facility />
          </div>
          <div>
              <h2 style={{ margin: 0, color: '#111827', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>CƠ SỞ VẬT CHẤT</h2>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>Báo cáo kiểm tra thiết bị định kỳ</span>
          </div>
      </div>
      
      {isAttendanceFlow && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#0369a1', fontSize: '0.95rem', fontWeight: '600' }}>
              ⚠️ Đang trong luồng Điểm danh: Hoàn tất kiểm tra thiết bị tại <b>{selectedArea}</b> để hệ thống tự động ghi nhận {action === 'checkin' ? 'Vào ca' : 'Tan ca'} cho bạn.
          </div>
      )}

      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Thời điểm báo cáo</label>
              <select value={checkType} onChange={e => setCheckType(e.target.value)} className="filter-modern" disabled={isAttendanceFlow}>
                <option value="Đầu giờ">☀️ Ca sáng / Đầu giờ</option>
                <option value="Cuối giờ">🌙 Ca tối / Cuối giờ</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '700', color: '#475569', marginBottom: '8px', fontSize: '0.9rem' }}>Khu vực kiểm tra</label>
              <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} required className="filter-modern" disabled={isAttendanceFlow}>
                <option value="" disabled>-- Vui lòng chọn khu vực --</option>
                {areas && areas.map(area => <option key={area.id} value={area.name}>{area.name}</option>)}
              </select>
            </div>
        </div>
      </div>

      {!selectedArea ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', background: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '3rem', opacity: 0.8 }}>📋</div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#475569' }}>Chưa chọn khu vực</div>
            <div style={{ fontSize: '0.9rem' }}>Vui lòng chọn khu vực làm việc ở phía trên để tải danh sách thiết bị.</div>
        </div>
      ) : currentChecklist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ea580c', background: '#fff7ed', borderRadius: '20px', border: '1px dashed #fed7aa', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>Chưa có cấu hình cho khu vực này!</div>
            <div style={{ fontSize: '0.9rem' }}>Vui lòng liên hệ Admin để thêm hạng mục kiểm tra cho khu vực <b>{selectedArea}</b>.</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '28px 24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -2px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', fontWeight: '800' }}>Checklist kiểm tra: <span style={{color: '#0369a1'}}>{selectedArea}</span></h3>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {currentChecklist.map((config, index) => (
                <div key={index} className="checklist-row">
                  <div className="item-label" style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>
                      {config.item}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {Array.isArray(config.options) && config.options.map(option => {
                        const isGood = option === config.goodStatus;
                        const isSelected = currentStatusMap[config.item] === option;
                        
                        let pillClass = "radio-pill";
                        if (isSelected) {
                            pillClass += isGood ? " selected-good" : " selected-bad";
                        }

                        return (
                          <label key={option} className={pillClass}>
                            <input 
                              type="radio" 
                              name={`${currentKey}_${config.item}`} 
                              value={option} 
                              checked={isSelected}
                              onChange={() => handleStatusChange(config.item, option)} 
                            /> 
                            {option}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn-submit">
               <Icons.Check /> {isAttendanceFlow ? "Xác nhận & Điểm danh" : "Xác nhận gửi Báo cáo"}
            </button>
        </form>
      )}
    </div>
  );
};

export default FacilityCheck;