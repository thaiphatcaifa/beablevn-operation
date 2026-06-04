// =============================================================================
// notify.js — Hệ thống thông báo dùng chung cho 2SOL Operations
//
// MỤC ĐÍCH: thay các hộp thoại mặc định xấu & chặn luồng của trình duyệt
//   - window.alert(...)  -> toast nổi góc màn hình (không chặn thao tác)
//   - window.confirm(...) (đồng bộ) KHÔNG thay được trực tiếp vì nó phải trả về
//     ngay lập tức; thay vào đó dùng hàm bất đồng bộ confirmDialog(...) -> Promise<boolean>.
//
// KHÔNG dùng thư viện ngoài, KHÔNG đụng tới React/CSDL. Chỉ thao tác DOM thuần,
// nên import 1 lần ở index.js là áp dụng cho toàn app.
// =============================================================================

const BRAND = '#2B6830'; // Forest Green — màu thương hiệu Be Able VN (Brand Guideline)

// --- Chèn CSS 1 lần duy nhất vào <head> ---
function injectStylesOnce() {
  if (typeof document === 'undefined') return;          // an toàn khi không có DOM
  if (document.getElementById('bav-notify-styles')) return;

  const style = document.createElement('style');
  style.id = 'bav-notify-styles';
  style.textContent = `
    #bav-toast-container {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
      z-index: 2147483647; display: flex; flex-direction: column; gap: 10px;
      width: max-content; max-width: calc(100vw - 32px); pointer-events: none;
      font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .bav-toast {
      pointer-events: auto; display: flex; align-items: flex-start; gap: 10px;
      min-width: 240px; max-width: 92vw; padding: 13px 16px; border-radius: 12px;
      background: #ffffff; color: #1e293b; font-size: 0.92rem; font-weight: 600;
      line-height: 1.45; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.18); border: 1px solid #e2e8f0;
      border-left: 5px solid ${BRAND}; white-space: pre-line; word-break: break-word;
      animation: bavToastIn 0.22s cubic-bezier(0.16,1,0.3,1);
    }
    .bav-toast.out { animation: bavToastOut 0.2s ease forwards; }
    .bav-toast .bav-ic { flex-shrink: 0; font-size: 1.05rem; line-height: 1.3; }
    .bav-toast.success { border-left-color: #10b981; }
    .bav-toast.success .bav-ic { color: #10b981; }
    .bav-toast.error   { border-left-color: #dc2626; }
    .bav-toast.error .bav-ic { color: #dc2626; }
    .bav-toast.warning { border-left-color: #f59e0b; }
    .bav-toast.warning .bav-ic { color: #f59e0b; }
    .bav-toast.info .bav-ic { color: ${BRAND}; }

    @keyframes bavToastIn  { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bavToastOut { from { opacity: 1; transform: translateY(0); }    to { opacity: 0; transform: translateY(-12px); } }

    /* --- Modal xác nhận --- */
    #bav-confirm-overlay {
      position: fixed; inset: 0; z-index: 2147483646; display: flex;
      align-items: center; justify-content: center; padding: 20px;
      background: rgba(15,23,42,0.5); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
      font-family: 'Josefin Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: bavFade 0.15s ease;
    }
    @keyframes bavFade { from { opacity: 0; } to { opacity: 1; } }
    .bav-confirm-box {
      background: #fff; border-radius: 18px; width: 100%; max-width: 420px; overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); animation: bavPop 0.18s ease-out;
    }
    @keyframes bavPop { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .bav-confirm-body { padding: 26px 24px 8px; text-align: center; }
    .bav-confirm-emoji { font-size: 30px; margin-bottom: 12px; }
    .bav-confirm-title { font-size: 1.15rem; font-weight: 800; color: #111827; margin: 0 0 8px; }
    .bav-confirm-msg { font-size: 0.92rem; color: #475569; font-weight: 500; line-height: 1.5; white-space: pre-line; margin: 0; }
    .bav-confirm-actions { display: flex; gap: 12px; padding: 22px 24px; }
    .bav-confirm-actions button { flex: 1; padding: 12px; border-radius: 11px; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: none; transition: filter 0.15s; }
    .bav-confirm-actions button:hover { filter: brightness(0.96); }
    .bav-btn-cancel { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0 !important; }
    .bav-btn-ok { color: #fff; background: ${BRAND}; }
    .bav-btn-ok.danger { background: #dc2626; }
  `;
  document.head.appendChild(style);
}

