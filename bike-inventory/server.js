require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const os = require("os");

const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require("cloudinary");
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
app.set("trust proxy", 1);
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://www.bikebuilders.in",
  "https://bike-builders-ii74.vercel.app",
  "https://bike-builders-lfn5tcmcq-labyeyes-projects.vercel.app",
];

if (process.env.NODE_ENV !== "production") {
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
  app.use(
    cors({
      origin: function (origin, callback) {
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
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-Forwarded-Proto",
        "Access-Control-Allow-Credentials",
        "Access-Control-Allow-Origin",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
}
const CLOUDINARY_ENABLED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured: ", process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log("Cloudinary not configured - falling back to local uploads");
}

async function uploadFileToCloudinary(source, options = {}) {
  if (!CLOUDINARY_ENABLED) return null;
  if (typeof source === "string") {
    try {
      const res = await cloudinary.uploader.upload(source, options);
      try {
        if (fs.existsSync(source)) fs.unlinkSync(source);
      } catch (e) {
        console.warn("Could not remove temp file:", source, e.message);
      }
      return { url: res.secure_url, public_id: res.public_id };
    } catch (err) {
      console.error("Cloudinary upload failed:", err.message || err);
      return null;
    }
  }

  // If source is an object with a buffer (multer memoryStorage), upload via stream
  if (source && source.buffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      );
      uploadStream.end(source.buffer);
    }).catch((err) => {
      console.error("Cloudinary upload_stream failed:", err.message || err);
      return null;
    });
  }

  console.warn(
    "uploadFileToCloudinary received unsupported source",
    typeof source
  );
  return null;
}

// Attempt to extract Cloudinary public_id from a hosted URL.
function extractCloudinaryPublicId(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;
    let publicPath = parts.slice(uploadIndex + 1).join("/");
    // remove version prefix like v123456
    publicPath = publicPath.replace(/^v\d+\//, "");
    // strip extension
    publicPath = publicPath.replace(/\.[a-zA-Z0-9]+$/, "");
    return publicPath;
  } catch (e) {
    return null;
  }
}

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

// Updates (for site updates/posters)
const updateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poster: { type: String, required: true }, // stored as /uploads/<filename>
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Update = mongoose.model("Update", updateSchema);

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

    // Ensure the session is saved before sending the response. Some stores
    // or environments may not persist the session immediately which can
    // cause subsequent requests (from the client) to arrive without the
    // session cookie/session data available.
    req.session.save((err) => {
      if (err) {
        console.error("Session save error after login:", err);
        // Still respond, but log the problem for diagnostics.
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }

      console.log(
        "Login successful for:",
        user.username,
        "Session:",
        req.session.user,
        "SessionID:",
        req.sessionID
      );
      // In development return the sessionID in the JSON to help debug mobile cookie issues.
      const resp = { success: true, user: req.session.user };
      if (process.env.NODE_ENV !== "production")
        resp._sessionID = req.sessionID;
      // Also expose a simple header that clients can read if needed.
      res.set("Access-Control-Expose-Headers", "X-Session-ID");
      res.set("X-Session-ID", req.sessionID);
      res.json(resp);
    });
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

  // Helpful debug output: show incoming Cookie header and current session id.
  // This will help determine whether the browser sent the cookie with the request.
  try {
    console.log("Request cookies:", req.headers.cookie);
    console.log("Current sessionID:", req.sessionID);
  } catch (e) {}

  // Expose session id for debugging in non-production so the client can confirm
  // whether the same session is maintained across requests. We still send the
  // normal JSON shape expected by clients.
  const responsePayload =
    req.session.isAuthenticated && req.session.user
      ? { isAuthenticated: true, user: req.session.user }
      : { isAuthenticated: false };
  if (process.env.NODE_ENV !== "production")
    responsePayload._sessionID = req.sessionID;
  res.set("Access-Control-Expose-Headers", "X-Session-ID");
  res.set("X-Session-ID", req.sessionID);
  return res.json(responsePayload);

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

