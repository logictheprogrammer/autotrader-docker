import transferSettingsModel from '../../../modules/transferSettings/transferSettings.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import AppRepository from '../../app/app.repository'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import { IUser } from '../../user/user.interface'
import userModel from '../../user/user.model'
import { ITransferSettings } from '../transferSettings.interface'
import {
  transferSettingsA,
  transferSettingsB,
} from './transferSettings.payload'

const userRepository = new AppRepository<IUser>(userModel)
const transferSettingsRepository = new AppRepository<ITransferSettings>(
  transferSettingsModel
)

describe('transfer settings', () => {
  const baseUrl = '/api/transfer-settings'
  describe('get transfer settings', () => {
    const url = `${baseUrl}`
    describe('a get request', () => {
      it('should return the transfer settings payload', async () => {
        const transferSettings = await transferSettingsRepository
          .create(transferSettingsA)
          .save()

        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Transfer Settings fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transferSettings.approval).toBe(
          transferSettings.approval
        )
        expect(body.data.transferSettings.fee).toBe(transferSettings.fee)
      })
    })
  })
  describe('update transfer settings', () => {
    const url = `${baseUrl}/update`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userRepository.create(userA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const payload = {
          fee: 15,
        }

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"approval" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('on success entry', () => {
      it('should return a payload', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        await transferSettingsRepository.create(transferSettingsA).save()

        const payload = transferSettingsB

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Transfer Settings Updated')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.transferSettings.approval).toBe(
          transferSettingsB.approval
        )
        expect(body.data.transferSettings.fee).toBe(transferSettingsB.fee)
      })
    })
  })
})
