import { Schema, Types, model } from 'mongoose'
import { IReferral } from '@/modules/referral/referral.interface'

const ReferralSchema = new Schema(
  {
    rate: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    referrer: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referrerObject: {
      type: Object,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userObject: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IReferral>('Referral', ReferralSchema)
