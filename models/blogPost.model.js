import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    profile: { type: String, required: true },
    content: { type: String, required: true },
    additionalInfo: { type: String },
  },
  { timestamps: true, collection: "posts" }
);

export const Post = mongoose.model("posts", postSchema);
