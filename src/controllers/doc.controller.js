import { asyncHandler } from "../utils/asyncHandler.js";

const introduceApi = asyncHandler((req, res) => {
  res.send({ message: "Hi, this is docs v1" });
});

export { introduceApi };
