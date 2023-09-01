import Joi from 'joi'

const create = Joi.object({
  name: Joi.string().required().lowercase(),
  symbol: Joi.string().required().lowercase(),
  logo: Joi.string().required(),
})

export default { create }
