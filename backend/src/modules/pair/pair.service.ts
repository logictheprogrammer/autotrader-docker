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
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'
import assetModel from '../asset/asset.model'

@Service()
class PairService implements IPairService {
  private pairRepository = new AppRepository<IPair>(pairModel)
  private assetRepository = new AppRepository<IAsset>(assetModel)

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  private find = async (
    pairId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IPair> => {
    const pair = await this.pairRepository
      .findById(pairId, fromAllAccounts, userId)
      .collect()

    if (!pair) throw new HttpException(404, 'Pair not found')

    return pair
  }

  public async get(pairId: AppObjectId): Promise<IPairObject | null> {
    try {
      const pair = await this.pairRepository.findById(pairId).collect()

      if (!pair) return null

      return this.pairRepository.toObject(pair)
    } catch (err: any) {
      throw new AppException(err, 'Unable to get pair, please try again')
    }
  }

  public async getByBase(baseId: AppObjectId): Promise<IPairObject[]> {
    try {
      const pairs = await this.pairRepository
        .find({ baseAsset: baseId })
        .collectAll()

      const pairsObject = pairs.map((pair) =>
        this.pairRepository.toObject(pair)
      )

      return pairsObject
    } catch (err: any) {
      throw new AppException(err, 'Unable to get pair, please try again')
    }
  }

  public create = async (
    assetType: AssetType,
    baseAssetId: AppObjectId,
    quoteAssetId: AppObjectId
  ): THttpResponse<{ pair: IPair }> => {
    try {
      const baseAsset = await this.assetService.get(baseAssetId, assetType)

      if (!baseAsset) throw new HttpException(404, 'Base Asset not found')

      const quoteAsset = await this.assetService.get(quoteAssetId, assetType)

      if (!quoteAsset) throw new HttpException(404, 'Quote Asset not found')

      await this.pairRepository.ifExist(
        {
          baseAsset: baseAssetId,
          quoteAsset: quoteAssetId,
          assetType,
        },
        'Pair already exist'
      )

      const pair = await this.pairRepository
        .create({
          assetType,
          baseAsset: baseAsset._id,
          baseAssetObject: baseAsset,
          quoteAsset: quoteAsset._id,
          quoteAssetObject: quoteAsset,
        })
        .save()

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
    pairId: AppObjectId,
    assetType: AssetType,
    baseAssetId: AppObjectId,
    quoteAssetId: AppObjectId
  ): THttpResponse<{ pair: IPair }> => {
    try {
      await this.pairRepository.ifExist(
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
      throw new AppException(err, 'Unable to update pair, please try again')
    }
  }

  public fetchAll = async (): THttpResponse<{ pairs: IPair[] }> => {
    try {
      const pairs = await this.pairRepository
        .find()
        .select('-baseAssetObject -quoteAssetObject')
        .collectAll()

      await this.pairRepository.populateAll(
        pairs,
        'baseAsset',
        'baseAssetObject',
        'name symbol logo type isDeleted',
        this.assetRepository
      )

      await this.pairRepository.populateAll(
        pairs,
        'quoteAsset',
        'quoteAssetObject',
        'name symbol logo type isDeleted',
        this.assetRepository
      )

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
