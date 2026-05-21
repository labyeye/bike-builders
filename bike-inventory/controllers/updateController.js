const path = require("path");
const fs = require("fs");
const Update = require("../models/Update");
const {
  cloudinary,
  CLOUDINARY_ENABLED,
  uploadFileToCloudinary,
  extractCloudinaryPublicId,
} = require("../middleware/upload");

async function listUpdates(req, res) {
  try {
    const updates = await Update.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    console.error("Error fetching updates:", err);
    res.status(500).json({ success: false, error: "Failed to fetch updates" });
  }
}

async function createUpdate(req, res) {
  try {
    const { title, link } = req.body;
    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Poster image is required" });
    }

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
    res.status(500).json({ success: false, error: "Failed to create update" });
  }
}

async function deleteUpdate(req, res) {
  try {
    const upd = await Update.findByIdAndDelete(req.params.id);
    if (!upd) {
      return res
        .status(404)
        .json({ success: false, error: "Update not found" });
    }

    try {
      if (upd.poster && upd.poster.startsWith("/uploads/")) {
        const filename = upd.poster.split("/").pop();
        const filepath = path.join(__dirname, "..", "uploads", filename);
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
    res.status(500).json({ success: false, error: "Failed to delete update" });
  }
}

module.exports = { listUpdates, createUpdate, deleteUpdate };
