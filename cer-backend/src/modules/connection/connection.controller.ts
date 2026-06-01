import { createConnectionsSchema } from "./connection.dto";
import * as service from "./connection.service";
import { Response } from "express";
import * as R from "../../utils/response";
import { AuthRequest } from "../../middleware/auth";

export const createConnections = async (req: AuthRequest, res: Response) => {
  const { error, value } = createConnectionsSchema.validate(req.body);

  if (error) {
    return R.badRequest(res, error.details?.[0]?.message);
  }

  const mapId = req.params.mapId;

  const result = await service.createConnections(String(mapId), value);

  return R.created(res, "Connections created", result);
};