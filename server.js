import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const mongoURI = "mongodb://localhost:27017/blogs";

mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { collection: "usersData" }
);
const usersInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profession: { type: String, required: true },
    img: { type: String }, // Store the URL or path to the image
    blogs: [{ type: String }], // Array of blog IDs
  },
  { collection: "usersInfo" }
);
const postSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    profile: { type: String, required: true },
    content: { type: String, required: true },
    additionalInfo: { type: String },
  },
  { collection: "posts" }
);
const User = mongoose.model("usersData", userSchema);
const Post = mongoose.model("posts", postSchema);
const UsersInfo = mongoose.model("UsersInfo", usersInfoSchema);
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/api", (req, res) => {
  res.send({ message: "this is api" });
});

app.post("/api/register", async (req, res) => {
  const { username, password, name, profession } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).send({ message: "User already exists" });
    }

    // Create a new user in the User collection
    const newUser = new User({ username, password });
    await newUser.save();

    // Create a new user info in the usersInfo collection
    const newUserInfo = new UsersInfo({
      name,
      username,
      profession,
      img: "", // Initialize img as an empty string (can be updated later)
      blogs: [], // Initialize blogs as an empty array (can be updated later)
    });
    await newUserInfo.save();

    res.status(201).send({ message: "User registered successfully" });
    console.log("User registered successfully", username, password);
  } catch (error) {
    res.status(500).send({
      message: "An error occurred during registration",
      error,
    });
    console.error("Registration error:", error);
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(400).send({ message: "Invalid username or password" });
    }
    res.send({ message: "Login successful" });
    console.log("Login successful: " + username);
  } catch (error) {
    res.status(500).send({ message: "An error occurred during login", error });
  }
});

app.post("/api/writeBlogs", async (req, res) => {
  console.log("Writing Blog of " + req.body.profile);
  const { title, author, profile, content, additionalInfo, id } = req.body;
  try {
    const newPost = new Post({
      id,
      title,
      author,
      profile,
      content,
      additionalInfo,
    });

    await newPost.save();
    const userUpdate = await UsersInfo.findOneAndUpdate(
      { username: profile }, // or any unique field for the user
      { $push: { blogs: id } }, // Push the new blog ID to the blogs array
      { new: true } // Return the updated document
    );

    if (!userUpdate) {
      // If the user is not found, return an error
      return res.status(404).send({ message: "User not found" });
    }
    res.status(201).send({ message: "Blog post created successfully" });
  } catch (error) {
    // Handle any errors
    res.status(500).send({
      message: "An error occurred while creating the blog post",
      error,
    });
  }
});

app.get("/api/readBlogs/:blogId", async (req, res) => {
  const blogId = req.params.blogId;
  try {
    const blog = await Post.findOne({ id: blogId });
    if (!blog) {
      return res.status(404).send({ message: "Invalid blog id" });
    }
    res.status(200).send({ blog });
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while reading the blog",
      error,
    });
  }
});

app.get("/api/readBlogs", async (req, res) => {
  try {
    // Retrieve blogs with a limit of 10 documents
    const blogs = await Post.find().limit(10);

    // Send the blogs as a response
    res.status(200).send({ blogs });
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while fetching the blogs",
      error,
    });
  }
});

app.get("/api/userInfo/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const userInfo = await UsersInfo.findOne({ username: username });
    if (!userInfo) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ userInfo });
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while fetching the user information",
      error,
    });
  }
});

app.get("/api/authors", async (req, res) => {
  try {
    // Fetch 10 users from UsersInfo collection
    const authors = await UsersInfo.find({})
      .limit(10) // Limit to 10 records
      .exec();

    if (!authors.length) {
      return res.status(404).send({ message: "No authors found" });
    }

    res.status(200).send({ authors });
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while fetching authors",
      error,
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
