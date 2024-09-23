import Blog from "../models/blog.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
    if (req.file) {
      const filePath = path.join(__dirname, "../..", req.file.path); // Adjust path as needed
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
    return res.status(409).json({
      success: false,
      message: "User with Username or Email already exists",
    });
  }
  const newUser = await User.create({
    username,
    password,
    name,
    profession,
    email,
    img:req.file ? `/img/${req.file.filename}` : "",
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
  console.log(
    "User registered success:",
    createdUser.username,
  );
  console.log("file",req.file);
  return res
    .status(201)
    .send({ success: true, message: "User registered successfully" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ $or: [{ username }, { email: username }] });
  if (!user) {
    return res.status(404).send({ success: false, message: "User not found" });
  }
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    return res
      .status(401)
      .send({ success: false, message: "Invalid credentials" });
  }
  return res.status(200).json({ success: true, message: "Login successful" });
  console.log("Login successful: " + username);
});

const writeBlog = asyncHandler(async (req, res) => {
  console.log("Writing Blog of", req.body.profile);
  const { title, profile, content, additionalInfo, id, category } = req.body;
  const user = await User.findOne({ username: profile });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  const newPost = new Blog({
    id,
    title,
    author: user._id,
    profile,
    content,
    additionalInfo,
    category,
  });
  await newPost.save();
  // Update the user's blog list with the new blog's ObjectId
  const userUpdate = await User.findOneAndUpdate(
    { username: profile },
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
    $or: [{ username }, { email: username }],
  }).populate("blogs");
  if (!userInfo) {
    return res.status(404).send({ message: "User not found" });
  }
  return res.status(200).send({ userInfo });
});

const getAuthersList = asyncHandler(async (req, res) => {
  // Fetch 10 users from User collection
  const authors = await User.find({})
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
};