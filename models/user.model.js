import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profession: { type: String, required: false },
  img: { type: String, default: "" }, // URL to profile image
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }], // References to Blog documents
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model("User", userSchema);

export default User;
