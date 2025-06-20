const User = require('../models/User');
const bcrypt = require("bcryptjs");

// Get all staff members (Admin only)
exports.getAllStaff = async (req, res) => {
    try {
        const staffMembers = await User.find({ roleName: "Staff" }).select('-password');
        res.json(staffMembers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching staff members", error });
    }
};

// Get staff member by ID
exports.getStaffById = async (req, res) => {
    try {
        const staff = await User.findOne({ _id: req.params.id, roleName: "Staff" }).select('-password');
        if (!staff) return res.status(404).json({ message: "Staff member not found" });

        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: "Error fetching staff member", error });
    }
};

// Update staff profile
exports.updateStaff = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, verified } = req.body;
        const updatedStaff = await User.findOneAndUpdate(
            { _id: req.params.id, roleName: "Staff" },
            { firstName, lastName, phoneNumber, verified, updatedDate: Date.now() },
            { new: true }
        ).select('-password');

        if (!updatedStaff) return res.status(404).json({ message: "Staff member not found" });

        res.json({ message: "Staff profile updated successfully", staff: updatedStaff });
    } catch (error) {
        res.status(500).json({ message: "Error updating staff profile", error });
    }
};

// Delete staff member (Admin only)
exports.deleteStaff = async (req, res) => {
    try {
        const staff = await User.findOneAndDelete({ _id: req.params.id, roleName: "Staff" });
        if (!staff) return res.status(404).json({ message: "Staff member not found" });

        res.json({ message: "Staff member deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting staff member", error });
    }
};

// Create new staff member (Admin only)
exports.createStaff = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password, verified} = req.body;

        // Check if email already exists
        const existingStaff = await User.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new staff member
        const newStaff = new User({
            firstName,
            lastName,
            email,
            phoneNumber,
            password : hashedPassword, // Ensure you hash the password before saving it
            roleName : "Staff",
            verified,
        });

        // Save the new staff member
        await newStaff.save();

        res.status(201).json({ message: "Staff member created successfully", staff: newStaff });
    } catch (error) {
        res.status(500).json({ message: "Error creating staff member", error });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const staff = await User.findOne({ _id: req.params.id, roleName: "Staff" }).select('-password');
        if (!staff) return res.status(404).json({ message: "Staff member not found" });
    
        const defaultPassword = "default123";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
        staff.password = hashedPassword;
        await staff.save();
    
        res.json({ message: "Password reset successfully" });
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
};

