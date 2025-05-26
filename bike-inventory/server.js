require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const cors = require("cors");

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

app.use(
  session({
    secret: "rgesda543",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 },
  })
);

app.use(express.static(path.join(__dirname, "public")));

const bikeSchema = new mongoose.Schema({
  brand: String,
  model: String,
  modelYear: Number,
  kmDriven: Number,
  ownership: String,
  fuelType: { type: String, enum: ["Petrol", "Diesel", "EV"] },
  daysOld: Number,
  price: Number,
  imageUrl: String,
  status: { type: String, enum: ["Available", "Coming Soon", "Sold Out"], default: "Available" },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, enum: ["admin", "staff"], default: "staff" },
});

const Bike = mongoose.model("Bike", bikeSchema);
const User = mongoose.model("User", userSchema);

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
  const valid = user && (await bcrypt.compare(req.body.password, user.password));
  
  if (!valid) return res.render("login", { error: "Invalid credentials" });
  
  req.session.isAuthenticated = true;
  req.session.user = {
    username: user.username,
    role: user.role
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
      sold: await Bike.countDocuments({ status: "Sold Out" })
    };
    
    res.render("dashboard", { 
      bikes,
      stats,
      user: req.session.user
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

app.post("/admin/bike/delete/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Bike.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.status(500).send("Error deleting bike");
  }
});

app.get("/admin/bike/add", isAuthenticated, (req, res) => {
  res.render("add-bike", { error: null, formData: null });
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
      imageUrl: req.body.imageUrl || 'https://via.placeholder.com/300',
      status: req.body.status
    };

    if (!bikeData.brand || !bikeData.model || isNaN(bikeData.modelYear) || 
        isNaN(bikeData.kmDriven) || !bikeData.ownership || !bikeData.fuelType || 
        isNaN(bikeData.daysOld) || isNaN(bikeData.price) || !bikeData.status) {
      return res.render("add-bike", {
        error: "Please fill all required fields with valid data",
        formData: req.body
      });
    }

    const bike = new Bike(bikeData);
    await bike.save();
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.render("add-bike", {
      error: "Failed to add bike. Please try again.",
      formData: req.body
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});