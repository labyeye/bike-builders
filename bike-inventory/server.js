require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const connectDB = require("./db");
const buildCors = require("./middleware/cors");
const requestLogger = require("./middleware/logger");
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

if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET env var is missing. Auth will not work. Set it in .env and restart.");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("❌ FATAL: MONGO_URI env var is missing. Cannot connect to database.");
  process.exit(1);
}

connectDB()
  .then(ensureAdminUser)
  .catch((err) => {
    console.error("❌ FATAL: DB connection failed:", err.message);
    process.exit(1);
  });

app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({ extended: true, limit: "2mb" }));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(buildCors());
app.use(requestLogger);

// extend default 2-minute server timeout for slow uploads
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes
  res.setTimeout(120000);
  next();
});

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

const multer = require("multer");

app.use((err, req, res, next) => {
  // multer-specific errors → 400
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "Each image must be under 10 MB.",
      LIMIT_FILE_COUNT: "Too many files. Max 5 images per bike.",
      LIMIT_UNEXPECTED_FILE: `Unexpected file field: ${err.field}`,
    };
    const msg = messages[err.code] || `Upload error: ${err.message}`;
    console.warn(`⚠️ multer error on ${req.method} ${req.originalUrl}: ${err.code} — ${msg}`);
    return res.status(400).json({ success: false, error: msg, code: err.code });
  }

  // file filter rejection (non-image)
  if (err && /Invalid file type/.test(err.message || "")) {
    console.warn(`⚠️ file filter rejected on ${req.method} ${req.originalUrl}: ${err.message}`);
    return res.status(400).json({ success: false, error: err.message });
  }

  // CORS rejection
  if (err && /Not allowed by CORS/i.test(err.message || "")) {
    console.warn(`⚠️ CORS rejected on ${req.method} ${req.originalUrl}: ${err.message}`);
    return res.status(403).json({ success: false, error: err.message });
  }

  console.error(
    `❌ Unhandled error on ${req.method} ${req.originalUrl}:`,
    err.name,
    err.message
  );
  if (err.stack) console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
    name: err.name,
  });
});

app.use((req, res) => {
  console.warn(`⚠️  404 — no route matched ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: "Route not found" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
