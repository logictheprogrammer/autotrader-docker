import { Router } from 'express'
import { Types } from 'mongoose'

export interface IServiceController {
  path: string
  router: Router
}

export interface IServiceObject {
  __v: number
  _id: Types.ObjectId
  updatedAt: string
  createdAt: string
}
