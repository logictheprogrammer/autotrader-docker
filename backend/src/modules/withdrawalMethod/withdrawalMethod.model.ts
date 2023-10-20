import { Schema, Types, model } from 'mongoose'
import { IWithdrawalMethod } from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { WithdrawalMethodStatus } from './withdrawalMethod.enum'

const WithdrawalMethodSchema = new Schema<IWithdrawalMethod>(
  {
    currency: {
      type: Types.ObjectId,
      ref: 'currency',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(WithdrawalMethodStatus),
    },
    fee: {
      type: Number,
      required: true,
    },
    minWithdrawal: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IWithdrawalMethod>(
  'WithdrawalMethod',
  WithdrawalMethodSchema
)
