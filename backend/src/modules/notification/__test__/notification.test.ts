import notificationModel from '../../../modules/notification/notification.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import AppRepository from '../../app/app.repository'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import { IUser } from '../../user/user.interface'
import userModel from '../../user/user.model'
import { INotification } from '../notification.interface'
import { notificationA } from './notification.payload'
import { Types } from 'mongoose'

const userRepository = new AppRepository<IUser>(userModel)
const notificationRepository = new AppRepository<INotification>(
  notificationModel
)

describe('notification', () => {
  const baseUrl = '/api/notification'
  describe('get user notifications', () => {
    // const url = `${baseUrl}/:userid`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}/userid`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user notification', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        await notificationRepository.create(notificationA).save()

        await notificationRepository
          .create({
            ...notificationA,
            user: user._id,
            environment: UserEnvironment.DEMO,
          })
          .save()

        await notificationRepository
          .create({
            ...notificationA,
            user: user._id,
          })
          .save()

        const url = `${baseUrl}/${user._id}`
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
        const user = await userRepository.create(userA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)
        await notificationRepository.create(notificationA).save()
        await notificationRepository
          .create({
            ...notificationA,
            environment: UserEnvironment.DEMO,
          })
          .save()

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
    // const url = `${baseUrl}/demo/:userid`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const url = `${baseUrl}/demo/userid`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return an array of the user notification', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        await notificationRepository.create(notificationA).save()

        await notificationRepository
          .create({
            ...notificationA,
            user: user._id,
            environment: UserEnvironment.DEMO,
          })
          .save()

        await notificationRepository
          .create({
            ...notificationA,
            user: user._id,
          })
          .save()

        const url = `${baseUrl}/demo/${user._id}`
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
        const user = await userRepository.create(userA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)
        await notificationRepository.create(notificationA).save()
        await notificationRepository
          .create({
            ...notificationA,
            environment: UserEnvironment.DEMO,
          })
          .save()

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
    describe('given transation those not exist', () => {
      it('should return a 404 error', async () => {
        const user = await userRepository.create(userA).save()
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
    describe('given transation those not belongs to user', () => {
      it('should return a 404 error', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)
        const notification = await notificationRepository
          .create(notificationA)
          .save()

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
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)
        const notification = await notificationRepository
          .create({
            ...notificationA,
            user: user._id,
          })
          .save()

        let notificationsCount = await notificationRepository.count()

        expect(notificationsCount).toBe(1)

        const url = `${baseUrl}/delete/${notification._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Notification deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        notificationsCount = await notificationRepository.count()
        expect(notificationsCount).toBe(0)
      })
    })
  })
})
