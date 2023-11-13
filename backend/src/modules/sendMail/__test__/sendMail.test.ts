import Helpers from '../../../utils/helpers'
import { MailOptionName } from '../../../modules/mailOption/mailOption.enum'
import renderFile from '../../../utils/renderFile'
import { request } from '../../../test'
import { sendMailMock, setSenderMock } from '../../mail/__test__/mail.mock'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { SiteConstants } from '../../config/config.constants'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'
import { IControllerRoute } from '../../../core/utils'
import { sendMailController } from '../../../setup'

describe('send mail', () => {
  const baseUrl = '/api/send-email'
  const masterUrl = '/api/master/send-email'
  describe('Validate routes', () => {
    const routes = sendMailController.routes as IControllerRoute[]
    it('should expect 1 routes', () => {
      expect(routes.length).toBe(1)
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
  describe('send custom mail', () => {
    const url = `${masterUrl}`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given invalid inputs', () => {
      it('should return a 400 error', async () => {
        const payload = {
          email: 'example@gmail.com',
          subject: 'subject',
          heading: 'heading',
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"content" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
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

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Mail sent successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

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
          text: Helpers.clearHtml(emailContent),
          html: emailContent,
        })
      })
    })
  })
})
