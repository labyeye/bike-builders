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
const port = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: true, // or specify your frontend URL like "http://localhost:3000"
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rgesda543",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);

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

const Bike = mongoose.model("Bike", bikeSchema);
const User = mongoose.model("User", userSchema);
const SellRequest = mongoose.model("SellRequest", sellRequestSchema);
const QuoteRequest = mongoose.model("QuoteRequest", quoteRequestSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const Offer = mongoose.model("Offer", offerSchema);

(async function () {
  const existing = await User.findOne({ username: "admin" });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({ username: "admin", password: hashed, role: "admin" });
    console.log("🔐 Admin created: admin / admin123");
  }
})();

function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) return next();
  res.status(401).json({ success: false, error: "Unauthorized" });
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") return next();
  res.status(403).json({ success: false, error: "Access denied" });
}

app.get("/", (req, res) => {
  res.json({ message: "Bike Inventory System API" });
});

app.post("/api/admin/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  const valid = user && (await bcrypt.compare(req.body.password, user.password));

  if (!valid) return res.status(401).json({ success: false, error: "Invalid credentials" });

  req.session.isAuthenticated = true;
  req.session.user = {
    username: user.username,
    role: user.role,
  };

  res.json({ success: true, user: req.session.user });
});

app.get("/api/admin/check-auth", (req, res) => {
  if (req.session.isAuthenticated) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get("/api/admin/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get("/api/bikes", async (req, res) => {
  try {
    const bikes = await Bike.find({ status: "Available" });
    res.json({ success: true, bikes });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch bikes" });
  }
});
app.get("/api/featured-bikes", async (req, res) => {
  try {
    const bikes = await Bike.find({ status: "Available" })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, data: bikes });
  } catch (err) {
    console.error("Error fetching featured bikes:", err);
    res.status(500).json({ success: false, error: "Failed to fetch featured bikes" });
  }
});
app.get("/api/stats", isAuthenticated, async (req, res) => {
  try {
    const stats = {
      total: await Bike.countDocuments(),
      available: await Bike.countDocuments({ status: "Available" }),
      sold: await Bike.countDocuments({ status: "Sold Out" }),
    };
    res.json({ success: true, ...stats });
  } catch (err) {
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
    res.status(500).json({ success: false, error: "Error loading dashboard" });
  }
});

app.get("/api/admin/bike/:id", isAuthenticated, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    res.json({ success: true, bike });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error loading bike" });
  }
});

app.put("/api/admin/bike/:id", isAuthenticated, async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, bike });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error updating bike" });
  }
});

app.delete("/api/admin/bike/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Bike.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error deleting bike" });
  }
});
// Remove the first POST route (around line 141-178) and keep only this one
app.post("/api/admin/bike", isAuthenticated, async (req, res) => {
  try {
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
      imageUrl: req.body.imageUrls || [], // Accept imageUrls from frontend
      status: req.body.status,
    };

    // Filter out empty image URLs
    if (Array.isArray(bikeData.imageUrl)) {
      bikeData.imageUrl = bikeData.imageUrl.filter(url => url && url.trim() !== "");
    }

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

app.get("/api/admin/staff", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const staff = await User.find().sort({ role: 1 });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

app.post("/api/admin/staff", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role,
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add staff member" });
  }
});

app.delete("/api/admin/staff/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    if (req.params.id === req.session.user._id) {
      return res.status(400).json({ success: false, error: "Cannot delete your own account" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error deleting staff member" });
  }
});

app.post("/api/sell-request", upload.array("images", 5), async (req, res) => {
  try {
    const { brand, model, year, price, name, email, phone } = req.body;

    if (!brand || !model || !year || !price || !name || !email || !phone) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
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
    res.status(500).json({ success: false, error: "Failed to submit sell request" });
  }
});

app.get("/api/admin/sell-requests", isAuthenticated, async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error loading sell requests" });
  }
});

app.put("/api/admin/sell-request/:id", isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await SellRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error updating sell request" });
  }
});

app.post("/api/quote-request", async (req, res) => {
  try {
    const { name, email, phone, brand, model, year, budget, notes } = req.body;

    if (!name || !email || !phone || !brand || !year || !budget) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const quoteRequest = new QuoteRequest({
      name,
      email,
      phone,
      brand,
      model,
      year,
      budget,
      notes,
    });

    await quoteRequest.save();
    res.json({ success: true, message: "Quote request submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to submit quote request" });
  }
});

app.get("/api/admin/quote-requests", isAuthenticated, async (req, res) => {
  try {
    const requests = await QuoteRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error loading quote requests" });
  }
});

app.put("/api/admin/quote-request/:id", isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await QuoteRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error updating quote request" });
  }
});

app.get("/api/available-bikes", async (req, res) => {
  try {
    const bikes = await Bike.find({ status: "Available" });
    res.json(bikes); // Return the array directly
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch available bikes" });
  }
});

app.post("/api/book-bike", async (req, res) => {
  try {
    const { name, email, phone, bikeId, paymentMethod, amount, transactionId } = req.body;

    if (!name || !email || !phone || !bikeId || !paymentMethod || !amount || !transactionId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const bike = await Bike.findById(bikeId);
    if (!bike || bike.status !== "Available") {
      return res.status(400).json({ success: false, error: "Bike not available" });
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
    res.json({ success: true, message: "Booking confirmed" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to process booking" });
  }
});

app.get("/api/admin/bookings", isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find().populate("bikeId").sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error loading bookings" });
  }
});

app.put("/api/admin/booking/:id", isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error updating booking" });
  }
});

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
    res.status(500).json({ success: false, error: "Failed to fetch offers" });
  }
});

app.get("/api/admin/offers", isAuthenticated, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ startDate: -1 });
    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error loading offers" });
  }
});

app.post("/api/admin/offers", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, type, image, startDate, endDate, cta, link } = req.body;

    if (!title || !description || !type || !image || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
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
    res.status(500).json({ success: false, error: "Error adding offer" });
  }
});

app.put("/api/admin/offers/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const offer = await Offer.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error updating offer" });
  }
});

app.delete("/api/admin/offers/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error deleting offer" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});