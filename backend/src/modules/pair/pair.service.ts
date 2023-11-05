import { Inject, Service } from 'typedi'
import { IPair, IPairObject, IPairService } from '@/modules/pair/pair.interface'
import { IAssetService } from '../asset/asset.interface'
import { AssetType } from '../asset/asset.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import { NotFoundError, RequestConflictError } from '@/core/apiError'
import PairModel from '@/modules/pair/pair.model'

@Service()
class PairService implements IPairService {
  private pairModel = PairModel

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  public async fetch(query: FilterQuery<IPair>): Promise<IPairObject> {
    const pair = await this.pairModel
      .findOne(query)
      .populate('baseAsset')
      .populate('quoteAsset')

    if (!pair) throw new NotFoundError('Pair not found')

    return pair
  }

  public async create(
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): Promise<IPairObject> {
    const baseAsset = await this.assetService.fetch({
      _id: baseAssetId,
      type: assetType,
    })

    if (!baseAsset) throw new NotFoundError('Base Asset not found')

    if (baseAssetId.toString() === quoteAssetId.toString())
      throw new RequestConflictError('Base and quote assets can not be thesame')

    const quoteAsset = await this.assetService.fetch({
      _id: quoteAssetId,
      type: assetType,
    })

    if (!quoteAsset) throw new NotFoundError('Quote Asset not found')

    const pairExist = await this.pairModel.findOne({
      baseAsset,
      quoteAsset,
      assetType,
    })

    if (pairExist) throw new RequestConflictError('Pair already exist')

    const pair = await this.pairModel.create({
      assetType,
      baseAsset,
      quoteAsset,
    })

    await pair.populate('baseAsset')
    await pair.populate('quoteAsset')

    return pair
  }

  public async update(
    filter: FilterQuery<IPair>,
    assetType: AssetType,
    baseAssetId: ObjectId,
    quoteAssetId: ObjectId
  ): Promise<IPairObject> {
    const pair = await this.pairModel.findOne(filter)

    if (!pair) throw new NotFoundError('Pair not found')

    const pairExist = await this.pairModel.findOne({
      $and: [
        { _id: { $ne: pair._id } },
        { assetType },
        { baseAsset: baseAssetId },
        { quoteAsset: quoteAssetId },
      ],
    })

    if (pairExist) throw new RequestConflictError('Pair already exist')

    const baseAsset = await this.assetService.fetch({
      _id: baseAssetId,
      type: assetType,
    })

    if (!baseAsset) throw new NotFoundError('Base Asset not found')

    const quoteAsset = await this.assetService.fetch({
      _id: quoteAssetId,
      type: assetType,
    })

    if (!quoteAsset) throw new NotFoundError('Quote Asset not found')

    pair.assetType = assetType
    pair.baseAsset = baseAsset
    pair.quoteAsset = quoteAsset

    await pair.save()

    return pair
  }

  public async fetchAll(query: FilterQuery<IPair>): Promise<IPairObject[]> {
    return await this.pairModel
      .find(query)
      .populate('baseAsset')
      .populate('quoteAsset')
  }
}

export default PairService
