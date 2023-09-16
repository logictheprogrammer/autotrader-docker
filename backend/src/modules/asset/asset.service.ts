import { Service } from 'typedi'
import {
  IAsset,
  IAssetObject,
  IAssetService,
} from '@/modules/asset/asset.interface'
import assetModel from '@/modules/asset/asset.model'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { AssetType } from '@/modules/asset/asset.enum'
import { ObjectId } from 'mongoose'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class AssetService implements IAssetService {
  private assetModel = assetModel

  private find = async (
    assetId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IAsset> => {
    let asset

    if (fromAllAccounts) {
      asset = await this.assetModel.findById(assetId)
    } else {
      asset = await this.assetModel.findOne({ _id: assetId, user: userId })
    }

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
      const assetExist = await this.assetModel.findOne({
        $or: [{ name }, { symbol }],
      })

      if (assetExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'Asset already exist'
        )

      const asset = await this.assetModel.create({
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
      throw new AppException(err, 'Unable to save new asset, please try again')
    }
  }

  public async get(
    assetId: ObjectId,
    assetType: AssetType
  ): Promise<IAssetObject | null | undefined> {
    try {
      const asset = await this.assetModel.findOne({
        _id: assetId,
        type: assetType,
      })

      if (!asset) return

      return asset.toObject({ getters: true })
    } catch (err: any) {
      throw new AppException(err, 'Unable to get asset, please try again')
    }
  }

  public update = async (
    assetId: ObjectId,
    name: string,
    symbol: string,
    logo: string,
    type: AssetType
  ): THttpResponse<{ asset: IAsset }> => {
    try {
      const assetExist = await this.assetModel.findOne({
        $and: [{ _id: { $ne: assetId } }, { $or: [{ name }, { symbol }] }],
      })

      if (assetExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
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
      throw new AppException(err, 'Unable to update asset, please try again')
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
      throw new AppException(err, 'Unable to fetch asset, please try again')
    }
  }
}

export default AssetService
