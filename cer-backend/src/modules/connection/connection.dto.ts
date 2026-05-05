import Joi from "joi";

export const createConnectionsSchema = Joi.array().items(
  Joi.object({
    fromId: Joi.string().required(),
    toId: Joi.string().required(),
  })
).min(1);