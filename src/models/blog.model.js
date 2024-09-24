import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Custom ID field
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User document
  username: { type: String, required: true }, // Short description or profile snippet of the author
  content: { type: String, required: true },
  additionalInfo: { type: String, required: false },
  category: { type: String, required: true }, // Category of the blog
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
