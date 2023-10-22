import Joi from 'joi'
import { AssetType } from './asset.enum'

const create = Joi.object({
  name: Joi.string().trim().required(),
  symbol: Joi.string().trim().required(),
  logo: Joi.string().trim().required(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(AssetType))
    .required(),
})

const update = Joi.object({
  name: Joi.string().trim().required(),
  symbol: Joi.string().trim().required(),
  logo: Joi.string().trim().required(),
  type: Joi.string()
    .trim()
    .valid(...Object.values(AssetType))
    .required(),
})

export default { create, update }
