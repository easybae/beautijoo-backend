const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 5 }, // minutes
  },
  { _id: true }
);

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, default: "—", trim: true },
  },
  { _id: true }
);

const salonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["زنانه", "مردانه", "ناخن", "پوست و مو", "آرایش عروس"],
      required: true,
    },
    address: { type: String, required: true, trim: true },
    desc: { type: String, default: "" },
    accent: { type: String, default: "#E8B4B0" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    services: [serviceSchema],
    staff: [staffSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", salonSchema);
