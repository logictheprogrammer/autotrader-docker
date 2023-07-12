import { Document, Types } from 'mongoose'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { AssetType } from '@/modules/asset/asset.enum'
import { IAsset, IAssetObject } from '@/modules/asset/asset.interface'

export interface IPairObject extends IServiceObject {
  assetType: AssetType
  baseAsset: IAsset['_id']
  baseAssetObject: IAssetObject
  quoteAsset: IAsset['_id']
  quoteAssetObject: IAssetObject
}

export interface IPair extends Document {
  assetType: AssetType
  baseAsset: IAsset['_id']
  baseAssetObject: IAssetObject
  quoteAsset: IAsset['_id']
  quoteAssetObject: IAssetObject
}

export interface IPairService {
  create(
    assetType: AssetType,
    baseAssetId: Types.ObjectId,
    quoteAssetId: Types.ObjectId
  ): THttpResponse<{ pair: IPair }>

  get(pairId: Types.ObjectId): Promise<IPairObject | null>

  getByBase(baseId: Types.ObjectId): Promise<IPairObject[]>

  update(
    pairId: Types.ObjectId,
    assetType: AssetType,
    baseAssetId: Types.ObjectId,
    quoteAssetId: Types.ObjectId
  ): THttpResponse<{ pair: IPair }>

  fetchAll(): THttpResponse<{ pairs: IPair[] }>
}
