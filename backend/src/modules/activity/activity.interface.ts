import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseModelInterface from '@/core/baseModelInterface'
import baseObjectInterface from '@/core/baseObjectInterface'

export interface IActivityObject extends baseObjectInterface {
  user: IUser
  category: ActivityCategory
  message: string
  status: ActivityStatus
  forWho: ActivityForWho
}

// @ts-ignore
export interface IActivity extends baseModelInterface, IActivityObject {}

export interface IActivityService {
  create(
    user: IUserObject,
    forWho: ActivityForWho,
    category: ActivityCategory,
    message: string
  ): Promise<IActivityObject>

  fetchAll(filter: FilterQuery<IActivity>): Promise<IActivityObject[]>

  hide(filter: FilterQuery<IActivity>): Promise<IActivityObject>

  hideAll(filter: FilterQuery<IActivity>): Promise<void>

  delete(filter: FilterQuery<IActivity>): Promise<IActivityObject>

  deleteAll(filter: FilterQuery<IActivity>): Promise<void>
}
