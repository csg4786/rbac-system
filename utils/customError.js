
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500; // Default to 500 if no status code is provided
    // this.isOperational = true; // Can use this flag to differentiate between operational vs programming errors
    Error.captureStackTrace(this, this.constructor); // Capture stack trace for better debugging
  }
}

module.exports = CustomError;
