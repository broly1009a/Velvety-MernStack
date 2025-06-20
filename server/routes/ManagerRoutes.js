const express = require('express');
const router = express.Router();
const ManagerController = require('../controllers/ManagerController');
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');

// Get all managers 
router.get('/', authenticate, authorize(['Admin']), ManagerController.getAllManagers);

// Get manager by ID
router.get('/:id', authenticate, authorize(['Admin', 'Manager']), ManagerController.getManagerById);

// Update manager profile
router.put('/:id', authenticate, authorize(['Manager']), ManagerController.updateManager);

// Delete manager 
router.delete('/:id', authenticate, authorize(['Admin']), ManagerController.deleteManager);

module.exports = router;
