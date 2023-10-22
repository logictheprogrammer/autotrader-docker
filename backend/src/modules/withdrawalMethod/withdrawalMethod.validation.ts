import Joi from 'joi'
import { WithdrawalMethodStatus } from './withdrawalMethod.enum'

const create = Joi.object({
  currencyId: Joi.string().trim().required(),
  network: Joi.string().trim().required(),
  fee: Joi.number().min(0).required(),
  minWithdrawal: Joi.number().positive().required(),
})

const update = Joi.object({
  currencyId: Joi.string().trim().required(),
  network: Joi.string().trim().required(),
  fee: Joi.number().min(0).required(),
  minWithdrawal: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(...Object.values(WithdrawalMethodStatus))
    .required(),
})

export default { create, update, updateStatus }
