import { IEmailVerification } from './../../emailVerification/emailVerification.interface'
import { IResetPassword } from './../../resetPassword/resetPassword.interface'
import { request } from '../../../test'
import emailVerificationModel from '../../../modules/emailVerification/emailVerification.model'
import {
  ActivityCategory,
  ActivityForWho,
} from './../../activity/activity.enum'
import resetPasswordModel from '../../../modules/resetPassword/resetPassword.model'
import userModel from '../../../modules/user/user.model'
import { AppConstants } from '../../app/app.constants'
import { setActivityMock } from '../../activity/__test__/activity.mock'
import { createEmailVerificationMock } from '../../emailVerification/__test__/emailVerification.mock'
import { createResetPasswordMock } from '../../resetPassword/__test__/resetPassword.mock'
import {
  adminUser,
  existingUser,
  suspendedUser,
  verifieldUser,
} from '../../user/__test__/user.payload'
import { HttpResponseStatus } from '../../http/http.enum'
import Encryption from '../../../utils/encryption'
import {
  sendEmailVerificationMailMock,
  sendResetPasswordMailMock,
  sendWelcomeMailMock,
} from './auth.mock'
import { IUser } from '../../user/user.interface'
import AppCrypto from '../../app/app.crypto'
import { Types } from 'mongoose'

