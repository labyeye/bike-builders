const router = require("express").Router();
const { isAuthenticated } = require("../middleware/auth");
const ctrl = require("../controllers/bookingController");

router.post("/book-bike", ctrl.bookBike);
router.get("/admin/bookings", isAuthenticated, ctrl.listBookings);
router.put("/admin/booking/:id", isAuthenticated, ctrl.updateBooking);
router.delete("/admin/booking/:id", isAuthenticated, ctrl.deleteBooking);

module.exports = router;
