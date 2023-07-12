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

ResetPasswordSchema.pre<IResetPassword>('save', async function (next) {
  if (!this.isModified('token')) {
    return next()
  }

  const hash = await bcrypt.hash(this.token, 12)
  this.token = hash

  next()
})

ResetPasswordSchema.methods.isValidToken = async function (
  token: string
): Promise<Error | boolean> {
  return await bcrypt.compare(token, this.token)
}

export default model<IResetPassword>('ResetPassword', ResetPasswordSchema)
