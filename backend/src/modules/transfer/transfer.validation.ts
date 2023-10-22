import Joi from 'joi'
import { TransferStatus } from '@/modules/transfer/transfer.enum'
import { UserAccount } from '@/modules/user/user.enum'

const create = Joi.object({
  toUserUsername: Joi.string()
    .trim()
    .alphanum()
    .lowercase()
    .min(3)
    .max(30)
    .required(),
  account: Joi.string()
    .trim()
    .valid(UserAccount.MAIN_BALANCE, UserAccount.REFERRAL_BALANCE)
    .required(),
  amount: Joi.number().positive().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(TransferStatus.SUCCESSFUL, TransferStatus.REVERSED)
    .required(),
})

export default { create, updateStatus }
