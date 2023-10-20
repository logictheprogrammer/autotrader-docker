import { Schema, Types, model } from 'mongoose'
import { IReferral } from '@/modules/referral/referral.interface'
import { ReferralTypes } from './referral.enum'

const ReferralSchema = new Schema<IReferral>(
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
      enum: Object.values(ReferralTypes),
    },
    referrer: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IReferral>('Referral', ReferralSchema)
