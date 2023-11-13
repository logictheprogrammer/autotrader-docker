import { Types } from 'mongoose'
import notificationModel from '../../../modules/notification/notification.model'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import userModel from '../../user/user.model'
import { NotificationForWho } from '../notification.enum'
import { notificationA } from './notification.payload'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'
import { IControllerRoute } from '../../../core/utils'
import { notificationController } from '../../../setup'

describe('notification', () => {
  const baseUrl = '/api/notification'
  const demoUrl = '/api/demo/notification'
  const masterUrl = '/api/master/notification'
  const masterDemoUrl = '/api/master/demo/notification'
  describe('Validate routes', () => {
    const routes = notificationController.routes as IControllerRoute[]
    it('should expect 9 routes', () => {
      expect(routes.length).toBe(9)
    })
    test.each(routes)(
      'should have only one occurance for method - (%s) and url - (%s)',
      (method, url) => {
        const occurance = routes.filter(
          ([method1, url1]) => method === method1 && url === url1
        )
        expect(occurance.length).toBe(1)
      }
    )
    test.each(routes)(
      'The last middleware should only be called once where method - (%s) and url - (%s)',
      (...middlewares) => {
        const occurance = routes.filter((middlewares1) => {
          return (
            middlewares[middlewares.length - 1].toString() ===
            middlewares1[middlewares1.length - 1].toString()
          )
        })
        expect(occurance.length).toBe(1)
      }
    )
  })
  describe('get user notifications', () => {
    const url = `${baseUrl}`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user notification', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        await notificationModel.create(notificationA)

        await notificationModel.create({
          ...notificationA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        await notificationModel.create({
          ...notificationA,
          user: user._id,
        })

        const url = `${baseUrl}`
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notifications fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.LIVE
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get all users notifications', () => {
    const url = `${masterUrl}/users`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return an array of all users notifications', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        await notificationModel.create(notificationA)
        await notificationModel.create({
          ...notificationA,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notifications fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.LIVE
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get admin notifications', () => {
    const url = `${masterUrl}`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return an array of all users notifications', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        await notificationModel.create(notificationA)
        await notificationModel.create({
          ...notificationA,
          forWho: NotificationForWho.ADMIN,
          environment: UserEnvironment.LIVE,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notifications fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.LIVE
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get user demo notifications', () => {
    const url = `${demoUrl}`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user notification', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        await notificationModel.create(notificationA)

        await notificationModel.create({
          ...notificationA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        await notificationModel.create({
          ...notificationA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notifications fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.DEMO
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get all users demo notifications', () => {
    const url = `${masterDemoUrl}/users`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return an array of all users notifications', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        await notificationModel.create(notificationA)
        await notificationModel.create({
          ...notificationA,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notifications fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.DEMO
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('delete a notification', () => {
    // const url = `${baseUrl}/delete/:notificationId`
    describe('given user is not loggedin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}/delete/${new Types.ObjectId()}`
        const { statusCode, body } = await request.delete(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given notification those not exist', () => {
      it('should return a 404 error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${baseUrl}/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given notification those not belongs to user', () => {
      it('should return a 404 error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const notification = await notificationModel.create(notificationA)

        const url = `${baseUrl}/delete/${notification._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('it should delete the notification', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const notification = await notificationModel.create({
          ...notificationA,
          user: user._id,
        })

        let notificationsCount = await notificationModel.count()

        expect(notificationsCount).toBe(1)

        const url = `${baseUrl}/delete/${notification._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        notificationsCount = await notificationModel.count()
        expect(notificationsCount).toBe(0)
      })
    })
  })
  describe('admin delete a notification', () => {
    // const url = `${masterUrl}/delete/:notificationId`
    describe('given user is not loggedin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${masterUrl}/delete/${new Types.ObjectId().toString()}`
        const { statusCode, body } = await request.delete(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user is not an admin', () => {
      it('should return a 401 error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${masterUrl}/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given notification those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('it should delete the notification', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const notification = await notificationModel.create({
          ...notificationA,
          forWho: NotificationForWho.ADMIN,
        })

        let notificationsCount = await notificationModel.count()

        expect(notificationsCount).toBe(1)

        const url = `${masterUrl}/delete/${notification._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        notificationsCount = await notificationModel.count()
        expect(notificationsCount).toBe(0)
      })
    })
  })
})
