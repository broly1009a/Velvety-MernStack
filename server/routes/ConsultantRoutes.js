const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ConsultantController = require('../controllers/ConsultantController');
const { authenticate, authorize } = require('../middlewares/AuthMiddleware');


// Get all consultants
router.get('/', ConsultantController.getAllConsultants);

// Get consultant by ID
router.get('/:id', authenticate, ConsultantController.getConsultantById);


// Create a new consultant 
router.post('/', authenticate, authorize(['Admin']), ConsultantController.createConsultant);

// Update consultant 
router.put('/:id', authenticate, authorize(['Admin']), ConsultantController.updateConsultant);

// Delete consultant 
router.delete('/:id', authenticate, authorize(['Admin']), ConsultantController.deleteConsultant);

// Add rating to consultant (Validation added)
router.post(
    '/:id/rate',
    authenticate,
    authorize(['Customer']),
    [
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().isString().withMessage('Comment must be a string')
    ],
    ConsultantController.addRating
);

// Reset password for consultant 
router.post('/:id/reset-password', authenticate, authorize(['Admin']), ConsultantController.resetPassword);

router.get('/available/:bookingID',authenticate, authorize(['Staff']), ConsultantController.getAvailableConsultants);

module.exports = router;
