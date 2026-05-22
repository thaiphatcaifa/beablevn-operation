import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database"; 
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging"; // Import thêm các hàm FCM

const firebaseConfig = {
  apiKey: "AIzaSyCcDf-QwrU2zkkQan49gSdq6AkjY5JI2rQ",
  authDomain: "beablevn-operation.firebaseapp.com",
  databaseURL: "https://beablevn-operation-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beablevn-operation",
  storageBucket: "beablevn-operation.firebasestorage.app",
  messagingSenderId: "18301003388",
  appId: "1:18301003388:web:a32ceea5343c27a1134bf9",
  measurementId: "G-L54LMGPTL4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 
export const auth = getAuth(app);
export const messaging = getMessaging(app); // Khởi tạo Messaging

// Hàm yêu cầu cấp quyền và lấy FCM Token
export const requestForToken = async (userId) => {
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: 'BPgCtTrlZjXsoVco8xzaHzlub-jt4nLFZZVprTLiXpQDqSt6gkVLiLIH_mEEiiy0EEyd88Y0zVpfTn-BzgV7wjs' 
    });
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      
      // Tự động ghi đè/cập nhật token này vào đường dẫn staff/' + userId + '/fcmToken trên Realtime Database
      if (userId) {
        const tokenRef = ref(db, 'staff/' + userId);
        await update(tokenRef, {
          fcmToken: currentToken
        });
        console.log('Đã cập nhật FCM Token lên Realtime Database thành công cho user:', userId);
      } else {
        console.log('Không có userId được cung cấp, bỏ qua cập nhật Database.');
      }

      return currentToken;
    } else {
      console.log('Không thể lấy được token. Người dùng chưa cấp quyền.');
      return null;
    }
  } catch (err) {
    console.log('Lỗi khi lấy FCM token:', err);
    return null;
  }
};

// Hàm lắng nghe thông báo khi ứng dụng ĐANG MỞ (Foreground)
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });