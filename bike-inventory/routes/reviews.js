const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const ctrl = require("../controllers/reviewController");

router.get("/reviews", ctrl.listReviews);
router.post("/reviews", ctrl.createReview);
router.put("/admin/reviews/:id", isAuthenticated, isAdmin, ctrl.updateReview);
router.delete(
  "/admin/reviews/:id",
  isAuthenticated,
  isAdmin,
  ctrl.deleteReview
);

module.exports = router;
