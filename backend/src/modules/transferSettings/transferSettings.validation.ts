import Joi from 'joi'

const update = Joi.object({
  approval: Joi.boolean().required(),
  fee: Joi.number().min(0).required(),
})

export default { update }
