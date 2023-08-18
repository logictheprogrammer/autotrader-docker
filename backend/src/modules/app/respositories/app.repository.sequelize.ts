import HttpException from '@/modules/http/http.exception'
import AppObjectId from '@/modules/app/ObjectIds/app.ObjectId.sequelize'
import AppDocument from '@/modules/app/Documents/app.document.sequelize'
import { IAppRepository, SortOrder } from '@/modules/app/app.interface'
import { ModelCtor } from 'sequelize-typescript'
import {
  Attributes,
  BuildOptions,
  CreationAttributes,
  FindAttributeOptions,
  FindOptions,
  Op,
  Order,
  UpdateOptions,
  WhereAttributeHashValue,
  WhereOptions,
} from 'sequelize'
import { Col, Fn, Literal } from 'sequelize/types/utils'

type MergeType<A, B> = Omit<A, keyof B> & B

export default class AppRepository<T extends AppDocument<any, any>>
  implements IAppRepository
{
  private query: FindOptions<Attributes<T>> = {}

  private queryAll: FindOptions<Attributes<T>> = {}

  private createNew: null | T = null

  public collection = {
    name: this.self.tableName,
  }

  public constructor(private self: ModelCtor<T>) {}

  public create(record: CreationAttributes<T>, options?: BuildOptions): this {
    this.createNew = this.self.build(record)

    return this
  }

  public findOne = (
    payload: WhereOptions<Attributes<T>> = {},
    fromAllAccounts: boolean = true,
    userPayload?: WhereOptions<Attributes<T>>
  ): this => {
    if (fromAllAccounts) {
      this.query.where = payload
    } else {
      this.query.where = { ...payload, ...userPayload }
    }

    return this
  }

  public find = (
    payload: WhereOptions<Attributes<T>> = {},
    fromAllAccounts: boolean = true,
    userPayload?: WhereOptions<Attributes<T>>
  ): this => {
    if (fromAllAccounts) {
      this.queryAll.where = payload
    } else {
      this.queryAll.where = { ...payload, ...userPayload }
    }

    return this
  }

  public ifExist = async (
    payload: WhereOptions<Attributes<T>>,
    errorMessage: string
  ): Promise<void> => {
    const itExist = await this.self.findOne({ where: payload })
    if (itExist) throw new HttpException(409, errorMessage)
  }

  public findById = (
    modelId: AppObjectId | string,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId | string
  ): this => {
    if (!AppObjectId.isValid(modelId)) return this

    if (fromAllAccounts) {
      this.query.where = {
        _id: modelId as unknown as WhereAttributeHashValue<
          Attributes<T>[string]
        >,
      } as WhereOptions<Attributes<T>>
    } else {
      this.query.where = {
        _id: modelId,
        user: userId as any,
      } as WhereOptions<Attributes<T>>
    }

    return this
  }

  public sort(
    arg?:
      | {
          [key: string]: SortOrder
        }
      | [string, SortOrder][]
      | null
      | undefined
  ): this {
    let order: Order | undefined

    if (arg && Array.isArray(arg)) {
      const arrArgs = arg as [string, SortOrder][]
      order = arrArgs.map((arr) => [arr[0], arr[1] > 0 ? 'ASC' : 'DESC'])
    } else if (arg && typeof arg === 'object') {
      const objArgs = arg as {
        [key: string]: SortOrder
      }

      order = Object.entries(objArgs).map((arr) => [
        arr[0],
        arr[1] > 0 ? 'ASC' : 'DESC',
      ])
    }

    this.queryAll.order = order
    return this
  }

  public select(arg: string | string[]): this {
    let select: FindAttributeOptions = { include: [], exclude: [] }

    if (!Array.isArray(arg)) {
      const strArg = arg as string

      if (strArg[0] === '-') {
        select.exclude = [strArg.slice(1)]
      } else {
        select = [strArg]
      }
    } else {
      const arrArg = arg as string[]

      if (arrArg[0][0] === '-') {
        select.exclude = arrArg.map((value) => value.slice(1))
      } else {
        select = arrArg
      }
    }

    this.queryAll.attributes = select
    this.query.attributes = select

    return this
  }

  public async collect(): Promise<T | null> {
    const result = await this.self.findOne(this.query)
    this.query = {}
    return result
  }

  public async collectAll(): Promise<T[]> {
    const result = await this.self.findAll(this.queryAll)
    this.queryAll = {}
    return result
  }

  public async updateOne(
    filter: WhereOptions<Attributes<T>> | {} | undefined,
    update: {
      [key in keyof Attributes<T>]?:
        | Col
        | Fn
        | Literal
        | Attributes<T>[key]
        | undefined
    },
    options?: {} | null | undefined
  ): Promise<{}> {
    const filterOptions = {
      where: filter,
    } as Omit<UpdateOptions<Attributes<T>>, 'returning'>

    await this.self.update(update, filterOptions)
    return (await this.find(filter).collect()) as T
  }

  public async findByIdAndDelete(
    id: any,
    options?: {} | null | undefined
  ): Promise<T | null> {
    const filterOptions = {
      where: {
        id,
      },
    } as Omit<UpdateOptions<Attributes<T>>, 'returning'>

    const deletedRow = await this.find({ _id: id }).collect()

    await this.self.destroy(filterOptions)

    return deletedRow
  }

  public async deleteOne(
    filter: WhereOptions<Attributes<T>> | {} | undefined,
    options?: {} | null | undefined
  ): Promise<{}> {
    const deletedRow = (await this.find(filter).collect()) as T & {
      _id: any
    }

    if (deletedRow) await this.self.destroy({ where: { _id: deletedRow._id } })

    return deletedRow
  }

  public async deleteMany(
    filter: WhereOptions<Attributes<T>> | {} | undefined,
    options?: {} | null | undefined
  ): Promise<{}> {
    const filterOptions = {
      where: filter,
    } as Omit<UpdateOptions<Attributes<T>>, 'returning'>

    return await this.self.destroy(filterOptions)
  }

  public async count(
    filter?: WhereOptions<Attributes<T>> | {} | undefined
  ): Promise<number> {
    const result = await this.self.count({
      where: filter,
    })

    return result
  }

  public collectRaw(): T {
    if (!this.createNew) throw new Error('createNew payload not found')
    return this.createNew
  }

  public collectUnsaved(): T & { _id: AppObjectId } {
    if (!this.createNew) throw new Error('createNew payload not found')
    return this.createNew.toJSON()
  }

  public toClass(instance: T): this {
    this.createNew = instance
    return this
  }

  public async save(instance?: T): Promise<T> {
    if (instance) {
      return (await instance.save()) as T
    }
    if (!this.createNew) {
      throw new Error('createNew payload is empty')
    }
    return (await this.createNew.save()) as T
  }

  public toObject(instance: T): T & { _id: AppObjectId } {
    return instance.toJSON()
  }

  public async populate(
    instance: T,
    path: string,
    select: string,
    refInstance: ModelCtor<any>
  ) {
    let selected: {}

    const _id: string = instance.getDataValue(path)

    if (!select) {
      selected = await refInstance.findByPk(_id)
    } else {
      const filterOption = [...select.split(' '), '_id']
      selected = await refInstance.findByPk(_id, {
        attributes: filterOption,
      })
    }

    instance.setDataValue(path, selected)
  }

  public async populateAll(
    arr: T[],
    path: string,
    ref: string,
    select: string,
    refInstance: ModelCtor<any>
  ): Promise<void> {
    let populating: any = {}
    for (const obj of arr) {
      const populatingId = obj.get(path) as string
      await this.populate(obj, path, select, refInstance)

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
