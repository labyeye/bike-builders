const mongoose = require("mongoose");

const sellRequestSchema = new mongoose.Schema({
  brand: String,
  model: String,
  year: Number,
  expectedPrice: Number,
  images: [String],
  sellerName: String,
  sellerEmail: String,
  sellerPhone: String,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SellRequest", sellRequestSchema);
