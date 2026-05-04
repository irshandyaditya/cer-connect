import type { Application } from "express";
import { API_PREFIX } from "./variables";
import authRoute from "../modules/auth/auth.route";


export default (app: Application) => {
    const base = API_PREFIX
        ? (API_PREFIX.startsWith('/') ? API_PREFIX : `/${API_PREFIX}`)
        : '';

    app.use(`${base}/auths`, authRoute);
};
