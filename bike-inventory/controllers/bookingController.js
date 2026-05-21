const Booking = require("../models/Booking");
const Bike = require("../models/Bike");

async function bookBike(req, res) {
  try {
    const { name, email, phone, bikeId, paymentMethod, amount, transactionId } =
      req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !bikeId ||
      !paymentMethod ||
      !amount ||
      !transactionId
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const bike = await Bike.findById(bikeId);
    if (!bike || bike.status !== "Available") {
      return res
        .status(400)
        .json({ success: false, error: "Bike not available" });
    }

    const booking = new Booking({
      name,
      email,
      phone,
      bikeId,
      paymentMethod,
      amount,
      transactionId,
    });

    await booking.save();
    await Bike.findByIdAndUpdate(bikeId, { status: "Sold Out" });

    res.json({ success: true, message: "Booking confirmed" });
  } catch (err) {
    console.error("Error processing booking:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to process booking" });
  }
}

async function listBookings(req, res) {
  try {
    const bookings = await Booking.find()
      .populate("bikeId")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Error loading bookings:", err);
    res.status(500).json({ success: false, error: "Error loading bookings" });
  }
}

async function updateBooking(req, res) {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("bikeId");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    if (status === "Approved" && booking.bikeId && booking.bikeId._id) {
      await Bike.findByIdAndUpdate(booking.bikeId._id, { status: "Sold Out" });
      console.log(`[booking] approved ${booking._id} — bike ${booking.bikeId._id} marked Sold Out`);
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ success: false, error: "Error updating booking" });
  }
}

async function deleteBooking(req, res) {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ success: false, error: "Error deleting booking" });
  }
}

module.exports = { bookBike, listBookings, updateBooking, deleteBooking };
