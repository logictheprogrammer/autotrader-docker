import { Schema, model } from 'mongoose'
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

export default model<IEmailVerification>(
  'EmailVerification',
  EmailVerificationSchema
)
