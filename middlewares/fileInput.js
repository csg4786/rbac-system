const multer = require("multer");
const CustomError = require("../utils/customError");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./assets/images");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}.${file.originalname.split('.')[1]}`);
  },
});

module.exports = {storage};
