import { Response } from "express";
import * as R from "../../utils/response";
import * as MapService from "./map.service";
import { createMapSchema } from "./map.dto";
import { AuthRequest } from "../../middleware/auth";

export const getMap = async (req: AuthRequest, res: Response) => {
  if (!req.user) return R.unauthorized(res, "User not logged in");

  const { mapId } = req.params;
  const map = await MapService.getMapById(String(mapId), req.user.role) as any;

  if (!map) return R.notFound(res, "Map tidak ditemukan");

  // Untuk student: filter submissions hanya milik user ini
  if (req.user.role === "STUDENT" && map.submissions) {
    map.submissions = map.submissions.filter((s: any) => s.userId === req.user!.id);
  }

  return R.ok(res, "Map fetched", map);
};

export const createMap = async (req: AuthRequest, res: Response) => {
  // groupIds may come as JSON string from multipart form
  if (req.body.groupIds && typeof req.body.groupIds === "string") {
    try {
      req.body.groupIds = JSON.parse(req.body.groupIds);
    } catch {
      // leave as-is; Joi will validate
    }
  }

  const { error, value } = createMapSchema.validate(req.body);

  if (error) {
    return R.badRequest(res, error.details?.[0]?.message);
  }

  if (req.file) {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return R.badRequest(
        res,
        "Only PDF, DOC, DOCX, PPT, and PPTX files are allowed"
      );
    }
  }

  if (!req.file) {
    return R.badRequest(res, "File not found");
  }

  const data = await MapService.createMap(
    value,
    req.user!.id,
    req.file
  );

  return R.created(res, "Map created", data);
};

export const getMaps = async (req: AuthRequest, res: Response) => {
  if (!req.user) return R.unauthorized(res, "User not logged in");

  if (req.user.role == "TEACHER") return R.ok(res, "Maps fetched", await MapService.getAllMaps());

  const maps = await MapService.getMapsByGroup(req.user!.groupId!, req.user.role);

  // Untuk student: sembunyikan map yang belum ada cards (belum dikerjakan guru)
  const filtered = maps.filter((m: any) => m.cards && m.cards.length > 0);

  return R.ok(res, "Maps fetched", filtered);
};

export const getMapSubmissions = async (req: AuthRequest, res: Response) => {
  if (!req.user) return R.unauthorized(res, "User not logged in");
  if (req.user.role !== "TEACHER") return R.forbidden(res, "Hanya guru yang dapat mengakses data ini");
 
  const { mapId } = req.params;
  const submissions = await MapService.getSubmissionsByMap(String(mapId));
 
  return R.ok(res, "Submissions fetched", submissions);
};

export const addGroupToMap = async (req: AuthRequest, res: Response) => {
  if (!req.user) return R.unauthorized(res, "User not logged in");
  if (req.user.role !== "TEACHER") return R.forbidden(res, "Hanya guru yang dapat mengakses data ini");

  const { mapId } = req.params;
  const { groupId } = req.body;

  if (!groupId) return R.badRequest(res, "groupId is required");

  try {
    const result = await MapService.addGroupToMap(String(mapId), String(groupId));
    return R.created(res, "Group added to map", result);
  } catch (err: any) {
    if (err.code === "P2002") return R.badRequest(res, "Group sudah terdaftar di map ini");
    throw err;
  }
};

export const removeGroupFromMap = async (req: AuthRequest, res: Response) => {
  if (!req.user) return R.unauthorized(res, "User not logged in");
  if (req.user.role !== "TEACHER") return R.forbidden(res, "Hanya guru yang dapat mengakses data ini");

  const { mapId, groupId } = req.params;

  try {
    await MapService.removeGroupFromMap(String(mapId), String(groupId));
    return R.ok(res, "Group removed from map", null);
  } catch (err: any) {
    if (err.code === "P2025") return R.notFound(res, "Group tidak ditemukan di map ini");
    throw err;
  }
};