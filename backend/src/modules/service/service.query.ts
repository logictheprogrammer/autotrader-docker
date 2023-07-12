import { Query, Types, FilterQuery, Document, Model } from 'mongoose'
import HttpException from '@/modules/http/http.exception'

export default class ServiceQuery<T extends Document> {
  public constructor(readonly self: Model<T>) {}

  public find = (
    payload: FilterQuery<T> = {},
    fromAllAccounts: boolean = true,
    userPayload?: FilterQuery<T>
  ): Query<T[], T> => {
    let query: Query<T[], T>

    if (fromAllAccounts) {
      query = this.self.find(payload) as Query<T[], T>
    } else {
      query = this.self.find({
        ...payload,
        ...userPayload,
      }) as Query<T[], T>
    }

    return query
  }

  public ifExist = async (
    payload: FilterQuery<T>,
    errorMessage: string
  ): Promise<void> => {
    const itExist = await this.self.findOne(payload)
    if (itExist) throw new HttpException(409, errorMessage)
  }

  public findById = (
    modelId: Types.ObjectId | string,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId | string
  ): Query<T, T> | null => {
    if (!Types.ObjectId.isValid(modelId)) return null

    let query: Query<T, T>

    if (fromAllAccounts) {
      query = this.self.findById(modelId) as Query<T, T>
    } else {
      query = this.self.findOne({
        _id: modelId,
        user: userId,
      }) as Query<T, T>
    }

    return query
  }

  public findOne = (
    payload: FilterQuery<T> = {},
    fromAllAccounts: boolean = true,
    userPayload?: FilterQuery<T>
  ): Query<T, T> => {
    let query: Query<T, T>

    if (fromAllAccounts) {
      query = this.self.findOne(payload) as Query<T, T>
    } else {
      query = this.self.findOne({
        ...payload,
        ...userPayload,
      }) as Query<T, T>
    }

    return query
  }

  public async populate(
    arr: T[],
    path: string,
    ref: string,
    select: string
  ): Promise<void> {
    let populating: any = {}
    for (const obj of arr) {
      const populatingId = obj.get(path)
      await obj.populate(path, select)
      if (!obj.get(path)) {
        if (!populating[populatingId]) {
          // @ts-ignore
          const mostRecentObj = await this.findOne({
            [path]: populatingId,
          }).sort({
            createdAt: -1,
          })
          populating[populatingId] = mostRecentObj.get(ref)

          // to pass test
          if (!populating[populatingId]._id) {
            populating[populatingId]._id = mostRecentObj.get(path)
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
