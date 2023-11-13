import { userBInput } from './../../user/__test__/user.payload'
import { StatusCode } from '../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import referralModel from '../../../modules/referral/referral.model'
import { request } from '../../../test'
import {
  adminAInput,
  userAInput,
  userA_id,
  userB_id,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { referralA } from './referral.payoad'
import { IControllerRoute } from '../../../core/utils'
import { referralController } from '../../../setup'

describe('referral', () => {
  const baseUrl = '/api/referral/'
  const masterUrl = '/api/master/referral/'
  describe('Validate routes', () => {
    const routes = referralController.routes as IControllerRoute[]
    it('should expect 6 routes', () => {
      expect(routes.length).toBe(6)
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
  describe('get referral transactions', () => {
    const url = `${baseUrl}`
    describe('given user is not logged in', () => {
      it('should return a 401', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on successful entry', () => {
      it('should return a payload of the current user referral transaction', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const referralTransaction = await referralModel.create({
          ...referralA,
          referrer: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referrals fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.referrals.length).toBe(1)

        expect(body.data.referrals[0].user).not.toBe(
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
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on successful entry', () => {
      it('should return a payload of the current user referral earnings', async () => {
        await userModel.create({ ...userBInput, _id: userB_id })
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

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

        expect(body.message).toBe('Referral earnings fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

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
    const url = `${masterUrl}users`
    describe('given user is not an admin', () => {
      it('should return a 401', async () => {
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
    describe('on successful entry', () => {
      it('should return a payload of the all users referral transactions', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const user1 = await userModel.create(userAInput)
        const user2 = await userModel.create(userBInput)

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

        expect(body.message).toBe('Referrals fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.referrals.length).toBe(2)
      })
    })
  })
  describe('get users referral earnings', () => {
    const url = `${masterUrl}earnings/users`
    describe('given user is not an admin', () => {
      it('should return a 401', async () => {
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
    describe('on successful entry', () => {
      it('should return a payload of the all users referral earnings', async () => {
        await userModel.create({ ...userBInput, _id: userB_id })
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const user = await userModel.create({ ...userAInput, _id: userA_id })

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

        expect(body.message).toBe('Referral earnings fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.referralEarnings.length).toBe(1)

        expect(body.data.referralEarnings[0].referrer.username).toBe(
          user.username
        )

        expect(body.data.referralEarnings[0].earnings).toBe(
          referralA.amount * 2
        )
      })
    })
  })
  describe('get referral leaderboard', () => {
    const url = `${masterUrl}leaderboard`
    describe('given user is not an admin', () => {
      it('should return a 401', async () => {
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
    describe('on successful entry', () => {
      it('should return a payload of the referral leaderboard', async () => {
        await userModel.create({
          ...userBInput,
          _id: userB_id,
          key: '8f6c4c9d7f4b1c2b8e8a8d6c8a8d6c8',
          email: 'userb2@gmail.com',
          username: 'userb2',
          refer: 'userb2',
        })
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const user1 = await userModel.create(userAInput)
        const user2 = await userModel.create(userBInput)

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

        expect(body.message).toBe('Referral leaderboard fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.referralLeaderboard.length).toBe(2)
      })
    })
  })
})
