import { IReferralSettings } from './../referralSettings.interface'
import referralSettingsModel from '../../../modules/referralSettings/referralSettings.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import { IUser } from '../../user/user.interface'
import userModel from '../../user/user.model'
import {
  referralSettingsA,
  referralSettingsB,
} from './referralSettings.payload'

describe('referral settings', () => {
  const baseUrl = '/api/referral-settings'
  describe('get referral settings', () => {
    const url = `${baseUrl}`
    describe('a get request', () => {
      it('should return the referral settings payload', async () => {
        const referralSettings = await referralSettingsModel.create(
          referralSettingsA
        )

        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Referral Settings fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

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
    const url = `${baseUrl}/update`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const payload = {}

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given input are not valid', () => {
      it('should return a 400', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

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
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('on success entry', () => {
      it('should return a payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await referralSettingsModel.create(referralSettingsA)

        const payload = referralSettingsB

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Referral Settings Updated')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.referralSettings.deposit).toBe(
          referralSettingsB.deposit
        )
        expect(body.data.referralSettings.stake).toBe(referralSettingsB.stake)
        expect(body.data.referralSettings.winnings).toBe(
          referralSettingsB.winnings
        )
      })
    })
  })
})
