import Joi from 'joi'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { AssetType } from '@/modules/asset/asset.enum'

const create = Joi.object({
  name: Joi.string().required(),
  engine: Joi.string().required(),
  minAmount: Joi.number().positive().required(),
  maxAmount: Joi.number().positive().required(),
  minPercentageProfit: Joi.number().positive().required(),
  maxPercentageProfit: Joi.number().positive().required(),
  duration: Joi.number().positive().required(),
  dailyForecasts: Joi.number().positive().required(),
  gas: Joi.number().positive().required(),
  description: Joi.string().required(),
  assetType: Joi.string()
    .valid(...Object.values(AssetType))
    .required(),
  assets: Joi.array().items(Joi.string()).min(1).unique(),
})

const update = Joi.object({
  planId: Joi.string().required(),
  name: Joi.string().required(),
  engine: Joi.string().required(),
  minAmount: Joi.number().positive().required(),
  maxAmount: Joi.number().positive().required(),
  minPercentageProfit: Joi.number().positive().required(),
  maxPercentageProfit: Joi.number().positive().required(),
  duration: Joi.number().positive().required(),
  dailyForecasts: Joi.number().positive().required(),
  gas: Joi.number().positive().required(),
  description: Joi.string().required(),
  assetType: Joi.string()
    .valid(...Object.values(AssetType))
    .required(),
  assets: Joi.array().items(Joi.string()).min(1).unique(),
})

const updateStatus = Joi.object({
  planId: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(PlanStatus))
    .required(),
})

export default { create, update, updateStatus }
