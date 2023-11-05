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
import { NotFoundError } from '@/core/apiError'
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
    const activity = await this.activityModel.create({
      user,
      category,
      message,
      forWho,
    })

    return activity.populate('user')
  }

  public async fetchAll(
    filter: FilterQuery<IActivity>
  ): Promise<IActivityObject[]> {
    const activities = await this.activityModel.find(filter).populate('user')

    return activities
  }

  public async hide(filter: FilterQuery<IActivity>): Promise<IActivityObject> {
    const activity = await this.activityModel.findOne(filter).populate('user')

    if (!activity) throw new NotFoundError('Activity not found')

    activity.status = ActivityStatus.HIDDEN

    await activity.save()

    return activity
  }

  public async hideAll(filter: FilterQuery<IActivity>): Promise<void> {
    const activities = await this.activityModel.find(filter).populate('user')

    if (!activities.length) throw new NotFoundError('No Activities found')

    for (const activity of activities) {
      activity.status = ActivityStatus.HIDDEN
      await activity.save()
    }
  }

  public async delete(
    filter: FilterQuery<IActivity>
  ): Promise<IActivityObject> {
    const activity = await this.activityModel.findOne(filter).populate('user')
    if (!activity) throw new NotFoundError('Activity not found')

    await this.activityModel.deleteOne({ _id: activity._id })

    return activity
  }

  public async deleteAll(filter: FilterQuery<IActivity>): Promise<void> {
    let activities = await this.activityModel.find(filter).populate('user')

    if (!activities.length) throw new NotFoundError('No Activities found')

    for (const activity of activities) {
      await this.activityModel.deleteOne({ _id: activity._id })
    }
  }
}

export default ActivityService
