import { Schema, Types, model } from 'mongoose'
import { ITransfer } from '@/modules/transfer/transfer.interface'

const TransferSchema = new Schema(
  {
    fromUser: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromUserObject: {
      type: Object,
      required: true,
    },
    toUser: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserObject: {
      type: Object,
      required: true,
    },
    account: {
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

export default model<ITransfer>('Transfer', TransferSchema)
