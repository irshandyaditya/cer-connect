import { Router } from "express";
import * as AuthCtrl from "./auth.controller";
import { wrapRouter } from "../../utils/wrap-router";

const router = Router();

// router.post("/register", AuthCtrl.register);
router.post("/login", AuthCtrl.login);
router.get("/groups", AuthCtrl.getAllGroups);

export default wrapRouter(router);
