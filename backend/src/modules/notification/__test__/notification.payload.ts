import { depositA_id } from '../../deposit/__test__/deposit.payload'
import { userA_id } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import { NotificationTitle, NotificationForWho } from '../notification.enum'

export const notificationA_id = '2145de5d5b1f5b3a5c1b539a'

export const notificationA = {
  user: userA_id,
  message: 'message here',
  title: NotificationTitle.DEPOSIT_MADE,
  object: depositA_id,
  forWho: NotificationForWho.USER,
  environment: UserEnvironment.LIVE,
}
