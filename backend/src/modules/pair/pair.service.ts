import { Inject, Service } from 'typedi'
import { IPair, IPairObject, IPairService } from '@/modules/pair/pair.interface'
import pairModel from '@/modules/pair/pair.model'
import { Types } from 'mongoose'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAssetService } from '../asset/asset.interface'
import { AssetType } from '../asset/asset.enum'

@Service()
class PairService implements IPairService {
  private pairModel = new ServiceQuery<IPair>(pairModel)

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  private find = async (
    pairId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IPair> => {
    const pair = await this.pairModel.findById(pairId, fromAllAccounts, userId)

    if (!pair) throw new HttpException(404, 'Pair not found')

    return pair
  }

  public async get(pairId: Types.ObjectId): Promise<IPairObject | null> {
    try {
      const pair = await this.pairModel.findById(pairId)

      if (!pair) return null

      return pair.toObject()
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to get pair, please try again')
    }
  }

  public async getByBase(baseId: Types.ObjectId): Promise<IPairObject[]> {
    try {
      const pairs = await this.pairModel.find({ baseAsset: baseId })

      const pairsObject = pairs.map((pair) => pair.toObject())

      return pairsObject
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to get pair, please try again')
    }
  }

  public create = async (
    assetType: AssetType,
    baseAssetId: Types.ObjectId,
    quoteAssetId: Types.ObjectId
  ): THttpResponse<{ pair: IPair }> => {
    try {
      const baseAsset = await this.assetService.get(baseAssetId, assetType)

      if (!baseAsset) throw new HttpException(404, 'Base Asset not found')

      const quoteAsset = await this.assetService.get(quoteAssetId, assetType)

      if (!quoteAsset) throw new HttpException(404, 'Quote Asset not found')

      await this.pairModel.ifExist(
        {
          baseAsset: baseAssetId,
          quoteAsset: quoteAssetId,
          assetType,
        },
        'Pair already exist'
      )

      const pair = await this.pairModel.self.create({
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
      throw new ServiceException(
        err,
        'Unable to save new pair, please try again'
      )
    }
  }

  public update = async (
    pairId: Types.ObjectId,
    assetType: AssetType,
    baseAssetId: Types.ObjectId,
    quoteAssetId: Types.ObjectId
  ): THttpResponse<{ pair: IPair }> => {
    try {
      await this.pairModel.ifExist(
        {
          $and: [
            { _id: { $ne: pairId } },
            { assetType },
            { baseAsset: baseAssetId },
            { quoteAsset: quoteAssetId },
          ],
        },
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
      throw new ServiceException(err, 'Unable to update pair, please try again')
    }
  }

  public fetchAll = async (): THttpResponse<{ pairs: IPair[] }> => {
    try {
      const pairs = await this.pairModel
        .find()
        .select('-baseAssetObject -quoteAssetObject')

      await this.pairModel.populate(
        pairs,
        'baseAsset',
        'baseAssetObject',
        'name symbol logo type isDeleted'
      )

      await this.pairModel.populate(
        pairs,
        'quoteAsset',
        'quoteAssetObject',
        'name symbol logo type isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Pairs fetch successfully',
        data: { pairs },
      }
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to fetch pair, please try again')
    }
  }
}

export default PairService
