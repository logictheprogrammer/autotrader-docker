import {
  Query,
  FilterQuery,
  Model,
  IfAny,
  Require_id,
  AnyKeys,
  QueryOptions,
  UpdateWithAggregationPipeline,
  UpdateQuery,
  MergeType,
} from 'mongoose'
import HttpException from '@/modules/http/http.exception'
import AppObjectId from '@/modules/app/ObjectIds/app.ObjectId.mongoose'
import AppDocument from '@/modules/app/Documents/app.document.mongoose'
import { IAppRepository, SortOrder } from '@/modules/app/app.interface'

export default class AppRepository<T extends AppDocument>
  implements IAppRepository
{
  private query: null | Query<T, T> = null
  private queryAll: null | Query<T[], T> = null
  private createNew:
    | null
    | T
    | IfAny<T, any, AppDocument<unknown, {}, T> & Omit<Require_id<T>, never>> =
    null

  public collection = {
    name: this.self.collection.name,
  }

  public constructor(private self: Model<T>) {}

  public create(docs: T | AnyKeys<T>): this {
    this.createNew = new this.self(docs)
    return this
  }

  public find = (
    payload: FilterQuery<T> = {},
    fromAllAccounts: boolean = true,
    userPayload?: FilterQuery<T>
  ): this => {
    if (fromAllAccounts) {
      this.queryAll = this.self.find(payload) as Query<T[], T>
    } else {
      this.queryAll = this.self.find({
        ...payload,
        ...userPayload,
      }) as Query<T[], T>
    }

    return this
  }

  public ifExist = async (
    payload: FilterQuery<T>,
    errorMessage: string
  ): Promise<void> => {
    const itExist = await this.self.findOne(payload)
    if (itExist) throw new HttpException(409, errorMessage)
  }

  public findById = (
    modelId: AppObjectId | string,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId | string
  ): this => {
    if (!AppObjectId.isValid(modelId)) return this

    if (fromAllAccounts) {
      this.query = this.self.findById(modelId) as Query<T, T>
    } else {
      this.query = this.self.findOne({
        _id: modelId,
        user: userId,
      }) as Query<T, T>
    }

    return this
  }

  public findOne = (
    payload: FilterQuery<T> = {},
    fromAllAccounts: boolean = true,
    userPayload?: FilterQuery<T>
  ): this => {
    if (fromAllAccounts) {
      this.query = this.self.findOne(payload) as Query<T, T>
    } else {
      this.query = this.self.findOne({
        ...payload,
        ...userPayload,
      }) as Query<T, T>
    }

    return this
  }

  public sort(
    arg?:
      | {
          [key: string]:
            | SortOrder
            | {
                $meta: 'textScore'
              }
        }
      | [string, SortOrder][]
      | null
      | undefined
  ): this {
    this.query?.sort(arg)
    return this
  }

  public select(arg: string | string[]): this {
    this.queryAll?.select(arg)
    return this
  }

  public collect(): Promise<T> | undefined {
    const result = this.query?.exec()
    this.query = null
    return result
  }

  public collectAll(): Promise<T[]> {
    const result = this.queryAll?.exec()
    if (!result) throw Error('queryAll not available')
    this.queryAll = null
    return result
  }

  public async updateOne(
    filter: FilterQuery<T> | undefined,
    update: UpdateWithAggregationPipeline | UpdateQuery<T> | undefined,
    options?: QueryOptions<T> | null | undefined
  ): Promise<{}> {
    return await this.self.updateOne(filter, update, options)
  }

  public async findByIdAndDelete(
    id: any,
    options?: QueryOptions<T> | null | undefined
  ): Promise<T | null> {
    return await this.self.findByIdAndDelete(id, options)
  }

  public async deleteOne(
    filter?: FilterQuery<T> | undefined,
    options?: QueryOptions<T> | undefined
  ): Promise<{}> {
    if (this.query) return await this.query.deleteOne()
    return await this.self.deleteOne(filter, options)
  }

  public async deleteMany(
    filter?: FilterQuery<T> | undefined,
    options?: QueryOptions<T> | undefined
  ): Promise<{}> {
    if (this.queryAll) return await this.queryAll.deleteMany()
    return await this.self.deleteMany(filter, options)
  }

  public async count(filter?: FilterQuery<T> | undefined): Promise<number> {
    return this.self.count(filter).exec()
  }

  public collectRaw(): T {
    if (!this.createNew) throw new Error('createNew payload not found')
    return this.createNew
  }

  public collectUnsaved(): T & { _id: AppObjectId } {
    if (!this.createNew) throw new Error('createNew payload not found')
    return this.createNew.toObject({
      getters: true,
    })
  }

  public toClass(instance: T): this {
    this.createNew = instance
    return this
  }

  public async save(instance?: T): Promise<T> {
    if (instance) return await instance.save()
    if (!this.createNew) throw new Error('createNew payload is empty')
    return await this.createNew.save()
  }

  public toObject(instance: T): T & { _id: AppObjectId } {
    return instance.toObject({ getters: true })
  }

  public async populate<Paths = {}>(
    instance: T,
    path: string,
    select: string,
    refInstance: any
  ) {
    await instance.populate(path, select)
  }

  public async populateAll(
    instanceArr: T[],
    path: string,
    ref: string,
    select: string,
    refInstance: any
  ): Promise<void> {
    let populating: any = {}
    for (const obj of instanceArr) {
      const populatingId = obj.get(path)
      await obj.populate(path, select)
      if (!obj.get(path)) {
        if (!populating[populatingId]) {
          // @ts-ignore
          const mostRecentObj = await this.findOne({
            [path]: populatingId,
          })
            .sort({
              createdAt: -1,
            })
            .collect()
          populating[populatingId] = mostRecentObj?.get(ref)

          // to pass test
          if (!populating[populatingId]._id) {
            populating[populatingId]._id = mostRecentObj?.get(path)
          }
        }
        const recentPopulating: any = {}

        select.split(' ').forEach((field) => {
          recentPopulating[field] = populating[populatingId][field]
        })
        recentPopulating.isDeleted = true
        recentPopulating._id = populating[populatingId]._id

        obj.set(path, recentPopulating)
      }
    }
  }
}
