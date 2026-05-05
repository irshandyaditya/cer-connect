import Joi from "joi";

export const createCardsSchema = Joi.array().items(
  Joi.object({
    text: Joi.string().required(),
    column: Joi.string().valid("CLAIM", "EVIDENCE", "REASONING").required(),
  })
).min(1);

