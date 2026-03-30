// ===========================================
// Request Validation Middleware
// Uses express-validator for input sanitization
// ===========================================
const { body, validationResult } = require('express-validator');

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Registration validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage('Password must include uppercase, lowercase, number, and special character (!@#$%^&*)'),
  validate,
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Reset Password validation rules
const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage('Password must include uppercase, lowercase, number, and special character (!@#$%^&*)'),
  validate,
];

// Profile update validation
const profileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio must be under 200 characters'),
  validate,
];

// Game start validation
const gameStartValidation = [
  body('productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  validate,
];

// Chat message validation
const chatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Message must be under 500 characters'),
  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  profileValidation,
  gameStartValidation,
  chatValidation,
};
