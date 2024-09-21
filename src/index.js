import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import connectDB from "./db/index.js";
import app from "./app.js";
connectDB();

import { asyncHandler } from "./utils/asyncHandler.js";

app.get(
  "/api",
  asyncHandler((req, res) => {
    res.send({ message: "this is api" });
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
