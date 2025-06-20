const BookingRequest = require('../models/BookingRequest');
const Consultant = require("../models/Consultant");
const mongoose = require('mongoose');
const cron = require('node-cron');
const crypto = require("crypto"); // for generating a random code

exports.createBookingRequest = async (req, res) => {
  try {
    const { serviceID, customerID, date, time, consultantID } = req.body;

    // Validate required fields
    if (!serviceID || !customerID || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert date to ISO format (YYYY-MM-DD) to avoid time zone issues
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    console.log("Checking for existing bookings:", { date: bookingDate, time, consultantID });

    // Check if the consultant is already booked at the same date and time
    if (consultantID) {
      const existingBooking = await BookingRequest.findOne({
        date: new Date(date), // Convert input date to a Date object
        time,
        consultantID
      });

      if (existingBooking) {
        console.log("Conflict found:", existingBooking);
        return res.status(400).json({ message: "This consultant is already booked at the selected date and time." });
      }
    }

    // Generate a unique check-in code
    const generateCheckinCode = () => {
      return crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g., "A3F5C2B1"
    };

    let checkinCode;
    let isUnique = false;

    // Ensure the code is unique in the DB
    while (!isUnique) {
      checkinCode = generateCheckinCode();
      const existingCode = await BookingRequest.findOne({ CheckinCode: checkinCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Create new booking request
    const newBooking = new BookingRequest({
      serviceID,
      customerID,
      date: bookingDate.toISOString().split("T")[0], // Ensures consistent date format
      time,
      consultantID: consultantID || null,
      status: req.body.status || "Pending",
      isConsultantAssignedByCustomer: req.body.isConsultantAssignedByCustomer || false,
      CheckinCode: checkinCode,
    });

    const bookingRequest = await newBooking.save();
    res.status(201).json(bookingRequest);
  } catch (error) {
    console.error("Error creating booking request:", error);

    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ error: "This consultant is already booked at the selected date and time." });
    }

    res.status(500).json({ error: "Failed to create booking request" });
  }
};


exports.getAllBookingRequests = async (req, res) => {
  try {
    const bookingRequests = await BookingRequest.find()
      .populate("serviceID", "name")
      .populate("consultantID", "firstName lastName email");
    res.status(200).json(bookingRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignService = async (req, res) => {
  try {
    const { serviceID } = req.body;
    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { serviceID },
      { new: true }
    );
    if (!bookingRequest) return res.status(404).json({ message: 'Booking Request not found' });
    await logUserActivity("Assigned Service")(req, res, () => { });
    res.status(200).json(bookingRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBookingRequestStatus = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const { status: newStatus } = req.body;
    if (!newStatus) {
      return res.status(400).json({ message: "Status is required" });
    }

    const bookingRequest = await BookingRequest.findById(req.params.id);
    if (!bookingRequest) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    const validTransitions = {
      "Pending": ["Confirmed"],
      "Confirmed": ["Completed"],
      "Cancelled": [],  // No valid transitions from Cancelled
      "Completed": [],  // No valid transitions from Completed
    };

    const currentStatus = bookingRequest.status;

    console.log(`Current Status: ${currentStatus}, New Status: ${newStatus}`);

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'`
      });
    }

    bookingRequest.status = newStatus;
    await bookingRequest.save();
    res.status(200).json({ message: "Status updated successfully", bookingRequest });

  } catch (error) {
    console.error("Error upx`dating status:", error);
    res.status(500).json({ error: error.message });
  }
};

// API: Lấy danh sách booking của consultant theo ngày
exports.getBookingsByConsultantAndDate = async (req, res) => {
  try {
    const { consultantID, date } = req.query;

    if (!consultantID || !date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const bookings = await BookingRequest.find({
      consultantID,
      date: new Date(date).toISOString().split("T")[0] // Chỉ lấy ngày, bỏ giờ phút giây
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};


exports.getConsultantBookings = async (req, res) => {
  console.log(" Checking req.user:", req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

  try {
    const bookings = await BookingRequest.find({ consultantID: req.user.id }) // Lấy userId từ token
      .populate("customerID", "firstName lastName")
      .populate("serviceID", "name");

    res.json({ bookings });
  } catch (error) {
    console.error(" Error fetching consultant bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getCustomerBookings = async (req, res) => {
  console.log("🔍 Checking req.user:", req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

  try {
    const bookings = await BookingRequest.find({ customerID: req.user.id }) // Lấy lịch sử đặt lịch của khách hàng
      .populate("consultantID", "firstName lastName")
      .populate("serviceID", "name");

    res.json({ bookings });
  } catch (error) {
    console.error(" Error fetching customer bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.cancelBookingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Request ID:", id);

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Find the booking request
    const booking = await BookingRequest.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    // Ensure the user is the owner of the booking request
    if (booking.customerID.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only cancel your own booking request" });
    }

    // Define allowed status transitions
    const cancellableStatuses = ["Pending"];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel booking with status '${booking.status}'` });
    }

    // Update the status to "Cancelled"
    booking.status = "Cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking request canceled successfully", booking });

  } catch (error) {
    console.error("Error canceling booking request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateBookingRequest = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID booking từ URL
    const updateData = req.body; // Dữ liệu cập nhật từ request body

    console.log("Updating BookingRequest ID:", id, "with data:", updateData);

    // Kiểm tra ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    // Cập nhật booking
    const updatedBooking = await BookingRequest.findByIdAndUpdate(id, updateData, { new: true });

    // Kiểm tra nếu booking không tồn tại
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    res.status(200).json({
      message: "Booking Request updated successfully",
      booking: updatedBooking,
    });

  } catch (error) {
    console.error("Error updating booking request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingRequest.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({ message: "Only pending bookings can be confirmed" });
    }

    booking.status = "Confirmed";
    await booking.save();
    res.status(200).json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error confirming booking", error: error.message });
  }
};

// Function to update status to Completed (only if currently Confirmed)
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingRequest.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    if (booking.status !== "Confirmed") {
      return res.status(400).json({ message: "Only confirmed bookings can be marked as completed" });
    }

    booking.status = "Completed";
    await booking.save();
    res.status(200).json({ message: "Booking marked as completed", booking });
  } catch (error) {
    res.status(500).json({ message: "Error completing booking", error: error.message });
  }
};

// Function to update status to Cancelled (only if currently Pending)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingRequest.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({ message: "Only pending bookings can be cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();
    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};

// Function to get booking details
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await BookingRequest.findById(id).populate("serviceID customerID consultantID isUpdated");

    if (!booking) {
      return res.status(404).json({ message: "Booking request not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving booking details", error: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id, newStatus } = req.params;

    // Find the booking request
    const booking = await BookingRequest.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking request not found." });
    }

    // Define valid status transitions
    const validTransitions = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["Completed"],
    };

    // Check if the requested status update is valid
    if (!validTransitions[booking.status] || !validTransitions[booking.status].includes(newStatus)) {
      return res.status(400).json({ message: `Invalid status transition from ${booking.status} to ${newStatus}.` });
    }

    // Update status
    booking.status = newStatus;
    await booking.save();

    res.status(200).json({ message: `Booking status updated to ${newStatus}`, booking });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, action } = req.body; // action = 'cancel', 'checkin', 'checkout'
    let newStatus;

    switch (action) {
      case 'cancel':
        newStatus = 'cancelled';
        break;
      case 'checkin':
        newStatus = 'confirmed';
        break;
      case 'checkout':
        newStatus = 'completed';
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const updatedBooking = await BookingRequest.findByIdAndUpdate(
      bookingId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.assignConsultant = async (req, res) => {
  const { bookingId } = req.params;
  const { consultantId } = req.body;

  try {
    const updatedBooking = await BookingRequest.findByIdAndUpdate(
      bookingId,
      { consultantID: consultantId },
      { new: true }
    ).populate("consultantID"); // Ensure populated response

    if (!updatedBooking) return res.status(404).json({ message: "Booking not found" });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Error assigning consultant", error });
  }
};

exports.getPendingBookingsForConsultant = async (req, res) => {
  try {
    const { consultantId } = req.params; // Extract consultant ID from URL params

    if (!consultantId) {
      return res.status(400).json({ error: "Consultant ID is required" });
    }

    const pendingBookings = await BookingRequest.find({
      consultantID: consultantId,
      status: "Pending",
    }); // Populate related data if needed

    res.json(pendingBookings);
  } catch (error) {
    console.error("Error fetching pending bookings:", error);
    res.status(500).json({ error: "Failed to fetch pending bookings" });
  }
};

// delete booking 
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await BookingRequest.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking request not found" });
    }
    res.status(200).json({ message: "Booking request deleted successfully", deletedBooking });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking request", error: error.message });
  }
};

// Define the cron job within the controller
exports.scheduleBookingCancellation = () => {
  console.log("✅ Cron job for booking cancellation initialized");

  cron.schedule('* * * * *', async () => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const bookingsToCancel = await BookingRequest.find({
        status: "Pending",
        date: { $lt: todayStart },
      });

      if (bookingsToCancel.length === 0) {
        console.log("📭 No overdue pending bookings to cancel.");
        return;
      }

      console.log(`🚫 Cancelling ${bookingsToCancel.length} overdue bookings:`);

      for (const booking of bookingsToCancel) {
        booking.status = "Cancelled";
        await booking.save();
        console.log(`🔄 Booking ID ${booking._id} cancelled.`);
      }
    } catch (error) {
      console.error("❌ Error during booking cancellation cron job:", error);
    }
  });
};

exports.initializeBookingTasks = () => {
  exports.scheduleBookingCancellation(); // not "this", use "exports" here
};



//update booking request (date and consultant)
exports.updateBookingRequestDetails = async (req, res) => {
  try {
    const { id } = req.params; // Booking ID from URL
    const { date, time, consultantID } = req.body; // New booking details

    console.log("Updating BookingRequest ID:", id, "with data:", { date, time, consultantID });

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }

    // Fetch the booking request
    const booking = await BookingRequest.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking Request not found" });
    }

    // Ensure the booking is in "Pending" status
    if (booking.status !== "Pending") {
      return res.status(400).json({ message: "Booking can only be updated when its status is 'Pending'." });
    }

    // Ensure the booking has not already been updated
    if (booking.isUpdated) {
      return res.status(400).json({ message: "Booking details can only be updated once." });
    }

    // Validate the date if provided
    if (date) {
      const selectedDate = new Date(date);
      const currentDate = new Date();
      if (isNaN(selectedDate.getTime()) || selectedDate <= currentDate) {
        return res.status(400).json({ message: "Selected date must be in the future." });
      }
    }

    // Check if the consultant is already booked at the new date and time
    if (consultantID && date && time) {
      const existingBooking = await BookingRequest.findOne({
        date: new Date(date),
        time,
        consultantID,
        _id: { $ne: id }, // Exclude the current booking
      });

      if (existingBooking) {
        return res.status(400).json({ message: "This consultant is already booked at the selected date and time." });
      }
    }

    // If a new consultant is being selected, ensure they are available
    if (consultantID) {
      const bookedConsultants = await BookingRequest.find({
        date: date || booking.date, // Use the provided date or the existing booking date
        time: time || booking.time, // Use the provided time or the existing booking time
        consultantID,
        status: { $in: ["Pending", "Confirmed"] },
      }).distinct("consultantID");

      if (bookedConsultants.includes(consultantID)) {
        return res.status(400).json({ message: "The selected consultant is not available at the chosen time." });
      }
    }

    // Update booking details
    const updateData = {};
    if (date) updateData.date = date;
    if (time) updateData.time = time;
    if (consultantID !== undefined) {
      updateData.consultantID = consultantID === '' ? null : consultantID;
    }
    updateData.isUpdated = true; // Mark as updated

    const updatedBooking = await BookingRequest.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      message: "Booking Request updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking request details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};