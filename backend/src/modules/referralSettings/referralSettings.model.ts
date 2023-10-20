import { Schema, model } from 'mongoose'
import { IReferralSettings } from '@/modules/referralSettings/referralSettings.interface'

const ReferralSettingsSchema = new Schema<IReferralSettings>(
  {
    deposit: {
      type: Number,
      required: true,
    },
    stake: {
      type: Number,
      required: true,
    },
    winnings: {
      type: Number,
      required: true,
    },
    investment: {
      type: Number,
      required: true,
    },
    completedPackageEarnings: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IReferralSettings>(
  'ReferralSettings',
  ReferralSettingsSchema
)
