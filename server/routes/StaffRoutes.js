const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/StaffController');
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');

// Get all staff members 
router.get('/', authenticate, authorize(['Admin']), StaffController.getAllStaff);

// Get staff member by ID
router.get('/:id', authenticate, authorize(['Admin', 'Staff']), StaffController.getStaffById);

// Update staff member 
router.put('/:id', authenticate, authorize(['Admin']), StaffController.updateStaff);

// Delete staff member 
router.delete('/:id', authenticate, authorize(['Admin']), StaffController.deleteStaff);

// Creat staff member
router.post('/', authenticate, authorize(['Admin']), StaffController.createStaff);

router.post("/:id/reset-password", authenticate, authorize(['Admin']),StaffController.resetPassword);

module.exports = router;
