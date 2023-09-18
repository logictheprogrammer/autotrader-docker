import Joi from 'joi'
import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { UserAccount } from '../user/user.enum'
import { ForecastMove, ForecastStatus } from './forecast.enum'

const create = Joi.object({
  investmentId: Joi.string().required(),
  pairId: Joi.string().required(),
  stake: Joi.number().positive().required(),
  profit: Joi.number().required(),
})

const update = Joi.object({
  forecastId: Joi.string().required(),
  pairId: Joi.string().required(),
  move: Joi.string()
    .valid(...Object.values(ForecastMove))
    .required(),
  stake: Joi.number().positive().required(),
  profit: Joi.number().required(),
  openingPrice: Joi.number().positive(),
  closingPrice: Joi.number().positive(),
  startTime: Joi.date().iso(),
  stopTime: Joi.date().iso(),
})

const updateStatus = Joi.object({
  forecastId: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(ForecastStatus))
    .required(),
})

const updateAmount = Joi.object({
  forecastId: Joi.string().required(),
  stake: Joi.number().positive().required(),
  profit: Joi.number().required(),
})

export default { create, updateStatus, update, updateAmount }
