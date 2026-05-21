const Review = require("../models/Review");

async function createReview(req, res) {
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
}

async function listReviews(req, res) {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ success: false, error: "Failed to fetch reviews" });
  }
}

async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const { name, message, rating } = req.body;
    if (!name || !message || !rating) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }
    const updated = await Review.findByIdAndUpdate(
      id,
      { name, message, rating, date: new Date() },
      { new: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }
    res.json({ success: true, review: updated });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ success: false, error: "Failed to update review" });
  }
}

async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const removed = await Review.findByIdAndDelete(id);
    if (!removed) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ success: false, error: "Failed to delete review" });
  }
}

module.exports = { createReview, listReviews, updateReview, deleteReview };
