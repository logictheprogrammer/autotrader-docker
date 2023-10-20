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
    },
    category: {
      type: String,
      required: true,
      enum: Object.values(ActivityCategory),
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ActivityStatus),
      default: ActivityStatus.VISIBLE,
    },
    forWho: {
      type: String,
      required: true,
      enum: Object.values(ActivityForWho),
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IActivity>('Activity', ActivitySchema)
