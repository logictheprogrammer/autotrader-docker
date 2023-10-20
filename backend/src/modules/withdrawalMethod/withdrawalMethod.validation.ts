import Joi from 'joi'
import { WithdrawalMethodStatus } from './withdrawalMethod.enum'

const create = Joi.object({
  currencyId: Joi.string().required(),
  network: Joi.string().required(),
  fee: Joi.number().min(0).required(),
  minWithdrawal: Joi.number().positive().required(),
})

const update = Joi.object({
  currencyId: Joi.string().required(),
  network: Joi.string().required(),
  fee: Joi.number().min(0).required(),
  minWithdrawal: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .valid(...Object.values(WithdrawalMethodStatus))
    .required(),
})

export default { create, update, updateStatus }
