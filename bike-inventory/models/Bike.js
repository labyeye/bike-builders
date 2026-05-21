const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema({
  brand: String,
  model: String,
  modelYear: Number,
  kmDriven: Number,
  ownership: String,
  fuelType: { type: String, enum: ["Petrol", "EV"] },
  daysOld: Number,
  price: Number,
  downPayment: Number,
  emiAvailable: Boolean,
  emiAmount: Number,
  imageUrl: [String],
  status: {
    type: String,
    enum: ["Available", "Coming Soon", "Sold Out"],
    default: "Available",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Bike", bikeSchema);
