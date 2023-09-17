import notificationModel from '../../../modules/notification/notification.model'
import { INotification } from '../../../modules/notification/notification.interface'
import { depositA, depositA_id } from '../../deposit/__test__/deposit.payload'
import { DepositStatus } from '../../deposit/deposit.enum'
import { userA, userA_id } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import { NotificationCategory, NotificationForWho } from '../notification.enum'

// @ts-ignore
export const notificationModelReturn: INotification = {
  save: jest.fn(),
  _id: 'notification id',
  // @ts-ignore
  collection: {
    name: 'notification',
  },
}

// @ts-ignore
export const notificationModelReturnFailed: INotification = {
  save: jest.fn().mockImplementation(() => {
    throw new Error('Saving error')
  }),
  _id: 'notification id',
  // @ts-ignore
  collection: {
    name: 'notification',
  },
}

export const notificationA_id = '2145de5d5b1f5b3a5c1b539a'

export const notificationA = {
  user: userA_id,
  userObject: userA,
  message: 'message here',
  categoryName: NotificationCategory.DEPOSIT,
  category: depositA_id,
  categoryObject: depositA,
  forWho: NotificationForWho.USER,
  status: DepositStatus.APPROVED,
  environment: UserEnvironment.LIVE,
}

export const notificationInstance = {
  model: notificationModelReturn,
  onFailed: 'delete notification',
  async callback() {},
}

export const notificationInstanceFailedSave = {
  model: notificationModelReturnFailed,
  onFailed: 'delete notification',
  async callback() {},
}
