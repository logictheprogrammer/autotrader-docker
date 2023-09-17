import { IMailOption } from './../mailOption.interface'
import mailOptionModel from '../../..//modules/mailOption/mailOption.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import { IUser } from '../../user/user.interface'
import userModel from '../../user/user.model'
import { mailOptionA } from './mailOption.payload'

describe('mail option', () => {
  const baseUrl = '/api/mail-options/'
  describe('create', () => {
    const url = baseUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(mailOptionA)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ ...mailOptionA, name: '' })

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given mail option already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        await mailOptionModel.create(mailOptionA)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(mailOptionA)

        expect(body.message).toBe('Name or Username already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const mailOptionCount = await mailOptionModel.count()

        expect(mailOptionCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and mailOption payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(mailOptionA)

        expect(body.message).toBe('Mail Option created')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          mailOption: {
            ...mailOptionA,
            __v: 0,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            password: expect.any(String),
          },
        })
      })
    })
  })
})
