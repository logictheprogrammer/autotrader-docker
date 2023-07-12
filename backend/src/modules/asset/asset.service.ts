import { Service } from 'typedi'
import {
  IAsset,
  IAssetObject,
  IAssetService,
} from '@/modules/asset/asset.interface'
import assetModel from '@/modules/asset/asset.model'
import { Types } from 'mongoose'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'
import { AssetType } from '@/modules/asset/asset.enum'

@Service()
class AssetService implements IAssetService {
  private assetModel = new ServiceQuery<IAsset>(assetModel)

  private find = async (
    assetId: string | Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IAsset> => {
    const asset = await this.assetModel.findById(
      assetId,
      fromAllAccounts,
      userId
    )

    if (!asset) throw new HttpException(404, 'Asset not found')

    return asset
  }

  public create = async (
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): THttpResponse<{ asset: IAsset }> => {
    try {
      await this.assetModel.ifExist(
        {
          $or: [{ name }, { symbol }],
        },
        'Asset already exist'
      )

      const asset = await this.assetModel.self.create({
        name,
        symbol,
        logo,
        type,
      })
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Asset added successfully',
        data: { asset },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to save new asset, please try again'
      )
    }
  }

  public async get(
    assetId: Types.ObjectId,
    assetType: AssetType
  ): Promise<IAssetObject | null> {
    try {
      const asset = await this.assetModel.findOne({
        _id: assetId,
        type: assetType,
      })

      return asset?.toObject()
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to get asset, please try again')
    }
  }

  public update = async (
    assetId: string | Types.ObjectId,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): THttpResponse<{ asset: IAsset }> => {
    try {
      await this.assetModel.ifExist(
        { $and: [{ _id: { $ne: assetId } }, { $or: [{ name }, { symbol }] }] },
        'Asset already exist'
      )

      const asset = await this.find(assetId)

      asset.name = name
      asset.symbol = symbol
      asset.logo = logo
      asset.type = type

      await asset.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Asset updated successfully',
        data: { asset },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to update asset, please try again'
      )
    }
  }

  public fetchAll = async (): THttpResponse<{ assets: IAsset[] }> => {
    try {
      const assets = await this.assetModel.find()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Assets fetch successfully',
        data: { assets },
      }
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to fetch asset, please try again')
    }
  }
}

export default AssetService
