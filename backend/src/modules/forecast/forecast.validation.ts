import Joi from 'joi'
import { ForecastMove, ForecastStatus } from './forecast.enum'
import ForecastService from './forecast.service'

const create = Joi.object({
  planId: Joi.string().trim().required(),
  pairId: Joi.string().trim().required(),
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
    .valid(...Object.values(ForecastMove)),
  stakeRate: Joi.number()
    .positive()
    .min(ForecastService.minStakeRate)
    .max(ForecastService.maxStakeRate)
    .required(),
  percentageProfit: Joi.number().not(0),
  openingPrice: Joi.number().positive(),
  closingPrice: Joi.number().positive(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(...Object.values(ForecastStatus))
    .required(),
  percentageProfit: Joi.number().not(0),
})

export default { create, updateStatus, update }
