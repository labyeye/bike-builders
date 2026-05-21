const mongoose = require("mongoose");

const quoteRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  brand: String,
  model: String,
  year: Number,
  budget: Number,
  notes: String,
  status: {
    type: String,
    enum: ["Pending", "Contacted", "Completed"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QuoteRequest", quoteRequestSchema);
