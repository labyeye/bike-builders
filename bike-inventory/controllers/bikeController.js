const path = require("path");
const fs = require("fs");
const Bike = require("../models/Bike");
const {
  cloudinary,
  CLOUDINARY_ENABLED,
  uploadFileToCloudinary,
  extractCloudinaryPublicId,
} = require("../middleware/upload");

async function listBikes(req, res) {
  try {
    const bikes = await Bike.find();
    res.json({ success: true, bikes });
  } catch (err) {
    console.error("Error fetching bikes:", err);
    res.status(500).json({ success: false, error: "Failed to fetch bikes" });
  }
}

async function featuredBikes(req, res) {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: bikes });
  } catch (err) {
    console.error("Error fetching featured bikes:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch featured bikes" });
  }
}

async function availableBikes(req, res) {
  try {
    const bikes = await Bike.find({ status: "Available" });
    res.json(bikes);
  } catch (err) {
    console.error("Error fetching available bikes:", err);
    res.status(500).json({ error: "Failed to fetch available bikes" });
  }
}

async function getBikeById(req, res) {
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
}

async function createBike(req, res) {
  const t0 = Date.now();
  console.log(`[createBike] start — files=${req.files?.length || 0}, body keys=${Object.keys(req.body).length}`);
  try {
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log(`[createBike] uploading ${req.files.length} images in parallel...`);
      const uT0 = Date.now();
      imageUrls = await Promise.all(
        req.files.map(async (file, idx) => {
          try {
            if (CLOUDINARY_ENABLED) {
              const up = await uploadFileToCloudinary(file.path || file, {
                folder: "bike-builders",
              });
              if (up && up.url) return up.url;
              console.warn(`[createBike] image ${idx} upload returned null, falling back`);
            }
            return `/uploads/${file.filename || file.originalname || `img-${idx}`}`;
          } catch (e) {
            console.warn(
              `[createBike] image ${idx} exception:`,
              e.message || e
            );
            return `/uploads/${file.filename || file.originalname || `img-${idx}`}`;
          }
        })
      );
      console.log(`[createBike] all uploads done in ${Date.now() - uT0}ms, urls=${imageUrls.length}`);
    } else if (req.body.imageUrls) {
      imageUrls = Array.isArray(req.body.imageUrls)
        ? req.body.imageUrls
        : [req.body.imageUrls];
      imageUrls = imageUrls.filter((u) => u && u.trim() !== "");
      console.log(`[createBike] using pre-supplied imageUrls: ${imageUrls.length}`);
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

    const missing = [];
    if (!bikeData.brand) missing.push("brand");
    if (!bikeData.model) missing.push("model");
    if (isNaN(bikeData.modelYear)) missing.push("modelYear");
    if (isNaN(bikeData.kmDriven)) missing.push("kmDriven");
    if (!bikeData.ownership) missing.push("ownership");
    if (!bikeData.fuelType) missing.push("fuelType");
    if (isNaN(bikeData.daysOld)) missing.push("daysOld");
    if (isNaN(bikeData.price)) missing.push("price");
    if (isNaN(bikeData.downPayment)) missing.push("downPayment");
    if (!bikeData.status) missing.push("status");

    if (missing.length > 0) {
      console.warn("createBike validation failed:", missing, "received:", req.body);
      return res.status(400).json({
        success: false,
        error: `Missing/invalid: ${missing.join(", ")}`,
      });
    }

    console.log("[createBike] saving to mongo:", { ...bikeData, imageUrl: `[${imageUrls.length} urls]` });
    const bike = new Bike(bikeData);
    await bike.save();
    console.log(`[createBike] ✅ saved id=${bike._id} total=${Date.now() - t0}ms`);
    res.json({ success: true, bike });
  } catch (err) {
    console.error(`[createBike] ❌ error after ${Date.now() - t0}ms:`, err.name, err.message, err.errors || "");
    res.status(500).json({ success: false, error: err.message || "Failed to add bike" });
  }
}

