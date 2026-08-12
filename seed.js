// اجرا با: node seed.js
// این اسکریپت چند سالن نمونه با یک کاربر صاحب برای هرکدوم میسازه، فقط برای تست.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Salon = require("./models/Salon");

const DEMO = [
  {
    owner: { name: "مریم صادقی", phone: "09120000001", password: "test1234", role: "owner" },
    salon: {
      name: "سالن زیبایی ریسا", category: "زنانه",
      address: "تهران، ونک، خیابان ملاصدرا", accent: "#E8B4B0",
      desc: "تخصصی در رنگ مو، کراتینه و آرایش صورت با محصولات اورجینال.",
      services: [
        { name: "کوتاهی مو", price: 350000, duration: 30 },
        { name: "رنگ مو ریشه", price: 950000, duration: 90 },
        { name: "میکاپ عروس", price: 3500000, duration: 120 },
      ],
      staff: [
        { name: "مریم صادقی", specialty: "رنگ و کراتینه" },
        { name: "نیلوفر رضایی", specialty: "میکاپ" },
      ],
    },
  },
  {
    owner: { name: "امیر حسینی", phone: "09120000002", password: "test1234", role: "owner" },
    salon: {
      name: "باربرشاپ کاپیتان", category: "مردانه",
      address: "تهران، سعادت‌آباد، بلوار فرهنگ", accent: "#C9A24B",
      desc: "اصلاح کلاسیک و مدرن، پیرایش ریش با تیغ.",
      services: [
        { name: "کوتاهی مو مردانه", price: 220000, duration: 30 },
        { name: "اصلاح ریش با تیغ", price: 150000, duration: 20 },
        { name: "کوتاهی + اصلاح", price: 330000, duration: 45 },
      ],
      staff: [{ name: "امیر حسینی", specialty: "فید و اصلاح" }],
    },
  },
  {
    owner: { name: "سارا کریمی", phone: "09120000003", password: "test1234", role: "owner" },
    salon: {
      name: "استودیو ناخن لمیرال", category: "ناخن",
      address: "تهران، جردن، خیابان نلسون ماندلا", accent: "#E3C878",
      desc: "کاشت، ژلیش و طراحی ناخن با اصول بهداشتی کامل.",
      services: [
        { name: "کاشت ناخن ژل", price: 650000, duration: 60 },
        { name: "ژلیش ناخن طبیعی", price: 280000, duration: 40 },
      ],
      staff: [
        { name: "سارا کریمی", specialty: "طراحی ناخن" },
        { name: "الناز محمدی", specialty: "کاشت" },
      ],
    },
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("متصل شد، در حال ساخت دادههای نمونه...");

  for (const item of DEMO) {
    let user = await User.findOne({ phone: item.owner.phone });
    if (!user) {
      user = new User({ name: item.owner.name, phone: item.owner.phone, role: item.owner.role });
      await user.setPassword(item.owner.password);
      await user.save();
      console.log(`+ کاربر ساخته شد: ${item.owner.name} (${item.owner.phone} / رمز: ${item.owner.password})`);
    }

    const already = await Salon.findOne({ owner: user._id });
    if (!already) {
      await Salon.create({ ...item.salon, owner: user._id });
      console.log(`+ سالن ساخته شد: ${item.salon.name}`);
    } else {
      console.log(`- سالن قبلاً وجود داره: ${item.salon.name}`);
    }
  }

  console.log("تمام شد ✓");
  await mongoose.disconnect();
})();
