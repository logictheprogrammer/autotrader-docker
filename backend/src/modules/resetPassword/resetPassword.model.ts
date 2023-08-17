import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'
import { IResetPassword } from '@/modules/resetPassword/resetPassword.interface'

const ResetPasswordSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IResetPassword>('ResetPassword', ResetPasswordSchema)
