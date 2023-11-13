import { RequestHandler, Router } from 'express'
import { ObjectId } from 'mongoose'

export interface IController {
  path: string
  router: Router
  routes: IControllerRoute[]
}

export interface IAppObject {
  __v: number
  _id: ObjectId
  updatedAt: Date
  createdAt: Date
}

type httpMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'

export type IControllerRoute = [httpMethod, string, ...RequestHandler[]]
