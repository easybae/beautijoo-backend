const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
    salonName: String,
    serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    serviceName: String,
    price: Number,
    staffId: { type: mongoose.Schema.Types.ObjectId, required: true },
    staffName: String,
    dateKey: { type: String, required: true }, // e.g. "2026-8-15"
    time: { type: String, required: true }, // e.g. "14:30"
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true, match: /^09\d{9}$/ },
    status: {
      type: String,
      enum: ["confirmed", "done", "cancelled"],
      default: "confirmed",
    },
    // اطلاعات تراکنش پرداخت (بعد از اتصال درگاه واقعی پر می‌شه)
    payment: {
      authority: String, // کد Authority زرین‌پال
      refId: String, // کد پیگیری بعد از تایید پرداخت
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    },
  },
  { timestamps: true }
);

// جلوگیری از دوبل‌بوک شدن یک آرایشگر در یک زمان مشخص
appointmentSchema.index(
  { staffId: 1, dateKey: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
