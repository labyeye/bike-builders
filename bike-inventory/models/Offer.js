const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ["festival", "sale", "event", "new"],
    required: true,
  },
  image: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  cta: { type: String, default: "Learn More" },
  link: { type: String },
  status: {
    type: String,
    enum: ["active", "expired", "upcoming"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Offer", offerSchema);
