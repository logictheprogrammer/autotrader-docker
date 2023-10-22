import Joi from 'joi'
import { AssetType } from '../asset/asset.enum'

const create = Joi.object({
  assetType: Joi.string()
    .trim()
    .valid(...Object.values(AssetType))
    .required(),
  baseAssetId: Joi.string().trim().required(),
  quoteAssetId: Joi.string().trim().required(),
})

const update = Joi.object({
  assetType: Joi.string()
    .trim()
    .valid(...Object.values(AssetType))
    .required(),
  baseAssetId: Joi.string().trim().required(),
  quoteAssetId: Joi.string().trim().required(),
})

export default { create, update }
