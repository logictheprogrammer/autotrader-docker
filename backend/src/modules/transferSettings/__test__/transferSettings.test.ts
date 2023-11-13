import { StatusCode } from '../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import { IControllerRoute } from '../../../core/utils'
import transferSettingsModel from '../../../modules/transferSettings/transferSettings.model'
import { transferSettingsController } from '../../../setup'
import { request } from '../../../test'
import {
  adminA,
  adminAInput,
  userA,
  userAInput,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  transferSettingsA,
  transferSettingsB,
} from './transferSettings.payload'

describe('transfer settings', () => {
  const baseUrl = '/api/transfer-settings'
  const masterUrl = '/api/master/transfer-settings'
  describe('Validate routes', () => {
    const routes = transferSettingsController.routes as IControllerRoute[]
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
  describe('get transfer settings', () => {
    const url = `${baseUrl}`
    describe('a get request', () => {
      it('should return the transfer settings payload', async () => {
        await transferSettingsModel.create(transferSettingsA)
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Transfer status fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
      })
    })
  })
  describe('update transfer settings', () => {
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
          fee: 15,
        }

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"approval" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('on success entry', () => {
      it('should return a payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await transferSettingsModel.create(transferSettingsA)

        const payload = transferSettingsB

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Transfer settings updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.transferSettings.approval).toBe(
          transferSettingsB.approval
        )
        expect(body.data.transferSettings.fee).toBe(transferSettingsB.fee)

        const transferSettingsCount = await transferSettingsModel.count(
          transferSettingsB
        )

        expect(transferSettingsCount).toBe(1)
      })
    })
  })
})
