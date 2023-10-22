import Joi from 'joi'

const sendEmail = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
  subject: Joi.string().trim().required(),
  heading: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
})

export default {
  sendEmail,
}
