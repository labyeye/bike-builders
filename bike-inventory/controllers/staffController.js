const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function listStaff(req, res) {
  try {
    const staff = await User.find().select("-password").sort({ role: 1 });
    res.json({ success: true, staff });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
}

async function createStaff(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      role: req.body.role,
    });

    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.json({ success: true, user: userResponse });
  } catch (err) {
    console.error("Error adding staff:", err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, error: "Username already exists" });
    }
    res
      .status(500)
      .json({ success: false, error: "Failed to add staff member" });
  }
}

async function deleteStaff(req, res) {
  try {
    if (req.params.id === String(req.session.user.id)) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res
      .status(500)
      .json({ success: false, error: "Error deleting staff member" });
  }
}

module.exports = { listStaff, createStaff, deleteStaff };
