import Joi from "joi";

export const createMapSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow("", null),
  document: Joi.any().optional(),
  timeoutAt: Joi.date().required(),
  // Accept either a single groupId OR an array groupIds
  groupId: Joi.string().optional(),
  groupIds: Joi.alternatives().try(
    Joi.array().items(Joi.string()).min(1),
    Joi.string()
  ).optional(),
}).or("groupId", "groupIds");