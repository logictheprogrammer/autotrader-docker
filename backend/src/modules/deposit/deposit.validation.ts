import Joi from 'joi'
import { DepositStatus } from '@/modules/deposit/deposit.enum'

const create = Joi.object({
  depositMethodId: Joi.string().required(),
  amount: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  depositId: Joi.string().required(),
  status: Joi.string()
    .valid(DepositStatus.APPROVED, DepositStatus.CANCELLED)
    .required(),
})

export default { create, updateStatus }
