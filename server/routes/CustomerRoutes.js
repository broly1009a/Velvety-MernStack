const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');

// Get all customers 
router.get('/', authenticate, authorize(['Admin']), CustomerController.getAllCustomers);

// Get customer by ID
router.get('/:id', authenticate, authorize(['Admin', 'Customer']), CustomerController.getCustomerById);

// Update customer profile
router.put('/:id', authenticate, authorize(['Customer']), CustomerController.updateCustomer);

// Delete customer 
router.delete('/:id', authenticate, authorize(['Admin']), CustomerController.deleteCustomer);

// Change password
router.post('/change-password', authenticate, CustomerController.changePassword);

module.exports = router;
