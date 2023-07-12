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
import { IUser, IUserObject } from '@/modules/user/user.interface'
import ServiceQuery from '@/modules/service/service.query'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import { Types } from 'mongoose'

@Service()
class ActivityService implements IActivityService {
  private activityModel = new ServiceQuery<IActivity>(activityModel)

  private async find(
    activityId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<IActivity> {
    const activity = await this.activityModel.findById(
      activityId,
      fromAllAccounts,
      userId
    )

    if (!activity) throw new HttpException(404, 'Activity not found')

    return activity
  }

  public async set(
    user: IUserObject,
    forWho: ActivityForWho,
    category: ActivityCategory,
    message: string
  ): Promise<IActivity> {
    try {
      const activity = await this.activityModel.self.create({
        user: user._id,
        userObject: user,
        category,
        message,
        forWho,
      })

      return activity
    } catch (err: any) {
      throw new ServiceException(
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
        activities = await this.activityModel
          .find({
            user: userId,
            forWho,
          })
          .select('-userObject')
      } else if (accessBy >= UserRole.ADMIN && !userId) {
        activities = await this.activityModel
          .find({ forWho })
          .select('-userObject')
      } else {
        activities = await this.activityModel
          .find({
            user: userId,
            forWho,
            status: ActivityStatus.VISIBLE,
          })
          .select('-userObject')
      }

      await this.activityModel.populate(
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
      throw new ServiceException(
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
      const activity = await this.activityModel.findOne({
        _id: activityId,
        user: userId,
        status: ActivityStatus.VISIBLE,
        forWho,
      })

      if (!activity) throw new HttpException(404, 'Activity not found')

      activity.status = ActivityStatus.HIDDEN

      await activity.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activity log deleted successfully',
        data: { activity },
      }
    } catch (err: any) {
      throw new ServiceException(
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
      const activities = await this.activityModel.find({
        user: userId,
        status: ActivityStatus.VISIBLE,
        forWho,
      })

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
      throw new ServiceException(
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
        activity = await this.activityModel.findOne({
          _id: activityId,
          forWho,
          user: userId,
        })
      } else {
        activity = await this.activityModel.findOne({
          _id: activityId,
          forWho,
        })
      }

      if (!activity) throw new HttpException(404, 'Activity not found')

      await activity.deleteOne()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activity log deleted successfully',
        data: { activity },
      }
    } catch (err: any) {
      throw new ServiceException(
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
        activities = await this.activityModel.find({ forWho })
      } else {
        activities = await this.activityModel.find({ forWho, user: userId })
      }

      if (!activities.length) throw new HttpException(404, 'No Activity found')

      for (const activity of activities) {
        await activity.deleteOne()
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Activity logs deleted successfully',
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to delete activities log, please try again'
      )
    }
  }
}

export default ActivityService
