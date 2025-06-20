const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate, authorize } = require("../middlewares/AuthMiddleware");

// Register a new user
router.post('/register', AuthController.register);

// Login
router.post('/login', AuthController.login);

// Verify Email
router.get('/verify', AuthController.verifyEmail);

// Forgot Password
router.post('/forgot-password', AuthController.forgotPassword);

// Reset Password
router.post('/reset-password', AuthController.resetPassword);

// Resend Verification Email
router.post('/resend-verification-email', AuthController.resendVerificationEmail);

// Logout
router.post('/logout', AuthController.logout);

// Change Password
router.post('/change-password',authenticate, authorize(['Manager', 'Admin', 'Consultant', 'Staff']), AuthController.changePassword);

module.exports = router;
