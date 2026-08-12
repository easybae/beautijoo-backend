require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const salonRoutes = require("./routes/salons");
const appointmentRoutes = require("./routes/appointments");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

// جلوگیری از حملات brute-force روی مسیرهای ورود/ثبت‌نام
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/salons", salonRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`✓ سرور روی پورت ${PORT} بالا اومد`));
});
