import baseModelInterface from '@/core/baseModelInterface'
import baseObjectInterface from '@/core/baseObjectInterface'
import { AssetType } from '@/modules/asset/asset.enum'
import { FilterQuery, QueryOptions } from 'mongoose'
import { ObjectId } from 'mongoose'

export interface IAssetObject extends baseObjectInterface {
  name: string
  symbol: string
  logo: string
  type: AssetType
}

// @ts-ignore
export interface IAsset extends baseModelInterface, IAssetObject {}

export interface IAssetService {
  create(
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): Promise<IAssetObject>

  fetch(filter: FilterQuery<IAsset>): Promise<IAssetObject>

  update(
    filter: FilterQuery<IAsset>,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): Promise<IAssetObject>

  fetchAll(filter: FilterQuery<IAsset>): Promise<IAssetObject[]>
}
