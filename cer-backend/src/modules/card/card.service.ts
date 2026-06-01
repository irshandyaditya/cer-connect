import prisma from "../../config/prisma";
import { httpError } from "../../utils/http-error";

export const createCards = async (mapId: string, cards: any[]) => {
  return Promise.all(
    cards.map((c) =>
      prisma.card.create({
        data: {
          ...c,
          mapId,
        },
      })
    )
  );
};