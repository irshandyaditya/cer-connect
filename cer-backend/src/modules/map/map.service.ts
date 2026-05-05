import prisma from "../../config/prisma";

export const createMap = async (data: any, teacherId: string) => {
  return prisma.map.create({
    data: {
      ...data,
      teacherId,
    },
  });
};

export const getMapsByGroup = async (groupId: string) => {
  return prisma.map.findMany({
    where: { groupId },
    include: {
      createdBy: true,
    },
  });
};