/**
 * Cloud Functions — 2SOL Operations.
 *
 * Gồm 2 hàm:
 *   1) sendNotificationOnNewTask (v1, us-central1): khi có NHIỆM VỤ MỚI được tạo,
 *      gửi FCM báo cho nhân sự được giao. (Tái tạo lại hàm cũ đã có trên server.)
 *   2) shiftReminders (v2, asia-southeast1, chạy mỗi 5 phút): nhắc TRƯỚC CA 30 phút
 *      và nhắc CHECK-OUT khi hết ca.
 *
 * Yêu cầu: Firebase gói Blaze. Deploy: firebase deploy --only functions
 */
const functionsV1 = require("firebase-functions/v1");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp({
  databaseURL:
    "https://beablevn-operation-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const RTDB_INSTANCE = "beablevn-operation-default-rtdb";

// Định dạng giờ HH:MM theo múi giờ Việt Nam.
function formatVNTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch (e) {
    return "";
  }
}

// =============================================================================
// 1) THÔNG BÁO KHI CÓ NHIỆM VỤ MỚI  (v1 — chạy ở us-central1 như hàm cũ)
//    Trigger: mỗi khi một node con mới được tạo dưới /tasks.
// =============================================================================
exports.sendNotificationOnNewTask = functionsV1.database
  .instance(RTDB_INSTANCE)
  .ref("/tasks/{taskId}")
  .onCreate(async (snapshot, context) => {
    const task = snapshot.val();
    if (!task || !task.assigneeId) return null;

    // Bỏ qua các ca sinh từ lịch định kỳ (fromScheduleId) để không spam khi sinh ca hàng loạt.
    if (task.fromScheduleId) return null;

    const tokenSnap = await admin
      .database()
      .ref(`staff/${task.assigneeId}/fcmToken`)
      .get();
    const token = tokenSnap.val();
    if (!token) return null;

    try {
      await admin.messaging().send({
        token,
        notification: {
          title: "Bạn có nhiệm vụ mới",
          body: `"${task.title || "Nhiệm vụ"}" vừa được giao cho bạn.`,
        },
        data: { taskKey: context.params.taskId, type: "new_task" },
        webpush: { fcmOptions: { link: "/staff/my-tasks" } },
      });
    } catch (e) {
      logger.warn(`sendNotificationOnNewTask FCM lỗi: ${e.message}`);
    }
    return null;
  });

// =============================================================================
// 2) NHẮC CA LÀM VIỆC  (v2 — chạy mỗi 5 phút, asia-southeast1)
//    - Nhắc TRƯỚC CA 30 phút (chưa check-in).
//    - Nhắc CHECK-OUT khi đã hết ca (đã check-in, chưa check-out).
//    Mỗi ca chỉ nhắc 1 lần nhờ cờ remindedStart / remindedEnd.
// =============================================================================
exports.shiftReminders = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
  },
  async () => {
    const db = admin.database();
    const now = Date.now();

    const REMIND_BEFORE_MS = 30 * 60 * 1000; // nhắc trước ca 30 phút
    const WINDOW_MS = 6 * 60 * 1000; // cửa sổ quét (> chu kỳ 5 phút) để không bỏ sót
    const AFTER_END_MS = 30 * 60 * 1000; // nhắc check-out trong vòng 30 phút sau khi hết ca

    const [staffSnap, tasksSnap] = await Promise.all([
      db.ref("staff").get(),
      db.ref("tasks").get(),
    ]);
    const staff = staffSnap.val() || {};
    const tasks = tasksSnap.val() || {};

    const jobs = [];
    for (const [key, t] of Object.entries(tasks)) {
      if (!t || !t.assigneeId) continue;
      const member = staff[t.assigneeId];
      const token = member && member.fcmToken;
      if (!token) continue;

      // Nhắc TRƯỚC CA 30 phút (chưa check-in, chưa nhắc lần nào).
      if (t.startTime && !t.checkInTime && !t.remindedStart) {
        const start = new Date(t.startTime).getTime();
        const diff = start - now;
        if (
          diff > 0 &&
          diff <= REMIND_BEFORE_MS &&
          diff > REMIND_BEFORE_MS - WINDOW_MS
        ) {
          jobs.push({
            token,
            key,
            flag: "remindedStart",
            title: "Sắp đến ca làm việc",
            body: `Ca "${t.title || "làm việc"}" bắt đầu lúc ${formatVNTime(
              t.startTime
            )}. Hãy đến nơi và điểm danh đúng giờ nhé!`,
          });
        }
      }

      // Nhắc CHECK-OUT khi đã hết ca (đã check-in, chưa check-out, chưa nhắc).
      if (t.endTime && t.checkInTime && !t.checkOutTime && !t.remindedEnd) {
        const end = new Date(t.endTime).getTime();
        if (now >= end && now <= end + AFTER_END_MS) {
          jobs.push({
            token,
            key,
            flag: "remindedEnd",
            title: "Đã hết ca làm việc",
            body: `Ca "${t.title || "làm việc"}" đã kết thúc lúc ${formatVNTime(
              t.endTime
            )}. Đừng quên Check-out để được chấm công nhé!`,
          });
        }
      }
    }

    let sent = 0;
    for (const j of jobs) {
      try {
        await admin.messaging().send({
          token: j.token,
          notification: { title: j.title, body: j.body },
          data: { taskKey: j.key, type: j.flag },
          webpush: { fcmOptions: { link: "/staff/attendance" } },
        });
        sent++;
      } catch (e) {
        logger.warn(`Gửi FCM thất bại cho task ${j.key}: ${e.message}`);
      }
      // Dù gửi được hay token hỏng, đánh dấu đã nhắc để không lặp lại liên tục.
      await db.ref(`tasks/${j.key}/${j.flag}`).set(true);
    }

    logger.info(
      `shiftReminders: quét ${Object.keys(tasks).length} task, gửi ${sent}/${jobs.length} thông báo.`
    );
  }
);
