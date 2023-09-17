import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { AssetType } from '@/modules/asset/asset.enum'
import { Document, ObjectId, Types } from 'mongoose'

export interface IAssetObject extends IAppObject {
  name: string
  symbol: string
  logo: string
  type: AssetType
  isDeleted?: boolean
}

export interface IAsset extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  name: string
  symbol: string
  logo: string
  type: AssetType
  isDeleted?: boolean
}

export interface IAssetService {
  create(
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): THttpResponse<{ asset: IAsset }>

  get(
    assetId: ObjectId | Types.ObjectId,
    assetType: AssetType
  ): Promise<IAssetObject | null | undefined>

  update(
    assetId: ObjectId,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): THttpResponse<{ asset: IAsset }>

  fetchAll(): THttpResponse<{ assets: IAsset[] }>
}
