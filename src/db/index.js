import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const mongoURI = `${process.env.MONGODB_URI}/${DB_NAME}`;
const localMongoURI = "mongodb://localhost:27017/blogs";

const connectDB = async () => {
  try {
    console.log("mongoURI : ", mongoURI);
    const connectionInstance = await mongoose.connect(
      process.env.NODE_ENV == "dev" ? localMongoURI : mongoURI
    );
    console.log(
      `Connected to \nDB : ${DB_NAME}, DB HOST :`,
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Error while connecting to DB : ", error);
    process.exit(1);
  }
};

export default connectDB;
