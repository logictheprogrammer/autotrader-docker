import { UserRole } from '@/modules/user/user.enum'
import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'
import { Document, Types } from 'mongoose'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { THttpResponse } from '@/modules/http/http.type'

export interface IActivity extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  user: IUser['_id']
  userObject: IUserObject
  category: ActivityCategory
  message: string
  status: ActivityStatus
  forWho: ActivityForWho
}

export interface IActivityRepositry {}

export interface IActivityService {
  set(
    user: IUserObject,
    forWho: ActivityForWho,
    category: ActivityCategory,
    message: string
  ): Promise<IActivity>

  fetchAll(
    role: UserRole,
    forWho: ActivityForWho,
    userId?: Types.ObjectId
  ): THttpResponse<{ activities: IActivity[] }>

  hide(
    userId: Types.ObjectId,
    activityId: Types.ObjectId,
    forWho: ActivityForWho
  ): THttpResponse<{ activity: IActivity }>

  hideAll(userId: Types.ObjectId, forWho: ActivityForWho): THttpResponse

  delete(
    activityId: Types.ObjectId,
    forWho: ActivityForWho,
    userId?: Types.ObjectId
  ): THttpResponse<{ activity: IActivity }>

  deleteAll(
    allUsers: boolean,
    forWho: ActivityForWho,
    userId: Types.ObjectId
  ): THttpResponse
}
