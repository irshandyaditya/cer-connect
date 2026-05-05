import prisma from "../../config/prisma";
import { httpError } from "../../utils/http-error";

export const createCards = async (mapId: string, cards: any[]) => {
  return prisma.card.createMany({
    data: cards.map(c => ({
      ...c,
      mapId,
    })),
  });
};