// Public config endpoint so frontends can detect whether Cloudinary is enabled
app.get("/api/config", (req, res) => {
  try {
    res.json({ success: true, cloudinary: CLOUDINARY_ENABLED });
  } catch (e) {
    res.status(500).json({ success: false, error: "Failed to fetch config" });
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

app.put(
  "/api/admin/bike/:id",
  isAuthenticated,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const bike = await Bike.findById(req.params.id);
      if (!bike) {
        return res
          .status(404)
          .json({ success: false, error: "Bike not found" });
      }

      // Parse fields that may come as strings
      // removeImages can be sent as multiple fields (removeImages[]) or a single string
      let removeImages = [];
      if (req.body.removeImages) {
        if (Array.isArray(req.body.removeImages))
          removeImages = req.body.removeImages;
        else {
          // It may be a JSON string or a single value
          try {
            removeImages = JSON.parse(req.body.removeImages);
            if (!Array.isArray(removeImages)) removeImages = [removeImages];
          } catch (e) {
            removeImages = [req.body.removeImages];
          }
        }
      }

      // existingOrder is expected to be a JSON stringified array of existing image URLs
      let existingOrder = null;
      if (req.body.existingOrder) {
        try {
          existingOrder = JSON.parse(req.body.existingOrder);
        } catch (e) {
          existingOrder = null;
        }
      }

      // Normalize removal list to full paths (if filenames provided, convert to /uploads/filename)
      const normalizeToUrl = (val) => {
        if (!val) return val;
        if (val.startsWith("/uploads/")) return val;
        if (val.includes("/uploads/"))
          return val.substring(val.indexOf("/uploads/"));
        return `/uploads/${val.split("/").pop()}`;
      };

      const removeUrls = removeImages.map(normalizeToUrl);

      // Delete files from disk for any removed images, and attempt Cloudinary deletion when configured
      for (const url of removeUrls) {
        try {
          if (url && url.startsWith("/uploads/")) {
            const filename = url.split("/").pop();
            const filepath = path.join(__dirname, "uploads", filename);
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } else if (url && url.startsWith("http") && CLOUDINARY_ENABLED) {
            // Try to derive public_id and remove from Cloudinary
            const publicId = extractCloudinaryPublicId(url);
            if (publicId) {
              try {
                await cloudinary.uploader.destroy(publicId);
              } catch (e) {
                console.warn(
                  "Failed to delete Cloudinary resource:",
                  publicId,
                  e.message || e
                );
              }
            }
          }
        } catch (err) {
          console.warn("Failed to delete file:", url, err.message);
        }
      }

      // Filter out removed images from current list
      let existingImages = Array.isArray(bike.imageUrl)
        ? bike.imageUrl.slice()
        : [];
      existingImages = existingImages.filter((u) => !removeUrls.includes(u));

      // Reorder existing images if an order was provided
      if (existingOrder && Array.isArray(existingOrder)) {
        const ordered = [];
        for (const u of existingOrder) {
          const nu = normalizeToUrl(u);
          if (existingImages.includes(nu)) ordered.push(nu);
        }
        // append any remaining existing images that weren't included in the order
        for (const u of existingImages) {
          if (!ordered.includes(u)) ordered.push(u);
        }
        existingImages = ordered;
      }

      // Handle newly uploaded files (upload to Cloudinary when configured)
      let uploadedUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            if (CLOUDINARY_ENABLED) {
              const up = await uploadFileToCloudinary(file.path || file, {
                folder: "bike-builders",
              });
              if (up && up.url) uploadedUrls.push(up.url);
              else uploadedUrls.push(`/uploads/${file.filename}`);
            } else {
              uploadedUrls.push(`/uploads/${file.filename}`);
            }
          } catch (e) {
            console.warn(
              "Error handling uploaded file:",
              file.path,
              e.message || e
            );
            // still include local path as fallback
            uploadedUrls.push(`/uploads/${file.filename}`);
          } finally {
            // ensure temp file removed when Cloudinary used; uploadFileToCloudinary removes it; otherwise keep file on disk for static serving
          }
        }
      }

      // Build the final image array and cap to 5
      let finalImages = [...existingImages, ...uploadedUrls].slice(0, 5);

      // Update bike fields from body (allow both multipart/form-data and JSON)
      const updated = {
        brand: req.body.brand || bike.brand,
        model: req.body.model || bike.model,
        modelYear: req.body.modelYear
          ? Number(req.body.modelYear)
          : bike.modelYear,
        kmDriven: req.body.kmDriven ? Number(req.body.kmDriven) : bike.kmDriven,
        ownership: req.body.ownership || bike.ownership,
        fuelType: req.body.fuelType || bike.fuelType,
        daysOld: req.body.daysOld ? Number(req.body.daysOld) : bike.daysOld,
        price: req.body.price ? Number(req.body.price) : bike.price,
        downPayment: req.body.downPayment
          ? Number(req.body.downPayment)
          : bike.downPayment,
        emiAvailable:
          req.body.emiAvailable === "true" || req.body.emiAvailable === true
            ? true
            : req.body.emiAvailable === "false"
            ? false
            : bike.emiAvailable,
        emiAmount: req.body.emiAmount
          ? Number(req.body.emiAmount)
          : bike.emiAmount,
        imageUrl: finalImages,
        status: req.body.status || bike.status,
      };

      // Assign and save
      Object.assign(bike, updated);
      await bike.save();

      res.json({ success: true, bike });
    } catch (err) {
      console.error("Error updating bike:", err);
      res.status(500).json({ success: false, error: "Error updating bike" });
    }
  }
);

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

    // Upload files to Cloudinary when available, otherwise store local filenames
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          if (CLOUDINARY_ENABLED) {
            const up = await uploadFileToCloudinary(file.path || file, {
              folder: "bike-builders/sell-requests",
            });
            if (up && up.url) images.push(up.url);
            else images.push(file.filename);
          } else {
            images.push(file.filename);
          }
        } catch (e) {
          console.warn(
            "Failed to process sell-request file:",
            file.path,
            e.message || e
          );
          images.push(file.filename);
        }
      }
    }

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
app.post(
  "/api/admin/bike",
  isAuthenticated,
  upload.array("images", 5),
  async (req, res) => {
    try {
      // Build imageUrl array from uploaded files (if any). Upload to Cloudinary when configured.
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            if (CLOUDINARY_ENABLED) {
              const up = await uploadFileToCloudinary(file.path || file, {
                folder: "bike-builders",
              });
              if (up && up.url) imageUrls.push(up.url);
              else imageUrls.push(`/uploads/${file.filename}`);
            } else {
              imageUrls.push(`/uploads/${file.filename}`);
            }
          } catch (e) {
            console.warn(
              "Failed to handle uploaded bike image:",
              file.path,
              e.message || e
            );
            imageUrls.push(`/uploads/${file.filename}`);
          }
        }
      } else if (req.body.imageUrls) {
        // fallback to any imageUrls provided in body
        imageUrls = Array.isArray(req.body.imageUrls)
          ? req.body.imageUrls
          : [req.body.imageUrls];
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
        emiAvailable:
          req.body.emiAvailable === "true" || req.body.emiAvailable === true,
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
        return res.status(400).json({
          success: false,
          error: "Invalid data. Please check all required fields.",
        });
      }

      const bike = new Bike(bikeData);
      await bike.save();
      res.json({ success: true, bike });
    } catch (err) {
      console.error("Error adding bike:", err);
      res.status(500).json({ success: false, error: "Failed to add bike" });
    }
  }
);

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

