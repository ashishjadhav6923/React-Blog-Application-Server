import User from "../models/user.model.js";

const generateRefreshAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error.message);
    // Throw the error to be handled in the calling function
    throw new Error("Error generating tokens");
  }
};

export default generateRefreshAccessToken;
