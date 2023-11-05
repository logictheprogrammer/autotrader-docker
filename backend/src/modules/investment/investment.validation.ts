import Joi from 'joi'
import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { UserAccount } from '../user/user.enum'

const create = Joi.object({
  planId: Joi.string().trim().required(),
  amount: Joi.number().positive().required(),
  account: Joi.string()
    .trim()
    .valid(
      UserAccount.MAIN_BALANCE,
      UserAccount.REFERRAL_BALANCE,
      UserAccount.BONUS_BALANCE
    )
    .required(),
})

const createDemo = Joi.object({
  planId: Joi.string().trim().required(),
  amount: Joi.number().positive().required(),
  account: Joi.string().trim().valid(UserAccount.DEMO_BALANCE).required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(...Object.values(InvestmentStatus))
    .required(),
})

const fund = Joi.object({
  amount: Joi.number().positive().required(),
})

const refill = Joi.object({
  gas: Joi.number().positive().required(),
})

export default { create, updateStatus, fund, refill, createDemo }
