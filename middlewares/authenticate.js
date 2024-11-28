const jwt = require("jsonwebtoken");
const CustomError = require("../utils/customError");

const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new CustomError("Not Authenticated", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new CustomError("Invalid Token", 401));
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.id.role) || !req.user.id.isActive) {
      return next(new CustomError("Unauthorized", 403));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
