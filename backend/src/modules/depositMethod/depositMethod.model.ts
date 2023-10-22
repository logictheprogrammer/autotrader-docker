import { Schema, Types, model } from 'mongoose'
import { IDepositMethod } from '@/modules/depositMethod/depositMethod.interface'
import { DepositMethodStatus } from './depositMethod.enum'

const DepositMethodSchema = new Schema<IDepositMethod>(
  {
    currency: {
      type: Types.ObjectId,
      ref: 'Currency',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    network: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(DepositMethodStatus),
      trim: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    minDeposit: {
      type: Number,
      required: true,
    },
    autoUpdate: {
      type: Boolean,
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

const DepositMethodModel = model<IDepositMethod>(
  'DepositMethod',
  DepositMethodSchema
)

export default DepositMethodModel
