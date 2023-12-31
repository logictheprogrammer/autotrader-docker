import mailOptionModel from '../../..//modules/mailOption/mailOption.model'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { mailOptionA } from './mailOption.payload'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'
import { IControllerRoute } from '../../../core/utils'
import { mailOptionController } from '../../../setup'

describe('mail option', () => {
  const baseUrl = '/api/mail-options/'
  const masterUrl = '/api/master/mail-options/'
  describe('Validate routes', () => {
    const routes = mailOptionController.routes as IControllerRoute[]
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
  describe('create', () => {
    const url = masterUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(mailOptionA)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ ...mailOptionA, name: '' })

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given mail option already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await mailOptionModel.create(mailOptionA)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(mailOptionA)

        expect(body.message).toBe('Name or Username already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        const mailOptionCount = await mailOptionModel.count()

        expect(mailOptionCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and mailOption payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(mailOptionA)

        expect(body.message).toBe('Mail option created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          mailOption: {
            ...mailOptionA,
            password: undefined,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const mailOptionCount = await mailOptionModel.count({
          _id: body.data.mailOption._id,
        })

        expect(mailOptionCount).toBe(1)
      })
    })
  })
})
