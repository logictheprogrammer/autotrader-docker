import { AssetType } from '@/modules/asset/asset.enum'
import { IAsset, IAssetObject } from '@/modules/asset/asset.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IPairObject extends baseObjectInterface {
  assetType: AssetType
  baseAsset: IAsset['_id']
  quoteAsset: IAsset['_id']
}

// @ts-ignore
export interface IPair extends baseModelInterface, IPairObject {}

export interface IPairService {
  create(
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): Promise<IPairObject>

  fetch(filter: FilterQuery<IPair>): Promise<IPairObject>

  update(
    filter: FilterQuery<IPair>,
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): Promise<IPairObject>

  fetchAll(filter: FilterQuery<IPair>): Promise<IPairObject[]>
}
