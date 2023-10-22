import Joi from 'joi'

const create = Joi.object({
  name: Joi.string().trim().required(),
  host: Joi.string().trim().required(),
  port: Joi.number().positive().required(),
  tls: Joi.boolean().required(),
  secure: Joi.boolean().required(),
  username: Joi.string().trim().required(),
  password: Joi.string().trim().required(),
})

export default { create }
