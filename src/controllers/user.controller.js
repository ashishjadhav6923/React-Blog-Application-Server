import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { fileUpload } from "../utils/cloudinaryFileUpload.js";
import generateRefreshAccessToken from "../utils/generateJWTtokens.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV !== "dev";
const options = {
  httpOnly: true,
  secure: isProduction, // true in production (HTTPS), false in development (HTTP)
  sameSite: isProduction ? "None" : "Lax", // 'None' for cross-site requests in production, 'Lax' in development
  path: "/", // Ensure the cookie is available site-wide
};
const registerUser = asyncHandler(async (req, res) => {
  const { username, password, name, profession, email } = req.body;
  if (!username || !password || !email || !name) {
    return res.status(400).json({
      success: false,
      message: "All fields are required: username, password, name, and email.",
    });
  }
  // Check if the user already exists
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    return res.status(409).json({
      success: false,
      message: "User with Username or Email already exists",
    });
  }
  let cloudnaryResponse = "";
  if (req.file) {
    const fileName = path.basename(
      req.file.originalname,
      path.extname(req.file.originalname)
    );
    const uniqueFileName = `${fileName}-${Date.now()}`;
    console.log("file", req.file);
    // Call the Cloudinary upload function
    cloudnaryResponse = await fileUpload(req.file.buffer, uniqueFileName);
    console.log("cloudnaryResponse : ", cloudnaryResponse);
  }
  const newUser = await User.create({
    username,
    password,
    name,
    profession,
    email,
    img: req.file ? cloudnaryResponse.secure_url : "",
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering, Please try again",
    });
  }
  console.log("User registered successfully:", createdUser.username);
  return res
    .status(201)
    .send({ success: true, message: "User registered successfully" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    res.status(400).json({ success: false, message: "Username is required" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send({ success: false, message: "User not found" });
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    return res
      .status(401)
      .send({ success: false, message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = await generateRefreshAccessToken(
    user._id
  );

  user.password = "";
  user.refreshToken = "";

  console.log("Login successful: " + username);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      user: user,
      accessToken,
      refreshToken,
      success: true,
      message: "Login successful",
    });
});

const loginUserWithJWT = asyncHandler(async (req, res) => {
  const username = req.user.username;

  const userDB = await User.findOne({ username });
  if (!userDB) {
    return res.status(404).send({ success: false, message: "User not found" });
  }

  console.log("Login with JWT successful: " + username);
  userDB.password = "";
  userDB.refreshToken = "";
  return res.status(200).json({
    user: userDB,
    success: true,
    message: "Login with JWT successful",
  });
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ success: true, message: "User Logged Out Successfully" });
});

const writeBlog = asyncHandler(async (req, res) => {
  console.log("Writing Blog of", req.user.username);
  const username = req.user.username;
  const { title, content, additionalInfo, id, category } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  const newPost = new Blog({
    id,
    title,
    author: user._id,
    username,
    content,
    additionalInfo,
    category,
  });
  const saveResponse = await newPost.save();
  // Update the user's blog list with the new blog's ObjectId
  if (!saveResponse) {
    return res.status().json({
      success: false,
      message: "Something went wrong while saving blog",
    });
  }
  const userUpdate = await User.findOneAndUpdate(
    { username: username },
    { $push: { blogs: newPost._id } }, // Push the new blog's ObjectId
    { new: true } // Return the updated document
  );
  if (!userUpdate) {
    // If the user is not found, return an error
    return res.status(404).send({ message: "User not found" });
  }
  return res.status(201).send({ message: "Blog post created successfully" });
});

const readBlog = asyncHandler(async (req, res) => {
  const blogId = req.params.blogId;
  const blog = await Blog.findOne({ id: blogId }).populate("author", "name");
  if (!blog) {
    return res.status(404).send({ message: "Invalid blog id" });
  }
  return res.status(200).send({ blog });
});

const getBlogs = asyncHandler(async (req, res) => {
  // Retrieve blogs with a limit of 10 documents
  const blogs = await Blog.find().populate("author", "name").limit(10);
  // Send the blogs as a response
  return res.status(200).send({ blogs });
});

const getUserInfo = asyncHandler(async (req, res) => {
  const username = req.params.username;
  const userInfo = await User.findOne({
    $or: [{ username }],
  })
    .populate("blogs")
    .select("-password -refreshToken");
  if (!userInfo) {
    return res.status(404).send({ message: "User not found" });
  }
  return res.status(200).send({ userInfo });
});

const getAuthersList = asyncHandler(async (req, res) => {
  // Fetch 10 users from User collection
  const authors = await User.find({})
    .select("name username profession img blogs")
    .limit(10) // Limit to 10 records
    .exec();
  if (!authors.length) {
    return res.status(404).send({ message: "No authors found" });
  }
  return res.status(200).send({ authors });
});

export {
  registerUser,
  loginUser,
  writeBlog,
  readBlog,
  getBlogs,
  getUserInfo,
  getAuthersList,
  logOutUser,
  loginUserWithJWT,
};
