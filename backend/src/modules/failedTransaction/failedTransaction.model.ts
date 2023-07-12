import { Schema, model } from 'mongoose'
import { IFailedTransaction } from '@/modules/failedTransaction/failedTransaction.interface'

const FailedTransactionSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    collectionName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IFailedTransaction>(
  'FailedTransaction',
  FailedTransactionSchema
)
