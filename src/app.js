import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.options(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.static("dist"));
app.use(express.static("public"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb " }));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import docRouter from "./routes/doc.route.js";

app.use("/api/user", userRouter);
app.use("/api/docs", docRouter);
export default app;
