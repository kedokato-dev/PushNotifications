const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json()); // Hỗ trợ JSON trong request

// Khởi tạo Firebase Admin SDK
const serviceAccount = require("./study-cpp-firebase-adminsdk-fbsvc-8a90bdec30.json"); // Thay bằng đường dẫn file JSON của bạn

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// API gửi thông báo ngay lập tức
app.post("/sendNotification", async (req, res) => {
  const { title, body } = req.body; // Nhận tiêu đề và nội dung từ request

  if (!title || !body) {
    return res.status(400).json({ error: "Thiếu tiêu đề hoặc nội dung thông báo." });
  }

  const message = {
    notification: { title, body },
    topic: "daily-notifications",
  };

  try {
    await admin.messaging().send(message);
    console.log("✅ Thông báo đã được gửi thành công!");
    res.status(200).json({ success: "Thông báo đã được gửi!" });
  } catch (error) {
    console.error("❌ Lỗi khi gửi thông báo:", error);
    res.status(500).json({ error: "Gửi thông báo thất bại!", details: error.message });
  }
});

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
