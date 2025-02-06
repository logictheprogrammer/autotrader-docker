import Joi from 'joi'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { AssetType } from '@/modules/asset/asset.enum'

const create = Joi.object({
  name: Joi.string().trim().required(),
  engine: Joi.string().trim().required(),
  duration: Joi.number().positive().required(),
  minAmount: Joi.number().positive().required(),
  maxAmount: Joi.number().positive().required(),
  dailyPercentageProfit: Joi.number().positive().required(),
  description: Joi.string().trim().required(),
  assetType: Joi.string()
    .trim()
    .valid(...Object.values(AssetType))
    .required(),
  assets: Joi.array().items(Joi.string().trim()).min(1).unique().required(),
})

const update = Joi.object({
  name: Joi.string().trim().required(),
  engine: Joi.string().trim().required(),
  duration: Joi.number().positive().required(),
  minAmount: Joi.number().positive().required(),
  maxAmount: Joi.number().positive().required(),
  dailyPercentageProfit: Joi.number().positive().required(),
  description: Joi.string().trim().required(),
  assetType: Joi.string()
    .trim()
    .valid(...Object.values(AssetType))
    .required(),
  assets: Joi.array().items(Joi.string().trim()).min(1).unique().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(...Object.values(PlanStatus))
    .required(),
})

export default { create, update, updateStatus }
