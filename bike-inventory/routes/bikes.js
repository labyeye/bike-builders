const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const ctrl = require("../controllers/bikeController");

router.get("/bikes", ctrl.listBikes);
router.get("/featured-bikes", ctrl.featuredBikes);
router.get("/available-bikes", ctrl.availableBikes);

router.get("/stats", isAuthenticated, ctrl.stats);
router.get("/config", ctrl.config);

router.get("/dashboard", isAuthenticated, ctrl.dashboard);
router.get("/bike/:id", isAuthenticated, ctrl.getBikeById);
router.post(
  "/bike",
  isAuthenticated,
  upload.array("images", 5),
  ctrl.createBike
);
router.put(
  "/bike/:id",
  isAuthenticated,
  isAdmin,
  upload.array("images", 5),
  ctrl.updateBike
);
router.delete("/bike/:id", isAuthenticated, isAdmin, ctrl.deleteBike);

module.exports = router;
