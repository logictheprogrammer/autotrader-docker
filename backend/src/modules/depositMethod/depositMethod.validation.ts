import Joi from 'joi'
import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'

const create = Joi.object({
  address: Joi.string().required(),
  network: Joi.string().required().lowercase(),
  fee: Joi.number().min(0).required(),
  minDeposit: Joi.number().positive().required(),
})

const update = Joi.object({
  address: Joi.string().required(),
  network: Joi.string().required().lowercase(),
  fee: Joi.number().min(0).required(),
  minDeposit: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .valid(...Object.values(DepositMethodStatus))
    .required(),
})

const updatePrice = Joi.object({
  price: Joi.number().positive().required(),
})

const updateMode = Joi.object({
  autoUpdate: Joi.boolean().required(),
})

export default { create, update, updateStatus, updateMode, updatePrice }
