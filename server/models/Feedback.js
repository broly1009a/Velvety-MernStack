const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  bookingRequestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "BookingRequest", 
    required: true 
  }, 
  serviceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Service",
    required: true 
  }, 
  consultantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Consultant",
    required: true 
  }, 
  serviceRating: { type: Number, min: 1, max: 5, required: true },
  serviceComment: { type: String, maxlength: 500 },
  consultantRating: { type: Number, min: 1, max: 5, required: true },
  consultantComment: { type: String, maxlength: 500 },
  createdDate: { type: Date, default: Date.now }
});

// Đảm bảo chỉ tạo feedback nếu bookingRequest đã hoàn thành
feedbackSchema.pre("save", async function (next) {
  const BookingRequest = mongoose.model("BookingRequest");
  
  const booking = await BookingRequest.findById(this.bookingRequestId);
  if (!booking || booking.status !== "Completed") {
    return next(new Error("Feedback chỉ được tạo khi booking đã hoàn thành"));
  }
  
  next();
});

module.exports = mongoose.model("Feedback", feedbackSchema);
