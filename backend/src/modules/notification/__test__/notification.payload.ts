import notificationModel from '../../../modules/notification/notification.model'
import { INotification } from '../../../modules/notification/notification.interface'
import { depositA, depositA_id } from '../../deposit/__test__/deposit.payload'
import { DepositStatus } from '../../deposit/deposit.enum'
import { userA, userA_id } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import { NotificationCategory, NotificationForWho } from '../notification.enum'

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
