// =============================================================================
// geofence.js — Kiểm tra nhân sự có ĐANG Ở trong khu vực Be Able VN khi điểm danh.
//
// Cách hoạt động: lấy toạ độ GPS của thiết bị (navigator.geolocation), tính khoảng
// cách tới toạ độ Be Able VN (công thức Haversine). Trong bán kính cho phép -> OK.
//
// ⚠️ CẦN CẤU HÌNH: điền toạ độ thật của Be Able VN vào WORKPLACE.lat / .lng bên dưới.
//   Cách lấy: mở Google Maps -> chuột phải đúng vị trí công ty -> bấm dòng toạ độ để
//   copy (vd "10.771530, 106.667840") -> lat = 10.771530, lng = 106.667840.
//   KHI lat/lng còn null: hệ thống TẠM KHÔNG chặn (cho điểm danh bình thường) để
//   tránh khoá nhầm toàn bộ nhân sự. Chặn chỉ bật khi đã điền toạ độ thật.
// =============================================================================

export const WORKPLACE = {
  lat: 10.773359568796218,   // Vĩ độ Be Able VN
  lng: 106.66984879450315,   // Kinh độ Be Able VN
  radiusMeters: 150,         // Bán kính cho phép điểm danh (mét). Tăng lên nếu hay bị chặn nhầm trong nhà.
  name: 'Be Able VN'
};

// Khoảng cách giữa 2 toạ độ (mét) — công thức Haversine.
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // bán kính Trái Đất (m)
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Kiểm tra vị trí hiện tại. Trả về Promise<{ ok, message?, distance? }>.
//  - ok === true  -> ở trong khu vực (hoặc chưa cấu hình toạ độ -> tạm cho qua).
//  - ok === false -> KHÔNG cho điểm danh, kèm `message` tiếng Việt để hiển thị.
export function verifyAtWorkplace() {
  return new Promise((resolve) => {
    // Chưa cấu hình toạ độ -> không chặn (chờ điền WORKPLACE.lat/lng).
    if (WORKPLACE.lat === null || WORKPLACE.lng === null) {
      resolve({ ok: true, skipped: true });
      return;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      resolve({ ok: false, message: 'Thiết bị không hỗ trợ định vị nên không thể điểm danh. Vui lòng dùng thiết bị có GPS.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distance = getDistanceMeters(
          pos.coords.latitude, pos.coords.longitude,
          WORKPLACE.lat, WORKPLACE.lng
        );
        if (distance <= WORKPLACE.radiusMeters) {
          resolve({ ok: true, distance, coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy } });
        } else {
          resolve({
            ok: false,
            distance,
            message: `Bạn chưa đến nơi làm việc (đang cách ${WORKPLACE.name} khoảng ${Math.round(distance)}m). Vui lòng đến công ty và thực hiện điểm danh lại.`
          });
        }
      },
      (err) => {
        let message;
        if (err && err.code === err.PERMISSION_DENIED) {
          // Nhân sự CHƯA cho phép quyền truy cập vị trí.
          message = 'Bạn chưa cho phép truy cập Vị trí. Vui lòng vào cài đặt trình duyệt, BẬT quyền Vị trí cho ứng dụng rồi điểm danh lại.';
        } else if (err && err.code === err.POSITION_UNAVAILABLE) {
          // Đã cho phép nhưng GPS đang tắt / không lấy được vị trí.
          message = 'Chưa lấy được vị trí. Vui lòng BẬT Định vị (GPS) trên thiết bị rồi thử điểm danh lại.';
        } else if (err && err.code === err.TIMEOUT) {
          message = 'Lấy vị trí quá lâu. Vui lòng kiểm tra Định vị (GPS) đang bật và thử lại.';
        } else {
          message = 'Không xác định được vị trí. Vui lòng BẬT Định vị (GPS) và thử lại.';
        }
        resolve({ ok: false, message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
