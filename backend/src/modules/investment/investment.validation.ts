import Joi from 'joi'
import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { UserAccount } from '../user/user.enum'

const create = Joi.object({
  planId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  account: Joi.string().valid(
    UserAccount.MAIN_BALANCE,
    UserAccount.REFERRAL_BALANCE,
    UserAccount.BONUS_BALANCE
  ),
})

const createDemo = Joi.object({
  planId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  account: Joi.string().valid(UserAccount.DEMO_BALANCE),
})

const updateStatus = Joi.object({
  investmentId: Joi.string().required(),
  status: Joi.string()
    .valid(...Object.values(InvestmentStatus))
    .required(),
})

const fund = Joi.object({
  investmentId: Joi.string().required(),
  amount: Joi.number().positive().required(),
})

export default { create, updateStatus, fund, createDemo }
