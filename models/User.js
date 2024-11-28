const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "/assets/images/avatar.png",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
    },
    gender: {
      type: String,
      enum: ["M", "F", "O"],
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Moderator", "User"],
      default: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.checkPassword = async function (passWord) {
  return await bcrypt.compare(passWord, this.password);
};


module.exports = mongoose.model("User", userSchema);
