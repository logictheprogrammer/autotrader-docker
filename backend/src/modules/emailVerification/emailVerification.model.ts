import { Schema, model } from 'mongoose'
import { IEmailVerification } from '@/modules/emailVerification/emailVerification.interface'
import Cryptograph from '@/core/cryptograph'

const EmailVerificationSchema = new Schema<IEmailVerification>(
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

EmailVerificationSchema.pre<IEmailVerification>('save', async function (next) {
  if (!this.isModified('token')) return next()
  this.token = await Cryptograph.setHash(this.token)
})

EmailVerificationSchema.methods.isValidToken = async function (token: string) {
  return await Cryptograph.isValidHash(token, this.token)
}

const EmailVerificationModel = model<IEmailVerification>(
  'EmailVerification',
  EmailVerificationSchema
)

export default EmailVerificationModel
