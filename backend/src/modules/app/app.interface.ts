import { Query, Types, FilterQuery, Document, Model } from 'mongoose'
import { Router } from 'express'
import AppObjectId from './app.objectId'

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
