import { Query, Types, FilterQuery, Document, Model } from 'mongoose'
import { Router } from 'express'

export interface IAppController {
  path: string
  router: Router
}

export interface IAppObject {
  __v: number
  _id: Types.ObjectId
  updatedAt: Date
  createdAt: Date
}
