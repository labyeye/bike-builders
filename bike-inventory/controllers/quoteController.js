const QuoteRequest = require("../models/QuoteRequest");

async function listQuoteRequests(req, res) {
  try {
    const requests = await QuoteRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error("Error loading quote requests:", err);
    res
      .status(500)
      .json({ success: false, error: "Error loading quote requests" });
  }
}

async function updateQuoteRequest(req, res) {
  try {
    const { status } = req.body;
    const request = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) {
      return res
        .status(404)
        .json({ success: false, error: "Request not found" });
    }
    res.json({ success: true, request });
  } catch (err) {
    console.error("Error updating quote request:", err);
    res
      .status(500)
      .json({ success: false, error: "Error updating quote request" });
  }
}

module.exports = { listQuoteRequests, updateQuoteRequest };
