import { Request, Response, NextFunction } from "express";
import jwt, { sign } from "jsonwebtoken";
import * as R from "../utils/response";
import { SECRET } from "../config/variables";
import { User } from "@prisma/client";
import { JWT_EXPIRES_IN } from "../config/variables";
import { parseDurationToSeconds } from "../utils/parse-duration";
import prisma from "../config/prisma";

export interface AuthRequest extends Request {
  user?: Omit<User, "password"> & {
    roleId: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  if (!header) return R.unauthorized(res, "Missing auth header");

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return R.unauthorized(res, "Invalid authorization format");
  }

  try {
    const payload = jwt.verify(token, SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });

    if (!user) return R.unauthorized(res, "User not found");

    const { password, role, ...rest } = user;

    req.user = {
      ...rest,
      roleId: role.id,
      role: role.name,
    };

    next();
  } catch {
    return R.unauthorized(res, "Invalid or expired token");
  }
};

export const authorize =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return R.unauthorized(res);

    if (!allowedRoles.includes(req.user.role)) {
      return R.forbidden(res, "Forbidden Role");
    }

    next();
  };

// export const authorizePermission =
//   (permission: RoleAccessName) =>
//   async (req: AuthRequest, res: Response, next: NextFunction) => {
//     if (!req.user) return R.unauthorized(res);

//     const has = await prisma.rolePermission.findFirst({
//       where: {
//         roleId: req.user.roleId,
//         permission: { name: permission },
//         isActive: true,
//       },
//     });

//     if (!has) {
//       return R.forbidden(res, "Forbidden: Missing permission");
//     }

//     next();
//   };

export const generateToken = (userId: string) => {
  const expires = parseDurationToSeconds(JWT_EXPIRES_IN);

  return sign({}, SECRET, {
    subject: userId,
    expiresIn: expires,
  });
};