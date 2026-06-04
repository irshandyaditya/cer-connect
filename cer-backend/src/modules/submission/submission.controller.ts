import { Response } from "express";
import * as R from "../../utils/response";
import * as Service from "./submission.service";
import { AuthRequest } from "../../middleware/auth";
import { submitSchema } from "./submission.dto";

export const submit = async (req: AuthRequest, res: Response) => {
  const { error, value } = submitSchema.validate(req.body);
  if (error) return R.badRequest(res, error.details?.[0]?.message);

  const uid = (req as any).user!.id;

  const submission = await Service.submitAnswer(
    uid,
    value.mapId,
    value.answers
  );

  const { score, correctAnswers } = await Service.calculateScore(
    submission.id,
    value.mapId
  );

  return R.ok(res, "Submitted", { submissionId: submission.id, score, correctAnswers });
};
export const myResult = async (req: AuthRequest, res: Response) => {
  const uid = (req as any).user!.id;
  const { mapId } = req.params;
  const result = await Service.getMyResult(uid, String(mapId));
  if (!result) return R.notFound(res, "Belum ada submission untuk map ini.");
  return R.ok(res, "OK", result);
};