// middlewares/errorHandler.js
const CustomError = require("../utils/customError");

// This middleware will catch errors thrown by other parts of the app
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error details for debugging

  // Set a generic status code if not provided in the error object
  const statusCode = err.statusCode || 500;

  // Send JSON response with error details
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error", // Default message for generic errors
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Include stack trace in development
  });
};

module.exports = {errorHandler};
