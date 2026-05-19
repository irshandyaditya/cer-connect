import prisma from "../../config/prisma";
import { saveDocument } from "./map.utils";

export const createMap = async (
  data: any,
  teacherId: string,
  file?: Express.Multer.File
) => {
  let documentUrl: string | undefined;

  if (file) {
    const uploaded = saveDocument(file);
    documentUrl = uploaded.url;
  }

  return prisma.map.create({
    data: {
      ...data,
      teacherId,
      documentUrl,
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

export const getAllMaps = async () => {
  return prisma.map.findMany({
    include: {
      createdBy: true,
    },
  });
};