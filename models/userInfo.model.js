import mongoose from "mongoose";

const usersInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profession: { type: String, required: true },
    img: { type: String }, // Store the URL or path to the image
    blogs: [{ type: String }], // Array of blog IDs
  },
  { timestamps: true, collection: "usersInfo" }
);

export const UsersInfo = mongoose.model("UsersInfo", usersInfoSchema);
