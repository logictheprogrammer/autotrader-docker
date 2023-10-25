import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'
import { Service } from 'typedi'
import {
  IActivity,
  IActivityObject,
  IActivityService,
} from '@/modules/activity/activity.interface'
import { IUserObject } from '@/modules/user/user.interface'
import { FilterQuery } from 'mongoose'
import { NotFoundError, ServiceError } from '@/core/apiError'
import ActivityModel from './activity.model'

@Service()
class ActivityService implements IActivityService {
  private activityModel = ActivityModel

  public async create(
    user: IUserObject,
    forWho: ActivityForWho,
    category: ActivityCategory,
    message: string
  ): Promise<IActivityObject> {
    try {
      const activity = await this.activityModel.create({
        user,
        category,
        message,
        forWho,
      })

      return activity.populate('user')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to register activity, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<IActivity>
  ): Promise<IActivityObject[]> {
    try {
      const activities = await this.activityModel.find(filter).populate('user')

      return activities
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch activities, please try again'
      )
    }
  }

  public async hide(filter: FilterQuery<IActivity>): Promise<IActivityObject> {
    try {
      const activity = await this.activityModel.findOne(filter).populate('user')

      if (!activity) throw new NotFoundError('Activity not found')

      activity.status = ActivityStatus.HIDDEN

      await activity.save()

      return activity
    } catch (err: any) {
      throw new ServiceError(err, 'Failed to delete, please try again')
    }
  }

  public async hideAll(filter: FilterQuery<IActivity>): Promise<void> {
    try {
      const activities = await this.activityModel.find(filter).populate('user')

      if (!activities.length) throw new NotFoundError('No Activities found')

      for (const activity of activities) {
        activity.status = ActivityStatus.HIDDEN
        await activity.save()
      }
    } catch (err: any) {
      throw new ServiceError(err, 'Failed to delete, please try again')
    }
  }

  public async delete(
    filter: FilterQuery<IActivity>
  ): Promise<IActivityObject> {
    try {
      const activity = await this.activityModel.findOne(filter).populate('user')
      if (!activity) throw new NotFoundError('Activity not found')

      await this.activityModel.deleteOne({ _id: activity._id })

      return activity
    } catch (err: any) {
      throw new ServiceError(err, 'Failed to delete, please try again')
    }
  }

  public async deleteAll(filter: FilterQuery<IActivity>): Promise<void> {
    try {
      let activities = await this.activityModel.find(filter).populate('user')

      if (!activities.length) throw new NotFoundError('No Activities found')

      for (const activity of activities) {
        await this.activityModel.deleteOne({ _id: activity._id })
      }
    } catch (err: any) {
      throw new ServiceError(err, 'Failed to delete, please try again')
    }
  }
}

export default ActivityService
