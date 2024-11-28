const { generateToken } = require("../config/jwtToken");
const crypto = require("crypto");
const User = require("../models/User");
const CustomError = require("../utils/customError");
const bcrypt = require("bcrypt");

// const registerUser = async (req, res, next) => {

//   try {

//     const {body} = req;

//     const {name, email, password, mobile, designation, gender, course} = body;

//     // console.log({name, email, password, mobile, designation, gender, course, filename});

//     const oldUser = await Auth.findOne({ email });

//     if (oldUser) {
//       return next(new CustomError(`User already exists`, 400));
//     } else {

//       const newUser = await Auth.create({email, password});
//       delete newUser._doc.password;
//       delete newUser._doc._id;

//       const newUserDetails = await User.create({name, email, mobile, designation, gender, course});

//       res.json({
//         success: true,
//         message: "New user added!",
//         ...newUser._doc,
//         ...newUserDetails._doc,
//       });
//     }

//   } catch (err) {
//     return next(new CustomError(`Error: ${err}`, 500));
//   }
// };

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });

    if (user && (await user.checkPassword(password))) {
      // Remove the password from the response object
      delete user._doc.password;

      // Generate a token
      const token = generateToken(user._doc);

      // Set the token in a secure, HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // Send response
      res.json({
        success: true,
        message: "Login Successful!",
        user: user._doc, // Send the user object
      });
    } else {
      return next(new CustomError("Invalid Credentials", 403));
    }
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

const logoutUser = async (req, res, next) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "Logout Successful!",
    });
  } catch (err) {
    return next(new CustomError(`Error: ${err}`, 500));
  }
};

module.exports = { loginUser, logoutUser };
