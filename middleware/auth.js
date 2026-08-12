const jwt = require("jsonwebtoken");

// این میان‌افزار توکن رو چک می‌کنه و کاربر رو به req.user اضافه می‌کنه.
// اگه توکن نامعتبر یا نبود، خطای ۴۰۱ برمی‌گردونه.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "لطفاً ابتدا وارد حساب شو." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, phone, role }
    next();
  } catch {
    return res.status(401).json({ error: "نشست شما منقضی شده، دوباره وارد شو." });
  }
}

// فقط کاربرهایی که نقش‌شون owner هست اجازه‌ی عبور دارن
function requireOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ error: "این عملیات فقط برای صاحبان آرایشگاه مجازه." });
  }
  next();
}

module.exports = { requireAuth, requireOwner };
