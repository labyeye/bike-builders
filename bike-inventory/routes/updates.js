const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const ctrl = require("../controllers/updateController");

router.get("/updates", ctrl.listUpdates);
router.post(
  "/updates",
  isAuthenticated,
  isAdmin,
  upload.single("poster"),
  ctrl.createUpdate
);
router.delete("/updates/:id", isAuthenticated, isAdmin, ctrl.deleteUpdate);

module.exports = router;
