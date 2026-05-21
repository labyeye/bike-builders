const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const ctrl = require("../controllers/offerController");

router.get("/offers", ctrl.listOffers);
router.post("/offers", isAuthenticated, isAdmin, ctrl.createOffer);
router.put("/offers/:id", isAuthenticated, isAdmin, ctrl.updateOffer);
router.delete("/offers/:id", isAuthenticated, isAdmin, ctrl.deleteOffer);

module.exports = router;
