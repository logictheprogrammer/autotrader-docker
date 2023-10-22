import { Schema, model } from 'mongoose'
import { IResetPassword } from '@/modules/resetPassword/resetPassword.interface'
import Cryptograph from '@/core/cryptograph'

const ResetPasswordSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      trim: true,
    },
    expires: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

ResetPasswordSchema.pre<IResetPassword>('save', async function (next) {
  if (!this.isModified('token')) return next()
  this.token = await Cryptograph.setHash(this.token)
})

ResetPasswordSchema.methods.isValidToken = async function (token: string) {
  return await Cryptograph.isValidHash(token, this.token)
}

const ResetPasswordModel = model<IResetPassword>(
  'ResetPassword',
  ResetPasswordSchema
)

export default ResetPasswordModel
