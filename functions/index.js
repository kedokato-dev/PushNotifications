const express = require("express");
const admin = require("firebase-admin");
const schedule = require("node-schedule"); // Thư viện để lập lịch

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

// API lập lịch gửi báo cáo định kỳ
app.post("/scheduleNotification", (req, res) => {
  const { title, body, daysOfWeek, hour, minute } = req.body; // Nhận thông tin từ request

  if (!title || !body || !Array.isArray(daysOfWeek) || hour === undefined || minute === undefined) {
    return res.status(400).json({ error: "Thiếu thông tin tiêu đề, nội dung, ngày hoặc giờ." });
  }

  // Mảng ánh xạ dayOfWeek (0-6) thành tên tiếng Việt
  const dayNames = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

  // Lập lịch gửi thông báo cho từng ngày trong mảng daysOfWeek
  const daysMapped = daysOfWeek.map((dayOfWeek) => {
    schedule.scheduleJob(
      { dayOfWeek, hour, minute },
      async () => {
        const message = {
          notification: { title, body },
          topic: "daily-notifications",
        };

        try {
          await admin.messaging().send(message);
          console.log(`✅ Thông báo định kỳ đã được gửi vào ${dayNames[dayOfWeek]} lúc ${hour}:${minute}`);
        } catch (error) {
          console.error("❌ Lỗi khi gửi thông báo định kỳ:", error);
        }
      }
    );
    return dayNames[dayOfWeek]; // Trả về tên ngày
  });

  // Trả về thông báo thành công với danh sách các ngày
  res.status(200).json({
    success: `Lịch gửi thông báo đã được thiết lập vào ${daysMapped.join(", ")} lúc ${hour}:${minute}!`,
  });
});

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});