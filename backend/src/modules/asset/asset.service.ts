import { Service } from 'typedi'
import {
  IAsset,
  IAssetObject,
  IAssetService,
} from '@/modules/asset/asset.interface'
import assetModel from '@/modules/asset/asset.model'
import { AssetType } from '@/modules/asset/asset.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import {
  NotFoundError,
  RequestConflictError,
  ServiceError,
} from '@/core/apiError'

@Service()
class AssetService implements IAssetService {
  private assetModel = assetModel

  public async create(
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): Promise<IAssetObject> {
    try {
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
    } catch (err: any) {
      throw new ServiceError(err, 'Unable to save new asset, please try again')
    }
  }

  public async fetch(filter: FilterQuery<IAsset>): Promise<IAssetObject> {
    try {
      const asset = await this.assetModel.findOne(filter, {}, { lean: true })

      if (!asset) throw new NotFoundError('Asset not found')

      return asset
    } catch (err: any) {
      throw new ServiceError(err, 'Unable to fetch asset, please try again')
    }
  }

  public async update(
    filter: FilterQuery<IAsset>,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): Promise<IAssetObject> {
    try {
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
    } catch (err: any) {
      throw new ServiceError(err, 'Unable to update asset, please try again')
    }
  }

  public async fetchAll(filter: FilterQuery<IAsset>): Promise<IAssetObject[]> {
    try {
      const assets = await this.assetModel.find(filter, {}, { lean: true })

      return assets
    } catch (err: any) {
      throw new ServiceError(err, 'Unable to fetch assets, please try again')
    }
  }
}

export default AssetService
