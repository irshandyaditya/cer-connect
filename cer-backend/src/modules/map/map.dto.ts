import Joi from "joi";

export const createMapSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow("", null),
  timeoutAt: Joi.date().required(),
  groupId: Joi.string().required(),
});