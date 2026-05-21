const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

module.exports = mongoose.model("User", userSchema);
