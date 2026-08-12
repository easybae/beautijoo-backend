const express = require("express");
const Salon = require("../models/Salon");
const Appointment = require("../models/Appointment");
const { requireAuth, requireOwner } = require("../middleware/auth");

const router = express.Router();

// GET /api/appointments/availability?staffId=&dateKey=
// عمومیه — برای نمایش ساعت‌های پر شده در فرانت‌اند، بدون نیاز به ورود
router.get("/availability", async (req, res) => {
  const { staffId, dateKey } = req.query;
  if (!staffId || !dateKey) return res.status(400).json({ error: "staffId و dateKey الزامی‌ان." });

  const taken = await Appointment.find({
    staffId, dateKey, status: { $ne: "cancelled" },
  }).select("time -_id");

  res.json(taken.map((t) => t.time));
});

// POST /api/appointments — ثبت نوبت جدید (نیازی به لاگین نیست، مشتری مهمان هم می‌تونه رزرو کنه)
router.post("/", async (req, res) => {
  try {
    const {
      salonId, serviceId, serviceName, price,
      staffId, staffName, dateKey, time,
      customerName, customerPhone,
    } = req.body;

    if (!salonId || !serviceId || !staffId || !dateKey || !time || !customerName || !customerPhone) {
      return res.status(400).json({ error: "اطلاعات رزرو ناقصه." });
    }
    if (!/^09\d{9}$/.test(customerPhone)) {
      return res.status(400).json({ error: "شماره موبایل معتبر نیست." });
    }

    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ error: "سالن پیدا نشد." });

    const appt = await Appointment.create({
      salon: salonId, salonName: salon.name,
      serviceId, serviceName, price,
      staffId, staffName, dateKey, time,
      customerName, customerPhone,
      status: "confirmed",
      payment: { status: "paid" },
    });

    res.status(201).json(appt);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "این ساعت همین الان توسط شخص دیگه‌ای رزرو شد." });
    }
    res.status(500).json({ error: "خطای سرور، دوباره تلاش کن." });
  }
});

// GET /api/appointments/mine — نوبت‌های سالنِ صاحب لاگین‌کرده
router.get("/mine", requireAuth, requireOwner, async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user.id });
  if (!salon) return res.json([]);
  const appts = await Appointment.find({ salon: salon._id }).sort({ createdAt: -1 });
  res.json(appts);
});

// PATCH /api/appointments/:id — تغییر وضعیت (تایید انجام‌شدن یا لغو) — فقط مالک سالن
router.patch("/:id", requireAuth, requireOwner, async (req, res) => {
  const appt = await Appointment.findById(req.params.id).populate("salon");
  if (!appt) return res.status(404).json({ error: "نوبت پیدا نشد." });
  if (String(appt.salon.owner) !== req.user.id) {
    return res.status(403).json({ error: "این نوبت متعلق به سالن شما نیست." });
  }
  if (!["done", "cancelled", "confirmed"].includes(req.body.status)) {
    return res.status(400).json({ error: "وضعیت نامعتبره." });
  }
  appt.status = req.body.status;
  await appt.save();
  res.json(appt);
});

module.exports = router;
