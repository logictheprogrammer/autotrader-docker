import Joi from 'joi'

const create = Joi.object({
  assetType: Joi.string().required(),
  baseAssetId: Joi.string().required(),
  quoteAssetId: Joi.string().required(),
})

const update = Joi.object({
  assetType: Joi.string().required(),
  baseAssetId: Joi.string().required(),
  quoteAssetId: Joi.string().required(),
})

export default { create, update }
