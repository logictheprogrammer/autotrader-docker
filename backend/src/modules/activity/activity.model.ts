import { Schema, Types, model } from 'mongoose'
import { IActivity } from '@/modules/activity/activity.interface'
import { ActivityStatus } from '@/modules/activity/activity.enum'

const ActivitySchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: ActivityStatus.VISIBLE,
    },
    forWho: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userObject: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
)

export default model<IActivity>('Activity', ActivitySchema)
