const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const ctrl = require("../controllers/bikeController");

router.get("/bikes", ctrl.listBikes);
router.get("/featured-bikes", ctrl.featuredBikes);
router.get("/available-bikes", ctrl.availableBikes);

router.get("/stats", isAuthenticated, ctrl.stats);
router.get("/config", ctrl.config);

router.get("/admin/dashboard", isAuthenticated, ctrl.dashboard);
router.get("/admin/bike/:id", isAuthenticated, ctrl.getBikeById);
router.post(
  "/admin/bike",
  isAuthenticated,
  upload.array("images", 5),
  ctrl.createBike
);
router.put(
  "/admin/bike/:id",
  isAuthenticated,
  upload.array("images", 5),
  ctrl.updateBike
);
router.delete("/admin/bike/:id", isAuthenticated, isAdmin, ctrl.deleteBike);

module.exports = router;
