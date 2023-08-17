import { UserRole } from '@/modules/user/user.enum'
import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'
import { Service } from 'typedi'
import {
  IActivity,
  IActivityService,
} from '@/modules/activity/activity.interface'
import activityModel from '@/modules/activity/activity.model'
import { IUserObject } from '@/modules/user/user.interface'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import { Types } from 'mongoose'
import AppRepository from '@/modules/app/app.repository'

@Service()
class ActivityService implements IActivityService {
  private activityRepository = new AppRepository<IActivity>(activityModel)

  public async set(
    user: IUserObject,
    forWho: ActivityForWho,
    category: ActivityCategory,
    message: string
  ): Promise<IActivity> {
    try {
      const activity = await this.activityRepository
        .create({
          user: user._id,
          userObject: user,
          category,
          message,
          forWho,
        })
        .save()

      return activity
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to register activity, please try again'
      )
    }
  }

  public fetchAll = async (
    accessBy: UserRole,
    forWho: ActivityForWho,
    userId?: Types.ObjectId
  ): THttpResponse<{ activities: IActivity[] }> => {
    try {
      let activities

      if (accessBy >= UserRole.ADMIN && userId) {
        activities = await this.activityRepository
          .find({
            user: userId,
            forWho,
          })
          .select('-userObject')
          .collectAll()
      } else if (accessBy >= UserRole.ADMIN && !userId) {
        activities = await this.activityRepository
          .find({ forWho })
          .select('-userObject')
          .collectAll()
      } else {
        activities = await this.activityRepository
          .find({
            user: userId,
            forWho,
            status: ActivityStatus.VISIBLE,
          })
          .select('-userObject')
          .collectAll()
      }

      await this.activityRepository.populate(
        activities,
        'user',
        'userObject',
        'username isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activities fetched successfully',
        data: { activities },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch activities, please try again'
      )
    }
  }

  public hide = async (
    userId: Types.ObjectId,
    activityId: Types.ObjectId,
    forWho: ActivityForWho
  ): THttpResponse<{ activity: IActivity }> => {
    try {
      const activity = await this.activityRepository
        .findOne({
          _id: activityId,
          user: userId,
          status: ActivityStatus.VISIBLE,
          forWho,
        })
        .collect()

      if (!activity) throw new HttpException(404, 'Activity not found')

      activity.status = ActivityStatus.HIDDEN

      await activity.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activity log deleted successfully',
        data: { activity },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete activity log, please try again'
      )
    }
  }

  public hideAll = async (
    userId: Types.ObjectId,
    forWho: ActivityForWho
  ): THttpResponse => {
    try {
      const activities = await this.activityRepository
        .find({
          user: userId,
          status: ActivityStatus.VISIBLE,
          forWho,
        })
        .collectAll()

      if (!activities.length)
        throw new HttpException(404, 'No Activity log found')

      for (const activity of activities) {
        activity.status = ActivityStatus.HIDDEN
        await activity.save()
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activity logs deleted successfully',
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete activity logs, please try again'
      )
    }
  }

  public delete = async (
    activityId: Types.ObjectId,
    forWho: ActivityForWho,
    userId?: Types.ObjectId
  ): THttpResponse<{ activity: IActivity }> => {
    try {
      let activity

      if (userId) {
        activity = await this.activityRepository
          .findOne({
            _id: activityId,
            forWho,
            user: userId,
          })
          .collect()
      } else {
        activity = await this.activityRepository
          .findOne({
            _id: activityId,
            forWho,
          })
          .collect()
      }

      if (!activity) throw new HttpException(404, 'Activity not found')

      await this.activityRepository.deleteOne({ _id: activity._id })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activity log deleted successfully',
        data: { activity },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete activities log, please try again'
      )
    }
  }

  public deleteAll = async (
    fromAllAccounts: boolean,
    forWho: ActivityForWho,
    userId?: Types.ObjectId
  ): THttpResponse => {
    try {
      let activities

      if (fromAllAccounts) {
        activities = await this.activityRepository.find({ forWho }).collectAll()
      } else {
        activities = await this.activityRepository
          .find({ forWho, user: userId })
          .collectAll()
      }

      if (!activities.length) throw new HttpException(404, 'No Activity found')

      for (const activity of activities) {
        await this.activityRepository.deleteOne({ _id: activity._id })
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activity logs deleted successfully',
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete activities log, please try again'
      )
    }
  }
}

export default ActivityService
