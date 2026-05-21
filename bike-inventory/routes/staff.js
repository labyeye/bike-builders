const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const ctrl = require("../controllers/staffController");

router.get("/", isAuthenticated, isAdmin, ctrl.listStaff);
router.post("/", isAuthenticated, isAdmin, ctrl.createStaff);
router.delete("/:id", isAuthenticated, isAdmin, ctrl.deleteStaff);

module.exports = router;
