import { Schema, Types, model } from 'mongoose'
import { IWithdrawal } from '@/modules/withdrawal/withdrawal.interface'

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    withdrawalMethod: {
      type: Types.ObjectId,
      ref: 'WithdrawalMethod',
      required: true,
    },
    currency: {
      type: Types.ObjectId,
      ref: 'Currency',
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
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
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
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

const WithdrawalModel = model<IWithdrawal>('Withdrawal', WithdrawalSchema)

export default WithdrawalModel
