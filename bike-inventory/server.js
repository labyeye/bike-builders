require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();
const port = process.env.PORT || 5000;

// Environment check logging
console.log("Environment check:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SESSION_SECRET exists:", !!process.env.SESSION_SECRET);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// If the app is behind a proxy (Render, Heroku, etc.) allow Express to
// trust the proxy so secure cookies and req.protocol are handled correctly.
app.set('trust proxy', 1); // trust first proxy
// CORS configuration
// In development we allow any origin to simplify local testing (avoids common CORB/CORS issues).
// In production we restrict to a known allowlist.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://www.bikebuilders.in",
  "https://bike-builders-ii74.vercel.app",
  "https://bike-builders-lfn5tcmcq-labyeyes-projects.vercel.app",
  // Add your actual deployment URLs here
];

if (process.env.NODE_ENV !== "production") {
  // Development: allow any origin (keeps credentials enabled)
  app.use(
    cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
} else {
  // Production: strict allowlist
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like server-to-server or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log("Blocked by CORS:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Updated session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rgesda543",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // 1 hour
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true, // Add this for security
      // Don't set domain unless absolutely necessary
    },
    proxy: process.env.NODE_ENV === "production",
  })
);

// Mongoose schemas
const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: "Bike" },
  paymentMethod: String,
  amount: Number,
  transactionId: String,
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

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

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

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

const reviewSchema = new mongoose.Schema({
  name: String,
  message: String,
  rating: Number,
  date: { type: Date, default: Date.now },
});

// Models
const Bike = mongoose.model("Bike", bikeSchema);
const User = mongoose.model("User", userSchema);
const SellRequest = mongoose.model("SellRequest", sellRequestSchema);
const QuoteRequest = mongoose.model("QuoteRequest", quoteRequestSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const Offer = mongoose.model("Offer", offerSchema);
const Review = mongoose.model("Review", reviewSchema);

// Create default admin user
(async function () {
  const existing = await User.findOne({ username: "admin" });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({ username: "admin", password: hashed, role: "admin" });
    console.log("🔑 Admin created: admin / admin123");
  }
})();

// Middleware
function isAuthenticated(req, res, next) {
  console.log("Auth check:", req.session.isAuthenticated, req.session.user); // Add logging
  if (req.session.isAuthenticated) return next();
  res.status(401).json({ success: false, error: "Unauthorized" });
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") return next();
  res.status(403).json({ success: false, error: "Access denied" });
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Bike Inventory System API" });
});

// Login route with improved logging
app.post("/api/admin/login", async (req, res) => {
  console.log("Login attempt:", req.body.username); // Add logging

  try {
    const user = await User.findOne({ username: req.body.username });
    const valid =
      user && (await bcrypt.compare(req.body.password, user.password));

    if (!valid) {
      console.log("Invalid credentials for:", req.body.username); // Add logging
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.isAuthenticated = true;
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    console.log(
      "Login successful for:",
      user.username,
      "Session:",
      req.session.user
    ); // Add logging
    res.json({ success: true, user: req.session.user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Check auth route with better caching headers
app.get("/api/admin/check-auth", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  console.log(
    "Auth check request:",
    req.session.isAuthenticated,
    req.session.user
  ); // Add logging

  if (req.session.isAuthenticated && req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get("/api/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

// Public routes
app.get("/api/bikes", async (req, res) => {
  try {
    const bikes = await Bike.find();
    res.json({ success: true, bikes });
  } catch (err) {
    console.error("Error fetching bikes:", err);
    res.status(500).json({ success: false, error: "Failed to fetch bikes" });
  }
});

app.get("/api/featured-bikes", async (req, res) => {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: bikes });
  } catch (err) {
    console.error("Error fetching featured bikes:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch featured bikes" });
  }
});

app.get("/api/available-bikes", async (req, res) => {
  try {
    const bikes = await Bike.find({ status: "Available" });
    res.json(bikes);
  } catch (err) {
    console.error("Error fetching available bikes:", err);
    res.status(500).json({ error: "Failed to fetch available bikes" });
  }
});

// Protected routes
app.get("/api/stats", isAuthenticated, async (req, res) => {
  try {
    const stats = {
      total: await Bike.countDocuments(),
      available: await Bike.countDocuments({ status: "Available" }),
      sold: await Bike.countDocuments({ status: "Sold Out" }),
    };
    res.json({ success: true, ...stats });
  } catch (err) {
    console.error("Error loading stats:", err);
    res.status(500).json({ success: false, error: "Error loading stats" });
  }
});

app.get("/api/admin/dashboard", isAuthenticated, async (req, res) => {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    const stats = {
      total: await Bike.countDocuments(),
      available: await Bike.countDocuments({ status: "Available" }),
      comingSoon: await Bike.countDocuments({ status: "Coming Soon" }),
      sold: await Bike.countDocuments({ status: "Sold Out" }),
    };

    res.json({ success: true, bikes, stats, user: req.session.user });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).json({ success: false, error: "Error loading dashboard" });
  }
});

app.get("/api/admin/bike/:id", isAuthenticated, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, error: "Bike not found" });
    }
    res.json({ success: true, bike });
  } catch (err) {
    console.error("Error loading bike:", err);
    res.status(500).json({ success: false, error: "Error loading bike" });
  }
});

