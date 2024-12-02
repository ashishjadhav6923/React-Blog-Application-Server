import { Router } from "express";
import { getAutherBlogsList, getAuthersList, getAuthersListByCategory, getBlogs, getBlogsListByCategory, getUserInfo, loginUser, loginUserWithJWT, logOutUser, rateBlog, rateUser, readBlog, registerUser, writeBlog } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter=Router();

userRouter.route("/register").post(upload.single('img'),registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/writeBlog").post(verifyJWT,writeBlog)
userRouter.route("/logout").post(verifyJWT,logOutUser)
userRouter.route("/loginWithJWT").post(verifyJWT,loginUserWithJWT)
userRouter.route("/rateUser").post(verifyJWT,rateUser);
userRouter.route("/rateBlog").post(verifyJWT,rateBlog);

userRouter.route("/readBlog/:blogId").get(readBlog)
userRouter.route("/getBlogs").get(getBlogs)
userRouter.route("/getBlogs/:category").get(getBlogsListByCategory)
userRouter.route("/userInfo/:username").get(getUserInfo)
userRouter.route("/authors").get(getAuthersList)
userRouter.route("/authors/:category").get(getAuthersListByCategory)
userRouter.route("/blogs/:username").get(getAutherBlogsList)


export default userRouter;