import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { AssetType } from '@/modules/asset/asset.enum'
import { IAsset, IAssetObject } from '@/modules/asset/asset.interface'
import { Document, ObjectId, Types } from 'mongoose'

export interface IPairObject extends IAppObject {
  assetType: AssetType
  baseAsset: IAsset['_id']
  baseAssetObject: IAssetObject
  quoteAsset: IAsset['_id']
  quoteAssetObject: IAssetObject
}

export interface IPair extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  assetType: AssetType
  baseAsset: IAsset['_id']
  baseAssetObject: IAssetObject
  quoteAsset: IAsset['_id']
  quoteAssetObject: IAssetObject
}

export interface IPairService {
  create(
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): THttpResponse<{ pair: IPair }>

  get(pairId: ObjectId | Types.ObjectId): Promise<IPairObject | null>

  getByBase(baseId: ObjectId): Promise<IPairObject[]>

  update(
    pairId: ObjectId,
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): THttpResponse<{ pair: IPair }>

  fetchAll(): THttpResponse<{ pairs: IPair[] }>
}