function getToastContainer() {
  injectStylesOnce();
  let c = document.getElementById('bav-toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'bav-toast-container';
    document.body.appendChild(c);
  }
  return c;
}

// Đoán loại toast (màu sắc) dựa trên nội dung tiếng Việt nếu không truyền type
function detectType(message) {
  const m = (message || '').toLowerCase();
  if (/lỗi|sai |không đúng|không khớp|không tìm thấy|thất bại|cảnh báo/.test(m)) return 'error';
  if (/vui lòng|chưa |bắt buộc|yêu cầu bạn|chỉ được|quá thời gian|quá hạn/.test(m)) return 'warning';
  if (/thành công|hoàn tất|đã |duyệt|✅|đã gửi/.test(m)) return 'success';
  return 'info';
}

const ICONS = { success: '✓', error: '⚠', warning: '!', info: 'ℹ' };

// --- HÀM CHÍNH: hiện 1 toast ---
export function toast(message, type) {
  if (typeof document === 'undefined') return;
  const t = type || detectType(message);
  const container = getToastContainer();

  const el = document.createElement('div');
  el.className = `bav-toast ${t}`;
  const ic = document.createElement('span');
  ic.className = 'bav-ic';
  ic.textContent = ICONS[t] || ICONS.info;
  const txt = document.createElement('span');
  txt.textContent = String(message);
  el.appendChild(ic);
  el.appendChild(txt);
  container.appendChild(el);

  // Thời gian hiển thị: tin lỗi/cảnh báo để lâu hơn cho người đọc kịp
  const duration = (t === 'error' || t === 'warning') ? 4800 : 3200;
  const remove = () => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 200);
  };
  el.addEventListener('click', remove);          // chạm để tắt sớm
  setTimeout(remove, duration);
}

// --- Modal xác nhận bất đồng bộ: thay window.confirm ---
// Dùng: const ok = await confirmDialog('Nội dung'); if (!ok) return;
export function confirmDialog(message, options = {}) {
  if (typeof document === 'undefined') return Promise.resolve(false);
  injectStylesOnce();

  const { title = 'Xác nhận', okText = 'Đồng ý', cancelText = 'Hủy bỏ', danger = false, emoji = '❓' } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'bav-confirm-overlay';
    overlay.innerHTML = `
      <div class="bav-confirm-box" role="dialog" aria-modal="true">
        <div class="bav-confirm-body">
          <div class="bav-confirm-emoji">${emoji}</div>
          <h3 class="bav-confirm-title"></h3>
          <p class="bav-confirm-msg"></p>
        </div>
        <div class="bav-confirm-actions">
          <button type="button" class="bav-btn-cancel"></button>
          <button type="button" class="bav-btn-ok ${danger ? 'danger' : ''}"></button>
        </div>
      </div>`;
    // Gán text qua textContent để tránh lỗi XSS / hỏng layout với ký tự đặc biệt
    overlay.querySelector('.bav-confirm-title').textContent = title;
    overlay.querySelector('.bav-confirm-msg').textContent = String(message);
    const btnCancel = overlay.querySelector('.bav-btn-cancel');
    const btnOk = overlay.querySelector('.bav-btn-ok');
    btnCancel.textContent = cancelText;
    btnOk.textContent = okText;

    const close = (result) => {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };

    btnCancel.addEventListener('click', () => close(false));
    btnOk.addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); }); // bấm nền để hủy
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    btnOk.focus();
  });
}

