import { Schema, model } from 'mongoose'
import { IAsset } from '@/modules/asset/asset.interface'
import { AssetType } from './asset.enum'

const AssetSchema = new Schema<IAsset>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(AssetType),
      trim: true,
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

const AssetModel = model<IAsset>('Asset', AssetSchema)

export default AssetModel
