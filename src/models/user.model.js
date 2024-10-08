import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profession: { type: String, required: false },
    img: { type: String, default: "" }, // URL to profile image
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }], // References to Blog documents
    refreshToken: { type: String },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const user = this;
  return jwt.sign(
    { _id: user._id, username: user.username, password: user.password },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  const user = this;
  return jwt.sign(
    { _id: user._id, username: user.username, password: user.password },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
