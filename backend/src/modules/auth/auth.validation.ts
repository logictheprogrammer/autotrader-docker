import Joi from 'joi'

const register = Joi.object({
  name: Joi.string().lowercase().min(3).max(30).required(),
  username: Joi.string().alphanum().lowercase().min(3).max(30).required(),
  email: Joi.string().email().lowercase().required(),
  country: Joi.string().lowercase().required(),
  invite: Joi.string().allow(null, '').optional(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const login = Joi.object({
  account: Joi.alternatives()
    .try(
      Joi.string().email().lowercase().required(),
      Joi.string().alphanum().min(3).lowercase().max(30).required()
    )
    .options({
      messages: { 'alternatives.match': 'Invalid email or username' },
    }),
  password: Joi.string().required(),
})

const updatePassword = Joi.object({
  oldPassword: Joi.string().min(8).required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const updateUserPassword = Joi.object({
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const forgetPassword = Joi.object({
  account: Joi.alternatives()
    .try(
      Joi.string().email().lowercase().required(),
      Joi.string().alphanum().min(3).lowercase().max(30).required()
    )
    .options({
      messages: { 'alternatives.match': 'Invalid email or username' },
    }),
})

const resetPassword = Joi.object({
  key: Joi.string().required(),
  verifyToken: Joi.string().required().label('Verify Token'),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref('password'))
    .required()
    .label('Confirm Password')
    .options({ messages: { 'any.only': 'Password does not match' } }),
})

const verifyEmail = Joi.object({
  key: Joi.string().required(),
  verifyToken: Joi.string().required().label('Verify Token'),
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
