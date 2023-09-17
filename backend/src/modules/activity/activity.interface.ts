import { UserRole } from '@/modules/user/user.enum'
import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { ObjectId } from 'mongoose'

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
    userId?: ObjectId
  ): THttpResponse<{ activities: IActivity[] }>

  hide(
    userId: ObjectId,
    activityId: ObjectId,
    forWho: ActivityForWho
  ): THttpResponse<{ activity: IActivity }>

  hideAll(userId: ObjectId, forWho: ActivityForWho): THttpResponse

  delete(
    activityId: ObjectId,
    forWho: ActivityForWho,
    userId?: ObjectId
  ): THttpResponse<{ activity: IActivity }>

  deleteAll(
    allUsers: boolean,
    forWho: ActivityForWho,
    userId: ObjectId
  ): THttpResponse
}
