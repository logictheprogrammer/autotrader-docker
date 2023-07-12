import Joi from 'joi'
import { UserAccount, UserStatus } from '@/modules/user/user.enum'
const updateProfile = Joi.object({
  name: Joi.string().lowercase().min(3).max(30).required(),
  username: Joi.string().alphanum().lowercase().min(3).max(30).required(),
  country: Joi.string().lowercase().required(),
})

const updateEmail = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .valid(...Object.values(UserStatus))
    .required(),
})

const sendEmail = Joi.object({
  subject: Joi.string().required(),
  heading: Joi.string().required(),
  content: Joi.string().required(),
})

const fundUser = Joi.object({
  amount: Joi.number().required(),
  account: Joi.string()
    .valid(...Object.values(UserAccount))
    .required(),
})

export default {
  updateProfile,
  updateEmail,
  updateStatus,
  sendEmail,
  fundUser,
}
