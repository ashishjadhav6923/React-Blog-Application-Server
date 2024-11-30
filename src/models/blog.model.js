import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Custom ID field
  title: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User document
  username: { type: String, required: true }, // Short description or profile snippet of the author
  ratings: [
    {
      raterID: { type: mongoose.Schema.Types.ObjectId },
      message: { type: String },
      rating: { type: Number },
    },
  ],
  averageRating: { type: Number, default: 0 },
  content: { type: String, required: true },
  additionalInfo: { type: String, required: false },
  category: { type: String, required: true }, // Category of the blog
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

blogSchema.pre('save',function(next){
  const blog=this;
  if(!blog.isModified('ratings')) return next();

  const sum=blog.ratings.reduce((acc,obj)=>{
    return acc+obj.rating;
  },0)

  blog.averageRating=blog.ratings.length ? sum/blog.ratings.length : 0;

  next();
})

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
