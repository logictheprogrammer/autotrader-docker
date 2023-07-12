import Joi from 'joi'

const sendEmail = Joi.object({
  email: Joi.string().email().lowercase().required(),
  subject: Joi.string().required(),
  heading: Joi.string().required(),
  content: Joi.string().required(),
})

export default {
  sendEmail,
}
