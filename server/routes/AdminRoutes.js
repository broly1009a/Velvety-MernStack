const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');

// Get all users
router.get('/users', authenticate, authorize(['Admin']), AdminController.getAllUsers);

// Get user by ID
router.get('/users/:id', authenticate, authorize(['Admin']), AdminController.getUserById);

// Update user role
router.put('/users/:id/role', authenticate, authorize(['Admin']), AdminController.updateUserRole);

// Delete user
router.delete('/users/:id', authenticate, authorize(['Admin']), AdminController.deleteUser);

// Approve consultant
router.put('/consultants/:id/approve', authenticate, authorize(['Admin']), AdminController.approveConsultant);

module.exports = router;
