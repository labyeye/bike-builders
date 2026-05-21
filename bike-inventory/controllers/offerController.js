const Offer = require("../models/Offer");

async function listActiveOffers(req, res) {
  try {
    const now = new Date();
    const offers = await Offer.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: "active",
    }).sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ success: false, error: "Failed to fetch offers" });
  }
}

async function listAllOffers(req, res) {
  try {
    const offers = await Offer.find().sort({ startDate: -1 });
    res.json({ success: true, offers });
  } catch (err) {
    console.error("Error loading offers:", err);
    res.status(500).json({ success: false, error: "Error loading offers" });
  }
}

async function createOffer(req, res) {
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
}

async function updateOffer(req, res) {
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
}

async function deleteOffer(req, res) {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting offer:", err);
    res.status(500).json({ success: false, error: "Error deleting offer" });
  }
}

module.exports = {
  listActiveOffers,
  listAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
};
