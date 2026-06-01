import prisma from "../../config/prisma";
import { saveDocument, shuffleCardsPerColumn } from "./map.utils";

export const getMapById = async (mapId: string, role?: string) => {
  const map = await prisma.map.findUnique({
    where: { id: mapId },
    include: {
      group: true,
      createdBy: {
        include: { role: true, group: true },
      },
      cards: true,
      connections: {
        include: { from: true, to: true },
      },
      submissions: {
        include: {
          user: { include: { role: true, group: true } },
          answers: true,
        },
      },
    },
  });

  if (!map) return null;

  if (role === "STUDENT") {
    const [shuffled] = shuffleCardsPerColumn([map]);
    return shuffled;
  }

  return map;
};

export const createMap = async (
  data: any,
  teacherId: string,
  file?: Express.Multer.File
) => {
  const {
    document,
    ...payload
  } = data;

  let documentUrl: string | undefined;

  if (file) {
    const uploaded = saveDocument(file);
    documentUrl = uploaded.url;
  }

  return prisma.map.create({
    data: {
      ...payload,
      teacherId,
      documentUrl,
    },
  });
};

export const getMapsByGroup = async (groupId: string, role?: string) => {
  const maps = await prisma.map.findMany({
    where: { groupId },
    include: {
      group: true,

      createdBy: {
        include: {
          role: true,
          group: true,
        },
      },

      cards: true,

      connections: {
        include: {
          from: true,
          to: true,
        },
      },

      submissions: {
        include: {
          user: {
            include: {
              role: true,
              group: true,
            },
          },

          answers: true,
        },
      },
    },
  });

  if (role === "STUDENT") return shuffleCardsPerColumn(maps);
  return maps;
};

export const getSubmissionsByMap = async (mapId: string) => {
  return prisma.submission.findMany({
    where: { mapId },
    select: {
      id: true,
      score: true,
      submittedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          username: true,
          group: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
};

export const getAllMaps = async () => {
  return prisma.map.findMany({
    include: {
      group: true,

      createdBy: {
        include: {
          role: true,
          group: true,
        },
      },

      cards: true,

      connections: {
        include: {
          from: true,
          to: true,
        },
      },

      submissions: {
        include: {
          user: {
            include: {
              role: true,
              group: true,
            },
          },

          answers: true,
        },
      },
    },
  });
};