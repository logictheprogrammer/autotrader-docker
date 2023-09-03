import { Schema, Types, model } from 'mongoose'
import { ITransaction } from '@/modules/transaction/transaction.interface'

const TransactionSchema = new Schema(
  {
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
    category: {
      type: Types.ObjectId,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    categoryObject: {
      type: Object,
      required: true,
    },
    environment: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    stake: {
      type: Number,
    },
  },
  { timestamps: true }
)

export default model<ITransaction>('Transaction', TransactionSchema)
