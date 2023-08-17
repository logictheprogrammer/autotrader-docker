import { Schema, model } from 'mongoose'
import { IWithdrawalMethod } from '@/modules/withdrawalMethod/withdrawalMethod.interface'

const WithdrawalMethodSchema = new Schema(
  {
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
