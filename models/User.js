const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: /^09\d{9}$/,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "owner"], default: "customer" },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toSafeJSON = function () {
  return { id: this._id, name: this.name, phone: this.phone, role: this.role };
};

module.exports = mongoose.model("User", userSchema);
