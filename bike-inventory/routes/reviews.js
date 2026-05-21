const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const ctrl = require("../controllers/reviewController");

router.get("/reviews", ctrl.listReviews);
router.post("/reviews", ctrl.createReview);
router.put("/reviews/:id", isAuthenticated, isAdmin, ctrl.updateReview);
router.delete("/reviews/:id", isAuthenticated, isAdmin, ctrl.deleteReview);

module.exports = router;
