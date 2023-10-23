import Joi from 'joi'
import { ForecastMove, ForecastStatus } from './forecast.enum'
import ForecastService from './forecast.service'

const create = Joi.object({
  planId: Joi.string().trim().required(),
  pairId: Joi.string().trim().required(),
  percentageProfit: Joi.number().required(),
  stakeRate: Joi.number()
    .positive()
    .min(ForecastService.minStakeRate)
    .max(ForecastService.maxStakeRate)
    .required(),
})

const update = Joi.object({
  pairId: Joi.string().trim().required(),
  move: Joi.string()
    .trim()
    .valid(...Object.values(ForecastMove))
    .required(),
  stakeRate: Joi.number()
    .positive()
    .min(ForecastService.minStakeRate)
    .max(ForecastService.maxStakeRate)
    .required(),
  percentageProfit: Joi.number().required(),
  openingPrice: Joi.number().positive(),
  closingPrice: Joi.number().positive(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(...Object.values(ForecastStatus))
    .required(),
})

export default { create, updateStatus, update }
