import { Schema, Types, model } from 'mongoose'
import { IDeposit } from '@/modules/deposit/deposit.interface'
import { DepositStatus } from './deposit.enum'

const DepositSchema = new Schema<IDeposit>(
  {
    depositMethod: {
      type: Types.ObjectId,
      ref: 'DepositMethod',
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(DepositStatus),
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

const DepositModel = model<IDeposit>('Deposit', DepositSchema)

export default DepositModel
