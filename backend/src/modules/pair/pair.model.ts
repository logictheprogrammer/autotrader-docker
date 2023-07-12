import { Schema, Types, model } from 'mongoose'
import { IPair } from '@/modules/pair/pair.interface'

const PairSchema = new Schema(
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
    baseAssetObject: {
      type: Object,
      required: true,
    },
    quoteAsset: {
      type: Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    quoteAssetObject: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IPair>('Pair', PairSchema)
