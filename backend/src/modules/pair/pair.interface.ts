import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { AssetType } from '@/modules/asset/asset.enum'
import { IAsset, IAssetObject } from '@/modules/asset/asset.interface'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface IPairObject extends IAppObject {
  assetType: AssetType
  baseAsset: IAsset['_id']
  baseAssetObject: IAssetObject
  quoteAsset: IAsset['_id']
  quoteAssetObject: IAssetObject
}

export interface IPair extends AppDocument {
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
    baseAssetId: AppObjectId,
    quoteAssetId: AppObjectId
  ): THttpResponse<{ pair: IPair }>

  get(pairId: AppObjectId): Promise<IPairObject | null>

  getByBase(baseId: AppObjectId): Promise<IPairObject[]>

  update(
    pairId: AppObjectId,
    assetType: AssetType,
    baseAssetId: AppObjectId,
    quoteAssetId: AppObjectId
  ): THttpResponse<{ pair: IPair }>

  fetchAll(): THttpResponse<{ pairs: IPair[] }>
}
