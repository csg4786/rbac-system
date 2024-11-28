const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const hostname = "127.0.0.1";
const port = process.env.PORT || 5000;
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const { errorHandler } = require("./middlewares/errorHandler");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");

dbConnect();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

app.use(
  "/assets/images",
  express.static(path.join(__dirname, "assets/images"))
);

app.use("/api/auth", authRouter);

app.use("/api/user", userRouter);

// Catch 404 errors - If no route matches, it will be caught by this middleware
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.statusCode = 404;
  next(error); // Pass the error to the error handling middleware
});

// Error handling middleware (handles 404 and other errors)
app.use(errorHandler);

app.listen(port, hostname, () => {
  console.log(`Sever Listening at https://${hostname}:${port}`);
});
