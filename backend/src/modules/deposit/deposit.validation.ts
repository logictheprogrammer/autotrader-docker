import Joi from 'joi'
import { DepositStatus } from '@/modules/deposit/deposit.enum'

const create = Joi.object({
  depositMethodId: Joi.string().trim().required(),
  amount: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(DepositStatus.APPROVED, DepositStatus.CANCELLED)
    .required(),
})

export default { create, updateStatus }
