import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

// --- BỘ ICON MINIMALIST (ĐÃ FIX LỖI TÊN ICON) ---
const Icons = {
  Report: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>),
  Finance: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#0369a1" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Task: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Warning: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ea580c" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>),
  Facility: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>),
  Schedule: () => (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Print: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>),
  ArrowRight: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>),
  Back: () => (<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>),
  Lock: () => (<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>),
  ChevronDown: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>),
  ChevronRight: () => (<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7-7" /></svg>)
};

// --- HELPER FUNCTIONS ---
const parseAmount = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    const clean = String(val).replace(/,/g, '').replace(/\s/g, '');
    const num = Number(clean);
    return isNaN(num) ? 0 : num;
};

const isSameDay = (d1, d2) => d1 && d2 && d1.toDateString() === d2.toDateString();
const isSameMonth = (d1, d2) => d1 && d2 && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
const isSameWeek = (d1, d2) => {
    if (!d1 || !d2) return false;
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
    return `${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}`;
};

const toDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const calculateWorkHoursDecimal = (schedStart, schedEnd, actualCheckIn, actualCheckOut, isAdminEdited = false) => {
    if (!schedStart || !schedEnd || !actualCheckIn || !actualCheckOut) return 0;
    const sStart = new Date(schedStart);
    const sEnd = new Date(schedEnd);
    const aIn = new Date(actualCheckIn);
    const aOut = new Date(actualCheckOut);
    let diffMs = 0;
    
    if (isAdminEdited) {
        // Lấy khoảng thời gian thực tế Admin tính (Check-out trừ Check-in) không bị giới hạn
        diffMs = aOut - aIn;
    } else {
        let calcStart = aIn > sStart ? aIn : sStart;
        let calcEnd;
        if (aOut > sEnd) calcEnd = sEnd;
        else {
            const diffMinutesEarly = (sEnd - aOut) / 60000;
            calcEnd = diffMinutesEarly <= 10 ? sEnd : aOut;
        }
        diffMs = calcEnd - calcStart;
    }
    
    if (diffMs < 0) return 0;
    return Math.floor(diffMs / 60000) / 60; 
};

const calculateWorkHours = (schedStart, schedEnd, actualCheckIn, actualCheckOut, isAdminEdited = false) => {
    const dec = calculateWorkHoursDecimal(schedStart, schedEnd, actualCheckIn, actualCheckOut, isAdminEdited);
    if (dec === 0) return '0h 00p';
    const h = Math.floor(dec);
    const m = Math.round((dec - h) * 60);
    return `${h}h ${m < 10 ? '0' + m : m}p`;
};

const getMatchedRate = (staffRems, task) => {
    if (!staffRems || !Array.isArray(staffRems)) return 0;
    const matched = staffRems.find(rem => {
        if (rem.position && String(rem.position).trim() !== '') {
            if (String(rem.position).trim().toLowerCase() !== String(task.assignedRole || '').trim().toLowerCase()) return false;
        }
        const rCode = String(rem.jobCode !== undefined ? rem.jobCode : (rem.keywords || '')).trim();
        if (rCode !== '') {
            const codes = rCode.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
            const tCode = String(task.jobCode || '').trim().toLowerCase();
            const tTitle = String(task.title || '').trim().toLowerCase();
            const isMatch = codes.some(c => tCode === c || tTitle.includes(c));
            if (!isMatch) return false;
        }
        return true;
    });
    return matched ? parseAmount(matched.amount) : 0;
};

const generateMonthYearOptions = () => {
    const options = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        options.push({ value: `${year}-${String(month).padStart(2, '0')}`, label: `Tháng ${month}/${year}` });
        d.setMonth(d.getMonth() - 1);
    }
    return options;
};
const monthYearOptions = generateMonthYearOptions();

