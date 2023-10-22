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
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

const ReferralSettingsModel = model<IReferralSettings>(
  'ReferralSettings',
  ReferralSettingsSchema
)

export default ReferralSettingsModel
