const router = require("express").Router();
const { isAuthenticated } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  createSellRequest,
  listSellRequests,
  updateSellRequestStatus,
} = require("../controllers/sellRequestController");

router.post("/sell-request", upload.array("images", 5), createSellRequest);
router.get("/sell-requests", isAuthenticated, listSellRequests);
router.put(
  "/sell-requests/:id/status",
  isAuthenticated,
  updateSellRequestStatus
);

module.exports = router;