describe('authentication', () => {
  const baseUrl = '/api/authentication/'
  describe('registeration', () => {
    const url = baseUrl + 'register'
    describe('given user inputs are not valid', () => {
      const userInput = {
        name: 'John Doe',
        username: '',
        country: 'USA',
        email: 'jdqq',
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      it('should return a 400', async () => {
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given email already exist', () => {
      const newUser = {
        name: 'John Doe',
        username: 'JohnD',
        country: 'USA',
        email: existingUser.email,
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      it('should return a 409', async () => {
        await userModel.create(existingUser)

        const { statusCode, body } = await request.post(url).send(newUser)

        expect(statusCode).toBe(409)
        expect(body.message).toBe('Email already exist')
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const usersCount = await userModel.count()

        expect(usersCount).toBe(1)
      })
    })

    describe('given username already exist', () => {
      const newUser = {
        name: 'John Doe',
        username: existingUser.username,
        country: 'USA',
        email: 'johndoe1122334@gmail.com',
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      it('should return a 409', async () => {
        await userModel.create(existingUser)

        const { statusCode, body } = await request.post(url).send(newUser)

        expect(statusCode).toBe(409)
        expect(body.message).toBe('Username already exist')
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const usersCount = await userModel.count()

        expect(usersCount).toBe(1)
      })
    })

    describe('given user provided an invalid invitation code', () => {
      const newUser = {
        name: 'John Doe',
        username: 'john123',
        country: 'USA',
        email: 'johndoe23231@gmail.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        invite: '1dgfdsserere',
      }
      it('should return a 400', async () => {
        await userModel.create(existingUser)

        const { statusCode, body } = await request.post(url).send(newUser)

        expect(statusCode).toBe(400)
        expect(body.message).toBe('Invalid referral code')
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const usersCount = await userModel.count()

        expect(usersCount).toBe(1)
      })
    })

    describe('given the input are valid', () => {
      const newUser = {
        name: 'John Doe',
        username: 'john1122',
        country: 'USA',
        email: 'johndoe12121@gmail.com',
        password: '1234567890',
        confirmPassword: '1234567890',
        invite: existingUser.refer,
      }

      it('should return a 201 and sends an email verification email', async () => {
        await userModel.create(existingUser)

        const { statusCode, body } = await request.post(url).send(newUser)

        expect(body.message).toBe(
          'A verification link has been sent to your email address'
        )
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.INFO)

        expect(createEmailVerificationMock).toHaveBeenCalledTimes(1)

        expect(setActivityMock).toHaveBeenCalledTimes(1)
        expect(setActivityMock).toHaveBeenCalledWith(
          expect.anything(),
          ActivityForWho.USER,
          ActivityCategory.PROFILE,
          'your account was created'
        )

        expect(sendEmailVerificationMailMock).toHaveBeenCalledTimes(1)

        expect(sendEmailVerificationMailMock).toHaveBeenCalledWith(
          newUser.email,
          newUser.username,
          'email verification link'
        )

        const usersCount = await userModel.count()

        expect(usersCount).toBe(2)
      })
    })
  })

  describe('login', () => {
    const url = baseUrl + 'login'
    describe('given user input are not valid', () => {
      const userInput = {
        account: 'johndoe@gmail.com',
        password: '',
      }
      it('should return a 400', async () => {
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('"password" is not allowed to be empty')
      })
    })
    describe('given user not found', () => {
      const userInput = {
        account: 'johndoe@gmail.com',
        password: '1234567890',
      }
      it('should return a 404', async () => {
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(body.message).toBe(
          'Could not find a user with that Email or Username'
        )
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(statusCode).toBe(404)
      })
    })
    describe('given incorrect password', () => {
      const userInput = {
        account: existingUser.email,
        password: '123456789kk',
      }
      it('should return a 400', async () => {
        await userModel.create(existingUser)
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(body.message).toBe('Incorrect password')
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(statusCode).toBe(400)
      })
    })
    describe('given user email is not verifield', () => {
      const userInput = {
        account: existingUser.email,
        password: existingUser.password,
      }
      it('should send return a 200 and send a verification mail', async () => {
        await userModel.create({
          ...existingUser,
          password: await AppCrypto.setHash(existingUser.password),
        })
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(body.message).toBe(
          'A verification link has been sent to your email address'
        )
        expect(body.status).toBe(HttpResponseStatus.INFO)
        expect(statusCode).toBe(200)

        expect(createEmailVerificationMock).toHaveBeenCalledTimes(1)

        expect(sendEmailVerificationMailMock).toHaveBeenCalledTimes(1)

        expect(sendEmailVerificationMailMock).toHaveBeenCalledWith(
          existingUser.email,
          existingUser.username,
          'email verification link'
        )
      })
    })
    describe('given user is suspended', () => {
      const userInput = {
        account: suspendedUser.email,
        password: suspendedUser.password,
      }
      it('should send return a 403 and send a verification mail', async () => {
        await userModel.create({
          ...suspendedUser,
          password: await AppCrypto.setHash(suspendedUser.password),
        })
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(body.message).toBe(
          'Your account is under review, please check in later'
        )
        expect(statusCode).toBe(403)
        expect(body.status).toBe(HttpResponseStatus.INFO)
      })
    })
    describe('log user in', () => {
      const userInput = {
        account: verifieldUser.email,
        password: verifieldUser.password,
      }
      it('should return a 200 and an access token', async () => {
        const user = await userModel.create({
          ...verifieldUser,
          password: await AppCrypto.setHash(verifieldUser.password),
        })
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(body.message).toBe('Login successful')
        expect(body.data.accessToken).toBeDefined()
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(statusCode).toBe(200)

        expect(setActivityMock).toHaveBeenCalledTimes(1)
        expect(setActivityMock).toHaveBeenCalledWith(
          user.toObject({ getters: true }),
          ActivityForWho.USER,
          ActivityCategory.PROFILE,
          'you logged in to your account'
        )

        expect(sendEmailVerificationMailMock).not.toBeCalled()
      })
    })
  })

  describe('update password', () => {
    const url = baseUrl + 'update-password'
    describe('given user does not exsit', () => {
      const payload = {
        oldPassword: '1234567890',
        password: '12345678',
        confirmPassword: '12345678',
      }
      it('should return a 401', async () => {
        const { statusCode, body } = await request.patch(url).send(payload)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')

        const usersCount = await userModel.count()

        expect(usersCount).toBe(0)
      })
    })
    describe('given input are invalid', () => {
      const payload = {
        oldPassword: '12342',
        password: '12341',
        confirmPassword: '123411',
      }
      it('should return a 400', async () => {
        const user = await userModel.create(existingUser)
        const token = Encryption.createToken(user)
        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given current password is not currect', () => {
      const payload = {
        oldPassword: '12345678',
        password: '11111111',
        confirmPassword: '11111111',
      }
      it('should return a 400', async () => {
        const user = await userModel.create(existingUser)
        const token = Encryption.createToken(user)
        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Incorrect password')
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(statusCode).toBe(400)
      })
    })
    describe('given information provided are complete', () => {
      const payload = {
        oldPassword: existingUser.password,
        password: '11111111',
        confirmPassword: '11111111',
      }
      it('should return a 200', async () => {
        const user = await userModel.create({
          ...existingUser,
          password: await AppCrypto.setHash(existingUser.password),
        })
        const token = Encryption.createToken(user)
        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Password updated successfully')
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(statusCode).toBe(200)

        expect(setActivityMock).toHaveBeenCalledTimes(1)
        expect(setActivityMock).toHaveBeenCalledWith(
          {
            ...user.toObject({ getters: true }),
            password: expect.any(String),
            updatedAt: expect.anything(),
          },
          ActivityForWho.USER,
          ActivityCategory.PROFILE,
          'you updated your password'
        )

        expect(body.data.user).toEqual({
          ...existingUser,
          __v: 0,
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          password: expect.not.stringContaining(user.password),
        })
      })
    })
    describe('admin: given user is not an admin', () => {
      const payload = {
        password: '123456789',
        confirmPassword: '123456789',
      }
      it('should return a 400', async () => {
        const user = await userModel.create(existingUser)

        const notAdmin = await userModel.create(verifieldUser)
        const token = Encryption.createToken(notAdmin)
        const { statusCode, body } = await request
          .patch(url + `/${user._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Unauthorized')
      })
    })
    describe('admin: given input are invalid', () => {
      const payload = {
        password: '12341',
        confirmPassword: '123411',
      }
      it('should return a 400', async () => {
        const user = await userModel.create(existingUser)

        const admin = await userModel.create(adminUser)
        const token = Encryption.createToken(admin)
        const { statusCode, body } = await request
          .patch(url + `/${user._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe(
          '"password" length must be at least 8 characters long'
        )
      })
    })
    describe('admin: given user does not exsit', () => {
      const payload = {
        password: '123456789',
        confirmPassword: '123456789',
      }
      it('should return a 400', async () => {
        const admin = await userModel.create(adminUser)
        const token = Encryption.createToken(admin)
        const { statusCode, body } = await request
          .patch(url + `/${new Types.ObjectId()}`)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(statusCode).toBe(404)
      })
    })
    describe('admin: given information provided are complete', () => {
      const payload = {
        password: '123456789',
        confirmPassword: '123456789',
      }
      it('should return a 200', async () => {
        const user = await userModel.create(existingUser)

        const admin = await userModel.create(adminUser)
        const token = Encryption.createToken(admin)
        const { statusCode, body } = await request
          .patch(url + `/${user._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Password updated successfully')
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(statusCode).toBe(200)

        expect(setActivityMock).toHaveBeenCalledTimes(1)
        expect(setActivityMock).toHaveBeenCalledWith(
          {
            ...user.toObject({ getters: true }),
            password: expect.any(String),
            updatedAt: expect.anything(),
          },
          ActivityForWho.USER,
          ActivityCategory.PROFILE,
          'you updated your password'
        )
      })
    })
  })

  describe('forget password', () => {
    const url = baseUrl + 'forget-password'
    describe('given inputs are not valid', () => {
      const userInput = {
        account: 'j',
      }
      it('should return a 400', async () => {
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Invalid email or username')
      })
    })

    describe('given user does not exist', () => {
      const userInput = {
        account: 'johndoe',
      }
      it('should return a 404', async () => {
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe(
          'Could not find a user with that Email or Username'
        )
      })
    })

    describe('given user exist and input are valid', () => {
      const userInput = {
        account: 'john',
      }
      it('should return 200 and send a reset password email', async () => {
        await userModel.create(existingUser)
        const { statusCode, body } = await request.post(url).send(userInput)

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.INFO)
        expect(body.message).toBe(
          'A reset password link has been sent to your email address'
        )

        expect(createResetPasswordMock).toHaveBeenCalledTimes(1)

        expect(sendResetPasswordMailMock).toHaveBeenCalledTimes(1)

        expect(sendResetPasswordMailMock).toHaveBeenCalledWith(
          existingUser.email,
          existingUser.username,
          'password reset link'
        )
      })
    })
  })

  describe('reset password', () => {
    const url = baseUrl + 'reset-password'
    describe('given incomplete inputs', () => {
      const userInput = {
        key: 'user key',
        verifyToken: 'verify token',
        password: '',
        confirmPassword: '',
      }
      it('should return a 400', async () => {
        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('"password" is not allowed to be empty')
      })
    })

    describe('given key is not valid', () => {
      const userInput = {
        key: 'invalid user key',
        verifyToken: 'verify token',
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      it('should return a 400', async () => {
        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Invalid or expired token')
      })
    })

    describe('given token has expired', () => {
      const userInput = {
        key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
        verifyToken: 'verify token',
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      const key = userInput.key
      const expires = new Date().getTime()
      it('should return a 400', async () => {
        const token = await AppCrypto.setHash(userInput.verifyToken)

        await userModel.create(verifieldUser)
        await resetPasswordModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Invalid or expired token')
      })
    })

    describe('given token is not valid', () => {
      const userInput = {
        key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
        verifyToken: 'invalid verify token',
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      const key = userInput.key
      const expires =
        new Date().getTime() + AppConstants.resetPasswordExpiresTime

      it('should return a 400', async () => {
        const token = await AppCrypto.setHash('valid token')
        await userModel.create(verifieldUser)
        await resetPasswordModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Invalid or expired token')
      })
    })

    describe('given user those not exist', () => {
      const userInput = {
        key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
        verifyToken: 'valid verify token',
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      const key = userInput.key
      const expires =
        new Date().getTime() + AppConstants.resetPasswordExpiresTime

      it('should return a 404', async () => {
        const token = await AppCrypto.setHash(userInput.verifyToken)
        await resetPasswordModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(body.message).toBe('User not found')
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(statusCode).toBe(404)
      })
    })

    describe('given all info are valid', () => {
      const userInput = {
        key: verifieldUser.key,
        verifyToken: 'valid verify token',
        password: '1234567890',
        confirmPassword: '1234567890',
      }
      const key = userInput.key
      const expires =
        new Date().getTime() + AppConstants.resetPasswordExpiresTime

      it('should return a 200, update password, delete the token and create an activity', async () => {
        const token = await AppCrypto.setHash(userInput.verifyToken)
        const user = await userModel.create(verifieldUser)
        await resetPasswordModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(body.message).toBe('Password updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(setActivityMock).toHaveBeenCalledTimes(1)

        expect(setActivityMock).toHaveBeenCalledWith(
          {
            ...user.toObject({ getters: true }),
            password: expect.any(String),
            updatedAt: expect.anything(),
          },
          ActivityForWho.USER,
          ActivityCategory.PROFILE,
          'you reset your password'
        )
      })
    })
  })

  describe('verify email', () => {
    const url = baseUrl + 'verify-email'
    describe('given incomplete inputs', () => {
      const userInput = {
        key: 'user key',
        verifyToken: '',
      }
      it('should return a 400', async () => {
        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('"Verify Token" is not allowed to be empty')
      })
    })

    describe('given key is not valid', () => {
      const userInput = {
        key: 'invalid user key',
        verifyToken: 'verify token',
      }
      it('should return a 400', async () => {
        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Invalid or expired token')
      })
    })

    describe('given token has expired', () => {
      const userInput = {
        key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
        verifyToken: 'verify token',
      }
      const key = userInput.key
      const expires = new Date().getTime()
      it('should return a 400', async () => {
        const token = await AppCrypto.setHash(userInput.verifyToken)
        await userModel.create(verifieldUser)
        await emailVerificationModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Invalid or expired token')
      })
    })

    describe('given token is not valid', () => {
      const userInput = {
        key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
        verifyToken: 'invalid verify token',
      }
      const key = userInput.key
      const expires =
        new Date().getTime() + AppConstants.resetPasswordExpiresTime

      it('should return a 400', async () => {
        const token = await AppCrypto.setHash('valid token')
        await userModel.create(verifieldUser)
        await emailVerificationModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(body.message).toBe('Invalid or expired token')
      })
    })

    describe('given user those not exist', () => {
      const userInput = {
        key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
        verifyToken: 'valid verify token',
      }
      const key = userInput.key
      const expires =
        new Date().getTime() + AppConstants.resetPasswordExpiresTime

      it('should return a 404', async () => {
        const token = await AppCrypto.setHash(userInput.verifyToken)
        await emailVerificationModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)

        expect(body.message).toBe('User not found')
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(statusCode).toBe(404)
      })
    })

    describe('given all info are valid', () => {
      const userInput = {
        key: verifieldUser.key,
        verifyToken: 'valid verify token',
      }
      const key = userInput.key
      const expires =
        new Date().getTime() + AppConstants.resetPasswordExpiresTime

      it('should return a 200, send a welcome email and create an activity log', async () => {
        const token = await AppCrypto.setHash(userInput.verifyToken)

        const user = await userModel.create(verifieldUser)
        await emailVerificationModel.create({ key, token, expires })

        const { statusCode, body } = await request.patch(url).send(userInput)
        const userObj = user.toObject({ getters: true })

        expect(body.message).toBe('Email successfully verifield')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(sendWelcomeMailMock).toHaveBeenCalledTimes(1)
        expect(sendWelcomeMailMock.mock.calls[0][0]._id.toString()).toBe(
          userObj._id.toString()
        )

        expect(setActivityMock).toHaveBeenCalledTimes(1)

        expect(setActivityMock).toHaveBeenCalledWith(
          userObj,
          ActivityForWho.USER,
          ActivityCategory.PROFILE,
          'you verifield your email address'
        )
      })
    })
  })
})
