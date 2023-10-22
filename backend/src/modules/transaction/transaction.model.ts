import { Schema, Types, model } from 'mongoose'
import { ITransaction } from '@/modules/transaction/transaction.interface'

const TransactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Types.ObjectId,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    environment: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    stake: {
      type: Number,
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

const TransactionModel = model<ITransaction>('Transaction', TransactionSchema)

export default TransactionModel
