import { Response } from "express";
import * as R from "../../utils/response";
import * as MapService from "./map.service";
import { createMapSchema } from "./map.dto";
import { AuthRequest } from "../../middleware/auth";

export const createMap = async (req: AuthRequest, res: Response) => {
  const { error, value } = createMapSchema.validate(req.body);
  if (error) return R.badRequest(res, error.details?.[0]?.message);

  const data = await MapService.createMap(value, req.user!.id);
  return R.created(res, "Map created", data);
};

export const getMaps = async (req: AuthRequest, res: Response) => {
    console.log("hh")
    const maps = await MapService.getMapsByGroup(req.user!.groupId!);
    console.log("hh2")
    return R.ok(res, "Maps fetched", maps);
};