const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');

// Get all users (Admin only)
router.get('/', authenticate, authorize(['Admin']), UserController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, UserController.getUserById);

// Update user profile
router.put('/:id', authenticate, UserController.updateUser);

// Change password
router.put('/:id/change-password', authenticate, UserController.changePassword);

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize(['Admin']), UserController.deleteUser);

module.exports = router;