app.put("/api/admin/bike/:id", isAuthenticated, async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!bike) {
      return res.status(404).json({ success: false, error: "Bike not found" });
    }
    res.json({ success: true, bike });
  } catch (err) {
    console.error("Error updating bike:", err);
    res.status(500).json({ success: false, error: "Error updating bike" });
  }
});

app.delete(
  "/api/admin/bike/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const bike = await Bike.findByIdAndDelete(req.params.id);
      if (!bike) {
        return res
          .status(404)
          .json({ success: false, error: "Bike not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting bike:", err);
      res.status(500).json({ success: false, error: "Error deleting bike" });
    }
  }
);



// Staff management routes
app.get("/api/admin/staff", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const staff = await User.find().select("-password").sort({ role: 1 });
    res.json({ success: true, staff });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

app.post("/api/admin/staff", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      role: req.body.role,
    });

    // Don't send password back
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Error adding staff:", err);
    if (err.code === 11000) {
      res
        .status(400)
        .json({ success: false, error: "Username already exists" });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to add staff member" });
    }
  }
});

app.delete(
  "/api/admin/staff/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      if (req.params.id === req.session.user.id) {
        return res
          .status(400)
          .json({ success: false, error: "Cannot delete your own account" });
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting staff:", err);
      res
        .status(500)
        .json({ success: false, error: "Error deleting staff member" });
    }
  }
);

// Sell request routes
app.post("/api/sell-request", upload.array("images", 5), async (req, res) => {
  try {
    const { brand, model, year, price, name, email, phone } = req.body;

    if (!brand || !model || !year || !price || !name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const images = req.files ? req.files.map((file) => file.filename) : [];

    const sellRequest = new SellRequest({
      brand,
      model,
      year,
      expectedPrice: price,
      images,
      sellerName: name,
      sellerEmail: email,
      sellerPhone: phone,
    });

    await sellRequest.save();
    res.json({ success: true, message: "Sell request submitted successfully" });
  } catch (err) {
    console.error("Error submitting sell request:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to submit sell request" });
  }
});

// Accept multipart/form-data for image uploads
app.post("/api/admin/bike", isAuthenticated, upload.array("images", 5), async (req, res) => {
  try {
    // Build imageUrl array from uploaded files (if any)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.imageUrls) {
      // fallback to any imageUrls provided in body
      imageUrls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : [req.body.imageUrls];
      imageUrls = imageUrls.filter((u) => u && u.trim() !== "");
    }

    const bikeData = {
      brand: req.body.brand,
      model: req.body.model,
      modelYear: Number(req.body.modelYear),
      kmDriven: Number(req.body.kmDriven),
      ownership: req.body.ownership,
      fuelType: req.body.fuelType,
      daysOld: Number(req.body.daysOld),
      price: Number(req.body.price),
      downPayment: Number(req.body.downPayment),
      emiAvailable: req.body.emiAvailable === 'true' || req.body.emiAvailable === true,
      emiAmount: req.body.emiAvailable ? Number(req.body.emiAmount) : null,
      imageUrl: imageUrls,
      status: req.body.status,
      stock: req.body.stock ? Number(req.body.stock) : 1,
    };

    // Validation
    if (
      !bikeData.brand ||
      !bikeData.model ||
      isNaN(bikeData.modelYear) ||
      isNaN(bikeData.kmDriven) ||
      !bikeData.ownership ||
      !bikeData.fuelType ||
      isNaN(bikeData.daysOld) ||
      isNaN(bikeData.price) ||
      isNaN(bikeData.downPayment) ||
      !bikeData.status
    ) {
      return res.status(400).json({ success: false, error: "Invalid data. Please check all required fields." });
    }

    const bike = new Bike(bikeData);
    await bike.save();
    res.json({ success: true, bike });
  } catch (err) {
    console.error("Error adding bike:", err);
    res.status(500).json({ success: false, error: "Failed to add bike" });
  }
});


