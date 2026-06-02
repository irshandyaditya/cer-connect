import prisma from "../../config/prisma";
import { uploadDocument, shuffleCardsPerColumn } from "./map.utils";

const mapInclude = {
  mapGroups: {
    include: { group: true },
  },
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
} as const;

/** Normalise map: expose groups[] array alongside legacy mapGroups */
function normaliseMap(map: any) {
  if (!map) return null;
  return {
    ...map,
    groups: map.mapGroups?.map((mg: any) => mg.group) ?? [],
  };
}

export const getMapById = async (mapId: string, role?: string) => {
  const map = await prisma.map.findUnique({
    where: { id: mapId },
    include: mapInclude,
  });

  if (!map) return null;

  const normalised = normaliseMap(map);

  if (role === "STUDENT") {
    const [shuffled] = shuffleCardsPerColumn([normalised]);
    return shuffled;
  }

  return normalised;
};

export const createMap = async (
  data: any,
  teacherId: string,
  file?: Express.Multer.File
) => {
  const { document, groupIds, groupId, ...payload } = data;

  // Support both groupId (single, legacy) and groupIds (array, new)
  const resolvedGroupIds: string[] = groupIds
    ? Array.isArray(groupIds)
      ? groupIds
      : [groupIds]
    : groupId
    ? [groupId]
    : [];

  if (resolvedGroupIds.length === 0) {
    throw new Error("At least one group must be specified");
  }

  let documentUrl: string | undefined;

  if (file) {
    const uploaded = await uploadDocument(file);
    documentUrl = uploaded.url;
  }

  const map = await prisma.map.create({
    data: {
      ...payload,
      teacherId,
      documentUrl,
      mapGroups: {
        create: resolvedGroupIds.map((gId: string) => ({ groupId: gId })),
      },
    },
    include: mapInclude,
  });

  return normaliseMap(map);
};

export const getMapsByGroup = async (groupId: string, role?: string) => {
  const maps = await prisma.map.findMany({
    where: {
      mapGroups: { some: { groupId } },
    },
    include: mapInclude,
  });

  const normalised = maps.map(normaliseMap);

  if (role === "STUDENT") return shuffleCardsPerColumn(normalised);
  return normalised;
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
  const maps = await prisma.map.findMany({ include: mapInclude });
  return maps.map(normaliseMap);
};

export const addGroupToMap = async (mapId: string, groupId: string) => {
  return prisma.mapGroup.create({
    data: { mapId, groupId },
  });
};

export const removeGroupFromMap = async (mapId: string, groupId: string) => {
  return prisma.mapGroup.delete({
    where: { mapId_groupId: { mapId, groupId } },
  });
};