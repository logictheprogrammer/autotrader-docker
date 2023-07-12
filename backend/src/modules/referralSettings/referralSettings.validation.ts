import Joi from 'joi'

const create = Joi.object({
  deposit: Joi.number().positive().required(),
  stake: Joi.number().positive().required(),
  winnings: Joi.number().positive().required(),
  investment: Joi.number().positive().required(),
  completedPackageEarnings: Joi.number().positive().required(),
})

const update = Joi.object({
  deposit: Joi.number().positive().required(),
  stake: Joi.number().positive().required(),
  winnings: Joi.number().positive().required(),
  investment: Joi.number().positive().required(),
  completedPackageEarnings: Joi.number().positive().required(),
})

export default { create, update }