const Reports = () => {
  const { user } = useAuth();
  const { tasks, staffList, facilityLogs, updateTask, payrollRecords, savePayrollRecord, areas, evaluateTask } = useData();
  
  const [activeTab, setActiveTab] = useState('overview'); 

  // Filters
  const [attendanceFilter, setAttendanceFilter] = useState('all'); 
  const [attendanceStaffFilter, setAttendanceStaffFilter] = useState('all'); 
  const [attendanceDayFilter, setAttendanceDayFilter] = useState('all'); 
  const [attendanceMonthFilter, setAttendanceMonthFilter] = useState('all'); 
  const [attendanceYearFilter, setAttendanceYearFilter] = useState('all');

  // Thêm state cấu hình sắp xếp cho báo cáo chấm công
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [editAttForm, setEditAttForm] = useState({ checkIn: '', checkOut: '', reason: '' });

  // [MỚI] Phân trang + chọn hàng loạt cho Báo cáo Chấm công
  const ATT_ITEMS_PER_PAGE = 50;
  const [attendancePage, setAttendancePage] = useState(1);
  const [selectedAttIds, setSelectedAttIds] = useState([]);
  const [bulkReason, setBulkReason] = useState('');

  const [financeStaffFilter, setFinanceStaffFilter] = useState('all'); 
  const [financeMonthFilter, setFinanceMonthFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selYear, selMonth] = (financeMonthFilter || '').split('-');
  const selectedFinanceMonth = new Date(selYear, selMonth - 1, 1);

  const [facilityAreaFilter, setFacilityAreaFilter] = useState('all'); 
  const [facilityStaffFilter, setFacilityStaffFilter] = useState('all'); 
  const [facilityTimeFilter, setFacilityTimeFilter] = useState('month'); 
  const [facilityMonthFilter, setFacilityMonthFilter] = useState('all'); 
  
  // Trạng thái mở rộng cho danh sách báo cáo Cơ sở vật chất
  const [expandedFacilityGroups, setExpandedFacilityGroups] = useState([]);
  
  const [taskStaffFilter, setTaskStaffFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const daysOfWeek = [
      { key: 'Mon', label: 'Thứ 2', val: 1 }, { key: 'Tue', label: 'Thứ 3', val: 2 }, { key: 'Wed', label: 'Thứ 4', val: 3 },
      { key: 'Thu', label: 'Thứ 5', val: 4 }, { key: 'Fri', label: 'Thứ 6', val: 5 }, { key: 'Sat', label: 'Thứ 7', val: 6 },
      { key: 'Sun', label: 'Chủ Nhật', val: 0 }
  ];

  const isChief = user?.role === 'chief';

  const handlePrint = () => { window.print(); };

  // ==============================================================
  // XUẤT EXCEL (.xls) — KHÔNG cần thư viện ngoài.
  // Tạo file HTML-table mà Excel mở trực tiếp được (kèm BOM UTF-8 để giữ tiếng Việt).
  // Mỗi lần xuất = dữ liệu của TAB báo cáo đang mở.
  // ==============================================================
  const downloadXls = (headers, rows, filename, sheetTitle) => {
      const esc = (v) => String(v === undefined || v === null ? '' : v)
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const headHtml = `<tr>${headers.map(h => `<th style="background:#2B6830;color:#ffffff;font-weight:bold;border:1px solid #999;padding:6px;">${esc(h)}</th>`).join('')}</tr>`;
      const bodyHtml = rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #ccc;padding:5px;mso-number-format:'\\@';">${esc(c)}</td>`).join('')}</tr>`).join('');
      const titleHtml = sheetTitle ? `<tr><td colspan="${headers.length}" style="font-size:15px;font-weight:bold;color:#2B6830;padding:8px;">${esc(sheetTitle)}</td></tr>` : '';
      const html =
          `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">` +
          `<head><meta charset="UTF-8"></head><body>` +
          `<table border="1">${titleHtml}${headHtml}${bodyHtml}</table>` +
          `</body></html>`;
      const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
      const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('vi-VN') : '';
      const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('vi-VN') : '';
      const monthTag = `${String(selMonth).padStart(2, '0')}-${selYear}`;

      if (activeTab === 'finance') {
          const headers = ['STT', 'Nhân sự', 'Thông tin', 'Thu nhập Gộp (Gross)', 'BHXH (10.5%)', 'Thuế TNCN (5%)', 'Thực nhận (Net)'];
          const rows = financeRows.map((r, i) => [
              i + 1, r.item, r.type,
              Math.round(r.gross || 0), Math.round(r.bhxh || 0), Math.round(r.tax || 0),
              Math.round(r.net || r.amount || 0)
          ]);
          rows.push(['', 'TỔNG CỘNG', '', '', '', '', Math.round(totalEstimatedCost)]);
          return downloadXls(headers, rows, `BaoCao_TaiChinh_T${monthTag}.xls`, `BÁO CÁO TÀI CHÍNH — Tháng ${Number(selMonth)}/${selYear}`);
      }

      if (activeTab === 'facility') {
          const headers = ['STT', 'Khu vực', 'Loại', 'Thời gian', 'Số hạng mục', 'Nhân sự báo cáo', 'Chi tiết hạng mục'];
          const rows = groupedFacilityLogs.map((g, i) => [
              i + 1, g.area || '', g.type || '', formatDateTime(g.timestamp),
              (g.items || []).length, g.staffName || 'Unknown',
              (g.items || []).map(it => `${it.itemName || it.item || it.category || 'Hạng mục'}: ${it.status || it.note || 'OK'}`).join(' | ')
          ]);
          return downloadXls(headers, rows, `BaoCao_CoSoVatChat.xls`, 'BÁO CÁO CƠ SỞ VẬT CHẤT');
      }

      if (activeTab === 'attendance') {
          const headers = ['STT', 'Nhân sự', 'Ca làm việc', 'Ngày', 'Giờ vào (lịch)', 'Giờ ra (lịch)', 'Check-in thực tế', 'Check-out thực tế', 'Số giờ công', 'Trạng thái', 'Tiến độ', 'Admin sửa'];
          const rows = sortedAttendance.map((t, i) => {
              const hrs = calculateWorkHoursDecimal(t.startTime, t.endTime, t.checkInTime, t.checkOutTime, t.adminEdited);
              const completed = t.status === 'completed' || t.progress === 100;
              return [
                  i + 1, t.assigneeName || '', t.title || '', fmtDate(t.startTime),
                  fmtDateTime(t.startTime), fmtDateTime(t.endTime),
                  t.checkInTime ? fmtDateTime(t.checkInTime) : 'Chưa check-in',
                  t.checkOutTime ? fmtDateTime(t.checkOutTime) : 'Chưa check-out',
                  hrs ? hrs.toFixed(2) : '0', completed ? 'Đã chấm công' : 'Chưa hoàn thành',
                  `${t.progress || 0}%`, t.adminEdited ? `Có: ${t.adminEditReason || ''}` : ''
              ];
          });
          return downloadXls(headers, rows, `BaoCao_ChamCong.xls`, 'BÁO CÁO CHẤM CÔNG');
      }

      if (activeTab === 'tasks') {
          const headers = ['STT', 'Nhiệm vụ', 'Phụ trách', 'Hạn chót', 'Tiến độ', 'Trạng thái', 'Đánh giá kết quả'];
          const rows = filteredOpTasks.map((t, i) => [
              i + 1, t.title || '', t.assigneeName || '', fmtDate(t.endTime),
              `${t.progress || 0}%`,
              t.status === 'completed' ? 'Hoàn thành' : (new Date() > new Date(t.endTime) ? 'Quá hạn' : 'Đang làm'),
              t.status !== 'completed' ? 'Chưa hoàn thành' : (t.evaluation === 'passed' ? 'Đạt' : (t.evaluation === 'failed' ? 'Không đạt' : 'Chưa đánh giá'))
          ]);
          return downloadXls(headers, rows, `BaoCao_NhiemVu.xls`, 'BÁO CÁO TIẾN ĐỘ NHIỆM VỤ');
      }

      // Tab tổng quan: chưa chọn báo cáo cụ thể
      window.toast("Hãy mở một báo cáo cụ thể (Tài chính / Chấm công / Cơ sở vật chất / Nhiệm vụ) rồi bấm Xuất Excel.", 'info');
  };

  const handleSaveAttendanceEdit = (task) => {
      if (!editAttForm.checkIn || !editAttForm.checkOut || !editAttForm.reason.trim()) {
          return alert("Vui lòng nhập đầy đủ Giờ vào, Giờ ra và Lý do chỉnh sửa!");
      }

      updateTask(task.id, {
          ...task, // BẢO TOÀN DỮ LIỆU CŨ TRÁNH MẤT STARTTIME/ENDTIME
          checkInTime: new Date(editAttForm.checkIn).toISOString(),
          checkOutTime: new Date(editAttForm.checkOut).toISOString(),
          status: 'completed',
          progress: 100,
          adminEdited: true, 
          adminEditReason: editAttForm.reason,
          adminEditTime: new Date().toISOString()
      });

      setEditingAttendanceId(null);
      alert("Đã cập nhật dữ liệu chấm công thành công. Hệ thống đã gửi thông báo đến nhân sự!");
  };

  // Hàm yêu cầu sắp xếp
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeStaffList = Array.isArray(staffList) ? staffList : [];
  const safeFacilityLogs = Array.isArray(facilityLogs) ? facilityLogs : [];

  const opAdminTasks = safeTasks.filter(t => !t.fromScheduleId);
  const scheduleTasks = safeTasks.filter(t => t.fromScheduleId);

  // ==============================================================
  // 1. LOGIC TÀI CHÍNH
  // ==============================================================
  let totalEstimatedCost = 0;
  let financeRows = [];
  let isLocked = false;
  let lockedInfo = null;

  const lockedRecord = Array.isArray(payrollRecords) ? payrollRecords.find(r => r.month === financeMonthFilter) : null;

  if (lockedRecord) {
      isLocked = true;
      financeRows = lockedRecord.data || [];
      totalEstimatedCost = lockedRecord.totalCost || 0;
      lockedInfo = { by: lockedRecord.lockedBy, at: lockedRecord.lockedAt };
  } else {
      const currentMonthScheduleTasks = scheduleTasks.filter(t => {
          // [FIX BUG #2] Dùng ngày dự phòng (startTime -> checkInTime -> endTime) để không bỏ sót
          // ca đã chấm công T5 khi startTime bị thiếu/không hợp lệ.
          const d = new Date(t.startTime || t.checkInTime || t.endTime);
          return !isNaN(d.getTime()) && isSameMonth(d, selectedFinanceMonth);
      });

      safeStaffList.forEach(staff => {
          if (financeStaffFilter !== 'all' && String(staff.id) !== String(financeStaffFilter)) return;

          const staffTasks = currentMonthScheduleTasks.filter(t => String(t.assigneeId) === String(staff.id));
          
          let hoursUBI1 = 0;
          let ubi1Tasks = [];

          let R_Secondary = 0;
          let hoursSecondaryPartTime = 0;

          // [FIX BUG #2] Tổng giờ công thực tế trong tháng (đếm MỌI vai trò),
          // dùng để hiển thị ở cột "Thông tin thêm" — không ảnh hưởng logic tính lương.
          let totalWorkedHours = 0;

          const ubiRoles = [];
          let secUbiTotal = 0;
          if (staff.secondaryUBIs && staff.secondaryUBIs.length > 0) {
              staff.secondaryUBIs.forEach(ubi => {
                  if (!ubi.type || ubi.type === 'ubi') {
                      const lf = Number(ubi.loadFactor);
                      const actualLf = lf > 1 ? lf / 100 : lf;
                      secUbiTotal += parseAmount(ubi.amount) * actualLf;
                      ubiRoles.push(ubi.role);
                  }
              });
          } else if (staff.ubi2Base !== undefined) {
              secUbiTotal = parseAmount(staff.ubi2Base) * (parseAmount(staff.ubi2Percent)/100 || 1);
          }

          staffTasks.forEach(task => {
              if (!task.checkInTime || !task.checkOutTime) return;
              const workedHours = calculateWorkHoursDecimal(task.startTime, task.endTime, task.checkInTime, task.checkOutTime, task.adminEdited);

              // [FIX BUG #2] Cộng dồn tổng giờ công thực tế (mọi vai trò)
              totalWorkedHours += workedHours;

              let taskRate = getMatchedRate(staff.remunerations, task);

              if (task.assignedRole === staff.primaryRole) {
                  hoursUBI1 += workedHours;
                  ubi1Tasks.push({ hours: workedHours, rate: taskRate });
              } else {
                  if (!ubiRoles.includes(task.assignedRole)) {
                      R_Secondary += workedHours * taskRate;
                      hoursSecondaryPartTime += workedHours;
                  }
              }
          });

          let R_UBI1 = 0;
          const minHours = parseAmount(staff.minWorkHours);
          if (hoursUBI1 > minHours) {
              ubi1Tasks.sort((a, b) => a.rate - b.rate);
              let hoursToOffset = minHours;

              ubi1Tasks.forEach(t => {
                  if (hoursToOffset > 0) {
                      if (t.hours <= hoursToOffset) {
                          hoursToOffset -= t.hours;
                          t.hours = 0;
                      } else {
                          t.hours -= hoursToOffset;
                          hoursToOffset = 0;
                      }
                  }
                  if (t.hours > 0 && t.rate > 0) {
                      R_UBI1 += t.hours * t.rate;
                  }
              });
          }

          const baseUbi = staff.ubiBase !== undefined ? parseAmount(staff.ubiBase) : (parseAmount(staff.ubi1Base) * (parseAmount(staff.ubi1Percent)/100 || 1));
          const allowance = parseAmount(staff.specificAllowance);
          
          const totalFixedSalary = baseUbi + secUbiTotal + allowance;

          const incomeForBHXH = baseUbi + R_UBI1;
          const bhxhDeduction = incomeForBHXH * 0.105;

          const grossIncome = totalFixedSalary + R_UBI1 + R_Secondary;

          const taxThreshold = 15500000;
          const taxDeduction = grossIncome > taxThreshold ? (grossIncome - taxThreshold) * 0.05 : 0;

          const netIncome = grossIncome - bhxhDeduction - taxDeduction;

          if (grossIncome > 0 || minHours > 0 || totalWorkedHours > 0) {
              financeRows.push({
                  item: staff.name,
                  // [FIX BUG #2] Hiển thị tổng giờ công của tháng + giờ UBI 1 (giữ nguyên thông tin cũ)
                  type: `Giờ công T${Number(selMonth)}: ${totalWorkedHours.toFixed(1)}h • UBI 1: ${hoursUBI1.toFixed(1)}/${minHours}h`,
                  gross: grossIncome,
                  bhxh: bhxhDeduction,
                  tax: taxDeduction,
                  net: netIncome,
                  amount: netIncome, 
                  date: new Date().toLocaleDateString('vi-VN')
              });
              totalEstimatedCost += netIncome; 
          }
      });
  }

  const handleLockPayroll = () => {
      if(!savePayrollRecord) {
          alert("Lỗi: Hệ thống chưa được cấu hình API savePayrollRecord trong DataContext.");
          return;
      }
      window.confirmDialog(`Chốt báo cáo lương tháng ${financeMonthFilter}? Dữ liệu sẽ được lưu thành bản cứng (Snapshot) để khóa lịch sử lương. KHÔNG THỂ hoàn tác!`, { title: 'Chốt báo cáo', okText: 'Chốt sổ', danger: true, emoji: '🔒' }).then(ok => {
          if (!ok) return;
          savePayrollRecord({
              month: financeMonthFilter,
              data: financeRows,
              totalCost: totalEstimatedCost,
              lockedAt: new Date().toISOString(),
              lockedBy: user?.username || 'Admin'
          });
          alert("Đã chốt báo cáo thành công!");
      });
  };

  // ==============================================================
  // 2. LOGIC FACILITY
  // ==============================================================
  // Chỉ lấy danh sách các khu vực ĐANG CÓ trong thiết lập hiện tại
  const availableAreas = [...new Set(
      (Array.isArray(areas) ? areas : []).map(a => a.name).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'vi-VN'));

  const availableReporters = [...new Set(safeFacilityLogs.map(l => l.staffName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi-VN'));

  const filteredFacilityLogs = safeFacilityLogs.filter(log => {
      if (facilityAreaFilter !== 'all' && log.area !== facilityAreaFilter) return false;
      if (facilityStaffFilter !== 'all' && log.staffName !== facilityStaffFilter) return false;
      
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (facilityTimeFilter === 'day' && !isSameDay(logDate, now)) return false;
      if (facilityTimeFilter === 'week' && !isSameWeek(logDate, now)) return false;
      if (facilityTimeFilter === 'month' && !isSameMonth(logDate, now)) return false;
      
      if (facilityMonthFilter !== 'all') {
          const selectedMonth = parseInt(facilityMonthFilter, 10);
          if (logDate.getFullYear() !== 2026 || (logDate.getMonth() + 1) !== selectedMonth) {
              return false;
          }
      }
      return true;
  });

  // Gom nhóm các báo cáo CSVC
  const groupedFacilityLogs = useMemo(() => {
      const groups = {};
      filteredFacilityLogs.forEach(log => {
          // Lấy đến chuỗi phút để gộp những hạng mục nộp cùng lúc
          const timeKey = log.timestamp ? log.timestamp.slice(0, 16) : 'unknown';
          const key = `${log.area}_${log.staffName}_${log.type}_${timeKey}`;
          
          if (!groups[key]) {
              groups[key] = {
                  id: key,
                  area: log.area,
                  staffName: log.staffName,
                  type: log.type || 'Báo cáo',
                  timestamp: log.timestamp,
                  items: []
              };
          }
          groups[key].items.push(log);
      });
      
      return Object.values(groups).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [filteredFacilityLogs]);

  const toggleFacilityGroup = (groupId) => {
      setExpandedFacilityGroups(prev => 
          prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
      );
  };

  // ==============================================================
  // 3. LOGIC TASKS (OP ADMIN)
  // ==============================================================
  const filteredOpTasks = opAdminTasks.filter(t => {
      if (taskStaffFilter !== 'all' && String(t.assigneeId) !== String(taskStaffFilter)) return false;
      
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

  // ==============================================================
  // 4. LOGIC ATTENDANCE
  // ==============================================================
  const filteredAttendance = scheduleTasks.filter(t => {
      // [FIX BUG #1] Dùng ngày dự phòng: nếu startTime rỗng/không hợp lệ thì lấy giờ
      // check-in, rồi mới đến endTime — tránh việc ca đã chấm công T5 bị rớt khỏi bộ lọc tháng.
      const taskDate = new Date(t.startTime || t.checkInTime || t.endTime);
      if (isNaN(taskDate.getTime())) return false;
      const now = new Date();
      const taskMonth = taskDate.getMonth() + 1;
      const taskYear = taskDate.getFullYear();

      if (attendanceFilter === 'day' && !isSameDay(taskDate, now)) return false;
      if (attendanceFilter === 'week' && !isSameWeek(taskDate, now)) return false;
      if (attendanceFilter === 'month' && !isSameMonth(taskDate, now)) return false;
      
      if (attendanceStaffFilter !== 'all' && String(t.assigneeId) !== String(attendanceStaffFilter)) return false;
      if (attendanceDayFilter !== 'all') {
          const dayVal = daysOfWeek.find(d => d.key === attendanceDayFilter)?.val;
          if (taskDate.getDay() !== dayVal) return false;
      }

      if (attendanceMonthFilter !== 'all' && String(taskMonth) !== String(attendanceMonthFilter)) return false;
      if (attendanceYearFilter !== 'all' && String(taskYear) !== String(attendanceYearFilter)) return false;

      return true;
  });

  // Áp dụng sắp xếp cho danh sách Báo cáo chấm công
  const sortedAttendance = useMemo(() => {
    let sortableItems = [...filteredAttendance];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Custom sort value handling
        if (sortConfig.key === 'statusCol') {
            const isCompletedA = a.status === 'completed' || a.progress === 100;
            const isCompletedB = b.status === 'completed' || b.progress === 100;
            valA = isCompletedA ? 1 : 0;
            valB = isCompletedB ? 1 : 0;
        } else if (sortConfig.key === 'workedHours') {
            valA = calculateWorkHoursDecimal(a.startTime, a.endTime, a.checkInTime, a.checkOutTime, a.adminEdited);
            valB = calculateWorkHoursDecimal(b.startTime, b.endTime, b.checkInTime, b.checkOutTime, b.adminEdited);
        } else if (sortConfig.key === 'startTime') {
            valA = new Date(a.startTime).getTime();
            valB = new Date(b.startTime).getTime();
        }

        // Basic comparison
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredAttendance, sortConfig]);

  // [MỚI] Phân trang cho Báo cáo Chấm công (tối đa 50 dòng/trang)
  const totalAttPages = Math.max(1, Math.ceil(sortedAttendance.length / ATT_ITEMS_PER_PAGE));
  const currentAttPage = Math.min(attendancePage, totalAttPages);
  const paginatedAttendance = sortedAttendance.slice((currentAttPage - 1) * ATT_ITEMS_PER_PAGE, currentAttPage * ATT_ITEMS_PER_PAGE);

  // Danh sách ca trên trang hiện tại mà Admin được phép sửa (quá hạn, chưa do nhân sự tự chấm công thành công)
  const editableOnPage = paginatedAttendance.filter(t => {
      const isOverdue = new Date() > new Date(t.endTime);
      const workedHoursDecimal = calculateWorkHoursDecimal(t.startTime, t.endTime, t.checkInTime, t.checkOutTime, t.adminEdited);
      const isCompleted = t.status === 'completed' || t.progress === 100;
      const isStaffSuccess = isCompleted && !t.adminEdited && workedHoursDecimal > 0;
      return isChief && isOverdue && !isStaffSuccess;
  });
  const allPageSelected = editableOnPage.length > 0 && editableOnPage.every(t => selectedAttIds.includes(t.id));

  const toggleSelectAtt = (id) => {
      setSelectedAttIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAllAtt = () => {
      if (allPageSelected) {
          setSelectedAttIds(prev => prev.filter(id => !editableOnPage.some(t => t.id === id)));
      } else {
          setSelectedAttIds(prev => [...new Set([...prev, ...editableOnPage.map(t => t.id)])]);
      }
  };

  // [MỚI] Sửa ca HÀNG LOẠT: bù công theo giờ lịch (check-in = giờ bắt đầu, check-out = giờ kết thúc)
  // cho tất cả ca đã chọn, kèm 1 lý do chung. Giữ nguyên dữ liệu cũ của từng task.
  const handleBulkSaveAttendance = () => {
      if (selectedAttIds.length === 0) return alert("Vui lòng chọn ít nhất một ca!");
      if (!bulkReason.trim()) return alert("Vui lòng nhập Lý do chỉnh sửa cho thao tác hàng loạt!");
      window.confirmDialog(`Bù công theo giờ lịch cho ${selectedAttIds.length} ca đã chọn? Hệ thống sẽ đặt Giờ vào = giờ bắt đầu ca, Giờ ra = giờ kết thúc ca và đánh dấu hoàn thành.`, { title: 'Bù công hàng loạt', okText: 'Bù công', emoji: '🕒' }).then(ok => {
          if (!ok) return;
          selectedAttIds.forEach(id => {
              const task = scheduleTasks.find(t => t.id === id);
              if (!task) return;
              updateTask(id, {
                  ...task,
                  checkInTime: new Date(task.startTime).toISOString(),
                  checkOutTime: new Date(task.endTime).toISOString(),
                  status: 'completed',
                  progress: 100,
                  adminEdited: true,
                  adminEditReason: bulkReason,
                  adminEditTime: new Date().toISOString()
              });
          });

          alert(`Đã cập nhật ${selectedAttIds.length} ca thành công!`);
          setSelectedAttIds([]);
          setBulkReason('');
      });
  };

  const renderDashboard = () => (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {isChief && (
              <div className="menu-card" style={styles.menuCard} onClick={() => setActiveTab('finance')}>
                  <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                      <div style={styles.iconBox}><Icons.Finance /></div>
                      <h3 style={styles.cardTitle}>Tài chính & Thu nhập</h3>
                  </div>
                  <div style={{color:'#6b7280', fontSize:'0.95rem', marginBottom:'24px', lineHeight: '1.5'}}>
                      Tổng chi (Net) (Tháng {Number(selMonth)}/{selYear}): <br/><strong style={{color:'#059669', fontSize: '1.15rem'}}>{Math.round(totalEstimatedCost).toLocaleString()} VNĐ</strong>
                  </div>
                  <button style={styles.accessBtn}>
                      Truy cập <Icons.ArrowRight />
                  </button>
              </div>
          )}

          <div className="menu-card" style={styles.menuCard} onClick={() => setActiveTab('facility')}>
              <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                  <div style={{...styles.iconBox, background: '#fffbeb', color: '#d97706'}}><Icons.Facility /></div>
                  <h3 style={styles.cardTitle}>Cơ sở vật chất</h3>
              </div>
              <div style={{color:'#6b7280', fontSize:'0.95rem', marginBottom:'24px', lineHeight: '1.5'}}>
                  Báo cáo mới ghi nhận: <strong style={{color: '#111827'}}>{filteredFacilityLogs.length}</strong>
              </div>
              <button style={{...styles.accessBtn, background: '#fffbeb', color: '#d97706'}}>
                  Truy cập <Icons.ArrowRight />
              </button>
          </div>

          <div className="menu-card" style={styles.menuCard} onClick={() => setActiveTab('attendance')}>
              <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                  <div style={{...styles.iconBox, background: '#ecfdf5', color: '#059669'}}><Icons.Schedule /></div>
                  <h3 style={styles.cardTitle}>Báo cáo Chấm công</h3>
              </div>
              <div style={{color:'#6b7280', fontSize:'0.95rem', marginBottom:'24px', lineHeight: '1.5'}}>
                  Dữ liệu chấm công theo lịch (Scheduler).
              </div>
              <button style={{...styles.accessBtn, background: '#ecfdf5', color: '#059669'}}>
                  Truy cập <Icons.ArrowRight />
              </button>
          </div>

          <div className="menu-card" style={styles.menuCard} onClick={() => setActiveTab('tasks')}>
              <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px'}}>
                  <div style={{...styles.iconBox, background: '#fdf2f8', color: '#be185d'}}><Icons.Task /></div>
                  <h3 style={styles.cardTitle}>Tiến độ Nhiệm vụ</h3>
              </div>
              <div style={{color:'#6b7280', fontSize:'0.95rem', marginBottom:'24px', lineHeight: '1.5'}}>
                  Tổng: <strong style={{color: '#111827'}}>{totalTasks}</strong> | Xong: <strong style={{color: '#111827'}}>{completedTasks}</strong>
              </div>
              <button style={{...styles.accessBtn, background: '#fdf2f8', color: '#be185d'}}>
                  Truy cập <Icons.ArrowRight />
              </button>
          </div>
      </div>
  );

  return (
    <div style={{ paddingBottom: '40px', boxSizing: 'border-box' }} className="reports-page">
      <style>{`
        @media print {
          .admin-sidebar, .admin-header-mobile, .admin-bottom-nav, .btn-print, .filter-modern, .nav-back-btn, .action-col, .lock-btn-container { display: none !important; }
          .admin-content { margin: 0 !important; padding: 20px !important; width: 100% !important; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; break-inside: avoid; }
        }
        
        .filter-group { display: flex; gap: 12px; flex-wrap: wrap; }
        .filter-modern {
            padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none;
            font-weight: 600; color: #334155; background: #ffffff; cursor: pointer; font-size: 0.95rem;
            transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); appearance: none; -webkit-appearance: none;
            background-image: url('data:image/svg+xml;utf8,<svg fill="%239ca3af" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
            background-repeat: no-repeat; background-position: right 12px center; padding-right: 40px; min-width: 150px;
        }
        .filter-modern:focus { border-color: #2B6830; box-shadow: 0 0 0 3px rgba(43, 104, 48, 0.1); }
        .input-modern {
            padding: 12px 14px; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; font-size: 0.95rem; width: 100%; box-sizing: border-box; transition: all 0.2s; background: white;
        }
        .input-modern:focus { border-color: #2B6830; box-shadow: 0 0 0 3px rgba(43, 104, 48, 0.1); }
        
        .menu-card { transition: all 0.25s ease; cursor: pointer; }
        .menu-card:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1) !important; border-color: #bae6fd !important; }
        .table-row { transition: background 0.2s; }
        .table-row:hover { background: #f8fafc !important; }
        
        /* Chống tràn cho bảng */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            border-radius: 8px;
        }
        
        /* Chống tràn cho nội dung text dính liền */
        .text-wrap-title { 
            word-break: break-all;
            overflow-wrap: break-word; 
            white-space: normal; 
            min-width: 250px; 
            line-height: 1.5; 
        }
        .text-wrap-name {
            word-break: break-word;
            white-space: normal;
            min-width: 150px;
            line-height: 1.5;
        }

        /* === CARD-VIEW MOBILE cho bảng: bỏ cuộn ngang, mỗi hàng thành 1 thẻ dọc === */
        @media (max-width: 768px) {
            .ops-table { min-width: 0 !important; }
            .ops-table thead { display: none; }
            .ops-table, .ops-table tbody, .ops-table tr, .ops-table td { display: block; width: 100%; box-sizing: border-box; }
            .ops-table tr {
                margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 14px;
                overflow: hidden; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            }
            .ops-table td {
                display: flex; justify-content: space-between; align-items: center; gap: 12px;
                text-align: right !important; padding: 11px 16px !important;
                border: none !important; border-bottom: 1px solid #f1f5f9 !important;
                white-space: normal !important; min-width: 0 !important;
            }
            .ops-table td:last-child { border-bottom: none !important; }
            .ops-table td::before {
                content: attr(data-label);
                font-weight: 700; color: #64748b; font-size: 0.7rem;
                text-transform: uppercase; letter-spacing: 0.03em; text-align: left; flex-shrink: 0;
            }
            .ops-table td:empty { display: none !important; }            /* Ẩn ô rỗng của hàng mở rộng */
            .ops-table td[colspan] { display: block; text-align: left !important; }
            .ops-table td[colspan]::before { content: ''; display: none; }
        }
      `}</style>

      {/* HEADER + NÚT IN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px', marginBottom: '32px' }}>
         <h2 style={{ color: '#111827', margin: 0, fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>BÁO CÁO QUẢN TRỊ</h2>
         <div className="btn-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleExportExcel} style={styles.printBtn} title="Xuất dữ liệu báo cáo đang xem ra file Excel">
               <Icons.Print /> Xuất Excel
            </button>
            <button onClick={handlePrint} style={{ ...styles.printBtn, background: '#ffffff', color: '#2B6830', border: '1px solid #2B6830' }} title="In / lưu PDF báo cáo đang xem">
               In
            </button>
         </div>
      </div>

      {activeTab === 'overview' && renderDashboard()}

      {/* VIEW: CHI TIẾT TÀI CHÍNH */}
      {activeTab === 'finance' && isChief && (
          <div style={styles.card} className="card">
               <div style={{...styles.cardHeader, justifyContent: 'space-between', flexWrap: 'wrap'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={styles.iconBox}><Icons.Finance /></div>
                      <div>
                          <h3 style={styles.cardTitle}>Tài chính & Thu nhập (Tháng {Number(selMonth)}/{selYear})</h3>
                          {isLocked && <div style={{fontSize:'0.8rem', color:'#d97706', fontWeight:'700', marginTop:'6px', background: '#fffbeb', padding: '2px 8px', borderRadius: '6px', display: 'inline-block'}}>🔒 Đã chốt sổ bởi {lockedInfo?.by} ({new Date(lockedInfo?.at).toLocaleDateString('vi-VN')})</div>}
                      </div>
                  </div>
                  <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap: 'wrap'}}>
                      <input 
                          type="month" 
                          value={financeMonthFilter} 
                          onChange={(e) => setFinanceMonthFilter(e.target.value)} 
                          style={{...styles.filterSelect, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', background: 'white'}}
                          title="Chọn tháng để lọc"
                      />
                      <select className="filter-modern" value={financeStaffFilter} onChange={(e) => setFinanceStaffFilter(e.target.value)}>
                          <option value="all">Tất cả nhân sự</option>
                          {safeStaffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      
                      {!isLocked && (
                          <div className="lock-btn-container">
                              <button onClick={handleLockPayroll} style={{...styles.printBtn, background:'#f59e0b', color:'white', border:'none', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)'}}>
                                  <Icons.Lock /> Chốt Báo Cáo
                              </button>
                          </div>
                      )}

                      <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
                  </div>
               </div>
               <div style={styles.cardBody}>
                  <div className="table-responsive">
                    <table style={styles.table} className="ops-table">
                      <thead>
                        <tr style={styles.tableHeadRow}>
                          <th style={{...styles.th, width: '50px', textAlign: 'center'}}>STT</th>
                          <th style={styles.th}>Nhân sự</th>
                          <th style={styles.th}>Thông tin thêm</th>
                          <th style={{...styles.th, textAlign: 'right'}}>Thu nhập Gộp (Gross)</th>
                          <th style={{...styles.th, textAlign: 'right'}}>BHXH (10.5%)</th>
                          <th style={{...styles.th, textAlign: 'right'}}>Thuế TNCN (5%)</th>
                          <th style={{...styles.th, textAlign: 'right', paddingRight: '20px'}}>Thực nhận (Net)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {financeRows.length > 0 ? financeRows.map((row, idx) => (
                          <tr key={idx} className="table-row">
                              <td data-label="STT" style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af'}}>{idx + 1}</td>
                              <td data-label="Nhân sự" style={{...styles.td, fontWeight:'700', color:'#1f2937'}} className="text-wrap-name">{row.item}</td>
                              <td data-label="Thông tin" style={{...styles.td, fontSize:'0.85rem', color:'#64748b'}}>{row.type}</td>
                              <td data-label="Gộp (Gross)" style={{...styles.td, fontWeight: '700', textAlign: 'right'}}>{Math.round(row.gross || 0).toLocaleString()}</td>
                              <td data-label="BHXH (10.5%)" style={{...styles.td, color: '#ef4444', textAlign: 'right'}}>-{Math.round(row.bhxh || 0).toLocaleString()}</td>
                              <td data-label="Thuế TNCN (5%)" style={{...styles.td, color: '#ef4444', textAlign: 'right'}}>-{Math.round(row.tax || 0).toLocaleString()}</td>
                              <td data-label="Thực nhận (Net)" style={{...styles.td, fontWeight: '800', color: '#059669', textAlign: 'right', paddingRight: '20px', fontSize: '1.05rem'}}>{Math.round(row.net || row.amount).toLocaleString()}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="7" style={styles.emptyTd}>Không có dữ liệu thu nhập hiển thị.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
          </div>
      )}

      {/* VIEW: CHI TIẾT CSVC */}
      {activeTab === 'facility' && (
          <div style={styles.card} className="card">
             <div style={{...styles.cardHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '16px'}}>
                <div style={{display:'flex', justifyContent:'space-between', width:'100%', alignItems:'center', flexWrap: 'wrap', gap: '12px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                        <div style={{...styles.iconBox, background: '#fffbeb', color: '#d97706'}}><Icons.Facility /></div>
                        <h3 style={styles.cardTitle}>Tình trạng Cơ sở vật chất</h3>
                    </div>
                    <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
                </div>
                <div className="filter-group" style={{width: '100%'}}>
                    <select className="filter-modern" value={facilityAreaFilter} onChange={(e) => setFacilityAreaFilter(e.target.value)} style={{flex: 1}}>
                        <option value="all">Khu vực: Tất cả</option>
                        {availableAreas.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                    <select className="filter-modern" value={facilityStaffFilter} onChange={(e) => setFacilityStaffFilter(e.target.value)} style={{flex: 1}}>
                        <option value="all">Nhân sự: Tất cả</option>
                        {availableReporters.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <select className="filter-modern" value={facilityTimeFilter} onChange={(e) => { setFacilityTimeFilter(e.target.value); if(e.target.value !== 'all') setFacilityMonthFilter('all'); }} style={{flex: 1}}>
                        <option value="all">Thời gian: Tất cả</option>
                        <option value="day">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                    </select>
                    <select className="filter-modern" value={facilityMonthFilter} onChange={(e) => { setFacilityMonthFilter(e.target.value); if(e.target.value !== 'all') setFacilityTimeFilter('all'); }} style={{flex: 1}}>
                        <option value="all">Tháng (2026): Tất cả</option>
                        {[...Array(12).keys()].map(i => ( <option key={i+1} value={i+1}>Tháng {i+1}</option> ))}
                    </select>
                </div>
             </div>
             <div style={styles.cardBody}>
                 <div className="table-responsive">
                     <table style={styles.table} className="ops-table">
                       <thead>
                         <tr style={styles.tableHeadRow}>
                           <th style={{...styles.th, width: '50px', textAlign: 'center'}}>STT</th>
                           <th style={styles.th}>Khu vực & Thời gian</th>
                           <th style={styles.th}>Tình trạng</th>
                           <th style={styles.th}>Nhân sự báo cáo</th>
                         </tr>
                       </thead>
                       <tbody>
                         {groupedFacilityLogs.length > 0 ? (
                           groupedFacilityLogs.map((group, index) => {
                             const isExpanded = expandedFacilityGroups.includes(group.id);
                             return (
                               <React.Fragment key={group.id}>
                                 <tr className="table-row">
                                   <td data-label="STT" style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af'}}>{index + 1}</td>
                                   <td data-label="Khu vực & Thời gian" style={{...styles.td, cursor: 'pointer'}} className="text-wrap-name" onClick={() => toggleFacilityGroup(group.id)}>
                                     <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#0369a1'}}>
                                         {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                                         {group.area || '---'}
                                     </div>
                                     <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: '500', marginTop: '6px', marginLeft: '24px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                         <span style={{background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0'}}>{group.type}</span>
                                         {formatDateTime(group.timestamp)}
                                     </div>
                                   </td>
                                   <td data-label="Tình trạng" style={{...styles.td, cursor: 'pointer'}} onClick={() => toggleFacilityGroup(group.id)}>
                                       <div style={{fontWeight:'600', color:'#334155'}}>Đã ghi nhận {group.items.length} hạng mục</div>
                                       <div style={{fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px'}}>Nhấn để xem chi tiết</div>
                                   </td>
                                   <td data-label="Nhân sự báo cáo" style={{...styles.td, fontWeight: '600'}} className="text-wrap-name">{group.staffName || 'Unknown'}</td>
                                 </tr>
                                 {isExpanded && (
                                     <tr style={{ background: '#f8fafc' }}>
                                         <td></td>
                                         <td colSpan="3" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                                             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                                                 {group.items.map((log, idx) => (
                                                     <div key={idx} style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                         <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{log.itemName || log.item || log.category || 'Hạng mục'}</span>
                                                         <span style={{ color: '#0369a1', fontWeight: '700', fontSize: '0.85rem' }}>Trạng thái: {log.status || log.note || 'Đã kiểm tra'}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                         </td>
                                     </tr>
                                 )}
                               </React.Fragment>
                             );
                           })
                         ) : (
                           <tr><td colSpan="4" style={styles.emptyTd}>Chưa có báo cáo kiểm tra phù hợp.</td></tr>
                         )}
                       </tbody>
                     </table>
                 </div>
             </div>
          </div>
      )}

      {/* VIEW: CHI TIẾT CHẤM CÔNG */}
      {activeTab === 'attendance' && (
          <div style={styles.card} className="card">
            <div style={{ ...styles.cardHeader, flexDirection:'column', alignItems: 'flex-start', gap: '16px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={{...styles.iconBox, background: '#ecfdf5', color: '#059669'}}><Icons.Schedule /></div>
                      <h3 style={styles.cardTitle}>Báo cáo Chấm công (Theo Lịch)</h3>
                  </div>
                  <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
               </div>
               
               <div className="filter-group" style={{width: '100%'}}>
                   <select className="filter-modern" value={attendanceStaffFilter} onChange={(e) => setAttendanceStaffFilter(e.target.value)} style={{flex: 1}}>
                        <option value="all">Nhân sự: Tất cả</option>
                        {safeStaffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select className="filter-modern" value={attendanceDayFilter} onChange={(e) => setAttendanceDayFilter(e.target.value)} style={{flex: 1}}>
                        <option value="all">Ngày: Tất cả</option>
                        {daysOfWeek.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                    </select>
                    <select className="filter-modern" value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value)} style={{flex: 1}}>
                        <option value="all">T/gian tương đối: Tất cả</option>
                        <option value="day">Hôm nay</option>
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                    </select>
                    <select className="filter-modern" value={attendanceMonthFilter} onChange={(e) => setAttendanceMonthFilter(e.target.value)} style={{flex: 1}}>
                        <option value="all">Tháng: Tất cả</option>
                        {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
                    </select>
                    <select className="filter-modern" value={attendanceYearFilter} onChange={(e) => setAttendanceYearFilter(e.target.value)} style={{flex: 1}}>
                        <option value="all">Năm: Tất cả</option>
                        {availableYears.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
               </div>
            </div>
            <div style={styles.cardBody}>
               {/* [MỚI] Thanh thao tác hàng loạt — hiện khi có ca được chọn */}
               {isChief && selectedAttIds.length > 0 && (
                   <div className="action-col" style={{ marginBottom: '16px', padding: '14px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                       <span style={{ fontWeight: '800', color: '#059669', fontSize: '0.9rem' }}>Đã chọn {selectedAttIds.length} ca</span>
                       <input
                           className="input-modern"
                           type="text"
                           placeholder="Lý do chỉnh sửa (bắt buộc) — vd: Bù công theo lịch"
                           value={bulkReason}
                           onChange={e => setBulkReason(e.target.value)}
                           style={{ flex: 1, minWidth: '220px', marginLeft: 'auto', maxWidth: '420px' }}
                       />
                       <button onClick={handleBulkSaveAttendance} style={{ background: '#059669', color: 'white', border: 'none', padding: '11px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', boxShadow: '0 4px 6px rgba(16,185,129,0.2)' }}>
                           Sửa ca hàng loạt ({selectedAttIds.length})
                       </button>
                       <button onClick={() => { setSelectedAttIds([]); setBulkReason(''); }} style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '11px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                           Bỏ chọn
                       </button>
                   </div>
               )}
               <div className="table-responsive">
                   <table style={styles.table} className="ops-table">
                      <thead>
                         <tr style={styles.tableHeadRow}>
                           {isChief && (
                               <th style={{ ...styles.th, width: '40px', textAlign: 'center' }} className="action-col">
                                   <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAllAtt} title="Chọn tất cả ca có thể sửa trên trang này" style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                               </th>
                           )}
                           <th style={{ ...styles.th, width: '50px', textAlign: 'center' }}>STT</th>
                           <th onClick={() => requestSort('assigneeName')} style={{...styles.th, cursor: 'pointer'}}>
                               Nhân sự {sortConfig.key === 'assigneeName' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                           </th>
                           <th onClick={() => requestSort('title')} style={{...styles.th, cursor: 'pointer'}}>
                               Ca làm việc {sortConfig.key === 'title' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                           </th>
                           <th onClick={() => requestSort('startTime')} style={{...styles.th, cursor: 'pointer'}}>
                               Thời gian {sortConfig.key === 'startTime' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                           </th>
                           <th onClick={() => requestSort('workedHours')} style={{...styles.th, cursor: 'pointer'}}>
                               Số giờ {sortConfig.key === 'workedHours' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                           </th>
                           <th onClick={() => requestSort('statusCol')} style={{...styles.th, cursor: 'pointer'}}>
                               Trạng thái {sortConfig.key === 'statusCol' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                           </th>
                           <th onClick={() => requestSort('progress')} style={{...styles.th, textAlign: 'center', cursor: 'pointer'}}>
                               Tiến độ {sortConfig.key === 'progress' ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                           </th>
                           <th style={{ ...styles.th, textAlign: 'right' }} className="action-col">Hành động</th>
                         </tr>
                      </thead>
                      {/* SỬ DỤNG paginatedAttendance MAP VÀO BẢNG CHẤM CÔNG (tối đa 50 dòng/trang) */}
                      <tbody>
                         {paginatedAttendance.length > 0 ? paginatedAttendance.map((t, index) => {
                           const globalIndex = (currentAttPage - 1) * ATT_ITEMS_PER_PAGE + index;
                           const isCompleted = t.status === 'completed' || t.progress === 100;
                           const isOverdue = new Date() > new Date(t.endTime);
                           
                           const workedHoursDecimal = calculateWorkHoursDecimal(t.startTime, t.endTime, t.checkInTime, t.checkOutTime, t.adminEdited);
                           
                           const isStaffSuccess = isCompleted && !t.adminEdited && workedHoursDecimal > 0;
                           const canEdit = isChief && isOverdue && !isStaffSuccess;

                           const statusDetails = [];

                           if (!t.checkInTime) {
                               statusDetails.push("Chưa check-in");
                           } else {
                               const plannedStart = new Date(t.startTime);
                               const actualIn = new Date(t.checkInTime);
                               const diffIn = (actualIn - plannedStart) / 60000; 
                               if (diffIn > 3 && !t.adminEdited) statusDetails.push(`Check-in trễ ${Math.round(diffIn)}p`);

                               if (!t.checkOutTime) {
                                   statusDetails.push("Chưa check-out");
                               } else {
                                   const plannedEnd = new Date(t.endTime);
                                   const actualOut = new Date(t.checkOutTime);
                                   const diffOut = (actualOut - plannedEnd) / 60000;
                                   if (diffOut > 15 && !t.adminEdited) statusDetails.push(`Check-out trễ ${Math.round(diffOut)}p`);
                               }
                           }

                           if (t.explanation) {
                               statusDetails.push(`Giải trình: ${t.explanation}`);
                           }

                           const displayStart = t.adminEdited && t.checkInTime ? t.checkInTime : t.startTime;
                           const displayEnd = t.adminEdited && t.checkOutTime ? t.checkOutTime : t.endTime;

                           return (
                               <tr key={t.id} className={editingAttendanceId !== t.id ? "table-row" : ""} style={{ background: selectedAttIds.includes(t.id) ? '#ecfdf5' : (editingAttendanceId === t.id ? '#f0fdf4' : 'transparent') }}>
                                  {isChief && (
                                      <td style={{ ...styles.td, textAlign: 'center' }} className="action-col">
                                          {canEdit ? (
                                              <input type="checkbox" checked={selectedAttIds.includes(t.id)} onChange={() => toggleSelectAtt(t.id)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                                          ) : null}
                                      </td>
                                  )}
                                  <td data-label="STT" style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af' }}>{globalIndex + 1}</td>

                                  {editingAttendanceId === t.id ? (
                                      <>
                                          <td style={{ ...styles.td, fontWeight: '700' }} className="text-wrap-name">{t.assigneeName}</td>
                                          <td style={styles.td}>
                                              <div style={{fontWeight: '700', color: '#1f2937'}} className="text-wrap-title">{t.title}</div>
                                              <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'4px'}}>{t.assignedRole}</div>
                                          </td>
                                          <td colSpan="4" style={{padding: '16px'}}>
                                              <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                                                  <div style={{display:'flex', gap:'12px', flexWrap: 'wrap'}}>
                                                      <div style={{flex:1, minWidth: '160px'}}>
                                                          <label style={{fontSize:'0.85rem', fontWeight:'700', color:'#475569', marginBottom:'6px', display:'block'}}>Giờ vào (Check-in)</label>
                                                          <input 
                                                              className="input-modern"
                                                              type="datetime-local" 
                                                              value={editAttForm.checkIn} 
                                                              onChange={e => setEditAttForm({...editAttForm, checkIn: e.target.value})} 
                                                          />
                                                      </div>
                                                      <div style={{flex:1, minWidth: '160px'}}>
                                                          <label style={{fontSize:'0.85rem', fontWeight:'700', color:'#475569', marginBottom:'6px', display:'block'}}>Giờ ra (Check-out)</label>
                                                          <input 
                                                              className="input-modern"
                                                              type="datetime-local" 
                                                              value={editAttForm.checkOut} 
                                                              onChange={e => setEditAttForm({...editAttForm, checkOut: e.target.value})} 
                                                          />
                                                      </div>
                                                  </div>
                                                  <div>
                                                      <label style={{fontSize:'0.85rem', fontWeight:'700', color:'#475569', marginBottom:'6px', display:'block'}}>Lý do chỉnh sửa (Bắt buộc)</label>
                                                      <input 
                                                          className="input-modern"
                                                          type="text" 
                                                          placeholder="Nhập lý do bù giờ..." 
                                                          value={editAttForm.reason} 
                                                          onChange={e => setEditAttForm({...editAttForm, reason: e.target.value})} 
                                                      />
                                                  </div>
                                              </div>
                                          </td>
                                          <td style={{...styles.td, textAlign: 'right'}}>
                                              <div style={{display:'flex', flexDirection:'column', gap:'8px', alignItems:'flex-end'}}>
                                                  <button onClick={() => handleSaveAttendanceEdit(t)} style={{color:'white', background:'#059669', border:'none', padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontWeight:'700', width:'90px', transition:'all 0.2s', boxShadow: '0 2px 4px rgba(16,185,129,0.2)'}}>Lưu</button>
                                                  <button onClick={()=>setEditingAttendanceId(null)} style={{color:'#475569', background:'#f1f5f9', border:'1px solid #cbd5e1', padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontWeight:'700', width:'90px', transition:'all 0.2s'}}>Hủy</button>
                                              </div>
                                          </td>
                                      </>
                                  ) : (
                                      <>
                                          <td data-label="Nhân sự" style={{ ...styles.td, fontWeight: '700' }} className="text-wrap-name">{t.assigneeName}</td>
                                          <td data-label="Ca làm việc" style={styles.td}>
                                              <div style={{fontWeight: '700', color: '#1f2937'}} className="text-wrap-title">{t.title}</div>
                                              <div style={{fontSize:'0.8rem', color:'#64748b', marginTop:'4px'}}>{t.assignedRole}</div>
                                          </td>
                                          <td data-label="Thời gian" style={styles.td}>
                                             <div style={{fontWeight: '600', color: '#334155'}}>{new Date(displayStart).toLocaleDateString('vi-VN')}</div>
                                             <div style={{fontSize:'0.85rem', color:'#64748b', marginTop:'4px'}}>
                                               {new Date(displayStart).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(displayEnd).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                             </div>
                                          </td>
                                          <td data-label="Số giờ" style={{...styles.td, fontWeight: '800', color: '#059669', whiteSpace: 'nowrap'}}>
                                              {calculateWorkHours(t.startTime, t.endTime, t.checkInTime, t.checkOutTime, t.adminEdited)}
                                          </td>
                                          <td data-label="Trạng thái" style={styles.td}>
                                             {isCompleted ?
                                               <span style={styles.badgeSuccess}>Đã chấm công</span> : 
                                               <span style={styles.badgePending}>Chưa hoàn thành</span>
                                             }
                                             {statusDetails.length > 0 && !t.adminEdited && (
                                                 <div style={{fontSize: '0.75rem', color: '#64748b', marginTop: '8px', fontStyle:'italic', display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                                     {statusDetails.map((detail, idx) => (
                                                         <div key={idx}>- {detail}</div>
                                                     ))}
                                                 </div>
                                             )}
                                             {t.adminEdited && (
                                                 <div style={{fontSize: '0.75rem', color: '#ea580c', marginTop: '8px', fontWeight: '700', background: '#ffedd5', padding: '4px 8px', borderRadius: '6px', display: 'inline-block'}}>
                                                     *Sửa bởi Admin: {t.adminEditReason}
                                                 </div>
                                             )}
                                          </td>
                                          <td data-label="Tiến độ" style={{...styles.td, textAlign: 'center', fontWeight: '800', color: t.progress === 100 ? '#10b981' : '#3b82f6'}}>{t.progress}%</td>
                                          <td data-label="Hành động" style={{...styles.td, textAlign: 'right'}} className="action-col">
                                              {canEdit ? (
                                                  <button 
                                                      onClick={() => {
                                                          setEditingAttendanceId(t.id);
                                                          setEditAttForm({
                                                              checkIn: t.checkInTime ? toDateTimeLocal(t.checkInTime) : toDateTimeLocal(t.startTime),
                                                              checkOut: t.checkOutTime ? toDateTimeLocal(t.checkOutTime) : toDateTimeLocal(t.endTime),
                                                              reason: t.adminEditReason || ''
                                                          });
                                                      }} 
                                                      style={{color:'#0284c7', border:'1px solid #bae6fd', background:'#f0f9ff', padding:'8px 14px', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'all 0.2s'}}
                                                  >
                                                      Sửa ca
                                                  </button>
                                              ) : (
                                                  <span style={{fontSize:'0.85rem', color:'#cbd5e1', fontStyle: 'italic'}}>---</span>
                                              )}
                                          </td>
                                      </>
                                  )}
                               </tr>
                           );
                         }) : (
                           <tr><td colSpan={isChief ? "9" : "8"} style={styles.emptyTd}>Không có dữ liệu chấm công phù hợp.</td></tr>
                         )}
                      </tbody>
                   </table>
               </div>

               {/* [MỚI] Phân trang Báo cáo Chấm công */}
               {totalAttPages > 1 && (
                   <div className="action-col" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                       <button onClick={() => setAttendancePage(p => Math.max(1, p - 1))} disabled={currentAttPage === 1} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', cursor: currentAttPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '700', color: '#475569', opacity: currentAttPage === 1 ? 0.5 : 1 }}>Trang trước</button>
                       <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '600' }}>Trang {currentAttPage} / {totalAttPages} ({sortedAttendance.length} ca)</span>
                       <button onClick={() => setAttendancePage(p => Math.min(totalAttPages, p + 1))} disabled={currentAttPage === totalAttPages} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', cursor: currentAttPage === totalAttPages ? 'not-allowed' : 'pointer', fontWeight: '700', color: '#475569', opacity: currentAttPage === totalAttPages ? 0.5 : 1 }}>Trang sau</button>
                   </div>
               )}
            </div>
          </div>
      )}

      {/* VIEW: CHI TIẾT NHIỆM VỤ (TIẾN ĐỘ) */}
      {activeTab === 'tasks' && (
          <div style={styles.card} className="card">
              <div style={{...styles.cardHeader, flexDirection: 'column', alignItems: 'flex-start', gap: '16px'}}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                     <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                         <div style={{...styles.iconBox, background: '#fdf2f8', color: '#be185d'}}><Icons.Task /></div>
                         <h3 style={styles.cardTitle}>Tiến độ Nhiệm vụ (Trách nhiệm Vận hành)</h3>
                     </div>
                     <button onClick={() => setActiveTab('overview')} style={styles.backBtn} className="nav-back-btn"><Icons.Back /> Ẩn</button>
                 </div>
                 <div className="filter-group" style={{width: '100%'}}>
                     <select 
                          className="filter-modern"
                          value={taskStaffFilter} 
                          onChange={(e) => setTaskStaffFilter(e.target.value)}
                          style={{flex: 1}}
                      >
                          <option value="all">Nhân sự: Tất cả</option>
                          {safeStaffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select 
                          className="filter-modern"
                          value={taskStatusFilter} 
                          onChange={(e) => setTaskStatusFilter(e.target.value)}
                          style={{flex: 1}}
                      >
                          <option value="all">Trạng thái: Tất cả</option>
                          <option value="inprogress">Đang làm</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="overdue">Quá hạn</option>
                      </select>
                 </div>
              </div>

              <div style={styles.cardBody}>
                {/* 3 Blocks thống kê nhỏ */}
                <div style={{ marginBottom: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{flex: 1, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '20px', borderRadius: '16px', minWidth: '150px'}}>
                        <div style={{fontSize:'0.85rem', color:'#64748b', fontWeight:'700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em'}}>Tổng nhiệm vụ</div>
                        <div style={{fontSize:'2rem', fontWeight:'800', color:'#1e293b'}}>{totalTasks}</div>
                    </div>
                    <div style={{flex: 1, border: '1px solid #a7f3d0', background: '#ecfdf5', padding: '20px', borderRadius: '16px', minWidth: '150px'}}>
                        <div style={{fontSize:'0.85rem', color:'#059669', fontWeight:'700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em'}}>Hoàn thành</div>
                        <div style={{fontSize:'2rem', fontWeight:'800', color:'#064e3b'}}>{completedTasks}</div>
                    </div>
                    <div style={{flex: 1, border: '1px solid #bae6fd', background: '#f0f9ff', padding: '20px', borderRadius: '16px', minWidth: '150px'}}>
                        <div style={{fontSize:'0.85rem', color:'#0284c7', fontWeight:'700', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em'}}>Tỷ lệ đạt</div>
                        <div style={{fontSize:'2rem', fontWeight:'800', color:'#0c4a6e'}}>{taskProgress}%</div>
                    </div>
                </div>

                <div className="table-responsive">
                  <table style={styles.table} className="ops-table">
                    <thead>
                      <tr style={styles.tableHeadRow}>
                        <th style={{...styles.th, width: '50px', textAlign: 'center'}}>STT</th>
                        <th style={styles.th}>Nhiệm vụ</th>
                        <th style={styles.th}>Phụ trách</th>
                        <th style={styles.th}>Hạn chót</th>
                        <th style={styles.th}>Tiến độ</th>
                        <th style={styles.th}>Trạng thái</th>
                        <th style={{...styles.th, textAlign: 'center'}}>Đánh giá kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                        {filteredOpTasks.map((task, index) => {
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
                            <tr key={task.id} className="table-row">
                              <td data-label="STT" style={{...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#9ca3af'}}>{index + 1}</td>
                              <td data-label="Nhiệm vụ" style={{ ...styles.td, fontWeight: '700', color: '#1f2937' }} className="text-wrap-title">{task.title}</td>
                              <td data-label="Phụ trách" style={{...styles.td, fontWeight: '600'}} className="text-wrap-name">{task.assigneeName}</td>
                              <td data-label="Hạn chót" style={{...styles.td, color: '#475569'}}>{new Date(task.endTime).toLocaleDateString('vi-VN')}</td>
                              <td data-label="Tiến độ" style={styles.td}>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <div style={{flex:1, height:'8px', background:'#e2e8f0', borderRadius:'4px', minWidth:'80px', overflow:'hidden'}}>
                                      <div style={{width:`${task.progress}%`, background: task.progress === 100 ? '#10b981' : '#3b82f6', height:'100%', borderRadius:'4px', transition: 'width 0.5s ease'}}></div>
                                    </div>
                                    <span style={{fontSize:'0.85rem', fontWeight:'800', color: task.progress === 100 ? '#10b981' : '#3b82f6'}}>{task.progress}%</span>
                                </div>
                              </td>
                              <td data-label="Trạng thái" style={styles.td}>
                                  <div style={{ display: 'inline-flex' }}>{statusElement}</div>
                              </td>
                              <td data-label="Đánh giá" style={{...styles.td, textAlign: 'center'}}>
                                  {task.status !== 'completed' ? (
                                      <span style={{fontSize:'0.85rem', color:'#cbd5e1', fontStyle: 'italic'}}>Chưa hoàn thành</span>
                                  ) : task.evaluation === 'passed' ? (
                                      <span style={styles.badgeSuccess}>✓ Đạt</span>
                                  ) : task.evaluation === 'failed' ? (
                                      <span style={styles.badgeError}>✕ Không đạt</span>
                                  ) : (
                                      <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                                          <button
                                              onClick={() => evaluateTask(task.id, true)}
                                              style={{color:'#059669', border:'1px solid #a7f3d0', background:'#ecfdf5', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'0.8rem', whiteSpace:'nowrap'}}
                                          >Đạt</button>
                                          <button
                                              onClick={() => { window.confirmDialog(`Đánh giá "${task.title}" là KHÔNG ĐẠT? Hệ thống sẽ tự động xét kỷ luật theo số lần tích lũy nếu chạm ngưỡng.`, { title: 'Đánh giá Không đạt', okText: 'Không đạt', danger: true, emoji: '✕' }).then(ok => { if (ok) evaluateTask(task.id, false); }); }}
                                              style={{color:'#dc2626', border:'1px solid #fecaca', background:'#fef2f2', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:'0.8rem', whiteSpace:'nowrap'}}
                                          >Không đạt</button>
                                      </div>
                                  )}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredOpTasks.length === 0 && <tr><td colSpan="7" style={styles.emptyTd}>Không tìm thấy nhiệm vụ phù hợp.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '32px', overflow: 'hidden' },
  cardHeader: { padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff' },
  iconBox: { width: '48px', height: '48px', background: '#f0f9ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2B6830' },
  cardTitle: { margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.01em' },
  cardBody: { padding: '24px' },
  printBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', color: '#2B6830', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', fontSize: '0.95rem' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  tableHeadRow: { background: '#f8fafc' },
  th: { padding: '16px 20px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155', verticalAlign: 'middle' },
  emptyTd: { padding: '40px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem' },
  
  badgeSuccess: { background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #a7f3d0', display: 'inline-block', whiteSpace: 'nowrap' },
  badgePending: { background: '#fff7ed', color: '#ea580c', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #fed7aa', display: 'inline-block', whiteSpace: 'nowrap' },
  badgeError: { background: '#fef2f2', color: '#dc2626', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #fecaca', display: 'inline-block', whiteSpace: 'nowrap' },
  badgeInfo: { background: '#eff6ff', color: '#1d4ed8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #bfdbfe', display: 'inline-block', whiteSpace: 'nowrap' },
  
  menuCard: { background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' },
  accessBtn: { marginTop: 'auto', background: '#2B6830', color: 'white', border: 'none', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', fontSize: '0.95rem' },
  backBtn: { background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' },
};

export default Reports;