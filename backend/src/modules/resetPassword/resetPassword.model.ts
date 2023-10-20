import { Schema, model } from 'mongoose'
import { IResetPassword } from '@/modules/resetPassword/resetPassword.interface'
import Cryptograph from '@/core/cryptograph'

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
  if (!this.isModified('token')) return next()
  this.token = await Cryptograph.setHash(this.token)
})

ResetPasswordSchema.methods.isValidToken = async function (token: string) {
  return await Cryptograph.isValidHash(token, this.token)
}

export default model<IResetPassword>('ResetPassword', ResetPasswordSchema)
