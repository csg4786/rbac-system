const mongoose = require("mongoose");
const CustomError = require("../utils/customError");

const dbConnect = () => {
  mongoose.set("strictQuery", true);

  const dbName = "assignment";
  const dbUrl = process.env.MONGODB_URL1 + dbName + process.env.MONGODB_URL2
  // const dbUrl =
  //   process.env.NODE_ENV && process.env.NODE_ENV == "production"
  //     ? process.env.MONGODB_URL1 + dbName + process.env.MONGODB_URL2
  //     : process.env.MONGODB_URL + dbName;
  try {
    const conn = mongoose.connect(dbUrl);
    console.log("Database Connected!");
  } catch (error) {
    return next(new CustomError('Database Connection Error', 500));
  }
};

module.exports = dbConnect;
