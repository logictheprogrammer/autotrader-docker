import { DepositMethodStatus } from '../../../modules/depositMethod/depositMethod.enum'
import depositMethodModel from '../../../modules/depositMethod/depositMethod.model'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import {
  depositMethodA,
  depositMethodB,
  depositMethodC,
  depositMethodUpdated,
} from './depositMethod.payload'
import { currencyA_id } from '../../currency/__test__/currency.payload'
import { fetchCurrencyMock } from '../../currency/__test__/currency.mock'
import { Types } from 'mongoose'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'

describe('deposit method', () => {
  const baseUrl = '/api/deposit-method/'
  const masterUrl = '/api/master/deposit-method/'
  describe('create deposit method', () => {
    const url = masterUrl + 'create'
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
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"address" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given fee is greater than min deposit', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: 10,
          minDeposit: 5,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min deposit must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: new Types.ObjectId(),
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
        expect(fetchCurrencyMock).toHaveBeenCalledTimes(1)
        expect(fetchCurrencyMock).toHaveBeenCalledWith({
          _id: payload.currencyId.toString(),
        })
      })
    })

    describe('given deposit method already exist', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This deposit method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodA.network,
          fee: depositMethodA.fee,
          minDeposit: depositMethodA.minDeposit,
          address: depositMethodA.address,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.depositMethod.network).toBe(
          depositMethodA.network.toString()
        )

        expect(fetchCurrencyMock).toHaveBeenCalledTimes(1)
        expect(fetchCurrencyMock).toHaveBeenCalledWith({
          _id: payload.currencyId.toString(),
        })

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(1)
      })
    })
  })

  describe('update status of deposit method', () => {
    // const url = masterUrl + `update-status/:depositMethodId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {}

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"status" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given deposit method those not exist', () => {
      it('should throw a 404 error', async () => {
        await depositMethodModel.create(depositMethodA)

        const payload = {
          status: DepositMethodStatus.DISABLED,
        }

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(1)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200', async () => {
        const dm = await depositMethodModel.create(depositMethodA)

        const payload = {
          status: DepositMethodStatus.DISABLED,
        }

        const url = masterUrl + `update-status/${dm._id}`

        let depositMethodCounts: number

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.depositMethod.network).toBe(
          depositMethodA.network.toString()
        )
        expect(body.data.depositMethod.status).toBe(payload.status)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.ENABLED,
        })

        expect(depositMethodCounts).toBe(0)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.DISABLED,
        })

        expect(depositMethodCounts).toBe(1)

        // secondly
        // /////////////////////////
        const payload2 = {
          status: DepositMethodStatus.ENABLED,
        }

        const url1 = masterUrl + `update-status/${dm._id}`

        const { statusCode: statusCode2, body: body2 } = await request
          .patch(url1)
          .set('Authorization', `Bearer ${token}`)
          .send(payload2)

        expect(body2.message).toBe('Status updated successfully')
        expect(statusCode2).toBe(200)
        expect(body2.status).toBe(StatusCode.SUCCESS)

        expect(body2.data.depositMethod.network).toBe(
          depositMethodA.network.toString()
        )
        expect(body2.data.depositMethod.status).toBe(payload2.status)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.ENABLED,
        })

        expect(depositMethodCounts).toBe(1)

        depositMethodCounts = await depositMethodModel.count({
          status: DepositMethodStatus.DISABLED,
          _id: body.data.depositMethod._id,
        })

        expect(depositMethodCounts).toBe(0)
      })
    })
  })

  describe('update price', () => {
    // const url = masterUrl + `update-price/:depositMethodId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {
          price: 200,
        }
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url =
          masterUrl + `update-price/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const payload = {
          price: '',
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url =
          masterUrl + `update-price/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"price" must be a number')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given depositMethod those not exist', () => {
      it('should throw a 404 not found', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          price: 1000,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url =
          masterUrl + `update-price/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
    describe('given deposit method is in auto mode', () => {
      it('should return a 400 error', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const payload = {
          price: 1000,
        }

        const url = masterUrl + `update-price/${depositMethod._id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Can not update a deposit method price that is on auto update mode'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and depositMethod payload', async () => {
        const depositMethod = await depositMethodModel.create({
          ...depositMethodA,
          autoUpdate: false,
        })

        const payload = {
          price: 1000,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-price/${depositMethod._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Price updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.depositMethod._id).toBe(depositMethod._id.toString())
        expect(body.data.depositMethod.network).toBe(depositMethod.network)
        expect(body.data.depositMethod.address).toBe(depositMethod.address)
        expect(body.data.depositMethod.fee).toBe(depositMethod.fee)
        expect(body.data.depositMethod.price).toBe(payload.price)
        expect(body.data.depositMethod.autoUpdate).toBe(false)

        const depositMethodCount = await depositMethodModel.count({
          _id: body.data.depositMethod._id,
          price: 1000,
        })

        expect(depositMethodCount).toBe(1)
      })
    })
  })

  describe('update mode', () => {
    // const url = masterUrl + `update-mode/:depositMethodId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {
          autoUpdate: true,
        }

        const url = masterUrl + `update-mode/${new Types.ObjectId().toString()}`
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const payload = {}
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-mode/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"autoUpdate" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given depositMethod those not exist', () => {
      it('should throw a 404 not found', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          autoUpdate: false,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-mode/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and depositMethod payload', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const payload = {
          autoUpdate: false,
        }
        const payload2 = {
          autoUpdate: true,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update-mode/${depositMethod._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Mode updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.depositMethod._id).toBe(depositMethod._id.toString())
        expect(body.data.depositMethod.network).toBe(depositMethod.network)
        expect(body.data.depositMethod.address).toBe(depositMethod.address)
        expect(body.data.depositMethod.fee).toBe(depositMethod.fee)
        expect(body.data.depositMethod.price).toBe(depositMethod.price)
        expect(body.data.depositMethod.autoUpdate).toBe(false)

        const url1 = masterUrl + `update-mode/${depositMethod._id}`

        const { statusCode: statusCode2, body: body2 } = await request
          .patch(url1)
          .set('Authorization', `Bearer ${token}`)
          .send(payload2)

        expect(body2.message).toBe('Mode updated successfully')
        expect(statusCode2).toBe(200)
        expect(body2.status).toBe(StatusCode.SUCCESS)

        expect(body2.data.depositMethod._id).toBe(depositMethod._id.toString())
        expect(body2.data.depositMethod.network).toBe(depositMethod.network)
        expect(body2.data.depositMethod.address).toBe(depositMethod.address)
        expect(body2.data.depositMethod.fee).toBe(depositMethod.fee)
        expect(body2.data.depositMethod.price).toBe(depositMethod.price)
        expect(body2.data.depositMethod.autoUpdate).toBe(true)

        const depositMethodCount = await depositMethodModel.count({
          _id: body2.data.depositMethod._id,
          autoUpdate: true,
        })

        expect(depositMethodCount).toBe(1)
      })
    })
  })

  describe('update deposit method', () => {
    // const url = masterUrl + `update/:depositMethodId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"address" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given fee is greater than min deposit', () => {
      it('should throw a 400 error', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: 10,
          minDeposit: 9,
        }

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Min deposit must be greater than the fee')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given deposit method those not exist', () => {
      it('should throw a 404 error', async () => {
        await depositMethodModel.create(depositMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const url = masterUrl + `update/${new Types.ObjectId()}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given currency those not exist', () => {
      it('should throw a 404 error', async () => {
        const dm = await depositMethodModel.create(depositMethodA)
        const payload = {
          currencyId: new Types.ObjectId(),
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const url = masterUrl + `update/${dm._id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Currency not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given deposit method already exist', () => {
      it('should throw a 409 conflict error', async () => {
        const dm = await depositMethodModel.create(depositMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }
        await depositMethodModel.create({ ...depositMethodA, ...payload })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${dm._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This deposit method already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        const depositMethodCounts = await depositMethodModel.count()

        expect(depositMethodCounts).toBe(2)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and updated deposit method', async () => {
        const dm = await depositMethodModel.create(depositMethodA)
        const payload = {
          currencyId: currencyA_id,
          network: depositMethodUpdated.network,
          address: depositMethodUpdated.address,
          fee: depositMethodUpdated.fee,
          minDeposit: depositMethodUpdated.minDeposit,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${dm._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Deposit method updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        body.data.depositMethod.currencyObject = null

        expect(body.data.depositMethod._id).toBe(dm._id.toString())
        expect(body.data.depositMethod.network).toBe(
          depositMethodUpdated.network
        )
        expect(body.data.depositMethod.address).toBe(
          depositMethodUpdated.address
        )
        expect(body.data.depositMethod.fee).toBe(depositMethodUpdated.fee)
        expect(body.data.depositMethod.status).toBe(DepositMethodStatus.ENABLED)

        const depositMethodCount = await depositMethodModel.count(
          body.data.depositMethod
        )

        expect(depositMethodCount).toBe(1)
      })
    })
  })

  describe('get all deposit methods', () => {
    const url = masterUrl
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
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          depositMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        await depositMethodModel.create(depositMethodA)
        await depositMethodModel.create(depositMethodB)
        await depositMethodModel.create({
          ...depositMethodC,
          status: DepositMethodStatus.DISABLED,
        })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          depositMethods: [
            expect.objectContaining({
              address: depositMethodA.address,
              network: depositMethodA.network,
              price: depositMethodA.price,
            }),
            expect.objectContaining({
              address: depositMethodB.address,
              network: depositMethodB.network,
              price: depositMethodB.price,
            }),
            expect.objectContaining({
              address: depositMethodC.address,
              network: depositMethodC.network,
              price: depositMethodC.price,
            }),
          ],
        })
      })
    })
  })

  describe('get enabled deposit methods', () => {
    const url = baseUrl
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 200 and an empty array', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          depositMethods: [],
        })
      })
      it('should return a 200 and array', async () => {
        await depositMethodModel.create(depositMethodA)
        await depositMethodModel.create(depositMethodB)
        await depositMethodModel.create({
          ...depositMethodC,
          status: DepositMethodStatus.DISABLED,
        })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit methods fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          depositMethods: [
            expect.objectContaining({
              address: depositMethodA.address,
              network: depositMethodA.network,
              price: depositMethodA.price,
            }),
            expect.objectContaining({
              address: depositMethodB.address,
              network: depositMethodB.network,
              price: depositMethodB.price,
            }),
          ],
        })
      })
    })
  })

  describe('delete deposit method', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        const url = `${masterUrl}delete/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given deposit method those not exist', () => {
      it('should return a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200', async () => {
        const depositMethod = await depositMethodModel.create(depositMethodA)

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)
        const url = `${masterUrl}delete/${depositMethod._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Deposit method deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const depositMethodCount = await depositMethodModel.count()

        expect(depositMethodCount).toBe(0)
      })
    })
  })
})
