import { RequestHandler, Router } from 'express'
import { ObjectId } from 'mongoose'

export interface IController {
  path: string
  router: Router
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

type path = string

export type IRoute = [httpMethod, path, ...RequestHandler[]]
