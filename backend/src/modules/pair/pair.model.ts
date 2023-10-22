import { Schema, Types, model } from 'mongoose'
import { IPair } from '@/modules/pair/pair.interface'
import { AssetType } from '../asset/asset.enum'

const PairSchema = new Schema<IPair>(
  {
    assetType: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(AssetType),
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
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

const PairModel = model<IPair>('Pair', PairSchema)

export default PairModel
