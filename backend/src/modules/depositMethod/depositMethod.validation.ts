import Joi from 'joi'
import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'

const create = Joi.object({
  currencyId: Joi.string().required(),
  address: Joi.string().required(),
  network: Joi.string().required().lowercase(),
  fee: Joi.number().min(0).required(),
  minDeposit: Joi.number().positive().required(),
})

const update = Joi.object({
  depositMethodId: Joi.string().required(),
  currencyId: Joi.string().required(),
  address: Joi.string().required(),
  network: Joi.string().required().lowercase(),
  fee: Joi.number().min(0).required(),
  minDeposit: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  depositMethodId: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(DepositMethodStatus))
    .required(),
})

const updatePrice = Joi.object({
  depositMethodId: Joi.string().required(),
  price: Joi.number().positive().required(),
})

const updateMode = Joi.object({
  depositMethodId: Joi.string().required(),
  autoUpdate: Joi.boolean().required(),
})

export default { create, update, updateStatus, updateMode, updatePrice }
