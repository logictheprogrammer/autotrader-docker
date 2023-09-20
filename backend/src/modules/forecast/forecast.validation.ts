import Joi from 'joi'
import { ForecastMove, ForecastStatus } from './forecast.enum'
import { ObjectId } from 'mongoose'

const create = Joi.object({
  planId: Joi.string().required(),
  pairId: Joi.string().required(),
  percentageProfit: Joi.number().required(),
  stakeRate: Joi.number().positive().required(),
})

const update = Joi.object({
  forecastId: Joi.string().required(),
  pairId: Joi.string().required(),
  move: Joi.string()
    .valid(...Object.values(ForecastMove))
    .required(),
  stakeRate: Joi.number().positive().required(),
  profit: Joi.number().required(),
  openingPrice: Joi.number().positive(),
  closingPrice: Joi.number().positive(),
})

const updateStatus = Joi.object<{
  forecastId: ObjectId
  status: ForecastStatus
}>({
  forecastId: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(ForecastStatus))
    .required(),
})

export default { create, updateStatus, update }
