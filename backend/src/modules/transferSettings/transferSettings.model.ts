import { Schema, model } from 'mongoose'
import { ITransferSettings } from '@/modules/transferSettings/transferSettings.interface'

const TransferSettingsSchema = new Schema<ITransferSettings>(
  {
    approval: {
      type: Boolean,
      required: true,
    },
    fee: {
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

const TransferSettingsModel = model<ITransferSettings>(
  'TransferSettings',
  TransferSettingsSchema
)

export default TransferSettingsModel
