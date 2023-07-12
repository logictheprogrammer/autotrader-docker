import { Schema, model } from 'mongoose'
import { ITransferSettings } from '@/modules/transferSettings/transferSettings.interface'

const TransferSettingsSchema = new Schema(
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
  { timestamps: true }
)

export default model<ITransferSettings>(
  'TransferSettings',
  TransferSettingsSchema
)
