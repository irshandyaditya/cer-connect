import { Router } from "express";
import * as ctrl from "./map.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { wrapRouter } from "../../utils/wrap-router";

const router = Router();

router.post("/", authenticate, authorize("TEACHER"), ctrl.createMap);
router.get("/", authenticate, ctrl.getMaps);

export default wrapRouter(router);