import { planA, planA_id } from './../../plan/__test__/plan.payload'
import PlanModel from '../../../modules/plan/plan.model'
import Cryptograph from '../../../core/cryptograph'
import {
  investmentB,
  investmentB_id,
} from './../../investment/__test__/investment.payload'
import {
  adminAInput,
  userAInput,
  userB,
  userB_id,
} from './../../user/__test__/user.payload'
import { pairA_id, pairC_id } from './../../pair/__test__/pair.payload'
import { createNotificationMock } from '../../notification/__test__/notification.mock'
import { createTransactionMock } from '../../transaction/__test__/transaction.mock'
import forecastModel from '../../forecast/forecast.model'
import {
  NotificationTitle,
  NotificationForWho,
} from '../../notification/notification.enum'
import { TransactionTitle } from '../../transaction/transaction.enum'
import { ForecastMove, ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { adminA, userA, userA_id } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { Types } from 'mongoose'

import {
  forecastA,
  forecastA_id,
  forecastAObj,
  forecastB,
} from './forecast.payload'
import { UserEnvironment } from '../../user/user.enum'
import {
  investmentA,
  investmentAObj,
  investmentA_id,
} from '../../investment/__test__/investment.payload'
import { fetchInvestmentMock } from '../../investment/__test__/investment.mock'
import { fetchPairMock } from '../../pair/__test__/pair.mock'

import ForecastService from '../forecast.service'
import { dynamicRangeMock } from '../../math/__test__/math.mock'
import { InvestmentStatus } from '../../investment/investment.enum'
import { IUser } from '../../user/user.interface'
import { IForecast } from '../forecast.interface'
import investmentModel from '../../investment/investment.model'
import { StatusCode } from '../../../core/apiResponse'

describe('forecast', () => {
  const baseUrl = '/api/forecast/'
  const masterUrl = '/api/master/forecast/'
  describe('create forecast on live mode and demo', () => {
    const url = masterUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
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
          investmentId: investmentA_id,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"pairId" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given investment those not exits', () => {
      it('should throw a 404 error', async () => {
        const investmentId = new Types.ObjectId().toString()
        const pairId = new Types.ObjectId().toString()
        const payload = {
          investmentId,
          pairId,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchInvestmentMock).toHaveBeenCalledTimes(1)
        expect(fetchInvestmentMock).toHaveBeenCalledWith(investmentId)
      })
    })
    describe('given user those not exits', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: new Types.ObjectId().toString(),
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given pair those not exits', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: new Types.ObjectId().toString(),
        }

        await userModel.create({ ...userAInput, _id: userA_id })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('The selected pair no longer exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
        expect(fetchPairMock).toHaveBeenCalledWith(payload.pairId)
      })
    })
    describe('given pair is not compatible', () => {
      it('should throw a 400 error', async () => {
        const pairId = pairC_id
        const payload = {
          investmentId: investmentA_id,
          pairId,
        }
        await userModel.create({ ...userAInput, _id: userA_id })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'The pair is not compatible with this investment plan'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201 and the forecast payload', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: pairA_id,
        }

        await userModel.create({ ...userAInput, _id: userA_id })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          forecast: {},
        })
      })
    })
  })

  describe('update forecast status', () => {
    // const url = masterUrl + `update-status/:forecastId`

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const payload = {
          status: '',
        }

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

    describe('given payload is not valid', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const payload = {
          status: '',
        }

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"forecastId" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given forecast was not found', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const payload = {
          status: ForecastStatus.ON_HOLD,
        }

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given forecast status is not allowed', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const forecast = await forecastModel.create({
          ...forecastA,
          _id: forecastA_id,
        })

        const payload = {
          status: ForecastStatus.PREPARING,
        }

        const url = masterUrl + `update-status/${forecast._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status not allowed')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given forecast status is not allowed for auto forecasts', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const forecast = await forecastModel.create({
          ...forecastA,
          _id: forecastA_id,
        })

        const statuses = [
          ForecastStatus.PREPARING,
          ForecastStatus.ON_HOLD,
          ForecastStatus.RUNNING,
          ForecastStatus.MARKET_CLOSED,
          ForecastStatus.SETTLED,
        ]

        for (const status of Object.values(ForecastStatus)) {
          const payload = {
            status: status,
          }

          const url = masterUrl + `update-status/${forecast._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          if (statuses.includes(status)) {
            expect(body.message).toBe('Status not allowed')
            expect(statusCode).toBe(400)
            expect(body.status).toBe(StatusCode.DANGER)
          }
        }
      })
    })

    describe('given all validations passed', () => {
      for (const status of Object.values(ForecastStatus)) {
        it(`should executes forecast with ${status} status`, async () => {
          const admin = await userModel.create(adminAInput)
          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const { ...userA1 } = userA
          const token = Cryptograph.createToken(admin)

          const forecast = await forecastModel.create({
            ...forecastA,
            _id: forecastA_id,
            user: user._id,
          })

          let payload: any
          let statusCode: any
          let body: any
        })
      }
    })
  })

  describe('update forecast', () => {
    // const url = `${masterUrl}update/:forecastId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${masterUrl}update/${new Types.ObjectId()}`

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
          pairId: new Types.ObjectId(),
          stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"profit" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given forecast those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          pairId: new Types.ObjectId(),
          stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPairMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given pair those not exist', () => {
      it('should return a 404 error', async () => {
        const forecast = await forecastModel.create(forecastA)
        const payload = {
          forecastId: forecast._id,
          pairId: new Types.ObjectId().toString(),
          stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}update/${forecast._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('The selected pair no longer exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
        expect(fetchPairMock).toHaveBeenCalledWith(payload.pairId)
      })
    })
    describe('given pair is not compatible', () => {
      it('should return a 400 error', async () => {
        await PlanModel.create({ ...planA, _id: planA_id })
        const forecast = await forecastModel.create(forecastA)
        const payload = {
          pairId: pairC_id,
          stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}update/${forecast._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'The pair is not compatible with this forecast'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
      })
    })
    describe('on success entry', () => {
      it('should return a 200 and payload', async () => {
        await PlanModel.create({ ...planA, _id: planA_id })

        const forecast = await forecastModel.create(forecastA)
        const payload = {
          pairId: pairA_id,
          stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}update/${forecast._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('get plans forecast', () => {
    // const url = `${baseUrl}plan/:planId`
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}plan/${new Types.ObjectId()}`
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('on successfull entry', () => {
      it('should return an array of current users forecasts', async () => {
        const forecast1 = await forecastModel.create(forecastA)
        await forecastModel.create(forecastB)
        await PlanModel.create({ ...planA, _id: planA_id })
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const user = await userModel.create({ ...userAInput, _id: userA_id })
        const token = Cryptograph.createToken(user)

        const url = `${baseUrl}plan/${planA_id}`

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecasts fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.forecasts.length).toBe(1)
      })
    })
  })

  describe('delete forecast', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${masterUrl}delete/${new Types.ObjectId().toString()}`

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given forecast those not exist', () => {
      it('should return a 404 error', async () => {
        const url = `${masterUrl}delete/${new Types.ObjectId().toString()}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given forecast has not been settled', () => {
      it('should return a 400 error', async () => {
        const forecast = await forecastModel.create(forecastA)
        const url = `${masterUrl}delete/${forecast._id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200 with a payload', async () => {
        const forecast = await forecastModel.create({
          ...forecastA,
          status: ForecastStatus.SETTLED,
        })

        const url = `${masterUrl}delete/${forecast._id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.forecast._id).toBe(forecast._id.toString())

        expect(await forecastModel.count()).toBe(0)
      })
    })
  })
})