async function updateBike(req, res) {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, error: "Bike not found" });
    }

    let removeImages = [];
    if (req.body.removeImages) {
      if (Array.isArray(req.body.removeImages)) {
        removeImages = req.body.removeImages;
      } else {
        try {
          removeImages = JSON.parse(req.body.removeImages);
          if (!Array.isArray(removeImages)) removeImages = [removeImages];
        } catch (e) {
          removeImages = [req.body.removeImages];
        }
      }
    }

    let existingOrder = null;
    if (req.body.existingOrder) {
      try {
        existingOrder = JSON.parse(req.body.existingOrder);
      } catch (e) {
        existingOrder = null;
      }
    }

    const normalizeToUrl = (val) => {
      if (!val) return val;
      if (val.startsWith("/uploads/")) return val;
      if (val.includes("/uploads/"))
        return val.substring(val.indexOf("/uploads/"));
      return `/uploads/${val.split("/").pop()}`;
    };

    const removeUrls = removeImages.map(normalizeToUrl);

    for (const url of removeUrls) {
      try {
        if (url && url.startsWith("/uploads/")) {
          const filename = url.split("/").pop();
          const filepath = path.join(__dirname, "..", "uploads", filename);
          if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        } else if (url && url.startsWith("http") && CLOUDINARY_ENABLED) {
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

    let existingImages = Array.isArray(bike.imageUrl)
      ? bike.imageUrl.slice()
      : [];
    existingImages = existingImages.filter((u) => !removeUrls.includes(u));

    if (existingOrder && Array.isArray(existingOrder)) {
      const ordered = [];
      for (const u of existingOrder) {
        const nu = normalizeToUrl(u);
        if (existingImages.includes(nu)) ordered.push(nu);
      }
      for (const u of existingImages) {
        if (!ordered.includes(u)) ordered.push(u);
      }
      existingImages = ordered;
    }

    let uploadedUrls = [];
    if (req.files && req.files.length > 0) {
      uploadedUrls = await Promise.all(
        req.files.map(async (file) => {
          try {
            if (CLOUDINARY_ENABLED) {
              const up = await uploadFileToCloudinary(file.path || file, {
                folder: "bike-builders",
              });
              if (up && up.url) return up.url;
            }
            return `/uploads/${file.filename}`;
          } catch (e) {
            console.warn(
              "Error handling uploaded file:",
              file.path,
              e.message || e
            );
            return `/uploads/${file.filename}`;
          }
        })
      );
    }

    const finalImages = [...existingImages, ...uploadedUrls].slice(0, 5);

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

    Object.assign(bike, updated);
    await bike.save();

    res.json({ success: true, bike });
  } catch (err) {
    console.error("Error updating bike:", err);
    res.status(500).json({ success: false, error: "Error updating bike" });
  }
}

async function deleteBike(req, res) {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, error: "Bike not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting bike:", err);
    res.status(500).json({ success: false, error: "Error deleting bike" });
  }
}

async function stats(req, res) {
  try {
    const payload = {
      total: await Bike.countDocuments(),
      available: await Bike.countDocuments({ status: "Available" }),
      sold: await Bike.countDocuments({ status: "Sold Out" }),
    };
    res.json({ success: true, ...payload });
  } catch (err) {
    console.error("Error loading stats:", err);
    res.status(500).json({ success: false, error: "Error loading stats" });
  }
}

async function dashboard(req, res) {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    const statsPayload = {
      total: await Bike.countDocuments(),
      available: await Bike.countDocuments({ status: "Available" }),
      comingSoon: await Bike.countDocuments({ status: "Coming Soon" }),
      sold: await Bike.countDocuments({ status: "Sold Out" }),
    };
    res.json({
      success: true,
      bikes,
      stats: statsPayload,
      user: req.user,
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).json({ success: false, error: "Error loading dashboard" });
  }
}

function config(req, res) {
  try {
    res.json({ success: true, cloudinary: CLOUDINARY_ENABLED });
  } catch (e) {
    res.status(500).json({ success: false, error: "Failed to fetch config" });
  }
}

module.exports = {
  listBikes,
  featuredBikes,
  availableBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike,
  stats,
  dashboard,
  config,
};
