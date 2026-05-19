
import { hashPassword, comparePassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import { httpError } from "../../utils/http-error";
import prisma from "../../config/prisma";

export const register = async (data: any) => {
  const exists = await prisma.user.findUnique({
    where: { username: data.username },
  });

  if (exists) {
    throw httpError(400, "Username already exists");
  }

  const hashed = await hashPassword(data.password);

  // default role: STUDENT
  const role = await prisma.role.findUnique({
    where: { name: "STUDENT" },
  });

  if (!role) throw httpError(500, "Default role not found");

  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashed,
      fullName: data.fullName,
      roleId: role.id,
    },
  });

  return user;
};

export const login = async (data: any) => {
    const user = await prisma.user.findUnique({
        where: { username: data.username },
        include: { role: true },
    });

    if (!user) throw httpError(401, "User not found");

    const valid = await comparePassword(data.password, user.password);
    if (!valid) throw httpError(401, "Invalid password");

    const token = signToken({
        id: user.id,
        role: user.role.name,
        group: user.groupId || null,
    });

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role.name,
        },
    };
};

export const getAllGroups = async () => {
  return prisma.group.findMany({});
};