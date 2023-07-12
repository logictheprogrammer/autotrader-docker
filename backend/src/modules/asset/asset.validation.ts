import Joi from 'joi'

const create = Joi.object({
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  logo: Joi.string().required(),
  type: Joi.string().required(),
})

const update = Joi.object({
  assetId: Joi.string().required(),
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  logo: Joi.string().required(),
  type: Joi.string().required(),
})

export default { create, update }
