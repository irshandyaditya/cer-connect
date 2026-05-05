import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import * as ctrl from "./submission.controller";
import { wrapRouter } from "../../utils/wrap-router";

const router = Router();

router.post("/", authenticate, authorize("STUDENT"), ctrl.submit);

export default wrapRouter(router);