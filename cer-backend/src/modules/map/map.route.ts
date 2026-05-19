import { Router } from "express";
import * as ctrl from "./map.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { wrapRouter } from "../../utils/wrap-router";
import { generalUpload } from "../../middleware/multer";

const router = Router();

router.post("/", authenticate, authorize("TEACHER"), generalUpload.single("file"), ctrl.createMap);
router.get("/", authenticate, ctrl.getMaps);

export default wrapRouter(router);