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
}

module.exports = { createSellRequest };
