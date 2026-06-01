import Joi from "joi";

export const submitSchema = Joi.object({
  mapId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      fromId: Joi.string().required(),
      toId: Joi.string().required(),
    })
  ).min(1).required(),
});