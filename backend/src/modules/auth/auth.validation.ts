import Joi from 'joi'

const register = Joi.object({
  name: Joi.string().trim().lowercase().min(3).max(30).required(),
  username: Joi.string()
    .trim()
    .alphanum()
    .lowercase()
    .min(3)
    .max(30)
    .required(),
  email: Joi.string().trim().email().lowercase().required(),
  country: Joi.string().trim().lowercase().required(),
  invite: Joi.string().trim().allow(null, '').optional(),
  password: Joi.string().trim().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const login = Joi.object({
  account: Joi.alternatives()
    .required()
    .try(
      Joi.string().trim().email().lowercase().required(),
      Joi.string().trim().alphanum().min(3).lowercase().max(30)
    )
    .options({
      messages: { 'alternatives.match': 'Invalid email or username' },
    }),
  password: Joi.string().trim().required(),
})

const updatePassword = Joi.object({
  oldPassword: Joi.string().trim().min(8).required(),
  password: Joi.string().trim().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const updateUserPassword = Joi.object({
  password: Joi.string().trim().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const forgetPassword = Joi.object({
  account: Joi.alternatives()
    .try(
      Joi.string().trim().email().lowercase().required(),
      Joi.string().trim().alphanum().min(3).lowercase().max(30).required()
    )
    .options({
      messages: { 'alternatives.match': 'Invalid email or username' },
    }),
})

const resetPassword = Joi.object({
  key: Joi.string().trim().required(),
  verifyToken: Joi.string().trim().required().label('Verify Token'),
  password: Joi.string().trim().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const verifyEmail = Joi.object({
  key: Joi.string().trim().required(),
  verifyToken: Joi.string().trim().required().label('Verify Token'),
})

export default {
  register,
  login,
  updatePassword,
  updateUserPassword,
  forgetPassword,
  resetPassword,
  verifyEmail,
}
