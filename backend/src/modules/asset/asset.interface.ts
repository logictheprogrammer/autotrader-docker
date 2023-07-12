import { Document, Types } from 'mongoose'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { AssetType } from '@/modules/asset/asset.enum'

export interface IAssetObject extends IServiceObject {
  name: string
  symbol: string
  logo: string
  type: AssetType
  isDeleted?: boolean
}

export interface IAsset extends Document {
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
    assetId: Types.ObjectId,
    assetType: AssetType
  ): Promise<IAssetObject | null>

  update(
    assetId: Types.ObjectId,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): THttpResponse<{ asset: IAsset }>

  fetchAll(): THttpResponse<{ assets: IAsset[] }>
}
