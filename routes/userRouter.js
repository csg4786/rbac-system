const express = require("express");

const {
  getUsers,
  getUser,
  addUser,
  removeUser,
  updateUser,
  changeRole,
  toggleActiveStatus,
} = require("../controllers/userController");

const { authenticate, authorize } = require("../middlewares/authenticate");
const multer = require("multer");
const { storage } = require("../middlewares/fileInput");

const {
  validateUser,
  handleValidationErrors,
} = require("../middlewares/inputValidation");

// Initialize multer with configured storage for file uploads
const upload = multer({ storage });

// Initialize Express Router
const router = express.Router();

/**
 * Route to fetch a list of users with filtering, sorting, and pagination.
 * Accessible to Admin and Moderator roles.
 * Method: GET
 * Path: /api/employee/
 */
router.get("/", 
  authenticate, 
  authorize(["Admin", "Moderator"]), 
  getUsers
);

/**
 * Route to fetch a single user by their ID.
 * Accessible to Admin, Moderator, and the User themselves.
 * Method: GET
 * Path: /api/employee/:id
 */
router.get(
  "/:id",
  authenticate,
  authorize(["Admin", "Moderator", "User"]),
  getUser
);

/**
 * Route to add a new user.
 * Accessible to Admin and Moderator roles.
 * Validates input before processing the request.
 * Method: POST
 * Path: /api/employee/add
 */
router.post(
  "/add",
  upload.none(), // No file upload required for this route
  validateUser, // Validate user input
  handleValidationErrors, // Handle validation errors
  authenticate, // Ensure the user is authenticated
  authorize(["Admin", "Moderator"]), // Ensure the user has the required role
  addUser
);

/**
 * Route to remove a user by their ID.
 * Accessible to Admin and Moderator roles.
 * Method: DELETE
 * Path: /api/employee/remove/:id
 */
router.delete(
  "/remove/:id",
  authenticate,
  authorize(["Admin", "Moderator"]),
  removeUser
);

/**
 * Route to update a user's details by their ID.
 * Accessible to Admin, Moderator, and the User themselves.
 * Validates input and handles file uploads.
 * Method: PATCH
 * Path: /api/employee/update/:id
 */
router.patch(
  "/update/:id",
  upload.single("image"), // Handle image upload
  validateUser, // Validate user input
  handleValidationErrors, // Handle validation errors
  authenticate, // Ensure the user is authenticated
  authorize(["Admin", "Moderator", "User"]), // Ensure the user has the required role
  updateUser
);

/**
 * Route to change the role of a user by their ID.
 * Accessible to Admin role only.
 * Method: PATCH
 * Path: /api/employee/change-role/:id
 */
router.patch(
  "/change-role/:id",
  authenticate,
  authorize(["Admin"]),
  changeRole
);

/**
 * Route to toggle the active status of a user by their ID.
 * Accessible to Admin and Moderator roles.
 * Method: PATCH
 * Path: /api/employee/toggle-active-status/:id
 */
router.patch(
  "/toggle-active-status/:id",
  authenticate,
  authorize(["Admin", "Moderator"]),
  toggleActiveStatus
);

// Export the router module for use in the application
module.exports = router;
