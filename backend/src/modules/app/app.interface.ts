import { Router } from 'express'
import AppObjectId from './app.objectId'
import { MergeType } from 'mongoose'

export type SortOrder = -1 | 1

export interface IAppController {
  path: string
  router: Router
}

export interface IAppObject {
  __v: number
  _id: AppObjectId
  updatedAt: Date
  createdAt: Date
}

export interface IAppRepository {
  collection: {
    name: string
  }

  create(docs: any): this

  find(payload: {}, fromAllAccounts: boolean, userPayload?: {}): this

  ifExist(payload: {}, errorMessage: string): Promise<void> | void

  findById(
    modelId: AppObjectId | string,
    fromAllAccounts: boolean,
    userId?: AppObjectId | string
  ): this

  findOne(payload: {}, fromAllAccounts: boolean, userPayload?: {}): this

  sort(
    arg?:
      | {
          [key: string]: SortOrder
        }
      | [string, SortOrder][]
      | null
      | undefined
  ): this

  select(arg: string | string[]): this

  collect():
    | Promise<{}>
    | Promise<{} | null>
    | undefined
    | null
    | Promise<undefined>
    | Promise<null>

  collectAll(): Promise<{}[]>

  updateOne(
    filter: {} | undefined,
    update: {} | undefined,
    options?: {} | null | undefined
  ): Promise<{}>

  findByIdAndDelete(
    id: any,
    options?: {} | null | undefined
  ): Promise<{} | null>

  deleteOne(filter?: {} | undefined, options?: {} | undefined): Promise<{}>

  deleteMany(filter?: {} | undefined, options?: {} | undefined): Promise<{}>

  count(filter?: {} | undefined): Promise<number>

  collectRaw(): {}

  collectUnsaved(): {} & { _id: AppObjectId }

  toClass(instance: {}): this

  save(instance?: {}): Promise<{}>

  toObject(instance: {}): {} & { _id: AppObjectId }

  populate<Paths = {}>(
    instance: {},
    path: string,
    select?: string,
    refInstance?: any
  ): void

  populateAll(
    instanceArr: {}[],
    path: string,
    ref: string,
    select: string,
    refInstance?: any
  ): Promise<void>
}
