import { Types } from 'mongoose'
import referralModel from '../../../modules/referral/referral.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import {
  adminA,
  userA,
  userB,
  userB_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { referralA } from './referral.payoad'
import AppRepository from '../../app/app.repository'
import { IReferral } from '../referral.interface'
import { IUser } from '../../user/user.interface'

const userRepository = new AppRepository<IUser>(userModel)
const referralRepository = new AppRepository<IReferral>(referralModel)

describe('referral', () => {
  const baseUrl = '/api/referral/'
  describe('get referral transactions', () => {
    const url = `${baseUrl}`
    describe('given user is not logged in', () => {
      it('should return a 401', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on successful entry', () => {
      it('should return a payload of the current user referral transaction', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const referralTransaction = await referralRepository
          .create({
            ...referralA,
            referrer: user._id,
          })
          .save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referral transactions fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.referralTransactions.length).toBe(1)

        expect(body.data.referralTransactions[0].user).not.toBe(
          referralTransaction.referrer
        )
      })
    })
  })
  describe('get referral earnings', () => {
    const url = `${baseUrl}earnings`
    describe('given user is not logged in', () => {
      it('should return a 401', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on successful entry', () => {
      it('should return a payload of the current user referral earnings', async () => {
        await userRepository.create({ ...userB, _id: userB_id }).save()
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        await referralRepository
          .create({
            ...referralA,
            referrer: user._id,
          })
          .save()

        const referralTransaction = await referralRepository
          .create({
            ...referralA,
            referrer: user._id,
          })
          .save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referral earnings fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.referralEarnings.length).toBe(1)

        expect(body.data.referralEarnings[0].user.username).toBe(
          referralTransaction.userObject.username
        )

        expect(body.data.referralEarnings[0].earnings).toBe(
          referralA.amount * 2
        )
      })
    })
  })
  describe('get users referral transactions', () => {
    const url = `${baseUrl}users`
    describe('given user is not an admin', () => {
      it('should return a 401', async () => {
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
    describe('on successful entry', () => {
      it('should return a payload of the all users referral transactions', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const user1 = await userRepository.create(userA).save()
        const user2 = await userRepository.create(userB).save()

        await referralRepository
          .create({
            ...referralA,
            referrer: user1._id,
          })
          .save()

        await referralRepository
          .create({
            ...referralA,
            referrer: user2._id,
          })
          .save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referral transactions fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.referralTransactions.length).toBe(2)
      })
    })
  })
  describe('get users referral earnings', () => {
    const url = `${baseUrl}earnings/users`
    describe('given user is not an admin', () => {
      it('should return a 401', async () => {
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
    describe('on successful entry', () => {
      it('should return a payload of the all users referral earnings', async () => {
        await userRepository.create({ ...userB, _id: userB_id }).save()
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        await referralRepository
          .create({
            ...referralA,
            referrer: new Types.ObjectId().toString(),
          })
          .save()

        const referralTransaction = await referralRepository
          .create({
            ...referralA,
            referrer: new Types.ObjectId().toString(),
          })
          .save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referral earnings fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.referralEarnings.length).toBe(1)

        expect(body.data.referralEarnings[0].user.username).toBe(
          referralTransaction.userObject.username
        )

        expect(body.data.referralEarnings[0].earnings).toBe(
          referralA.amount * 2
        )
      })
    })
  })
  describe('get referral leaderboard', () => {
    const url = `${baseUrl}leaderboard`
    describe('given user is not an admin', () => {
      it('should return a 401', async () => {
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
    describe('on successful entry', () => {
      it('should return a payload of the referral leaderboard', async () => {
        await userRepository.create({
          ...userB,
          _id: userB_id,
          key: '8f6c4c9d7f4b1c2b8e8a8d6c8a8d6c8',
          email: 'userb2@gmail.com',
          username: 'userb2',
          refer: 'userb2',
        })
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const user1 = await userRepository.create(userA).save()
        const user2 = await userRepository.create(userB).save()

        await referralRepository
          .create({
            ...referralA,
            referrer: user1._id,
          })
          .save()

        await referralRepository
          .create({
            ...referralA,
            referrer: user2._id,
          })
          .save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referral leaderboard fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.referralLeaderboard.length).toBe(2)
      })
    })
  })
})
