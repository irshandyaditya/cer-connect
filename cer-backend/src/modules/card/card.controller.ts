import { Request, Response } from "express";
import * as R from "../../utils/response";
import * as CardService from "./card.service";
import { createCardsSchema } from "./card.dto";
import { AuthRequest } from "../../middleware/auth";

export const createCards = async (req: AuthRequest, res: Response) => {
  const { error, value } = createCardsSchema.validate(req.body);

  if (error) {
    return R.badRequest(res, error.details?.[0]?.message);
  }

  const mapId = req.params.mapId;

  const result = await CardService.createCards(String(mapId), value);

  return R.created(res, "Cards created", result);
};