// --- Modal NHẬP LIỆU bất đồng bộ: thay window.prompt ---
// Dùng: const reason = await promptDialog('Nhập lý do'); if (!reason) return;
// Trả về chuỗi đã trim, hoặc null nếu người dùng hủy / để trống (khi required).
export function promptDialog(message, options = {}) {
  if (typeof document === 'undefined') return Promise.resolve(null);
  injectStylesOnce();

  const {
    title = 'Nhập thông tin', okText = 'Xác nhận', cancelText = 'Hủy bỏ',
    placeholder = '', defaultValue = '', multiline = true, emoji = '✏️', required = true
  } = options;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'bav-confirm-overlay';
    const field = multiline
      ? `<textarea class="bav-prompt-input" rows="3"></textarea>`
      : `<input type="text" class="bav-prompt-input" />`;
    overlay.innerHTML = `
      <div class="bav-confirm-box" role="dialog" aria-modal="true">
        <div class="bav-confirm-body">
          <div class="bav-confirm-emoji">${emoji}</div>
          <h3 class="bav-confirm-title"></h3>
          <p class="bav-confirm-msg"></p>
          <div style="margin-top:14px;text-align:left;">${field}</div>
        </div>
        <div class="bav-confirm-actions">
          <button type="button" class="bav-btn-cancel"></button>
          <button type="button" class="bav-btn-ok"></button>
        </div>
      </div>`;
    overlay.querySelector('.bav-confirm-title').textContent = title;
    overlay.querySelector('.bav-confirm-msg').textContent = String(message);
    const input = overlay.querySelector('.bav-prompt-input');
    const btnCancel = overlay.querySelector('.bav-btn-cancel');
    const btnOk = overlay.querySelector('.bav-btn-ok');
    btnCancel.textContent = cancelText;
    btnOk.textContent = okText;
    input.placeholder = placeholder;
    input.value = defaultValue;
    // Style ô nhập đồng bộ thương hiệu
    input.style.cssText = 'width:100%;box-sizing:border-box;padding:11px 13px;border:1px solid #e2e8f0;border-radius:10px;font-size:0.95rem;font-family:inherit;outline:none;resize:vertical;';
    input.addEventListener('focus', () => { input.style.borderColor = BRAND; input.style.boxShadow = '0 0 0 3px rgba(43,104,48,0.1)'; });
    input.addEventListener('blur', () => { input.style.borderColor = '#e2e8f0'; input.style.boxShadow = 'none'; });

    const finish = (cancelled) => {
      const val = input.value.trim();
      if (!cancelled && required && val === '') {
        // Bắt buộc nhập: rung nhẹ ô input thay vì đóng
        input.style.borderColor = '#dc2626';
        input.focus();
        return;
      }
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      resolve(cancelled ? null : (val === '' ? null : val));
    };
    const onKey = (e) => {
      if (e.key === 'Escape') finish(true);
      // Enter trong input 1 dòng = xác nhận; textarea cho phép xuống dòng (Ctrl+Enter để gửi)
      if (e.key === 'Enter' && (!multiline || e.ctrlKey)) { e.preventDefault(); finish(false); }
    };

    btnCancel.addEventListener('click', () => finish(true));
    btnOk.addEventListener('click', () => finish(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) finish(true); });
    document.addEventListener('keydown', onKey);

    document.body.appendChild(overlay);
    input.focus();
  });
}

// --- GHI ĐÈ window.alert toàn cục bằng toast (không chặn luồng) ---
// Nhờ vậy toàn bộ 52 lệnh alert() cũ tự động thành toast mà không phải sửa từng file.
export function installGlobalNotify() {
  if (typeof window === 'undefined') return;
  window.toast = toast;                 // tiện gọi window.toast(...) ở bất cứ đâu
  window.confirmDialog = confirmDialog; // tiện gọi không cần import
  window.promptDialog = promptDialog;   // modal nhập liệu thay window.prompt
  window.alert = (message) => toast(message);
}

installGlobalNotify();
