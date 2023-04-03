import * as Joi from 'joi'

export const configSchemaValidation = Joi.object({
  PORT: Joi.number().default(4000).required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_DATABASE: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  JWT_SECRET: Joi.string().required()
})