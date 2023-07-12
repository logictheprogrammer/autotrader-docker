import Joi from 'joi'

const create = Joi.object({
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  logo: Joi.string().required(),
})

export default { create }
