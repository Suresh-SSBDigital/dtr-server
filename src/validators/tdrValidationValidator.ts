import Joi from 'joi';

export const validateSourceDataSchema = Joi.object({
  application_id: Joi.string().trim().required(),
  samagra_id: Joi.string().trim().required()
}).required();
