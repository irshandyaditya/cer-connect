import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import * as ctrl from "./connection.controller";
import { wrapRouter } from "../../utils/wrap-router";

const router = Router();

router.post("/:mapId", authenticate, authorize("TEACHER"), ctrl.createConnections);

export default wrapRouter(router);