const CustomError = require("../utils/customError");
const { body, validationResult } = require("express-validator");

const validateAuth = [
  // Validate email field (should be a valid email format)
  body("email")
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),

  // Validate password field (should be at least 5 characters long)
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),

];

const validateUser = [
  // Validate name (should not be empty)
  body("name").notEmpty().withMessage("Name is required.").trim(),

  // Validate email (should be a valid email format)
  body("email")
    .isEmail()
    .withMessage("Invalid email address.")
    .normalizeEmail(),

  // Validate password field (should be at least 5 characters long)
  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long."),

  // Validate mobile number (should be a valid mobile number format)
  body("mobile").isMobilePhone().withMessage("Invalid mobile number."),

  // Validate gender (should be either 'M' or 'F')
  body("gender").isIn(["M", "F", "O"]).withMessage("Invalid gender."),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(", ");
    return next(new CustomError(`Errors: ${errorMessages}`, 400));
  }
  next(); // Proceed to the next middleware if no validation errors
};

module.exports = {
  validateAuth,
  validateUser,
  handleValidationErrors,
};
