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
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rgesda543",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);

app.use(express.static(path.join(__dirname, "public")));
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
  downPayment: Number, // Add this line
  imageUrl: String,
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

// Quote Request Schema
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
  res.redirect("/admin/login");
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "admin") return next();
  res.status(403).send("Access denied");
}

app.get("/", (req, res) => {
  res.send("Bike Inventory System");
});

app.get("/admin/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/admin/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  const valid =
    user && (await bcrypt.compare(req.body.password, user.password));

  if (!valid) return res.render("login", { error: "Invalid credentials" });

  req.session.isAuthenticated = true;
  req.session.user = {
    username: user.username,
    role: user.role,
  };

  res.redirect("/admin/dashboard");
});

app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

app.get("/api/bikes", async (req, res) => {
  try {
    const bikes = await Bike.find({ status: "Available" });
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bikes" });
  }
});

app.get("/admin/dashboard", isAuthenticated, async (req, res) => {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    const stats = {
      total: await Bike.countDocuments(),
      available: await Bike.countDocuments({ status: "Available" }),
      comingSoon: await Bike.countDocuments({ status: "Coming Soon" }),
      sold: await Bike.countDocuments({ status: "Sold Out" }),
    };

    res.render("dashboard", {
      bikes,
      stats,
      user: req.session.user,
    });
  } catch (err) {
    res.status(500).send("Error loading dashboard");
  }
});

app.get("/admin/bike/edit/:id", isAuthenticated, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    res.render("edit-bike", { bike });
  } catch (err) {
    res.status(500).send("Error loading bike");
  }
});

app.post("/admin/bike/edit/:id", isAuthenticated, async (req, res) => {
  try {
    await Bike.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.status(500).send("Error updating bike");
  }
});

app.post(
  "/admin/bike/delete/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      await Bike.findByIdAndDelete(req.params.id);
      res.redirect("/admin/dashboard");
    } catch (err) {
      res.status(500).send("Error deleting bike");
    }
  }
);

app.get("/admin/bike/add", isAuthenticated, (req, res) => {
  res.render("add-bike", {
    error: null,
    formData: null,
    user: req.session.user,
  });
});
app.post("/admin/bike/add", isAuthenticated, async (req, res) => {
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
      downPayment: Number(req.body.downPayment), // Add this line
      imageUrl: req.body.imageUrl || "https://via.placeholder.com/300",
      status: req.body.status,
    };

    if (
      !bikeData.brand ||
      !bikeData.model ||
      isNaN(bikeData.modelYear) ||
      isNaN(bikeData.kmDriven) ||
      !bikeData.ownership ||
      !bikeData.fuelType ||
      isNaN(bikeData.daysOld) ||
      isNaN(bikeData.price) ||
      isNaN(bikeData.downPayment) || // Add downPayment check
      !bikeData.status
    ) {
      return res.render("add-bike", {
        error: "Please fill all required fields with valid data",
        formData: req.body,
        user: req.session.user,
      });
    }

    const bike = new Bike(bikeData);
    await bike.save();
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.render("add-bike", {
      error: "Failed to add bike. Please try again.",
      formData: req.body,
      user: req.session.user,
    });
  }
});

app.get("/admin/staff", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const staff = await User.find().sort({ role: 1 });
    res.render("staff", {
      title: "Staff Management",
      staff,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get("/admin/staff/add", isAuthenticated, isAdmin, (req, res) => {
  res.render("add-staff", {
    error: null,
    user: req.session.user,
  });
});

app.post("/admin/staff/add", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role,
    });
    res.redirect("/admin/staff");
  } catch (err) {
    res.render("add-staff", {
      error: "Failed to add staff member",
      formData: req.body,
      user: req.session.user,
    });
  }
});

app.post(
  "/admin/staff/delete/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      if (req.params.id === req.session.user._id) {
        return res.status(400).send("Cannot delete your own account");
      }
      await User.findByIdAndDelete(req.params.id);
      res.redirect("/admin/staff");
    } catch (err) {
      res.status(500).send("Error deleting staff member");
    }
  }
);
app.post("/api/sell-request", upload.array("images", 5), async (req, res) => {
  try {
    const { brand, model, year, price, name, email, phone } = req.body;

    if (!brand || !model || !year || !price || !name || !email || !phone) {
      return res.status(400).json({ error: "Please fill all required fields" });
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
    res.status(201).json({
      message:
        "Sell request submitted successfully! We will contact you shortly.",
    });
  } catch (err) {
    console.error("Error submitting sell request:", err);
    res
      .status(500)
      .json({ error: "Failed to submit sell request. Please try again." });
  }
});

app.get("/admin/sell-requests", isAuthenticated, async (req, res) => {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    res.render("sell-requests", {
      requests,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching sell requests:", err);
    res.status(500).send("Error loading sell requests");
  }
});

app.post(
  "/admin/sell-request/update-status/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { status } = req.body;
      await SellRequest.findByIdAndUpdate(req.params.id, { status });
      res.redirect("/admin/sell-requests");
    } catch (err) {
      console.error("Error updating sell request:", err);
      res.status(500).send("Error updating sell request");
    }
  }
);

