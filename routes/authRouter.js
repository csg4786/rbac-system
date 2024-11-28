const express = require("express");

const {
  // registerUser, // Commented out for now, can be included if registration is added
  loginUser,
  logoutUser,
} = require("../controllers/authController");

const { authenticate } = require("../middlewares/authenticate");

const {
  validateAuth,
  handleValidationErrors,
} = require("../middlewares/inputValidation");

// Initialize Express Router
const router = express.Router();

/**
 * Route to log in a user.
 * Validates authentication input before processing the request.
 * Method: POST
 * Path: /login
 */
router.post(
  "/login",
  validateAuth, // Validate authentication input (e.g., email and password)
  handleValidationErrors, // Handle validation errors if present
  loginUser // Call the controller to handle user login
);

/**
 * Route to log out a user.
 * Ensures the user is authenticated before allowing logout.
 * Method: GET
 * Path: /logout
 */
router.get(
  "/logout",
  authenticate, // Middleware to ensure the user is authenticated
  logoutUser // Call the controller to handle user logout
);

// Export the router module for use in the application
module.exports = router;
