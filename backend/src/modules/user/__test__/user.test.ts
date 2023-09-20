import FormatString from '../../../utils/formats/formatString'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { UserAccount, UserStatus } from '../user.enum'
import userModel from '../user.model'
import { adminA, adminB, editedUser, userA, userB } from './user.payload'
import { sendMailMock } from '../../mail/__test__/mail.mock'
import renderFile from '../../../utils/renderFile'
import ParseString from '../../../utils/parsers/parseString'
import { SiteConstants } from '../../config/config.constants'
import { Types } from 'mongoose'

describe('users', () => {
  const baseUrl = '/api/users'
  describe('Fund User', () => {
    // const url = `${baseUrl}/:userId/force-fund-user`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}/userId/force-fund-user`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          account: UserAccount.MAIN_BALANCE,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/userId/force-fund-user`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"amount" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          account: UserAccount.MAIN_BALANCE,
          amount: 1000,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${new Types.ObjectId().toString()}/force-fund-user`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user those not have sufficient balance', () => {
      it('should return a 400 error', async () => {
        const payload = {
          account: UserAccount.MAIN_BALANCE,
          amount: -(userA.mainBalance + 10),
        }

        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/force-fund-user`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          `insufficient balance in ${FormatString.fromCamelToTitleCase(
            payload.account
          )} Account`
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const account = UserAccount.MAIN_BALANCE
        const payload = {
          account,
          amount: 1000,
        }

        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/force-fund-user`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(`User has been credited successfully`)
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.user[payload.account]).toBe(
          user[payload.account] + payload.amount
        )
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
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given invalid inputs', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          username: editedUser.username,
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given username already exist', () => {
      it('should throw a 409 error', async () => {
        const payload = {
          name: editedUser.name,
          username: userB.username,
          country: editedUser.country,
        }

        await userModel.create(userB)
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Username already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          name: editedUser.name,
          username: editedUser.username,
        }

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Profile updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.user.name).toBe(payload.name)
        expect(body.data.user.username).toBe(payload.username)
      })
    })
  })
  describe('update user profile', () => {
    // const url = `${baseUrl}/:userId/update-user-profile`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}/userId/update-user-profile`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          username: editedUser.username,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/userId/update-user-profile`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          name: editedUser.name,
          username: editedUser.username,
          country: editedUser.country,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${new Types.ObjectId().toString()}/update-user-profile`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given username already exist', () => {
      it('should throw a 409 error', async () => {
        const payload = {
          name: editedUser.name,
          username: userB.username,
          country: editedUser.country,
        }

        await userModel.create(userB)
        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/update-user-profile`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Username already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          name: editedUser.name,
          username: editedUser.username,
        }

        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/update-user-profile`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Profile updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.user.name).toBe(payload.name)
        expect(body.data.user.username).toBe(payload.username)
      })
    })
  })
  describe('update user email', () => {
    // const url = `${baseUrl}/:userId/update-user-email`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}/userId/update-user-email`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          //   email: editedUser.email,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/userId/update-user-email`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"email" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          email: editedUser.email,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${new Types.ObjectId().toString()}/update-user-email`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given email already exist', () => {
      it('should throw a 409 error', async () => {
        const payload = {
          email: userB.email,
        }

        await userModel.create(userB)
        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/update-user-email`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Email already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          email: editedUser.email,
        }

        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/update-user-email`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Email updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.user.email).toBe(payload.email)
      })
    })
  })
  describe('update user status', () => {
    // const url = `${baseUrl}/:userId/update-user-status`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}/userId/update-user-status`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          //   status: UserStatus.SUSPENDED,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/userId/update-user-status`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          status: UserStatus.SUSPENDED,
        }

        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${new Types.ObjectId().toString()}/update-user-status`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user is admin', () => {
      it('should return a 400 error', async () => {
        const payload = {
          status: UserStatus.SUSPENDED,
        }

        // const user = await userModel.create(userA)
        const admin2 = await userModel.create(adminB)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${admin2._id}/update-user-status`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Users with admin role can not be suspended')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const payload = {
          status: UserStatus.SUSPENDED,
        }

        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/update-user-status`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.user.status).toBe(payload.status)
      })
    })
  })
  describe('delete user', () => {
    // const url = `${baseUrl}/:userId/delete-user`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}/userId/delete-user`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        // const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${new Types.ObjectId().toString()}/delete-user`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user is an admin', () => {
      it('should return a 400 error', async () => {
        // const user = await userModel.create(userA)

        const admin2 = await userModel.create(adminB)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${admin2._id}/delete-user`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Users with admin role can not be deleted')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${user._id}/delete-user`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('User deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

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
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return an array of the referred users', async () => {
        await userModel.create({
          ...userB,
          referred: new Types.ObjectId().toString(),
        })

        const user = await userModel.create(userA)
        const user2 = await userModel.create({
          ...userB,
          referred: user._id,
        })

        const token = Encryption.createToken(user)
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referred users fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.users.length).toBe(1)
        expect(body.data.users[0].username).toBe(user2.username)
      })
    })
  })
  describe('get all referred users', () => {
    const url = `${baseUrl}/all-referred-users`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return an array of the referred users', async () => {
        const user2 = await userModel.create({
          ...userB,
          referred: new Types.ObjectId().toString(),
        })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Referred users fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.users[0].username).toBe(user2.username)
      })
    })
  })
  describe('get all users', () => {
    const url = `${baseUrl}`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return an array of the referred users', async () => {
        const user2 = await userModel.create(userB)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Users fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.users[0].username).toBe(user2.username)
      })
    })
  })
  describe('get one user', () => {
    // const url = `${baseUrl}/userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}/userId`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return an array of the referred users', async () => {
        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}/${user._id}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('User fetched')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.user.username).toBe(user.username)
      })
    })
  })
  describe('send user email', () => {
    // const url = `${baseUrl}/userId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)
        const url = `${baseUrl}/send-email/userId`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          subject: 'subject',
          heading: 'heading',
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/send-email/userId`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"content" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given user those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          subject: 'subject',
          heading: 'heading',
          content: 'content',
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}/send-email/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should send user an email', async () => {
        const payload = {
          subject: 'subject',
          heading: 'heading',
          content: 'content',
        }

        const user = await userModel.create(userA)
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const url = `${baseUrl}/send-email/${user._id}`

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Email has been sent successfully')

        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

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
          text: ParseString.clearHtml(emailContent),
          html: emailContent,
        })
      })
    })
  })
})