app.get("/api/admin/quote-requests", isAuthenticated, async (req, res) => {
  try {
    const requests = await QuoteRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error("Error loading quote requests:", err);
    res
      .status(500)
      .json({ success: false, error: "Error loading quote requests" });
  }
});

app.put("/api/admin/quote-request/:id", isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) {
      return res
        .status(404)
        .json({ success: false, error: "Request not found" });
    }
    res.json({ success: true, request });
  } catch (err) {
    console.error("Error updating quote request:", err);
    res
      .status(500)
      .json({ success: false, error: "Error updating quote request" });
  }
});

// Booking routes
app.post("/api/book-bike", async (req, res) => {
  try {
    const { name, email, phone, bikeId, paymentMethod, amount, transactionId } =
      req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !bikeId ||
      !paymentMethod ||
      !amount ||
      !transactionId
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const bike = await Bike.findById(bikeId);
    if (!bike || bike.status !== "Available") {
      return res
        .status(400)
        .json({ success: false, error: "Bike not available" });
    }

    const booking = new Booking({
      name,
      email,
      phone,
      bikeId,
      paymentMethod,
      amount,
      transactionId,
    });

    await booking.save();
    await Bike.findByIdAndUpdate(bikeId, { status: "Sold Out" });

    res.json({ success: true, message: "Booking confirmed" });
  } catch (err) {
    console.error("Error processing booking:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to process booking" });
  }
});

app.get("/api/admin/bookings", isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("bikeId")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Error loading bookings:", err);
    res.status(500).json({ success: false, error: "Error loading bookings" });
  }
});

app.put("/api/admin/booking/:id", isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("bikeId");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    if (status === "Confirmed" && booking.bikeId && booking.bikeId._id) {
      await Bike.findByIdAndUpdate(booking.bikeId._id, { status: "Sold Out" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ success: false, error: "Error updating booking" });
  }
});

app.delete("/api/admin/booking/:id", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ success: false, error: "Error deleting booking" });
  }
});

// Offer routes
app.get("/api/offers", async (req, res) => {
  try {
    const currentDate = new Date();
    const offers = await Offer.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: "active",
    }).sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ success: false, error: "Failed to fetch offers" });
  }
});

app.get("/api/admin/offers", isAuthenticated, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ startDate: -1 });
    res.json({ success: true, offers });
  } catch (err) {
    console.error("Error loading offers:", err);
    res.status(500).json({ success: false, error: "Error loading offers" });
  }
});

app.post("/api/admin/offers", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, type, image, startDate, endDate, cta, link } =
      req.body;

    if (!title || !description || !type || !image || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const offer = new Offer({
      title,
      description,
      type,
      image,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      cta: cta || "Learn More",
      link: link || null,
    });

    await offer.save();
    res.json({ success: true, offer });
  } catch (err) {
    console.error("Error adding offer:", err);
    res.status(500).json({ success: false, error: "Error adding offer" });
  }
});

app.put("/api/admin/offers/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }
    res.json({ success: true, offer });
  } catch (err) {
    console.error("Error updating offer:", err);
    res.status(500).json({ success: false, error: "Error updating offer" });
  }
});

app.delete(
  "/api/admin/offers/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const offer = await Offer.findByIdAndDelete(req.params.id);
      if (!offer) {
        return res
          .status(404)
          .json({ success: false, error: "Offer not found" });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting offer:", err);
      res.status(500).json({ success: false, error: "Error deleting offer" });
    }
  }
);

// Review routes
app.post("/api/reviews", async (req, res) => {
  try {
    const { name, message, rating } = req.body;
    if (!name || !message || !rating) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const review = new Review({ name, message, rating });
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ success: false, error: "Failed to save review" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
