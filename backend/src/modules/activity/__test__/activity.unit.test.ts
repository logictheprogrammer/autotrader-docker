import ActivityModel from '../../../modules/activity/activity.model'
import { request } from '../../../test'
import { userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { ActivityCategory, ActivityForWho } from '../activity.enum'
import { activityService } from '../../../setup'

describe('activity', () => {
  describe('create', () => {
    it('should create an activity to the database', async () => {
      request
      const user = await userModel.create(userAInput)
      const message = 'message'

      const result = await activityService.create(
        user,
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        message
      )

      expect(result.user._id).toEqual(user._id)
      expect(result.category).toEqual(ActivityCategory.PROFILE)
      expect(result.forWho).toEqual(ActivityForWho.USER)
      expect(result.message).toEqual(message)

      const savedActivity = await ActivityModel.count(result).exec()
      expect(savedActivity).toBe(1)
    })
  })
})
