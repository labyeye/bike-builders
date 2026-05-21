const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

    req.session.isAuthenticated = true;
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    req.session.save((err) => {
      if (err) {
        console.error("Session save error after login:", err);
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

      const resp = { success: true, user: req.session.user };
      if (process.env.NODE_ENV !== "production") resp._sessionID = req.sessionID;

      res.set("Access-Control-Expose-Headers", "X-Session-ID");
      res.set("X-Session-ID", req.sessionID);
      res.json(resp);
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

function checkAuth(req, res) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  console.log(
    "Auth check request:",
    req.session.isAuthenticated,
    req.session.user
  );

  try {
    console.log("Request cookies:", req.headers.cookie);
    console.log("Current sessionID:", req.sessionID);
  } catch (e) {}

  const payload =
    req.session.isAuthenticated && req.session.user
      ? { isAuthenticated: true, user: req.session.user }
      : { isAuthenticated: false };

  if (process.env.NODE_ENV !== "production") payload._sessionID = req.sessionID;

  res.set("Access-Control-Expose-Headers", "X-Session-ID");
  res.set("X-Session-ID", req.sessionID);
  return res.json(payload);
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, error: "Logout failed" });
    }
    res.json({ success: true });
  });
}

module.exports = { login, checkAuth, logout, ensureAdminUser };
