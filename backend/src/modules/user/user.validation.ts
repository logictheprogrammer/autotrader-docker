import Joi from 'joi'
import { UserAccount, UserStatus } from '@/modules/user/user.enum'
const updateProfile = Joi.object({
  name: Joi.string().trim().lowercase().min(3).max(30).required(),
  username: Joi.string()
    .trim()
    .alphanum()
    .lowercase()
    .min(3)
    .max(30)
    .required(),
})

const updateEmail = Joi.object({
  email: Joi.string().trim().email().lowercase().required(),
})

const updateStatus = Joi.object({
  status: Joi.string()
    .trim()
    .valid(...Object.values(UserStatus))
    .required(),
})

const sendEmail = Joi.object({
  subject: Joi.string().trim().required(),
  heading: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
})

const fundUser = Joi.object({
  amount: Joi.number().required(),
  account: Joi.string()
    .trim()
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