// Handle quote requests
app.post("/api/quote-request", async (req, res) => {
  try {
    const { name, email, phone, brand, model, year, budget, notes } = req.body;

    // Basic validation
    if (!name || !email || !phone || !brand || !year || !budget) {
      return res.status(400).json({ error: "Please fill all required fields" });
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

    // Here you would typically send a confirmation email
    res.status(201).json({
      message:
        "Quote request submitted successfully! We will contact you shortly.",
    });
  } catch (err) {
    console.error("Error submitting quote request:", err);
    res
      .status(500)
      .json({ error: "Failed to submit quote request. Please try again." });
  }
});

// Admin route to view quote requests
app.get("/admin/quote-requests", isAuthenticated, async (req, res) => {
  try {
    const requests = await QuoteRequest.find().sort({ createdAt: -1 });
    res.render("buy-requests", {
      requests,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching quote requests:", err);
    res.status(500).send("Error loading quote requests");
  }
});

// Update quote request status
app.post(
  "/admin/quote-request/update-status/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { status } = req.body;
      await QuoteRequest.findByIdAndUpdate(req.params.id, { status });
      res.redirect("/admin/quote-requests");
    } catch (err) {
      console.error("Error updating quote request:", err);
      res.status(500).send("Error updating quote request");
    }
  }
);
app.get("/api/available-bikes", async (req, res) => {
  try {
    const bikes = await Bike.find({ status: "Available" });
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch available bikes" });
  }
});

// Handle bike booking
app.post("/api/book-bike", async (req, res) => {
  try {
    const { name, email, phone, bikeId, paymentMethod, amount, transactionId } =
      req.body;

    // Basic validation
    if (
      !name ||
      !email ||
      !phone ||
      !bikeId ||
      !paymentMethod ||
      !amount ||
      !transactionId
    ) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    // Check if bike exists and is available
    const bike = await Bike.findById(bikeId);
    if (!bike || bike.status !== "Available") {
      return res
        .status(400)
        .json({ error: "Selected bike is not available for booking" });
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

    // Here you would typically:
    // 1. Send confirmation email to customer
    // 2. Send notification to admin
    // 3. Maybe update bike status to "Reserved"

    res.status(201).json({
      message:
        "Booking confirmed! We will contact you shortly to complete the process.",
    });
  } catch (err) {
    console.error("Error processing booking:", err);
    res
      .status(500)
      .json({ error: "Failed to process booking. Please try again." });
  }
});

// Admin route to view bookings
app.get("/admin/bookings", isAuthenticated, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("bikeId")
      .sort({ createdAt: -1 });

    res.render("bookings", {
      bookings,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).send("Error loading bookings");
  }
});

// Update booking status
app.post(
  "/admin/booking/update-status/:id",
  isAuthenticated,
  async (req, res) => {
    try {
      const { status } = req.body;
      await Booking.findByIdAndUpdate(req.params.id, { status });
      res.redirect("/admin/bookings");
    } catch (err) {
      console.error("Error updating booking:", err);
      res.status(500).send("Error updating booking");
    }
  }
);
app.get("/api/offers", async (req, res) => {
  try {
    const currentDate = new Date();
    const offers = await Offer.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: "active",
    }).sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
});

// Admin route to view all offers
app.get("/admin/offers", isAuthenticated, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ startDate: -1 });
    res.render("offers", {
      offers,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).send("Error loading offers");
  }
});

// Add new offer (admin only)
app.post("/admin/offers/add", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, type, image, startDate, endDate, cta, link } =
      req.body;

    if (!title || !description || !type || !image || !startDate || !endDate) {
      return res.status(400).json({ error: "Please fill all required fields" });
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

    await Offer.save();
    res.redirect("/admin/offers");
  } catch (err) {
    console.error("Error adding offer:", err);
    res.status(500).send("Error adding offer");
  }
});

// Update offer status (admin only)
app.post(
  "/admin/offers/update-status/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;
      await Offer.findByIdAndUpdate(req.params.id, { status });
      res.redirect("/admin/offers");
    } catch (err) {
      console.error("Error updating offer:", err);
      res.status(500).send("Error updating offer");
    }
  }
);

// Delete offer (admin only)
app.post(
  "/admin/offers/delete/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      await Offer.findByIdAndDelete(req.params.id);
      res.redirect("/admin/offers");
    } catch (err) {
      console.error("Error deleting offer:", err);
      res.status(500).send("Error deleting offer");
    }
  }
);



app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
