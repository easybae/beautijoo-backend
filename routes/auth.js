const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: "همه‌ی فیلدها الزامی‌ان." });
    }
    if (!/^09\d{9}$/.test(phone)) {
      return res.status(400).json({ error: "شماره موبایل معتبر نیست." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "رمز عبور باید حداقل ۴ کاراکتر باشه." });
    }

    const exists = await User.findOne({ phone });
    if (exists) return res.status(409).json({ error: "این شماره قبلاً ثبت‌نام کرده." });

    const user = new User({ name, phone, role: role === "owner" ? "owner" : "customer" });
    await user.setPassword(password);
    await user.save();

    res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: "خطای سرور، دوباره تلاش کن." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ error: "شماره یا رمز عبور اشتباهه." });

    const ok = await user.checkPassword(password || "");
    if (!ok) return res.status(401).json({ error: "شماره یا رمز عبور اشتباهه." });

    res.json({ token: signToken(user), user: user.toSafeJSON() });
  } catch (err) {
    res.status(500).json({ error: "خطای سرور، دوباره تلاش کن." });
  }
});

module.exports = router;
