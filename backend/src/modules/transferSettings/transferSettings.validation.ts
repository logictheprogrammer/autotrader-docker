import Joi from 'joi'

const update = Joi.object({
  approval: Joi.boolean().required(),
  fee: Joi.number().positive().required(),
})

export default { update }
