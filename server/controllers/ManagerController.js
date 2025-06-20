const User = require('../models/User');

// Get all managers (Admin only)
exports.getAllManagers = async (req, res) => {
    try {
        const managers = await User.find({ roleName: "Manager" }).select('-password');
        res.json(managers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching managers", error });
    }
};

// Get manager by ID
exports.getManagerById = async (req, res) => {
    try {
        const manager = await User.findOne({ _id: req.params.id, roleName: "Manager" }).select('-password');
        if (!manager) return res.status(404).json({ message: "Manager not found" });

        res.json(manager);
    } catch (error) {
        res.status(500).json({ message: "Error fetching manager", error });
    }
};

// Update manager profile
exports.updateManager = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber } = req.body;
        const updatedManager = await User.findOneAndUpdate(
            { _id: req.params.id, roleName: "Manager" },
            { firstName, lastName, phoneNumber, updatedDate: Date.now() },
            { new: true }
        ).select('-password');

        if (!updatedManager) return res.status(404).json({ message: "Manager not found" });

        res.json({ message: "Manager profile updated successfully", manager: updatedManager });
    } catch (error) {
        res.status(500).json({ message: "Error updating manager profile", error });
    }
};

// Delete manager (Admin only)
exports.deleteManager = async (req, res) => {
    try {
        const manager = await User.findOneAndDelete({ _id: req.params.id, roleName: "Manager" });
        if (!manager) return res.status(404).json({ message: "Manager not found" });

        res.json({ message: "Manager deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting manager", error });
    }
};
