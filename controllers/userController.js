const User = require("../models/User");
const bcrypt = require("bcrypt");
const { validateMongoDbId } = require("../utils/validateMongoDbId");
const CustomError = require("../utils/customError");

// Function to fetch the list of users with filtering, sorting, and pagination
const getUsers = async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const { key, ...filter } = { ...req.query };
    const excludeFields = ["limit", "sort", "page", "fields"];

    // Remove excluded fields from filter object
    excludeFields.forEach((element) => {
      delete filter[element];
    });

    // Apply case-insensitive search for multiple fields if a key is provided
    if (key) {
      filter.$or = [
        { name: { $regex: key, $options: "i" } }, // Case-insensitive search for name
        { email: { $regex: key, $options: "i" } }, // Case-insensitive search for email
        { mobile: { $regex: key, $options: "i" } }, // Case-insensitive search for mobile
        { gender: { $regex: key, $options: "i" } }, // Case-insensitive search for gender
        { role: { $regex: key, $options: "i" } }, // Case-insensitive search for role
      ];
    }

    // Convert filter object to string for MongoDB query
    let filterStr = JSON.stringify(filter);

    // Sorting based on query parameter or default to createdAt in descending order
    const sortBy = req.query.sort
      ? req.query.sort.split(",").join(" ") // If provided, sort by fields specified
      : "createdAt"; // Default sort by createdAt field in ascending order

    // Pagination setup with page and limit (default values if not provided)
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 10;
    const skip = (page - 1) * limit;

    // Get total number of users for pagination check
    const total = await User.countDocuments();

    // If the skip value is beyond the total number of users, return an error
    if (skip >= total) return next(new CustomError(`Page doesn't exist!`, 400));

    // Check if the user has the required role (Admin/Moderator) to fetch users
    let usersList;
    if (req.user.id.role === "Admin") {
      // Admin can fetch all users
      usersList = await User.find(JSON.parse(filterStr))
        .sort(sortBy)
        .skip(skip)
        .limit(limit);
    } else if (req.user.id.role === "Moderator") {
      // Moderator can fetch only Moderators and Users
      filter.role = { $in: ["Moderator", "User"] };
      usersList = await User.find({
        ...JSON.parse(filterStr),
        ...filter,
      })
        .sort(sortBy)
        .skip(skip)
        .limit(limit);
    } else {
      // Unauthorized if not Admin or Moderator
      return next(new CustomError(`Unauthorized`, 403));
    }

    // Send response with users data
    res.json({
      success: true,
      message: "Users Fetch Successful!",
      count: usersList.length,
      users: usersList,
    });
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

