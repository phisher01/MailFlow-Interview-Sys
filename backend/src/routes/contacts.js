const express = require('express');
const { body } = require('express-validator');
const {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  importContacts
} = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const contactValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
];

// Apply authentication to all routes
router.use(authenticate);

// Routes
router.get('/', getContacts);
router.post('/', contactValidation, createContact);
router.put('/:id', contactValidation, updateContact);
router.delete('/:id', deleteContact);
router.post('/import', importContacts);

module.exports = router;