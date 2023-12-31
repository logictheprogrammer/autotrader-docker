import { StatusCode } from '../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import { IControllerRoute } from '../../../core/utils'
import referralSettingsModel from '../../../modules/referralSettings/referralSettings.model'
import { referralSettingsController } from '../../../setup'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  referralSettingsA,
  referralSettingsB,
} from './referralSettings.payload'

describe('referral settings', () => {
  const baseUrl = '/api/referral-settings'
  const masterUrl = '/api/master/referral-settings'
  describe('Validate routes', () => {
    const routes = referralSettingsController.routes as IControllerRoute[]
    it('should expect 2 routes', () => {
      expect(routes.length).toBe(2)
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
  describe('get referral settings', () => {
    const url = `${baseUrl}`
    describe('a get request', () => {
      it('should return the referral settings payload', async () => {
        const referralSettings = await referralSettingsModel.create(
          referralSettingsA
        )

        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Referral settings fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.referralSettings.deposit).toBe(
          referralSettings.deposit
        )
        expect(body.data.referralSettings.stake).toBe(referralSettings.stake)
        expect(body.data.referralSettings.winnings).toBe(
          referralSettings.winnings
        )
      })
    })
  })
  describe('update referral settings', () => {
    const url = `${masterUrl}/update`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const payload = {}

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given input are not valid', () => {
      it('should return a 400', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const payload = {
          deposit: 15,
          stake: 15,
        }

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"winnings" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('on success entry', () => {
      it('should return a payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await referralSettingsModel.create(referralSettingsA)

        const payload = referralSettingsB

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Referral settings updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.referralSettings.deposit).toBe(
          referralSettingsB.deposit
        )
        expect(body.data.referralSettings.stake).toBe(referralSettingsB.stake)
        expect(body.data.referralSettings.winnings).toBe(
          referralSettingsB.winnings
        )

        const referralSettingsCount = await referralSettingsModel.count(
          referralSettingsB
        )
        expect(referralSettingsCount).toBe(1)
      })
    })
  })
})
