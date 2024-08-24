import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const mongoURI = `${process.env.MONGODB_URI}/${DB_NAME}`;

const connectDB = async () => {
  try {
    console.log(mongoURI);
    const connectionInstance = await mongoose.connect(mongoURI);
    console.log(
      `Connected to DB:${DB_NAME}, DB HOST:`,
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Error while connecting to DB : ", error);
    process.exit(1);
  }
};

export default connectDB;