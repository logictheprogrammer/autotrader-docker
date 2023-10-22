import { Schema, Types, model } from 'mongoose'
import { IActivity } from '@/modules/activity/activity.interface'
import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'

const ActivitySchema = new Schema<IActivity>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(ActivityCategory),
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ActivityStatus),
      default: ActivityStatus.VISIBLE,
      trim: true,
    },
    forWho: {
      type: String,
      required: true,
      enum: Object.values(ActivityForWho),
      trim: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret, options) {
        delete ret.__v
      },
    },
  }
)

const ActivityModel = model<IActivity>('Activity', ActivitySchema)

export default ActivityModel
