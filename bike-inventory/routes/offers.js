const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const ctrl = require("../controllers/offerController");

router.get("/offers", ctrl.listActiveOffers);
router.get("/admin/offers", isAuthenticated, ctrl.listAllOffers);
router.post("/admin/offers", isAuthenticated, isAdmin, ctrl.createOffer);
router.put("/admin/offers/:id", isAuthenticated, isAdmin, ctrl.updateOffer);
router.delete("/admin/offers/:id", isAuthenticated, isAdmin, ctrl.deleteOffer);

module.exports = router;
