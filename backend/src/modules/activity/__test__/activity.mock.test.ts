import AppRepository from '../../app/app.repository'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { ActivityCategory, ActivityForWho } from '../activity.enum'
import { activityService } from '../../../setup'
import { IUser } from '../../user/user.interface'

const userRepository = new AppRepository<IUser>(userModel)

describe('activity', () => {
  describe('set', () => {
    it('should create an activity to the database', async () => {
      request
      const user = await userRepository.create(userA).save()
      const newUser = userRepository.toObject(user)
      const message = 'message'

      const result = await activityService.set(
        newUser,
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        message
      )

      expect(result).toMatchObject({
        user: newUser._id,
        userObject: newUser,
        category: ActivityCategory.PROFILE,
        forWho: ActivityForWho.USER,
        message,
      })
    })
  })
})
