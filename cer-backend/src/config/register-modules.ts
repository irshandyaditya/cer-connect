import type { Application } from "express";
import { API_PREFIX } from "./variables";
import authRoute from "../modules/auth/auth.route";
import mapRoute from "../modules/map/map.route";
import cardRoute from "../modules/card/card.route";
import connectionRoute from "../modules/connection/connection.route";
import submissionRoute from "../modules/submission/submission.route";


export default (app: Application) => {
    const base = API_PREFIX
        ? (API_PREFIX.startsWith('/') ? API_PREFIX : `/${API_PREFIX}`)
        : '';

    app.use(`${base}/auths`, authRoute);
    app.use(`${base}/cards`, cardRoute);
    app.use(`${base}/connections`, connectionRoute);
    app.use(`${base}/maps`, mapRoute);
    app.use(`${base}/submissions`, submissionRoute);
};