// Public updates endpoint for website
app.get("/api/updates", async (req, res) => {
  try {
    const updates = await Update.find().sort({ createdAt: -1 });
    // Return array directly for older static pages expecting an array
    res.json(updates);
  } catch (err) {
    console.error("Error fetching updates:", err);
    res.status(500).json({ success: false, error: "Failed to fetch updates" });
  }
});

// Admin: create an update (title + poster)
app.post(
  "/api/admin/updates",
  isAuthenticated,
  isAdmin,
  upload.single("poster"),
  async (req, res) => {
    try {
      const { title, link } = req.body;
      if (!title)
        return res
          .status(400)
          .json({ success: false, error: "Title is required" });
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, error: "Poster image is required" });

      let posterUrl = `/uploads/${req.file.filename}`;
      if (CLOUDINARY_ENABLED) {
        const up = await uploadFileToCloudinary(req.file.path || req.file, {
          folder: "bike-builders/updates",
        });
        if (up && up.url) posterUrl = up.url;
      }
      const update = new Update({
        title,
        link: link || null,
        poster: posterUrl,
      });
      await update.save();
      res.json({ success: true, update });
    } catch (err) {
      console.error("Error creating update:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to create update" });
    }
  }
);

// Admin: delete update
app.delete(
  "/api/admin/updates/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const upd = await Update.findByIdAndDelete(req.params.id);
      if (!upd)
        return res
          .status(404)
          .json({ success: false, error: "Update not found" });
      // delete poster resource (local file or Cloudinary) if possible
      try {
        if (upd.poster && upd.poster.startsWith("/uploads/")) {
          const filename = upd.poster.split("/").pop();
          const filepath = path.join(__dirname, "uploads", filename);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        } else if (
          upd.poster &&
          upd.poster.startsWith("http") &&
          CLOUDINARY_ENABLED
        ) {
          const publicId = extractCloudinaryPublicId(upd.poster);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (e) {
              console.warn(
                "Failed deleting Cloudinary poster:",
                publicId,
                e.message || e
              );
            }
          }
        }
      } catch (e) {
        console.warn("Failed deleting poster file:", e.message);
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting update:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to delete update" });
    }
  }
);

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

// Admin: update a review
app.put(
  "/api/admin/reviews/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, message, rating } = req.body;
      if (!name || !message || !rating) {
        return res
          .status(400)
          .json({ success: false, error: "Missing fields" });
      }
      const updated = await Review.findByIdAndUpdate(
        id,
        { name, message, rating, date: new Date() },
        { new: true }
      );
      if (!updated)
        return res
          .status(404)
          .json({ success: false, error: "Review not found" });
      res.json({ success: true, review: updated });
    } catch (err) {
      console.error("Error updating review:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to update review" });
    }
  }
);

// Admin: delete a review
app.delete(
  "/api/admin/reviews/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const removed = await Review.findByIdAndDelete(id);
      if (!removed)
        return res
          .status(404)
          .json({ success: false, error: "Review not found" });
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting review:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to delete review" });
    }
  }
);

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
