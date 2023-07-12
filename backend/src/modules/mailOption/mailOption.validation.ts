import Joi from 'joi'

const create = Joi.object({
  name: Joi.string().required(),
  host: Joi.string().required(),
  port: Joi.number().positive().required(),
  tls: Joi.boolean().required(),
  secure: Joi.boolean().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
})

export default { create }
