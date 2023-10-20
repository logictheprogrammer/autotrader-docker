import { Schema, Types, model } from 'mongoose'
import { IWithdrawal } from '@/modules/withdrawal/withdrawal.interface'

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    withdrawalMethod: {
      type: Types.ObjectId,
      ref: 'WithdrawalMethod',
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    account: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IWithdrawal>('Withdrawal', WithdrawalSchema)
