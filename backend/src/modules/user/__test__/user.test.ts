import { request } from '../../../test'
import { UserAccount, UserStatus } from '../user.enum'
import userModel from '../user.model'
import {
  adminAInput,
  adminBInput,
  editedUser,
  userA,
  userAInput,
  userB,
  userBInput,
} from './user.payload'
import { sendMailMock } from '../../mail/__test__/mail.mock'
import renderFile from '../../../utils/renderFile'
import { SiteConstants } from '../../config/config.constants'
import { Types } from 'mongoose'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'
import Helpers from '../../../utils/helpers'

describe('users', () => {
  const baseUrl = '/api/users'
  const masterUrl = '/api/master/users'
  describe('Fund User', () => {
    // const url = `${masterUrl}/fund/:userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}/fund/userId`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          account: UserAccount.MAIN_BALANCE,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/fund/userId`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"amount" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          account: UserAccount.MAIN_BALANCE,
          amount: 1000,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/fund/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user those not have sufficient balance', () => {
      it('should return a 400 error', async () => {
        const payload = {
          account: UserAccount.MAIN_BALANCE,
          amount: -(userA.mainBalance + 10),
        }

        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/fund/${user._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          `Insufficient balance in ${Helpers.fromCamelToTitleCase(
            payload.account
          )} Account`
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const account = UserAccount.MAIN_BALANCE
        const payload = {
          account,
          amount: 1000,
        }

        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/fund/${user._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(`User credited successfully`)
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.user[payload.account]).toBe(
          user[payload.account] + payload.amount
        )

        const userCount = await userModel.count({
          _id: user._id,
          [UserAccount.MAIN_BALANCE]: user[payload.account] + payload.amount,
        })

        expect(userCount).toBe(1)
      })
    })
  })
  describe('update profile', () => {
    const url = `${baseUrl}/update-profile`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {}

        const { statusCode, body } = await request.put(url).send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given invalid inputs', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          username: editedUser.username,
        }

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given username already exist', () => {
      it('should throw a 409 error', async () => {
        const payload = {
          name: editedUser.name,
          username: userB.username,
          country: editedUser.country,
        }

        await userModel.create(userBInput)
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('A user with this username already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          name: editedUser.name,
          username: editedUser.username,
        }

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Profile updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.user.name).toBe(payload.name)
        expect(body.data.user.username).toBe(payload.username)

        const userCount = await userModel.count({
          _id: user._id,
          name: payload.name,
          username: payload.username,
        })

        expect(userCount).toBe(1)
      })
    })
  })
  describe('update user profile', () => {
    // const url = `${masterUrl}/update-profile/:userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}/update-profile/userId`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          username: editedUser.username,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-profile/userId`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          name: editedUser.name,
          username: editedUser.username,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-profile/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given username already exist', () => {
      it('should throw a 409 error', async () => {
        const payload = {
          name: editedUser.name,
          username: userB.username,
        }

        await userModel.create(userBInput)
        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-profile/${user._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('A user with this username already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          name: editedUser.name,
          username: editedUser.username,
        }

        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-profile/${user._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Profile updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.user.name).toBe(payload.name)
        expect(body.data.user.username).toBe(payload.username)

        const userCount = await userModel.count({
          _id: user._id,
          name: payload.name,
          username: payload.username,
        })

        expect(userCount).toBe(1)
      })
    })
  })
  describe('update user email', () => {
    // const url = `${masterUrl}/update-email/:userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}/update-email/userId`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          //   email: editedUser.email,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-email/userId`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"email" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          email: editedUser.email,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-email/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given email already exist', () => {
      it('should throw a 409 error', async () => {
        const payload = {
          email: userB.email,
        }

        await userModel.create(userBInput)
        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-email/${user._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('A user with this email already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          email: editedUser.email,
        }

        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-email/${user._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Email updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.user.email).toBe(payload.email)

        const userCount = await userModel.count({
          _id: user._id,
          email: payload.email,
        })

        expect(userCount).toBe(1)
      })
    })
  })
  describe('update user status', () => {
    // const url = `${masterUrl}/update-status/:userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}/update-status/userId`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          //   status: UserStatus.SUSPENDED,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-status/userId`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          status: UserStatus.SUSPENDED,
        }

        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-status/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user is admin', () => {
      it('should return a 400 error', async () => {
        const payload = {
          status: UserStatus.SUSPENDED,
        }

        // const user = await userModel.create(userAInput)
        const admin2 = await userModel.create(adminBInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-status/${admin2._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Users with admin role can not be suspended')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          status: UserStatus.SUSPENDED,
        }

        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/update-status/${user._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.user.status).toBe(payload.status)

        const userCount = await userModel.count({
          _id: user._id,
          status: payload.status,
        })

        expect(userCount).toBe(1)
      })
    })
  })
  describe('delete user', () => {
    // const url = `${masterUrl}/delete/:userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}/delete/userId`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        // const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given user is an admin', () => {
      it('should return a 400 error', async () => {
        // const user = await userModel.create(userAInput)

        const admin2 = await userModel.create(adminBInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/delete/${admin2._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Users with admin role can not be deleted')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/delete/${user._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('User deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const userCount = await userModel.count()
        expect(userCount).toBe(1)
      })
    })
  })
  describe('get referred users', () => {
    const url = `${baseUrl}/referred-users`
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return an array of the referred users', async () => {
        await userModel.create({
          ...userBInput,
          referred: new Types.ObjectId().toString(),
        })

        const user = await userModel.create(userAInput)
        const user2 = await userModel.create({
          ...userBInput,
          referred: user._id,
        })

        const token = Cryptograph.createToken(user)
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Users fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.users.length).toBe(1)
        expect(body.data.users[0].username).toBe(user2.username)
      })
    })
  })
  describe('get all referred users', () => {
    const url = `${masterUrl}/referred-users`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
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
    describe('on success', () => {
      it('should return an array of the referred users', async () => {
        const user2 = await userModel.create({
          ...userBInput,
          referred: new Types.ObjectId().toString(),
        })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Users fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.users[0].username).toBe(user2.username)
      })
    })
  })
  describe('get all users', () => {
    const url = `${masterUrl}`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
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
    describe('on success', () => {
      it('should return an array of the referred users', async () => {
        const user2 = await userModel.create(userBInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Users fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.users[0].username).toBe(user2.username)
      })
    })
  })
  describe('send user email', () => {
    // const url = `${masterUrl}/send-email/userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}/send-email/userId`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          subject: 'subject',
          heading: 'heading',
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/send-email/userId`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"content" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          subject: 'subject',
          heading: 'heading',
          content: 'content',
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}/send-email/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should send user an email', async () => {
        const payload = {
          subject: 'subject',
          heading: 'heading',
          content: 'content',
        }

        const user = await userModel.create(userAInput)
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/send-email/${user._id}`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Email successfully sent')

        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(sendMailMock).toHaveBeenCalledTimes(1)

        const emailContent = await renderFile('email/custom', {
          heading: payload.heading,
          content: payload.content,
          config: SiteConstants,
        })

        expect(sendMailMock).toHaveBeenCalledTimes(1)
        expect(sendMailMock).toHaveBeenCalledWith({
          subject: payload.subject,
          to: user.email,
          text: Helpers.clearHtml(emailContent),
          html: emailContent,
        })
      })
    })
  })
})
