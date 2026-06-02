import { Router } from "express";
import * as ctrl from "./map.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { wrapRouter } from "../../utils/wrap-router";
import { generalUpload } from "../../middleware/multer";

const router = Router();

router.post("/", authenticate, authorize("TEACHER"), generalUpload.single("document"), ctrl.createMap);
router.get("/", authenticate, ctrl.getMaps);
router.get("/:mapId", authenticate, ctrl.getMap);
router.get("/:mapId/submissions", authenticate, authorize("TEACHER"), ctrl.getMapSubmissions);

// Multiple group management
router.post("/:mapId/groups", authenticate, authorize("TEACHER"), ctrl.addGroupToMap);
router.delete("/:mapId/groups/:groupId", authenticate, authorize("TEACHER"), ctrl.removeGroupFromMap);

export default wrapRouter(router);