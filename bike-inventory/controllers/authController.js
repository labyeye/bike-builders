const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { signToken } = require("../middleware/auth");

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.SESSION_SECRET || "rgesda543";

async function ensureAdminUser() {
  const existing = await User.findOne({ username: "admin" });
  if (!existing) {
    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({ username: "admin", password: hashed, role: "admin" });
    console.log("🔑 Admin created: admin / admin123");
  }
}

async function login(req, res) {
  console.log("Login attempt:", req.body.username);

  try {
    const user = await User.findOne({ username: req.body.username });
    const valid =
      user && (await bcrypt.compare(req.body.password, user.password));

    if (!valid) {
      console.log("Invalid credentials for:", req.body.username);
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const userPayload = {
      id: String(user._id),
      username: user.username,
      role: user.role,
    };
    const token = signToken(userPayload);

    console.log("Login successful for:", user.username);
    return res.json({ success: true, token, user: userPayload });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

function checkAuth(req, res) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) return res.json({ isAuthenticated: false });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({
      isAuthenticated: true,
      user: {
        id: payload.id,
        username: payload.username,
        role: payload.role,
      },
    });
  } catch (err) {
    return res.json({ isAuthenticated: false });
  }
}

function logout(req, res) {
  res.json({ success: true });
}

module.exports = { login, checkAuth, logout, ensureAdminUser };
