const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all customers (Admin only)
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ roleName: "Customer" }).select('-password');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customers", error });
    }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await User.findOne({ _id: req.params.id, roleName: "Customer" }).select('-password');
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer", error });
    }
};

// Update customer profile
exports.updateCustomer = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber } = req.body;
        
        // Check if another user has the same phone number
        const existingUser = await User.findOne({ phoneNumber });
        
        if (existingUser && existingUser._id.toString() !== req.params.id) {
            return res.status(400).json({ message: "Phone number already in use" });
        }

        const updatedCustomer = await User.findOneAndUpdate(
            { _id: req.params.id, roleName: "Customer" },
            { firstName, lastName, phoneNumber, updatedDate: Date.now() },
            { new: true }
        ).select('-password');

        if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });

        res.json({ message: "Customer updated successfully", customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error updating customer", error });
    }
};

// Delete customer (Admin only)
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await User.findOneAndDelete({ _id: req.params.id, roleName: "Customer" });
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting customer", error });
    }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    // Trim input to prevent accidental whitespace issues
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    // Validate new password strength (min 8 chars, at least 1 number & special char)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(trimmedNewPassword)) {
      return res.status(400).json({
        message:
          "New password must be at least 8 characters long and include at least one number and one special character.",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare current password
    const isPasswordValid = await bcrypt.compare(trimmedCurrentPassword, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid current password" });

    // Prevent setting the same password again
    const isSameAsOldPassword = await bcrypt.compare(trimmedNewPassword, user.password);
    if (isSameAsOldPassword) {
      return res.status(400).json({ message: "New password cannot be the same as the current password" });
    }

    // Hash and update the new password
    user.password = await bcrypt.hash(trimmedNewPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Error changing password:", error);
    res.status(500).json({ message: "An error occurred while changing password" });
  }
};

