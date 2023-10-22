import { Schema, Types, model } from 'mongoose'
import { ITransfer } from '@/modules/transfer/transfer.interface'

const TransferSchema = new Schema<ITransfer>(
  {
    fromUser: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    account: {
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

const TransferModel = model<ITransfer>('Transfer', TransferSchema)

export default TransferModel
