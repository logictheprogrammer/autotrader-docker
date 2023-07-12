import Joi from 'joi'

const create = Joi.object({
  approval: Joi.boolean().required(),
  fee: Joi.number().positive().required(),
})

const update = Joi.object({
  approval: Joi.boolean().required(),
  fee: Joi.number().positive().required(),
})

export default { create, update }
