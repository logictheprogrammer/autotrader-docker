import { Types } from 'mongoose'
import referralModel from '../../../modules/referral/referral.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import {
  adminA,
  userA,
  userA_id,
  userB,
  userB_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { referralA } from './referral.payoad'
import { IReferral } from '../referral.interface'
import { IUser } from '../../user/user.interface'

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
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const referralTransaction = await referralModel.create({
          ...referralA,
          referrer: user._id,
        })

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
        await userModel.create({ ...userB, _id: userB_id })
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        await referralModel.create({
          ...referralA,
          referrer: user._id,
        })

        const referralTransaction = await referralModel.create({
          ...referralA,
          referrer: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referral earnings fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.referralEarnings.length).toBe(1)

        expect(body.data.referralEarnings[0].referrer._id.toString()).toEqual(
          referralTransaction.referrer.toString()
        )
        expect(body.data.referralEarnings[0].user._id.toString()).toEqual(
          referralTransaction.user.toString()
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
    describe('on successful entry', () => {
      it('should return a payload of the all users referral transactions', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const user1 = await userModel.create(userA)
        const user2 = await userModel.create(userB)

        await referralModel.create({
          ...referralA,
          referrer: user1._id,
        })

        await referralModel.create({
          ...referralA,
          referrer: user2._id,
        })

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
    describe('on successful entry', () => {
      it('should return a payload of the all users referral earnings', async () => {
        await userModel.create({ ...userB, _id: userB_id })
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const user = await userModel.create({ ...userA, _id: userA_id })

        await referralModel.create({
          ...referralA,
          referrer: user._id,
        })

        const referralTransaction = await referralModel.create({
          ...referralA,
          referrer: user._id,
        })

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
    describe('on successful entry', () => {
      it('should return a payload of the referral leaderboard', async () => {
        await userModel.create({
          ...userB,
          _id: userB_id,
          key: '8f6c4c9d7f4b1c2b8e8a8d6c8a8d6c8',
          email: 'userb2@gmail.com',
          username: 'userb2',
          refer: 'userb2',
        })
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const user1 = await userModel.create(userA)
        const user2 = await userModel.create(userB)

        await referralModel.create({
          ...referralA,
          referrer: user1._id,
        })

        await referralModel.create({
          ...referralA,
          referrer: user2._id,
        })

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
