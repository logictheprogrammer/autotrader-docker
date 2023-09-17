import { IActivity } from './../activity.interface'
import Helpers from '../../../utils/helpers/helpers'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../../modules/http/http.enum'
import activityModel from '../../../modules/activity/activity.model'
import { request } from '../../../test'
import {
  adminA,
  userA,
  userA_id,
  userB,
  userB_id,
  userC,
  userC_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '../activity.enum'
import { IUser } from '../../user/user.interface'
import { Types } from 'mongoose'

describe('Activity', () => {
  const baseUrl = '/api/activity/'
  describe('get activity logs', () => {
    const url = baseUrl
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(statusCode).toBe(401)
      })
    })
    describe('given user exist', () => {
      it('should return a 200 and an empty array of logged in user visible activity logs', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')
        expect(body.data).toEqual({ activities: [] })
      })

      it('should return a 200 and an array of logged in user visible activity logs', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
          status: ActivityStatus.HIDDEN,
        })

        const userActivity = await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data.activities.length).toBe(1)
        expect(body.data.activities[0].category).toBe(userActivity.category)
        expect(body.data.activities[0].message).toBe(userActivity.message)
        expect(body.data.activities[0].forWho).toBe(userActivity.forWho)
        expect(body.data.activities[0].status).toBe(userActivity.status)

        expect(body.data.activities[0].user._id).toBe(
          userActivity.user.toString()
        )
        expect(body.data.activities[0].user.username).toBe(
          userActivity.userObject.username
        )
      })
    })
  })
  describe('admin: get all users activity logs', () => {
    const url = baseUrl + 'users'
    describe('given current user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given current user is an admin', () => {
      it('should return a 200 and an empty array of all users activity logs', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')
        expect(body.data).toEqual({
          activities: [],
        })
      })
      it('should return a 200 and an array of all users activity logs', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await userModel.create({ ...userA, _id: userA_id })

        const userActivity1 = await activityModel.create({
          user: userA_id,
          userObject: userA,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const userActivity2 = await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const userActivity3 = await activityModel.create({
          user: userC_id,
          userObject: userC,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
          status: ActivityStatus.HIDDEN,
        })

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data.activities.length).toBe(3)
        expect(body.data.activities[0].category).toBe(userActivity1.category)
        expect(body.data.activities[0].message).toBe(userActivity1.message)
        expect(body.data.activities[0].forWho).toBe(userActivity1.forWho)
        expect(body.data.activities[0].status).toBe(userActivity1.status)

        expect(body.data.activities[0].user._id).toBe(
          userActivity1.user.toString()
        )
        expect(body.data.activities[0].user.username).toBe(
          userActivity1.userObject.username
        )

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(4)
      })
    })
  })
  describe('admin: get one user activity logs', () => {
    // const url = baseUrl + 'user/:user'
    describe('given current user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const url = baseUrl + 'user/' + new Types.ObjectId().toString()
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given selected user those not exist', () => {
      it('should return an empty array', async () => {
        const url = baseUrl + 'user/' + new Types.ObjectId().toString()
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data).toEqual({
          activities: [],
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('given selected user exist', () => {
      it('should return a 200 and an empty array of the selected users activity logs', async () => {
        const user = await userModel.create(userA)
        const url = baseUrl + 'user/' + user._id
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data).toEqual({
          activities: [],
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
      it('should return a 200 and an array of the selected users activity logs', async () => {
        const user = await userModel.create(userA)
        const url = baseUrl + 'user/' + user._id
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const userActivity = await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data.activities.length).toBe(1)
        expect(body.data.activities[0].category).toBe(userActivity.category)
        expect(body.data.activities[0].message).toBe(userActivity.message)
        expect(body.data.activities[0].forWho).toBe(userActivity.forWho)
        expect(body.data.activities[0].status).toBe(userActivity.status)

        expect(body.data.activities[0].user._id).toBe(
          userActivity.user.toString()
        )
        expect(body.data.activities[0].user.username).toBe(
          userActivity.userObject.username
        )

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
  })
  describe('admin: get admin activity logs', () => {
    const url = baseUrl + 'admin'
    describe('given current user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given current user is an admin', () => {
      it('should return a 200 and an empty array of the current admin activity logs', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data).toEqual({
          activities: [],
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(3)
      })
      it('should return a 200 and not empty array of the current admin activity logs', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const adminActivity = await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activities fetched successfully')

        expect(body.data.activities.length).toBe(1)
        expect(body.data.activities[0].category).toBe(adminActivity.category)
        expect(body.data.activities[0].message).toBe(adminActivity.message)
        expect(body.data.activities[0].forWho).toBe(adminActivity.forWho)
        expect(body.data.activities[0].status).toBe(adminActivity.status)

        expect(body.data.activities[0].user._id).toBe(
          adminActivity.user.toString()
        )
        expect(body.data.activities[0].user.username).toBe(
          adminActivity.userObject.username
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
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given activity log those not exist', () => {
      it('should return a 404', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'hide/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Activity not found')

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('given activity log those not belongs to current user', () => {
      it('should return a 404', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const anotherUserActivity = await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'hide/' + anotherUserActivity._id

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Activity not found')

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('hide selected activity log', () => {
      it('should return a 200 and hide the selected activity log', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const userActivity = await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'hide/' + userActivity._id

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity log deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          activity: {
            ...Helpers.deepClone(userActivity),
            status: ActivityStatus.HIDDEN,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            _id: expect.any(String),
            user: expect.any(String),
          },
        })
      })
    })
  })
  describe('hide all activity logs', () => {
    const url = baseUrl + 'hide'
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.patch(url)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given no visible activity log exist', () => {
      it('should return a 404', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          status: ActivityStatus.HIDDEN,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          status: ActivityStatus.HIDDEN,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('No Activity log found')

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
    describe('hide all user activity logs', () => {
      it('should return a 200 and hide all activity logs of current user', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: user._id,
          userObject: user,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activity logs deleted successfully')

        const activitiesCount = await activityModel.count({
          status: ActivityStatus.HIDDEN,
        })

        expect(activitiesCount).toBe(2)
      })
    })
  })
  describe('admin: delete one activity log', () => {
    // const url = baseUrl + 'delete/:activityId'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = baseUrl + 'delete/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given activity log those not exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'delete/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Activity not found')

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('delete selected activity log', () => {
      it('should return a 200 and hide the selected activity log', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const activity = await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'delete/' + activity._id

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.message).toBe('Activity log deleted successfully')

        expect(body.data).toEqual({
          activity: {
            ...Helpers.deepClone(activity),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            _id: expect.any(String),
            user: expect.any(String),
          },
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(0)
      })
    })
  })
  describe('admin: delete all user activity logs', () => {
    // const url = baseUrl + 'delete/user/:userId'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = baseUrl + 'delete/user/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('given no activity log exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const userId = new Types.ObjectId().toString()

        const url = baseUrl + 'delete/user/' + userId

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('No Activity found')
      })
    })
    describe('delete all selected user activity logs', () => {
      it('should return a 200 and delete all activity logs of current user', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = baseUrl + 'delete/user/' + userC_id

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userC_id,
          userObject: userC,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userC_id,
          userObject: userC,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: userC_id,
          userObject: userC,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity logs deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        const activitiesCount = await activityModel.count()

        const userActiviesCount = await activityModel.count({
          user: userC_id,
        })

        expect(activitiesCount).toBe(2)
        expect(userActiviesCount).toBe(1)
      })
    })
  })
  describe('admin: delete all activity logs', () => {
    const url = baseUrl + 'delete/all'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given no activity log was found', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('No Activity found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
    describe('delete all usesr activity logs', () => {
      it('should return a 200 and delete all users', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity logs deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
  })
  describe('admin: delete current admin activity log', () => {
    // const url = baseUrl + 'delete/admin/:activityId'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = baseUrl + 'delete/admin/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given activity log those not exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const url = baseUrl + 'delete/admin/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
    describe('given activity log those not belongs to current admin', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const activity = await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const activity2 = await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'delete/admin/' + activity._id
        const url2 = baseUrl + 'delete/admin/' + activity2._id

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        const { statusCode: statusCode2, body: body2 } = await request
          .delete(url2)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(body2.message).toBe('Activity not found')
        expect(statusCode2).toBe(404)
        expect(body2.status).toBe(HttpResponseStatus.ERROR)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
    describe('delete selected admin activity log', () => {
      it('should return a 200 and delete the selected admin activity log', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const activity = await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const url = baseUrl + 'delete/admin/' + activity._id

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity log deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          activity: {
            ...Helpers.deepClone(activity),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            _id: expect.any(String),
            user: expect.any(String),
          },
        })

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
  })
  describe('admin: delete all current admin activity logs', () => {
    const url = baseUrl + 'delete/admin'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given no activity log exist', () => {
      it('should return a 404', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.USER,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('No Activity found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(2)
      })
    })
    describe('delete all selected admin activity logs', () => {
      it('should return a 200 and delete all activity logs of current admin', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await activityModel.create({
          user: userB_id,
          userObject: userB,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        await activityModel.create({
          user: admin._id,
          userObject: admin,
          category: ActivityCategory.PROFILE,
          message: 'message',
          forWho: ActivityForWho.ADMIN,
        })

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Activity logs deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        const activitiesCount = await activityModel.count()

        expect(activitiesCount).toBe(1)
      })
    })
  })
})