// Function to fetch a specific user based on the ID
const getUser = async (req, res, next) => {
  try {
    // Validate the MongoDB ID format for the user
    validateMongoDbId(req.params.id);

    // Find the user to update and remove password before responding
    const target = await User.findById(req.params.id);
    if (!target) {
      return next(new CustomError("User not found!", 404));
    }
    delete target._doc.password;

    // Check if the user is Admin or Moderator to determine access permissions
    if (req.user.id.role === "Admin") {
      res.json({
        success: true,
        message: "User Fetch Successful!",
        user: target._doc,
      });
    } else if (req.user.id.role === "Moderator") {
      // Moderator can only access User data or their own data
      if (
        target._doc.role === "User" ||
        target._doc._id.toHexString() === req.user.id._id
      ) {
        res.json({
          success: true,
          message: "User Fetch Successful!",
          user: target._doc,
        });
      } else {
        return next(new CustomError(`Unauthorized`, 403));
      }
    } else {
      // User can only access their own data
      if (target._doc._id.toHexString() === req.user.id._id) {
        res.json({
          success: true,
          message: "User Fetch Successful!",
          user: target._doc,
        });
      } else {
        return next(new CustomError(`Unauthorized`, 403));
      }
    }
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

// Function to add a new user (Admin/Moderator only)
const addUser = async (req, res, next) => {
  try {
    // const { body, file } = req;
    const { body } = req;

    // Extract user details from the request body and set default image
    const { name, email, password, mobile, gender } = body;

    const filename = "/assets/images/avatar.png";

    // const filename = file?.filename
    //   ? `/assets/images/${file.filename}`
    //   : "/assets/images/avatar.png";

    // Check if the user is Admin or Moderator to allow adding users
    // if (req.user.id.role === "Admin" || req.user.id.role === "Moderator") {
    // Check if the user already exists by email
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return next(new CustomError(`User already exists`, 400));
    } else {
      // Create a new user record
      const newUserDetails = await User.create({
        name,
        image: filename,
        email,
        password,
        mobile,
        gender,
      });
      delete newUserDetails._doc.password;

      // Send response with the newly created user details
      res.json({
        success: true,
        message: "New user added!",
        ...newUserDetails._doc,
      });
    }
    // } else {
    //   return next(new CustomError(`Unauthorized`, 403));
    // }
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

// Function to remove a user (Admin/Moderator only)
const removeUser = async (req, res, next) => {
  try {
    // Validate the MongoDB ID format for the user
    validateMongoDbId(req.params.id);

    // Find the user to delete and remove password before responding
    const tempTarget = await User.findById(req.params.id);
    if (!tempTarget) {
      return next(new CustomError("User not found!", 404));
    }
    delete tempTarget._doc.password;

    // Admin can delete any user
    if (req.user.id.role === "Admin") {
      const target = await User.findByIdAndDelete(req.params.id);
      delete target._doc.password;
      res.json({
        success: true,
        message: "User Deleted!",
        user: target._doc,
      });
    } else if (req.user.id.role === "Moderator") {
      // Moderator can only delete users with the role "User"
      if (tempTarget._doc.role === "User") {
        const target = await User.findByIdAndDelete(req.params.id);
        delete target._doc.password;
        res.json({
          success: true,
          message: "User Deleted!",
          user: target._doc,
        });
      } else {
        return next(new CustomError(`Unauthorized`, 403));
      }
    } else {
      return next(new CustomError(`Unauthorized`, 403));
    }
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

// Function to update user details (Admin/Moderator only)
const updateUser = async (req, res, next) => {
  try {
    // Validate the MongoDB ID format for the user
    validateMongoDbId(req.params.id);

    // Find the user to update and remove password before responding
    const tempTarget = await User.findById(req.params.id);
    if (!tempTarget) {
      return next(new CustomError("User not found!", 404));
    }
    delete tempTarget._doc.password;

    // Extract user details from the request body
    const { body, file } = req;
    const { name, email, mobile, gender } = body;
    const filename = file?.filename
      ? `/assets/images/${file.filename}`
      : tempTarget.image;

    // Set the updated user data
    const setObject = {
      name,
      image: filename,
      email,
      mobile,
      gender,
    };

    // Admin can update any user
    if (req.user.id.role === "Admin") {
      const target = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: setObject }
      );
      delete target._doc.password;

      res.json({
        success: true,
        message: "User Updated!",
        user: target._doc,
      });
    } else if (req.user.id.role === "Moderator") {
      // Moderator can only update "User" role users or self
      if (
        tempTarget._doc.role === "User" ||
        tempTarget._doc._id === req.user.id._id
      ) {
        const target = await User.findOneAndUpdate(
          { _id: req.params.id },
          { $set: setObject }
        );
        delete target._doc.password;

        res.json({
          success: true,
          message: "User Updated!",
          user: target._doc,
        });
      } else {
        return next(new CustomError(`Unauthorized`, 403));
      }
    } else {
      // User can only update self
      if (target._doc._id.toHexString() === req.user.id._id) {
        const target = await User.findOneAndUpdate(
          { _id: req.params.id },
          { $set: setObject }
        );
        delete target._doc.password;

        res.json({
          success: true,
          message: "User Updated!",
          user: target._doc,
        });
      } else {
        return next(new CustomError(`Unauthorized`, 403));
      }
    }
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

// Function to change user role (Admin only)
const changeRole = async (req, res, next) => {
  try {
    // Validate the MongoDB ID format for the user
    validateMongoDbId(req.params.id);

    // Find the user to update and remove password before responding
    const tempTarget = await User.findById(req.params.id);
    if (!tempTarget) {
      return next(new CustomError("User not found!", 404));
    }
    const oldRole = tempTarget._doc.role;
    delete tempTarget._doc.password;

    // Extract user details from the request body
    const { role } = req.body;

    // Admin can update any user
    if (req.user.id.role === "Admin") {
      const target = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { role } }
      );

      res.json({
        success: true,
        message: `User role change from ${oldRole} to ${role}!`,
        user: target._doc,
      });
    } else {
      return next(new CustomError(`Unauthorized`, 403));
    }
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

// Function to toggle user active status (Admin/Moderator only)
const toggleActiveStatus = async (req, res, next) => {
  try {
    // Validate the MongoDB ID format for the user
    validateMongoDbId(req.params.id);

    // Find the user to update and remove password before responding
    const tempTarget = await User.findById(req.params.id);
    if (!tempTarget) {
      return next(new CustomError("User not found!", 404));
    }
    const oldStatus = tempTarget._doc.isActive;
    delete tempTarget._doc.password;

    // Admin can update any user
    if (req.user.id.role === "Admin") {
      const target = await User.findOneAndUpdate(
        { _id: req.params.id },
        { isActive: !oldStatus }
      );

      res.json({
        success: true,
        message: `User ${oldStatus ? "Deactivated" : "Activated"}!`,
        user: target._doc,
      });
    } else if (req.user.id.role === "Moderator") {
      // Moderator can update only User
      if (tempTarget._doc.role === "User") {
        const target = await User.findOneAndUpdate(
          { _id: req.params.id },
          { isActive: !oldStatus }
        );

        res.json({
          success: true,
          message: `User ${oldStatus ? "Deactivated" : "Activated"}!`,
          user: target._doc,
        });
      } else {
        return next(new CustomError(`Unauthorized`, 403));
      }
    } else {
      return next(new CustomError(`Unauthorized`, 403));
    }
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  removeUser,
  updateUser,
  changeRole,
  toggleActiveStatus,
};
