import Joi from 'joi'
import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import { UserAccount } from '../user/user.enum'

const create = Joi.object({
  withdrawalMethodId: Joi.string().required(),
  address: Joi.string().required(),
  account: Joi.string()
    .valid(UserAccount.MAIN_BALANCE, UserAccount.REFERRAL_BALANCE)
    .required(),
  amount: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  withdrawalId: Joi.string().required(),
  status: Joi.string()
    .valid(WithdrawalStatus.APPROVED, WithdrawalStatus.CANCELLED)
    .required(),
})

export default { create, updateStatus }
