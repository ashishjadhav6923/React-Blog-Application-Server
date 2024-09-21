import { Router } from "express";
import { getAuthersList, getBlogs, getUserInfo, loginUser, readBlog, registerUser, writeBlog } from "../controllers/user.controller.js";

const userRouter=Router();

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/writeBlog").post(writeBlog)

userRouter.route("/readBlog/:blogId").get(readBlog)
userRouter.route("/getBlogs").get(getBlogs)
userRouter.route("/userInfo/:username").get(getUserInfo)
userRouter.route("/authors").get(getAuthersList)


export default userRouter;