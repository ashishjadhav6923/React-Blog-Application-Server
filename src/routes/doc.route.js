import { Router } from "express";
import { introduceApi } from "../controllers/doc.controller.js";

const docRouter=Router();

docRouter.route("/v1").get(introduceApi)

export default docRouter;