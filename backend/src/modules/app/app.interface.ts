import { Router } from 'express'
import { ObjectId } from 'mongoose'

export interface IAppController {
  path: string
  router: Router
}

export interface IAppObject {
  __v: number
  _id: ObjectId
  updatedAt: Date
  createdAt: Date
}
