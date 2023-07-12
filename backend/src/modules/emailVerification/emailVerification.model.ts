import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'
import { IEmailVerification } from '@/modules/emailVerification/emailVerification.interface'

const EmailVerificationSchema = new Schema(
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

EmailVerificationSchema.pre<IEmailVerification>('save', async function (next) {
  if (!this.isModified('token')) {
    return next()
  }

  const hash = await bcrypt.hash(this.token, 12)
  this.token = hash

  next()
})

EmailVerificationSchema.methods.isValidToken = async function (
  token: string
): Promise<Error | boolean> {
  return await bcrypt.compare(token, this.token)
}

export default model<IEmailVerification>(
  'EmailVerification',
  EmailVerificationSchema
)
