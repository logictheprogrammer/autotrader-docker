import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { AssetType } from '@/modules/asset/asset.enum'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface IAssetObject extends IAppObject {
  name: string
  symbol: string
  logo: string
  type: AssetType
  isDeleted?: boolean
}

export interface IAsset extends AppDocument {
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
    assetId: AppObjectId,
    assetType: AssetType
  ): Promise<IAssetObject | null | undefined>

  update(
    assetId: AppObjectId,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): THttpResponse<{ asset: IAsset }>

  fetchAll(): THttpResponse<{ assets: IAsset[] }>
}
