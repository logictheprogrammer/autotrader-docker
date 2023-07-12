import { Schema, Types, model } from 'mongoose'
import { IDeposit } from '@/modules/deposit/deposit.interface'

const DepositSchema = new Schema(
  {
    depositMethod: {
      type: Types.ObjectId,
      ref: 'DepositMethod',
      required: true,
    },
    depositMethodObject: {
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

export default model<IDeposit>('Deposit', DepositSchema)
