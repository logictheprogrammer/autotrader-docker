import { Service } from 'typedi'
import {
  IAsset,
  IAssetObject,
  IAssetService,
} from '@/modules/asset/asset.interface'
import { AssetType } from '@/modules/asset/asset.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import { NotFoundError, RequestConflictError } from '@/core/apiError'
import AssetModel from '@/modules/asset/asset.model'

@Service()
class AssetService implements IAssetService {
  private assetModel = AssetModel

  public async create(
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): Promise<IAssetObject> {
    const assetExist = await this.assetModel.findOne({
      $or: [{ name }, { symbol }],
    })

    if (assetExist) throw new RequestConflictError('Asset already exist')

    const asset = await this.assetModel.create({
      name,
      symbol,
      logo,
      type,
    })

    return asset
  }

  public async fetch(filter: FilterQuery<IAsset>): Promise<IAssetObject> {
    const asset = await this.assetModel.findOne(filter, {}, { lean: true })

    if (!asset) throw new NotFoundError('Asset not found')

    return asset
  }

  public async update(
    filter: FilterQuery<IAsset>,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): Promise<IAssetObject> {
    const asset = await this.assetModel.findOne(filter)

    if (!asset) throw new NotFoundError('Asset not found')

    const assetExist = await this.assetModel.findOne({
      $and: [{ _id: { $ne: asset._id } }, { $or: [{ name }, { symbol }] }],
    })

    if (assetExist) throw new RequestConflictError('Asset already exist')

    asset.name = name
    asset.symbol = symbol
    asset.logo = logo
    asset.type = type

    await asset.save()

    return asset
  }

  public async fetchAll(filter: FilterQuery<IAsset>): Promise<IAssetObject[]> {
    return await this.assetModel.find(filter)
  }

  public async count(filter: FilterQuery<IAsset>): Promise<number> {
    return await this.assetModel.count(filter)
  }
}

export default AssetService
