import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import * as ctrl from "./card.controller";
import { wrapRouter } from "../../utils/wrap-router";

const router = Router();

router.post("/:mapId", authenticate, authorize("TEACHER"), ctrl.createCards);

export default wrapRouter(router);
