import { Schema, Types, model } from 'mongoose'
import { IWithdrawalMethod } from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { WithdrawalMethodStatus } from './withdrawalMethod.enum'

const WithdrawalMethodSchema = new Schema<IWithdrawalMethod>(
  {
    currency: {
      type: Types.ObjectId,
      ref: 'Currency',
      required: true,
    },
    network: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(WithdrawalMethodStatus),
      trim: true,
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
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

const WithdrawalMethodModel = model<IWithdrawalMethod>(
  'WithdrawalMethod',
  WithdrawalMethodSchema
)

export default WithdrawalMethodModel
