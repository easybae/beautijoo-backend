const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ به دیتابیس MongoDB وصل شد");
  } catch (err) {
    console.error("✗ اتصال به دیتابیس ناموفق بود:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
