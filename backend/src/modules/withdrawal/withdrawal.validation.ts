import Joi from 'joi'
import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import { UserAccount } from '../user/user.enum'

const create = Joi.object({
  withdrawalMethodId: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  account: Joi.string()
    .trim()
    .valid(UserAccount.MAIN_BALANCE, UserAccount.REFERRAL_BALANCE)
    .required(),
  amount: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(WithdrawalStatus.APPROVED, WithdrawalStatus.CANCELLED)
    .required(),
})

export default { create, updateStatus }
