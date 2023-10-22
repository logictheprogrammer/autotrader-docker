import Joi from 'joi'

const create = Joi.object({
  name: Joi.string().trim().required().lowercase(),
  symbol: Joi.string().trim().required().lowercase(),
  logo: Joi.string().trim().required(),
})

export default { create }
