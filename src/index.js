import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import connectDB from "./db/index.js";
import app from "./app.js";
connectDB();

// Import new schemas
import User from "./models/user.model.js"; // User schema
import Blog from "./models/blog.model.js"; // Blog schema
import { asyncHandler } from "./utils/asyncHandler.js";

app.get(
  "/api",
  asyncHandler((req, res) => {
    res.send({ message: "this is api" });
  })
);

app.post(
  "/api/register",
  asyncHandler(async (req, res) => {
    const { username, password, name, profession, email } = req.body;
    // Check if the user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).send({ message: "User already exists" });
    }
    // Create a new user in the User collection
    const newUser = new User({ username, password, name, profession, email });
    await newUser.save();
    res.status(201).send({ message: "User registered successfully" });
    console.log("User registered successfully", username, password);
  })
);

// Login route
app.post(
  "/api/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(400).send({ message: "Invalid username or password" });
    }
    res.send("message: Login successful");
    console.log("Login successful: " + username);
  })
);

// Write blog route
app.post(
  "/api/writeBlogs",
  asyncHandler(async (req, res) => {
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
    res.status(201).send({ message: "Blog post created successfully" });
  })
);

// Read single blog route
app.get(
  "/api/readBlogs/:blogId",
  asyncHandler(async (req, res) => {
    const blogId = req.params.blogId;
    const blog = await Blog.findOne({ id: blogId }).populate("author", "name");
    if (!blog) {
      return res.status(404).send({ message: "Invalid blog id" });
    }
    res.status(200).send({ blog });
  })
);

// Read all blogs route (limited to 10)
app.get(
  "/api/readBlogs",
  asyncHandler(async (req, res) => {
    // Retrieve blogs with a limit of 10 documents
    const blogs = await Blog.find().populate("author", "name").limit(10);
    // Send the blogs as a response
    res.status(200).send({ blogs });
  })
);

// Get user info by username
app.get(
  "/api/userInfo/:username",
  asyncHandler(async (req, res) => {
    const username = req.params.username;
    const userInfo = await User.findOne({ username }).populate("blogs");
    if (!userInfo) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ userInfo });
  })
);

// Get authors (limited to 10)
app.get(
  "/api/authors",
  asyncHandler(async (req, res) => {
    // Fetch 10 users from User collection
    const authors = await User.find({})
      .limit(10) // Limit to 10 records
      .exec();
    if (!authors.length) {
      return res.status(404).send({ message: "No authors found" });
    }
    res.status(200).send({ authors });
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
