import { Schema, model } from 'mongoose'
import { IAsset } from '@/modules/asset/asset.interface'

const AssetSchema = new Schema(
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
    },
  },
  { timestamps: true }
)

export default model<IAsset>('Asset', AssetSchema)
