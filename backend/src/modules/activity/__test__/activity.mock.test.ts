import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { ActivityCategory, ActivityForWho } from '../activity.enum'
import { activityService } from '../../../setup'

describe('activity', () => {
  describe('set', () => {
    it('should create an activity to the database', async () => {
      request
      const user = await userModel.create(userA)
      const message = 'message'

      const result = await activityService.set(
        user.toObject(),
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        message
      )

      expect(result).toMatchObject({
        user: user._id,
        userObject: user.toObject(),
        category: ActivityCategory.PROFILE,
        forWho: ActivityForWho.USER,
        message,
      })
    })
  })
})
