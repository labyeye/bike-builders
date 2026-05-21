const router = require("express").Router();
const { isAuthenticated } = require("../middleware/auth");
const {
  listQuoteRequests,
  updateQuoteRequest,
} = require("../controllers/quoteController");

router.get("/quote-requests", isAuthenticated, listQuoteRequests);
router.put("/quote-request/:id", isAuthenticated, updateQuoteRequest);

module.exports = router;
