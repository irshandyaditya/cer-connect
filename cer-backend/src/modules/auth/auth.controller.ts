import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import * as R from "../../utils/response";
import { registerSchema, loginSchema } from "./auth.dto";

// export const register = async (req: Request, res: Response) => {
//     const { error, value } = registerSchema.validate(req.body);
//     if (error) {
//         const message = error.details?.[0]?.message || "Validation error";
//         return R.badRequest(res, message);
//         }

//     try {
//         const user = await AuthService.register(value);
//         return R.created(res, "User registered", user);
//     } catch (err: any) {
//         return R.badRequest(res, err.message);
//     }
// };

export const login = async (req: Request, res: Response) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        const message = error.details?.[0]?.message || "Validation error";
        return R.badRequest(res, message);
    }

    try {
        const data = await AuthService.login(value);
        return R.ok(res, "Login success", data);
    } catch (err: any) {
        return R.unauthorized(res, err.message);
    }
};

export const getAllGroups = async (req: Request, res: Response) => {
    try {
        const data = await AuthService.getAllGroups();
        return R.ok(res, "Groups fetched", data);
    } catch (err: any) {
        return R.badRequest(res, err.message);
    }
};