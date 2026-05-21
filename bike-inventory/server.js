require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const connectDB = require("./db");
const buildCors = require("./middleware/cors");
const { ensureAdminUser } = require("./controllers/authController");

const authRoutes = require("./routes/auth");
const bikeRoutes = require("./routes/bikes");
const staffRoutes = require("./routes/staff");
const sellRequestRoutes = require("./routes/sellRequests");
const quoteRoutes = require("./routes/quotes");
const bookingRoutes = require("./routes/bookings");
const offerRoutes = require("./routes/offers");
const updateRoutes = require("./routes/updates");
const reviewRoutes = require("./routes/reviews");
const app = express();
const port = process.env.PORT || 5000;

console.log("Environment check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

connectDB()
  .then(ensureAdminUser)
  .catch(() => {});

app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(buildCors());

app.get("/", (req, res) => {
  res.json({ message: "Bike Inventory System API" });
});

app.use("/api", authRoutes);
app.use("/api", bikeRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api", sellRequestRoutes);
app.use("/api", quoteRoutes);
app.use("/api", bookingRoutes);
app.use("/api", offerRoutes);
app.use("/api", updateRoutes);
app.use("/api", reviewRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
