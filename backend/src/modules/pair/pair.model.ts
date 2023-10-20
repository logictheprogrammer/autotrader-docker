import { Schema, Types, model } from 'mongoose'
import { IPair } from '@/modules/pair/pair.interface'

const PairSchema = new Schema<IPair>(
  {
    assetType: {
      type: String,
      required: true,
    },
    baseAsset: {
      type: Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    quoteAsset: {
      type: Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IPair>('Pair', PairSchema)
