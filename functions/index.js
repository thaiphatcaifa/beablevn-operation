const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();

// Lắng nghe sự kiện khi có dữ liệu mới được tạo trong nhánh /tasks
exports.sendNotificationOnNewTask = functions.database.ref('/tasks/{taskId}')
  .onCreate(async (snapshot, context) => {
    const taskData = snapshot.val();
    
    // ĐÃ SỬA: Tìm ID nhân sự ở trường 'assigneeId' cho khớp với DB của bạn
    const staffId = taskData.assigneeId; 
    
    // Nếu không có id người nhận thì bỏ qua
    if (!staffId) return null;

    // Truy vấn vào DB để lấy fcmToken của nhân viên đó
    const staffRef = admin.database().ref(`/staffList/${staffId}`);
    const staffSnapshot = await staffRef.once('value');
    const staffData = staffSnapshot.val();

    if (staffData && staffData.fcmToken) {
      // Định nghĩa nội dung thông báo
      // ĐÃ SỬA: Lấy nội dung từ trường 'description'
      const message = {
        notification: {
          title: "Bạn có nhiệm vụ mới!",
          body: `Nhiệm vụ: ${taskData.description || 'Vui lòng vào app để kiểm tra'}`,
        },
        token: staffData.fcmToken
      };

      // Gửi thông báo qua Firebase Cloud Messaging
      try {
        await admin.messaging().send(message);
        console.log("Đã gửi thông báo thành công tới:", staffId);
      } catch (error) {
        console.error("Lỗi khi gửi thông báo:", error);
      }
    } else {
      console.log("Nhân viên này chưa có fcmToken (chưa cấp quyền hoặc chưa đăng nhập).");
    }
    
    return null;
  });