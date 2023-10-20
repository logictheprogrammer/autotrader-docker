import { Schema, model } from 'mongoose'
import { IAsset } from '@/modules/asset/asset.interface'
import { AssetType } from './asset.enum'

const AssetSchema = new Schema<IAsset>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
    },
    logo: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(AssetType),
    },
  },
  { timestamps: true }
)

export default model<IAsset>('Asset', AssetSchema)
