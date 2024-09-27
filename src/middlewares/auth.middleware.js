import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized request" });
  }
  const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid Access Token" });
  }
  req.user = user;
  next();
});

export default verifyJWT;
