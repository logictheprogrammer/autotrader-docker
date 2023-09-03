import { IWithdrawalMethod } from './../withdrawalMethod.interface'
import { WithdrawalMethodStatus } from '../../../modules/withdrawalMethod/withdrawalMethod.enum'
import withdrawalMethodModel from '../../../modules/withdrawalMethod/withdrawalMethod.model'
import { request } from '../../../test'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  withdrawalMethodA,
  withdrawalMethodB,
  withdrawalMethodC,
  withdrawalMethodUpdated,
} from './withdrawalMethod.payload'
import {
  currencyA,
  currencyA_id,
} from '../../currency/__test__/currency.payload'
import { getCurrencyMock } from '../../currency/__test__/currency.mock'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import AppRepository from '../../app/app.repository'
import { IUser } from '../../user/user.interface'
import AppObjectId from '../../app/app.objectId'

const userRepository = new AppRepository<IUser>(userModel)
const withdrawalMethodRepository = new AppRepository<IWithdrawalMethod>(
  withdrawalMethodModel
)

describe('withdrawal method', () => {
  const baseUrl = '/api/withdrawal-method/'
  describe('create withdrawal method', () => {
    const url = baseUrl + 'create'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userRepository.create(userA).save()
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
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"fee" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given fee is greater than min withdrawal', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          fee: 10,
          minWithdrawal: 5,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min withdrawal must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: new AppObjectId().toString(),
          network: withdrawalMethodA.network,
          fee: withdrawalMethodA.fee,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
        expect(getCurrencyMock).toHaveBeenCalledTimes(1)
        expect(getCurrencyMock).toHaveBeenCalledWith(payload.currencyId)
      })
    })
    describe('given withdrawal method already exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          fee: withdrawalMethodA.fee,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This withdrawal method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const withdrawalMethodCounts = await withdrawalMethodRepository.count()

        expect(withdrawalMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: withdrawalMethodA.network,
          fee: withdrawalMethodA.fee,
          minWithdrawal: withdrawalMethodA.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method added successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.withdrawalMethod).toEqual({
          ...withdrawalMethodA,
          __v: expect.any(Number),
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })

        expect(getCurrencyMock).toHaveBeenCalledTimes(1)
        expect(getCurrencyMock).toHaveBeenCalledWith(
          payload.currencyId.toString()
        )

        const withdrawalMethodCounts = await withdrawalMethodRepository.count()

        expect(withdrawalMethodCounts).toBe(1)
      })
    })
  })

  describe('update status of withdrawal method', () => {
    const url = baseUrl + 'update-status'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          withdrawalMethodId: new AppObjectId().toString(),
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given withdrawal method those not exist', () => {
      it('should throw a 404 error', async () => {
        await withdrawalMethodRepository.create(withdrawalMethodA).save()

        const payload = {
          withdrawalMethodId: new AppObjectId().toString(),
          status: WithdrawalMethodStatus.DISABLED,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const withdrawalMethodCounts = await withdrawalMethodRepository.count()

        expect(withdrawalMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200', async () => {
        const dm = await withdrawalMethodRepository
          .create(withdrawalMethodA)
          .save()

        const payload = {
          withdrawalMethodId: dm._id,
          status: WithdrawalMethodStatus.DISABLED,
        }

        let withdrawalMethodCounts: number

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.withdrawalMethod).toEqual({
          ...withdrawalMethodA,
          __v: expect.any(Number),
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          status: WithdrawalMethodStatus.DISABLED,
        })

        withdrawalMethodCounts = await withdrawalMethodRepository.count({
          status: WithdrawalMethodStatus.ENABLED,
        })

        expect(withdrawalMethodCounts).toBe(0)

        withdrawalMethodCounts = await withdrawalMethodRepository.count({
          status: WithdrawalMethodStatus.DISABLED,
        })

        expect(withdrawalMethodCounts).toBe(1)

        // secondly
        // /////////////////////////
        const payload2 = {
          withdrawalMethodId: dm._id,
          status: WithdrawalMethodStatus.ENABLED,
        }

        const { statusCode: statusCode2, body: body2 } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload2)

        expect(body2.message).toBe('Status updated successfully')
        expect(statusCode2).toBe(200)
        expect(body2.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body2.data.withdrawalMethod).toEqual({
          ...withdrawalMethodA,
          __v: expect.any(Number),
          _id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          status: WithdrawalMethodStatus.ENABLED,
        })

        withdrawalMethodCounts = await withdrawalMethodRepository.count({
          status: WithdrawalMethodStatus.ENABLED,
        })

        expect(withdrawalMethodCounts).toBe(1)

        withdrawalMethodCounts = await withdrawalMethodRepository.count({
          status: WithdrawalMethodStatus.DISABLED,
        })

        expect(withdrawalMethodCounts).toBe(0)
      })
    })
  })

  describe('update withdrawal method', () => {
    const url = baseUrl + 'update'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          withdrawalMethodId: new AppObjectId().toString(),
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"fee" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given fee is greater than min withdrawal', () => {
      it('should throw a 400 error', async () => {
        await withdrawalMethodRepository.create(withdrawalMethodA).save()
        const payload = {
          withdrawalMethodId: new AppObjectId(),
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: 10,
          minWithdrawal: 9,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min withdrawal must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given withdrawal method those not exist', () => {
      it('should throw a 404 error', async () => {
        await withdrawalMethodRepository.create(withdrawalMethodA).save()
        const payload = {
          withdrawalMethodId: new AppObjectId().toString(),
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const dm = await withdrawalMethodRepository
          .create(withdrawalMethodA)
          .save()
        const payload = {
          withdrawalMethodId: dm._id,
          currencyId: new AppObjectId().toString(),
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given withdrawal method already exist', () => {
      it('should throw a 404 error', async () => {
        const dm = await withdrawalMethodRepository
          .create(withdrawalMethodA)
          .save()
        const payload = {
          withdrawalMethodId: dm._id,
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }
        await withdrawalMethodRepository
          .create({ ...withdrawalMethodA, ...payload })
          .save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This withdrawal method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const withdrawalMethodCounts = await withdrawalMethodRepository.count()

        expect(withdrawalMethodCounts).toBe(2)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and updated withdrawal method', async () => {
        const dm = await withdrawalMethodRepository
          .create(withdrawalMethodA)
          .save()
        const payload = {
          withdrawalMethodId: dm._id,
          currencyId: currencyA_id,
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Withdrawal method updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.withdrawalMethod).toEqual({
          ...currencyA,
          network: withdrawalMethodUpdated.network,
          fee: withdrawalMethodUpdated.fee,
          minWithdrawal: withdrawalMethodUpdated.minWithdrawal,
          __v: expect.any(Number),
          _id: expect.any(String),
          currency: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          status: WithdrawalMethodStatus.ENABLED,
        })
      })
    })
  })

  describe('get all withdrawal methods', () => {
    const url = baseUrl + 'master'
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          withdrawalMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        await withdrawalMethodRepository.create(withdrawalMethodA).save()
        await withdrawalMethodRepository.create(withdrawalMethodB).save()
        await withdrawalMethodRepository
          .create({
            ...withdrawalMethodC,
            status: WithdrawalMethodStatus.DISABLED,
          })
          .save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          withdrawalMethods: [
            {
              ...withdrawalMethodA,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            {
              ...withdrawalMethodB,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            {
              ...withdrawalMethodC,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              status: WithdrawalMethodStatus.DISABLED,
            },
          ],
        })
      })
    })
  })

  describe('get enabled withdrawal methods', () => {
    const url = baseUrl
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data).toEqual({
          withdrawalMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        await withdrawalMethodRepository.create(withdrawalMethodA).save()
        await withdrawalMethodRepository.create(withdrawalMethodB).save()
        await withdrawalMethodRepository
          .create({
            ...withdrawalMethodC,
            status: WithdrawalMethodStatus.DISABLED,
          })
          .save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          withdrawalMethods: [
            {
              ...withdrawalMethodA,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
            {
              ...withdrawalMethodB,
              __v: expect.any(Number),
              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ],
        })
      })
    })
  })

  describe('delete withdrawal method', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)
        const url = `${baseUrl}delete/id`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given withdrawal method those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}delete/${new AppObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const withdrawalMethod = await withdrawalMethodRepository
          .create(withdrawalMethodA)
          .save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)
        const url = `${baseUrl}delete/${withdrawalMethod._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Withdrawal method deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        const withdrawalMethodCount = await withdrawalMethodRepository.count()

        expect(withdrawalMethodCount).toBe(0)
      })
    })
  })
})
