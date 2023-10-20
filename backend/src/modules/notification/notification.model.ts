import { Schema, Types, model } from 'mongoose'
import { INotification } from '@/modules/notification/notification.interface'
import { NotificationCategory } from './notification.enum'
import { UserEnvironment, UserRole } from '../user/user.enum'

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    categoryName: {
      type: String,
      required: true,
      enum: Object.values(NotificationCategory),
    },
    category: {
      type: Types.ObjectId,
      required: true,
    },
    forWho: {
      type: Number,
      required: true,
      enum: Object.values(UserRole),
    },
    status: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      required: true,
      enum: Object.values(UserEnvironment),
    },
  },
  { timestamps: true }
)

export default model<INotification>('Notification', NotificationSchema)
