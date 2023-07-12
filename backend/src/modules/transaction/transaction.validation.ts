import Joi from 'joi'
import { ReferralStatus } from '../referral/referral.enum'
import { DepositStatus } from '../deposit/deposit.enum'
import { TransferStatus } from '../transfer/transfer.enum'
import { WithdrawalStatus } from '../withdrawal/withdrawal.enum'

const updateStatus = Joi.object({
  transactionId: Joi.string().required(),
  status: Joi.string()
    .valid(
      ...Object.values(ReferralStatus),
      ...Object.values(DepositStatus),
      ...Object.values(WithdrawalStatus),
      ...Object.values(TransferStatus)
    )
    .required(),
})

const updateAmount = Joi.object({
  transactionId: Joi.string().required(),
  status: Joi.string()
    .valid(
      ...Object.values(ReferralStatus),
      ...Object.values(DepositStatus),
      ...Object.values(WithdrawalStatus),
      ...Object.values(TransferStatus)
    )
    .required(),
  amount: Joi.number().positive().required(),
})

export default { updateStatus, updateAmount }
