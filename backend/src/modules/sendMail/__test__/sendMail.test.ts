import { MailOptionName } from '../../../modules/mailOption/mailOption.enum'
import renderFile from '../../../utils/renderFile'
import ParseString from '../../../utils/parsers/parseString'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { sendMailMock, setSenderMock } from '../../mail/__test__/mail.mock'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { SiteConstants } from '../../config/config.constants'
import { IUser } from '../../user/user.interface'

describe('send mail', () => {
  const baseUrl = '/api/send-email'
  describe('send custom mail', () => {
    const url = `${baseUrl}`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given invalid inputs', () => {
      it('should return a 400 error', async () => {
        const payload = {
          email: 'example@gmail.com',
          subject: 'subject',
          heading: 'heading',
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"content" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('on success entry', () => {
      it('should send an email', async () => {
        const payload = {
          email: 'example@gmail.com',
          subject: 'subject',
          heading: 'heading',
          content: 'content',
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Email has been sent successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(setSenderMock).toHaveBeenCalledTimes(1)

        expect(setSenderMock).toHaveBeenCalledWith(MailOptionName.TEST)

        expect(sendMailMock).toHaveBeenCalledTimes(1)

        const emailContent = await renderFile('email/custom', {
          heading: payload.heading,
          content: payload.content,
          config: SiteConstants,
        })

        expect(sendMailMock.mock.calls[0][0]).toEqual({
          subject: payload.subject,
          to: payload.email,
          text: ParseString.clearHtml(emailContent),
          html: emailContent,
        })
      })
    })
  })
})
