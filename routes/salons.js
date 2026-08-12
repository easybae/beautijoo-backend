const express = require("express");
const Salon = require("../models/Salon");
const { requireAuth, requireOwner } = require("../middleware/auth");

const router = express.Router();

// GET /api/salons  — فهرست عمومی همه‌ی سالنها (بدون نیاز به ورود)
router.get("/", async (req, res) => {
  const salons = await Salon.find().sort({ createdAt: -1 });
  res.json(salons);
});

// GET /api/salons/mine — سالن متعلق به کاربر لاگین‌کرده
router.get("/mine", requireAuth, requireOwner, async (req, res) => {
  const salon = await Salon.findOne({ owner: req.user.id });
  res.json(salon || null);
});

// POST /api/salons — ساخت سالن جدید (فقط owner و فقط یک سالن به ازای هر owner)
router.post("/", requireAuth, requireOwner, async (req, res) => {
  const already = await Salon.findOne({ owner: req.user.id });
  if (already) return res.status(409).json({ error: "شما قبلاً یک سالن ساختی." });

  const { name, category, address, desc, accent } = req.body;
  if (!name || !category || !address) {
    return res.status(400).json({ error: "نام، دسته‌بندی و آدرس الزامی‌ان." });
  }

  const salon = await Salon.create({
    name, category, address, desc, accent,
    owner: req.user.id, services: [], staff: [],
  });
  res.status(201).json(salon);
});

// PATCH /api/salons/:id — ویرایش سالن (فقط مالک همون سالن)
router.patch("/:id", requireAuth, requireOwner, async (req, res) => {
  const salon = await Salon.findById(req.params.id);
  if (!salon) return res.status(404).json({ error: "سالن پیدا نشد." });
  if (String(salon.owner) !== req.user.id) {
    return res.status(403).json({ error: "این سالن متعلق به شما نیست." });
  }

  const allowed = ["name", "category", "address", "desc", "accent", "services", "staff"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) salon[key] = req.body[key];
  }
  await salon.save();
  res.json(salon);
});

module.exports = router;
