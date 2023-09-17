import { Types } from 'mongoose'
import notificationModel from '../../../modules/notification/notification.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import { IUser } from '../../user/user.interface'
import userModel from '../../user/user.model'
import { NotificationForWho } from '../notification.enum'
import { INotification } from '../notification.interface'
import { notificationA } from './notification.payload'

describe('notification', () => {
  const baseUrl = '/api/notification'
  describe('get user notifications', () => {
    // const url = `${baseUrl}`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user notification', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

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
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.LIVE
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get all users notifications', () => {
    const url = `${baseUrl}/all`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of all users notifications', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
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
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.LIVE
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get admin notifications', () => {
    const url = `${baseUrl}/admin`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of all users notifications', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
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
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.LIVE
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get user demo notifications', () => {
    // const url = `${baseUrl}/demo`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}/demo`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user notification', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

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

        const url = `${baseUrl}/demo`
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notifications fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.notifications[0].environment).toBe(
          UserEnvironment.DEMO
        )
        expect(body.data.notifications.length).toBe(1)
      })
    })
  })
  describe('get all users demo notifications', () => {
    const url = `${baseUrl}/demo/all`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of all users notifications', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
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
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

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
        const url = `${baseUrl}/delete/notificationId`
        const { statusCode, body } = await request.delete(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given notification those not exist', () => {
      it('should return a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = `${baseUrl}/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given notification those not belongs to user', () => {
      it('should return a 404 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const notification = await notificationModel.create(notificationA)

        const url = `${baseUrl}/delete/${notification._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('it should delete the notification', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
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
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        notificationsCount = await notificationModel.count()
        expect(notificationsCount).toBe(0)
      })
    })
  })
  describe('admin delete a notification', () => {
    // const url = `${baseUrl}/admin/delete/:notificationId`
    describe('given user is not loggedin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}/admin/delete/notificationId`
        const { statusCode, body } = await request.delete(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user is not an admin', () => {
      it('should return a 401 error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const url = `${baseUrl}/admin/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given notification those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}/admin/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('it should delete the notification', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const notification = await notificationModel.create({
          ...notificationA,
          forWho: NotificationForWho.ADMIN,
        })

        let notificationsCount = await notificationModel.count()

        expect(notificationsCount).toBe(1)

        const url = `${baseUrl}/admin/delete/${notification._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        notificationsCount = await notificationModel.count()
        expect(notificationsCount).toBe(0)
      })
    })
  })
})
