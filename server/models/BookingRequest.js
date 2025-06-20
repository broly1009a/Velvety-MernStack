const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingRequestSchema = new Schema({
    serviceID: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    customerID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Added customer reference
    date: { type: Date, required: true },
    time: { type: String, required: true },
    consultantID: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Renamed from therapistID
    status: { type: String, enum: ["Pending", "Confirmed", "Completed", "Cancelled"], required: true },
    isConsultantAssignedByCustomer: { type: Boolean, default: false },
    CheckinCode: { type: String, unique: true, required: true },
    isUpdated: { type: Boolean, default: false },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
    
});

bookingRequestSchema.index({ date: 1, time: 1, consultantID: 1 }, { unique: true });

bookingRequestSchema.pre('save', function (next) {
    this.updatedDate = new Date();
    next();
  });

  bookingRequestSchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedDate: new Date() });
    next();
  });

module.exports = mongoose.model("BookingRequest", bookingRequestSchema);
