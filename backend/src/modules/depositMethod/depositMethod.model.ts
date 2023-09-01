import { Schema, Types, model } from 'mongoose'
import { IDepositMethod } from '@/modules/depositMethod/depositMethod.interface'

const DepositMethodSchema = new Schema(
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
    price: {
      type: Number,
      required: true,
    },
    address: {
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
    minDeposit: {
      type: Number,
      required: true,
    },
    autoUpdate: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IDepositMethod>('DepositMethod', DepositMethodSchema)
