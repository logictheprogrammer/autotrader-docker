import { Inject, Service } from 'typedi'
import { IPair, IPairObject, IPairService } from '@/modules/pair/pair.interface'
import pairModel from '@/modules/pair/pair.model'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAsset, IAssetService } from '../asset/asset.interface'
import { AssetType } from '../asset/asset.enum'
import assetModel from '../asset/asset.model'
import { ObjectId } from 'mongoose'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class PairService implements IPairService {
  private pairModel = pairModel
  private assetModel = assetModel

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  private find = async (
    pairId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IPair> => {
    let pair
    if (fromAllAccounts) {
      pair = await this.pairModel.findById(pairId)
    } else {
      pair = await this.pairModel.findById({ _id: pairId, user: userId })
    }

    if (!pair) throw new HttpException(404, 'Pair not found')

    return pair
  }

  public async get(pairId: ObjectId): Promise<IPairObject | null> {
    try {
      const pair = await this.pairModel.findById(pairId)

      if (!pair) return null

      return pair.toObject({ getters: true })
    } catch (err: any) {
      throw new AppException(err, 'Unable to get pair, please try again')
    }
  }

  public async getByBase(baseId: ObjectId): Promise<IPairObject[]> {
    try {
      const pairs = await this.pairModel.find({ baseAsset: baseId })

      const pairsObject = pairs.map((pair) => pair.toObject({ getters: true }))

      return pairsObject
    } catch (err: any) {
      throw new AppException(err, 'Unable to get pair, please try again')
    }
  }

  public create = async (
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): THttpResponse<{ pair: IPair }> => {
    try {
      const baseAsset = await this.assetService.get(baseAssetId, assetType)

      if (!baseAsset) throw new HttpException(404, 'Base Asset not found')

      const quoteAsset = await this.assetService.get(quoteAssetId, assetType)

      if (!quoteAsset) throw new HttpException(404, 'Quote Asset not found')

      const pairExist = await this.pairModel.findOne({
        baseAsset: baseAssetId,
        quoteAsset: quoteAssetId,
        assetType,
      })

      if (pairExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'Pair already exist'
        )

      const pair = await this.pairModel.create({
        assetType,
        baseAsset: baseAsset._id,
        baseAssetObject: baseAsset,
        quoteAsset: quoteAsset._id,
        quoteAssetObject: quoteAsset,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Pair added successfully',
        data: { pair },
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to save new pair, please try again')
    }
  }

  public update = async (
    pairId: ObjectId,
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): THttpResponse<{ pair: IPair }> => {
    try {
      const pairExist = await this.pairModel.findOne({
        $and: [
          { _id: { $ne: pairId } },
          { assetType },
          { baseAsset: baseAssetId },
          { quoteAsset: quoteAssetId },
        ],
      })

      if (pairExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'Pair already exist'
        )

      const baseAsset = await this.assetService.get(baseAssetId, assetType)

      if (!baseAsset) throw new HttpException(404, 'Base Asset not found')

      const quoteAsset = await this.assetService.get(quoteAssetId, assetType)

      if (!quoteAsset) throw new HttpException(404, 'Quote Asset not found')

      const pair = await this.find(pairId)

      pair.assetType = assetType
      pair.baseAsset = baseAsset._id
      pair.baseAssetObject = baseAsset
      pair.quoteAsset = quoteAsset._id
      pair.quoteAssetObject = quoteAsset

      await pair.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Pair updated successfully',
        data: { pair },
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to update pair, please try again')
    }
  }

  public fetchAll = async (): THttpResponse<{ pairs: IPair[] }> => {
    try {
      const pairs = await this.pairModel
        .find()
        .select('-baseAssetObject -quoteAssetObject')
        .populate('baseAsset', 'name symbol logo type isDeleted')
        .populate('quoteAsset', 'name symbol logo type isDeleted')

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Pairs fetch successfully',
        data: { pairs },
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to fetch pair, please try again')
    }
  }
}

export default PairService
