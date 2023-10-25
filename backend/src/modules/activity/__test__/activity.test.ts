import Helpers from '../../../utils/helpers'
import { StatusCode } from './../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import activityModel from '../../../modules/activity/activity.model'
import { request } from '../../../test'
import {
  adminBInput,
  userAInput,
  userA_id,
  userB_id,
  userC_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '../activity.enum'
import { Types } from 'mongoose'

describe('Activity', () => {
  const baseUrl = '/api/activity/'
  const adminUrl = '/api/master/activity/'
  describe('get activity logs', () => {
    const url = baseUrl
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(body.status).toBe(StatusCode.DANGER)
        expect(statusCode).toBe(401)
      })
    })
    describe('given user exist', () => {
      it('should return a 200 and an empty array of logged in user visible activity logs', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')
        expect(body.data).toEqual({ activities: [] })
      })

      it('should return a 200 and an array of logged in user visible activity logs', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
          status: ActivityStatus.HIDDEN,
        })

        const userActivity = await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data.activities.length).toBe(1)
        expect(body.data.activities[0].category).toBe(userActivity.category)
        expect(body.data.activities[0].message).toBe(userActivity.message)
        expect(body.data.activities[0].forWho).toBe(userActivity.forWho)
        expect(body.data.activities[0].status).toBe(userActivity.status)

        expect(body.data.activities[0].user._id).toBe(
          userActivity.user._id.toString()
        )
      })
    })
  })
  describe('Fetch All users activities by admin', () => {
    const url = adminUrl + 'users'
    describe('given current user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given current user is an admin', () => {
      it('should return a 200 and an empty array of all users activity logs', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')
        expect(body.data).toEqual({
          activities: [],
        })
      })
      it('should return a 200 and an array of all users activity logs', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await userModel.create({ ...userAInput, _id: userA_id })

        const userActivity1 = await activityModel.create({
          user: userA_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userC_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
          status: ActivityStatus.HIDDEN,
        })

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data.activities.length).toBe(3)
        expect(body.data.activities[0].category).toBe(userActivity1.category)
        expect(body.data.activities[0].message).toBe(userActivity1.message)
        expect(body.data.activities[0].forWho).toBe(userActivity1.forWho)
        expect(body.data.activities[0].status).toBe(userActivity1.status)

        expect(body.data.activities[0].user._id).toBe(
          userActivity1.user._id.toString()
        )

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(4)
      })
    })
  })

  describe('Fetch all activities of current admin', () => {
    const url = adminUrl
    describe('given current user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(body.status).toBe(StatusCode.DANGER)
        expect(statusCode).toBe(401)
      })
    })
    describe('given current user is an admin', () => {
      it('should return a 200 and an empty array of the current admin activity logs', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activities fetched successfully')
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(statusCode).toBe(200)

        expect(body.data).toEqual({
          activities: [],
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(3)
      })
      it('should return a 200 and not empty array of the current admin activity logs', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const adminActivity = await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activities fetched successfully')
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(statusCode).toBe(200)

        expect(body.data.activities.length).toBe(1)
        expect(body.data.activities[0].category).toBe(adminActivity.category)
        expect(body.data.activities[0].message).toBe(adminActivity.message)
        expect(body.data.activities[0].forWho).toBe(adminActivity.forWho)
        expect(body.data.activities[0].status).toBe(adminActivity.status)

        expect(body.data.activities[0].user._id).toBe(
          adminActivity.user.toString()
        )

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(4)
      })
    })
  })
  describe('hide one activity log', () => {
    // const url = baseUrl + 'hide/:activityId'
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized', async () => {
        const url = baseUrl + 'hide/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request.patch(url)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given activity log those not exist', () => {
      it('should return a 404', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'hide/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Activity not found')

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('given activity log those not belongs to current user', () => {
      it('should return a 404', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const anotherUserActivity = await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'hide/' + anotherUserActivity._id

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Activity not found')

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('hide selected activity log', () => {
      it('should return a 200 and hide the selected activity log', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const userActivity = await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'hide/' + userActivity._id

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          activity: {
            ...Helpers.deepClone(userActivity),
            status: ActivityStatus.HIDDEN,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            _id: expect.any(String),
            user: expect.any(Object),
          },
        })

        const savedResult = await activityModel.count(body.data.activity).exec()
        expect(savedResult).toBe(1)
      })
    })
  })
  describe('hide all activity logs', () => {
    const url = baseUrl + 'hide/all'
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.patch(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given no visible activity log exist', () => {
      it('should return a 404', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          status: ActivityStatus.HIDDEN,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          status: ActivityStatus.HIDDEN,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('No Activities found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const activitiesCount = await activityModel.count({
          status: ActivityStatus.HIDDEN,
        })
        expect(activitiesCount).toBe(2)
      })
    })
    describe('hide all user activity logs', () => {
      it('should return a 200 and hide all activity logs of current user', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: user._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activities deleted successfully')
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(statusCode).toBe(200)

        const activitiesCount = await activityModel.count({
          status: ActivityStatus.HIDDEN,
        })

        expect(activitiesCount).toBe(2)
      })
    })
  })
  describe('admin: delete one activity log', () => {
    // const url = adminUrl + 'delete/user/:activityId'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = adminUrl + 'delete/user/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given activity log those not exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = adminUrl + 'delete/user/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Activity not found')

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('delete selected activity log', () => {
      it('should return a 200 and delete the selected activity log', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        const activity = await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = adminUrl + 'delete/user/' + activity._id

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity deleted successfully')
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(statusCode).toBe(200)

        expect(body.data).toEqual({
          activity: {
            ...Helpers.deepClone(activity),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            _id: expect.any(String),
            user: expect.any(Object),
          },
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(0)
      })
    })
  })
  describe('Delete all activities of provided user', () => {
    // const url = adminUrl + 'delete/user/:userId'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = adminUrl + 'delete/user/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given no activity log exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        const userId = new Types.ObjectId().toString()

        const url = adminUrl + 'delete/user/' + userId

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(body.message).toBe('Activity not found')
      })
    })
    describe('delete all selected user activity logs', () => {
      it('should return a 200 and delete all activity logs of current user', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        const url = adminUrl + 'delete/all/user/' + userC_id

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userC_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userC_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userC_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activities deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const activitiesCount = await activityModel.count()

        const userActiviesCount = await activityModel.count({
          user: userC_id,
        })

        expect(activitiesCount).toBe(2)
        expect(userActiviesCount).toBe(1)
      })
    })
  })
  describe('Delete all activites', () => {
    const url = adminUrl + 'delete/all/users'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given no activity log was found', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('No Activities found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
    describe('delete all usesr activity logs', () => {
      it('should return a 200 and delete all users', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activities deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
  })
  describe('Delete activity of current admin', () => {
    // const url = adminUrl + 'delete/:activityId'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = adminUrl + 'delete/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given activity log those not exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const url = adminUrl + 'delete/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('given activity log those not belongs to current admin', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        const activity = await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const activity2 = await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = adminUrl + 'delete/' + activity._id
        const url2 = adminUrl + 'delete/' + activity2._id

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        const { statusCode: statusCode2, body: body2 } = await request
          .delete(url2)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(body2.message).toBe('Activity not found')
        expect(statusCode2).toBe(404)
        expect(body2.status).toBe(StatusCode.DANGER)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
    describe('delete selected admin activity log', () => {
      it('should return a 200 and delete the selected admin activity log', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        const activity = await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = adminUrl + 'delete/' + activity._id

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          activity: {
            ...Helpers.deepClone(activity),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            _id: expect.any(String),
            user: expect.any(Object),
          },
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
  })
  describe('Delete all activity log of current admin', () => {
    const url = adminUrl + 'delete/all'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given no activity log exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('No Activities found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
    describe('delete all selected admin activity logs', () => {
      it('should return a 200 and delete all activity logs of current admin', async () => {
        const admin = await userModel.create(adminBInput)
        const token = Cryptograph.createToken(admin)

        await activityModel.create({
          user: userB_id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activities deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
  })
})
