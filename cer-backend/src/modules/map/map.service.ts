import prisma from "../../config/prisma";
import { saveDocument } from "./map.utils";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleCardsPerColumn(maps: any[]): any[] {
  return maps.map((map) => {
    if (!map.cards || map.cards.length === 0) return map;

    const columns = ["CLAIM", "EVIDENCE", "REASONING"] as const;
    const shuffled: typeof map.cards = [];

    for (const col of columns) {
      const colCards = map.cards.filter((c: any) => c.column === col);
      shuffled.push(...shuffleArray(colCards));
    }

    return { ...map, cards: shuffled, connections: [] };
  });
}

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