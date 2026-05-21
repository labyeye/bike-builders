const SellRequest = require("../models/SellRequest");
const {
  CLOUDINARY_ENABLED,
  uploadFileToCloudinary,
} = require("../middleware/upload");

async function createSellRequest(req, res) {
  try {
    const { brand, model, year, price, name, email, phone } = req.body;

    if (!brand || !model || !year || !price || !name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map(async (file) => {
          try {
            if (CLOUDINARY_ENABLED) {
              const up = await uploadFileToCloudinary(file.path || file, {
                folder: "bike-builders/sell-requests",
              });
              if (up && up.url) return up.url;
            }
            return file.filename;
          } catch (e) {
            console.warn(
              "Failed to process sell-request file:",
              file.path,
              e.message || e
            );
            return file.filename;
          }
        })
      );
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
}

async function listSellRequests(req, res) {
  try {
    const requests = await SellRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error("Error loading sell requests:", err);
    res
      .status(500)
      .json({ success: false, error: "Error loading sell requests" });
  }
}

async function updateSellRequestStatus(req, res) {
  try {
    const { status } = req.body;
    const updated = await SellRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Sell request not found" });
    }
    res.json({ success: true, request: updated });
  } catch (err) {
    console.error("Error updating sell request:", err);
    res
      .status(500)
      .json({ success: false, error: "Error updating sell request" });
  }
}

module.exports = {
  createSellRequest,
  listSellRequests,
  updateSellRequestStatus,
};
