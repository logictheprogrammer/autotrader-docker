import { tradeA } from './../../trade/__test__/trade.payload'
import {
  createTradeMock,
  deleteTradeMock,
  updateStatusTradeMock,
  updateTradeMock,
} from './../../trade/__test__/trade.mock'
import {
  planA,
  planA_id,
  unRunningForecastPlan_id,
} from './../../plan/__test__/plan.payload'
import PlanModel from '../../../modules/plan/plan.model'
import Cryptograph from '../../../core/cryptograph'
import {
  investmentB,
  investmentB_id,
} from './../../investment/__test__/investment.payload'
import { adminAInput, userAInput } from './../../user/__test__/user.payload'
import { pairA, pairA_id, pairD_id } from './../../pair/__test__/pair.payload'
import forecastModel from '../../forecast/forecast.model'
import { ForecastMove, ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { userA_id } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { Types } from 'mongoose'

import { forecastA, forecastA_id, forecastB } from './forecast.payload'
import {
  investmentA,
  investmentA_id,
} from '../../investment/__test__/investment.payload'
import {
  fetchPlanMock,
  updatePlanForecastDetailsMock,
} from '../../plan/__test__/plan.mock'
import { fetchPairMock } from '../../pair/__test__/pair.mock'
import { InvestmentStatus } from '../../investment/investment.enum'
import investmentModel from '../../investment/investment.model'
import { StatusCode } from '../../../core/apiResponse'
import TradeModel from '../../trade/trade.model'
import PairModel from '../../pair/pair.model'

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
        const payload = {}

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"planId" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given plan those not exits', () => {
      it('should throw a 404 error', async () => {
        const planId = new Types.ObjectId().toString()
        const pairId = new Types.ObjectId().toString()
        const payload = {
          planId,
          pairId,
          stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Mock: Plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPlanMock).toHaveBeenCalledTimes(1)
        expect(fetchPlanMock).toHaveBeenCalledWith({ _id: planId })
      })
    })
    describe('given plan has an unsettled forecast', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          planId: unRunningForecastPlan_id,
          pairId: pairA_id,
          stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This plan already has an unsettled forecast')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPlanMock).toHaveBeenCalledTimes(1)
        expect(fetchPlanMock).toHaveBeenCalledWith({
          _id: unRunningForecastPlan_id.toString(),
        })
      })
    })

    describe('given pair those not exits', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          planId: planA_id,
          pairId: new Types.ObjectId().toString(),
          stakeRate: 0.1,
        }

        await userModel.create({ ...userAInput, _id: userA_id })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Mock: Pair not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPlanMock).toHaveBeenCalledTimes(1)
        expect(fetchPlanMock).toHaveBeenCalledWith({
          _id: planA_id.toString(),
        })

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
        expect(fetchPairMock).toHaveBeenCalledWith({ _id: payload.pairId })
      })
    })
    describe('given pair is not compatible', () => {
      it('should throw a 400 error', async () => {
        const pairId = pairD_id
        const payload = {
          planId: planA_id,
          pairId,
          stakeRate: 0.1,
        }
        await userModel.create({ ...userAInput, _id: userA_id })

        await investmentModel.create({ ...investmentA })
        await investmentModel.create({ ...investmentA })

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

        expect(fetchPlanMock).toHaveBeenCalledTimes(1)
        expect(fetchPlanMock).toHaveBeenCalledWith({
          _id: planA_id.toString(),
        })

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
        expect(fetchPairMock).toHaveBeenCalledWith({
          _id: payload.pairId.toString(),
        })
      })
    })
    describe('on success', () => {
      describe('given there is no awaiting investment', () => {
        it('should return a 201 and the forecast payload', async () => {
          const payload = {
            planId: planA_id,
            pairId: pairA_id,
            stakeRate: 0.1,
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

          expect(body.data.forecast.stakeRate).toBe(payload.stakeRate)

          expect(updatePlanForecastDetailsMock).toHaveBeenCalledTimes(1)
          expect(updatePlanForecastDetailsMock).toHaveBeenCalledWith(
            { _id: payload.planId },
            expect.objectContaining({
              _id: new Types.ObjectId(body.data.forecast._id),
            })
          )

          expect(createTradeMock).toHaveBeenCalledTimes(0)
        })
      })
      describe('given there are awaiting investment', () => {
        it('should return a 201 and the forecast payload', async () => {
          await PairModel.create({ ...pairA, _id: pairA_id })
          await PlanModel.create({ ...planA, _id: planA_id })
          const payload = {
            planId: planA_id,
            pairId: pairA_id,
            stakeRate: 0.1,
          }

          await userModel.create({ ...userAInput, _id: userA_id })

          await investmentModel.create({
            ...investmentA,
            status: InvestmentStatus.AWAITING_TRADE,
            tradeStatus: ForecastStatus.RUNNING,
            _id: investmentB_id,
          })
          await investmentModel.create({
            ...investmentA,
            status: InvestmentStatus.AWAITING_TRADE,
            tradeStatus: ForecastStatus.SETTLED,
            _id: investmentA_id,
          })

          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Forecast created successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(StatusCode.SUCCESS)

          expect(body.data.forecast.stakeRate).toBe(payload.stakeRate)

          expect(await forecastModel.count(body.data.forecast)).toBe(1)

          expect(updatePlanForecastDetailsMock).toHaveBeenCalledTimes(1)
          expect(updatePlanForecastDetailsMock).toHaveBeenCalledWith(
            { _id: payload.planId },
            expect.objectContaining({
              _id: new Types.ObjectId(body.data.forecast._id),
            })
          )

          expect(createTradeMock).toHaveBeenCalledTimes(1)
          expect(createTradeMock).toHaveBeenCalledWith(
            userA_id,
            expect.objectContaining({
              _id: investmentA_id,
            }),
            expect.objectContaining({
              _id: new Types.ObjectId(body.data.forecast._id),
            })
          )
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

        expect(body.message).toBe(
          '"status" must be one of [preparing, running, on hold, market closed, settled]'
        )
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

    describe('given status has already been settled', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const forecast = await forecastModel.create({
          ...forecastA,
          status: ForecastStatus.SETTLED,
        })

        const payload = {
          status: ForecastStatus.ON_HOLD,
        }

        const url = masterUrl + `update-status/${forecast._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('This forecast has already been settled')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given status is set to settled but there is no percentage profit', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const forecast = await forecastModel.create({
          ...forecastA,
        })

        const payload = {
          status: ForecastStatus.SETTLED,
        }

        const url = masterUrl + `update-status/${forecast._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Percentage profit is required when forecast is being settled'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given status is not set to settled but there is percentage profit', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const forecast = await forecastModel.create({
          ...forecastA,
        })

        const payload = {
          status: ForecastStatus.ON_HOLD,
          percentageProfit: 0.025,
        }

        const url = masterUrl + `update-status/${forecast._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'Percentage profit is only required when the status is settled'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('on Success', () => {
      const testCases = [
        { status: ForecastStatus.MARKET_CLOSED },
        { status: ForecastStatus.ON_HOLD },
        { status: ForecastStatus.RUNNING },
        { status: ForecastStatus.PREPARING },
        { status: ForecastStatus.SETTLED },
      ]

      test.each(testCases)(
        'It should return a perform the right operation and return a payload for status $status',
        async ({ status }) => {
          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          await userModel.create({ ...userAInput, _id: userA_id })

          await PairModel.create({ ...pairA, _id: pairA_id })
          const plan = await PlanModel.create({ ...planA, _id: planA_id })

          await investmentModel.create({
            ...investmentA,
            status: InvestmentStatus.RUNNING,
            tradeStatus: ForecastStatus.RUNNING,
            _id: investmentB_id,
          })
          await investmentModel.create({
            ...investmentA,
            status: InvestmentStatus.AWAITING_TRADE,
            tradeStatus: ForecastStatus.SETTLED,
            _id: investmentA_id,
          })

          const forecast = await forecastModel.create({
            ...forecastA,
          })

          plan.currentForecast = forecast

          await plan.save()

          const payload = {
            status,
            percentageProfit:
              status === ForecastStatus.SETTLED ? 0.025 : undefined,
          }

          const url = masterUrl + `update-status/${forecast._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)

          expect(await forecastModel.count(body.data.forecast)).toBe(1)

          switch (status) {
            case ForecastStatus.MARKET_CLOSED:
            case ForecastStatus.ON_HOLD:
              expect(body.data.forecast.startTime).toBe(undefined)
              expect(body.data.forecast.percentageProfit).toBe(undefined)

              break

            case ForecastStatus.RUNNING:
              expect(body.data.forecast.startTime).toBeTruthy()
              expect(body.data.forecast.percentageProfit).toBe(undefined)
              break
            case ForecastStatus.SETTLED:
              expect(body.data.forecast.startTime).toBe(undefined)
              expect(body.data.forecast.percentageProfit).toBe(
                payload.percentageProfit
              )
              break
          }

          expect(body.data.forecast.status).toBe(payload.status)

          expect(updatePlanForecastDetailsMock).toHaveBeenCalledTimes(1)
          expect(updatePlanForecastDetailsMock).toHaveBeenCalledWith(
            { _id: planA_id, currentForecast: forecast._id },
            expect.objectContaining({
              _id: new Types.ObjectId(body.data.forecast._id),
            })
          )

          expect(updateStatusTradeMock).toHaveBeenCalledTimes(1)
          expect(updateStatusTradeMock).toHaveBeenCalledWith(
            expect.objectContaining({ _id: investmentB_id }),
            expect.objectContaining({
              _id: new Types.ObjectId(body.data.forecast._id),
            })
          )
        }
      )
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
          // stakeRate: 0.1,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"stakeRate" is required')
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

        expect(body.message).toBe('Mock: Pair not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
        expect(fetchPairMock).toHaveBeenCalledWith({ _id: payload.pairId })
      })
    })
    describe('given pair is not compatible', () => {
      it('should return a 400 error', async () => {
        await PlanModel.create({ ...planA, _id: planA_id })
        const forecast = await forecastModel.create(forecastA)
        const payload = {
          pairId: pairD_id,
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
          'The pair is not compatible with this forecast, use a crypto pair'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPairMock).toHaveBeenCalledTimes(1)
      })
    })
    describe('given forecast is not settled but Percentage profit, move or closeing price where provided', () => {
      const testCase = [
        {
          ref: 1,
          pairId: pairA_id,
          stakeRate: 0.1,
          closingPrice: 1001,
        },
        {
          ref: 2,
          pairId: pairA_id,
          stakeRate: 0.1,
          percentageProfit: 0.025,
        },
        {
          ref: 3,
          pairId: pairA_id,
          stakeRate: 0.1,
          move: ForecastMove.LONG,
        },
        {
          ref: 4,
          pairId: pairA_id,
          stakeRate: 0.1,
          move: ForecastMove.LONG,
          percentageProfit: 0.025,
          closingPrice: 1001,
        },
      ]

      test.each(testCase)(
        'should return a 400 error for ref $ref',
        async ({ ref, ...payload }) => {
          await PlanModel.create({ ...planA, _id: planA_id })
          const forecast = await forecastModel.create(forecastA)

          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          const url = `${masterUrl}update/${forecast._id}`

          const { statusCode, body } = await request
            .put(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe(
            'Percentage profit, move and closing price can only be updated on a settled forecast'
          )
          expect(statusCode).toBe(400)
          expect(body.status).toBe(StatusCode.DANGER)

          expect(fetchPairMock).toHaveBeenCalledTimes(1)
        }
      )
    })
    describe('given forecast is settled but Percentage profit, move or closeing price where not provided', () => {
      const testCase = [
        {
          ref: 1,
          pairId: pairA_id,
          stakeRate: 0.1,
        },
        {
          ref: 2,
          pairId: pairA_id,
          stakeRate: 0.1,
          percentageProfit: 0.025,
        },
        {
          ref: 3,
          pairId: pairA_id,
          stakeRate: 0.1,
          move: ForecastMove.LONG,
        },
        {
          ref: 4,
          pairId: pairA_id,
          stakeRate: 0.1,
          closingPrice: 1001,
        },
        {
          ref: 4,
          pairId: pairA_id,
          stakeRate: 0.1,
          closingPrice: 1001,
          percentageProfit: 0.025,
        },
        {
          ref: 4,
          pairId: pairA_id,
          stakeRate: 0.1,
          closingPrice: 1001,
          move: ForecastMove.LONG,
        },
        {
          ref: 4,
          pairId: pairA_id,
          stakeRate: 0.1,
          percentageProfit: 0.025,
          move: ForecastMove.LONG,
        },
      ]

      test.each(testCase)(
        'should return a 400 error for ref $ref',
        async ({ ref, ...payload }) => {
          await PlanModel.create({ ...planA, _id: planA_id })
          const forecast = await forecastModel.create({
            ...forecastA,
            status: ForecastStatus.SETTLED,
          })

          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          const url = `${masterUrl}update/${forecast._id}`

          const { statusCode, body } = await request
            .put(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe(
            'Percentage profit, move and closing price are required on a settled forecast'
          )
          expect(statusCode).toBe(400)
          expect(body.status).toBe(StatusCode.DANGER)

          expect(fetchPairMock).toHaveBeenCalledTimes(1)
        }
      )
    })
    describe('on success entry', () => {
      describe('given the forecast status is not settled and Percentage profit, move or closeing price where not provided', () => {
        it('should return a 200 and payload', async () => {
          const plan = await PlanModel.create({ ...planA, _id: planA_id })

          await TradeModel.create({ ...tradeA })

          await investmentModel.create({ ...investmentA, _id: investmentA_id })

          const forecast = await forecastModel.create({
            ...forecastA,
            _id: forecastA_id,
          })

          plan.currentForecast = forecast

          await plan.save()

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
          expect(body.data.forecast.percentageProfit).toBe(undefined)
          expect(body.data.forecast.closingPrice).toBe(undefined)
          expect(body.data.forecast.move).toBe(undefined)

          expect(await forecastModel.count(body.data.forecast)).toBe(1)

          expect(fetchPairMock).toHaveBeenCalledTimes(1)
          expect(fetchPairMock).toHaveBeenCalledWith({
            _id: payload.pairId.toString(),
          })

          expect(updatePlanForecastDetailsMock).toHaveBeenCalledTimes(1)
          expect(updatePlanForecastDetailsMock).toHaveBeenCalledWith(
            {
              _id: planA_id,
              currentForecast: forecast._id,
            },
            expect.objectContaining({ _id: forecast._id })
          )

          expect(updateTradeMock).toHaveBeenCalledTimes(1)
          expect(updateTradeMock).toHaveBeenCalledWith(
            expect.objectContaining({ _id: investmentA_id }),
            expect.objectContaining({ _id: forecast._id })
          )
        })
      })
      describe('given the forecast status is settled and Percentage profit, move or closeing price where  provided', () => {
        it('should return a 200 and payload', async () => {
          const plan = await PlanModel.create({ ...planA, _id: planA_id })

          await TradeModel.create({ ...tradeA })

          await investmentModel.create({ ...investmentA, _id: investmentA_id })

          const forecast = await forecastModel.create({
            ...forecastA,
            status: ForecastStatus.SETTLED,
            _id: forecastA_id,
          })

          plan.currentForecast = forecast

          await plan.save()

          const payload = {
            pairId: pairA_id,
            stakeRate: 0.1,
            closingPrice: 1001,
            move: ForecastMove.LONG,
            percentageProfit: 0.025,
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
          expect(body.data.forecast.percentageProfit).toBe(
            payload.percentageProfit
          )
          expect(body.data.forecast.closingPrice).toBe(payload.closingPrice)
          expect(body.data.forecast.move).toBe(payload.move)

          expect(fetchPairMock).toHaveBeenCalledTimes(1)
          expect(fetchPairMock).toHaveBeenCalledWith({
            _id: payload.pairId.toString(),
          })

          expect(updatePlanForecastDetailsMock).toHaveBeenCalledTimes(1)
          expect(updatePlanForecastDetailsMock).toHaveBeenCalledWith(
            {
              _id: planA_id,
              currentForecast: forecast._id,
            },
            expect.objectContaining({ _id: forecast._id })
          )

          expect(updateTradeMock).toHaveBeenCalledTimes(1)
          expect(updateTradeMock).toHaveBeenCalledWith(
            expect.objectContaining({ _id: investmentA_id }),
            expect.objectContaining({ _id: forecast._id })
          )
        })
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

    describe('on success entry', () => {
      it('should return a 200 with a payload', async () => {
        const trade1 = await TradeModel.create({ ...tradeA })
        const trade2 = await TradeModel.create({ ...tradeA })

        const forecast = await forecastModel.create({
          ...forecastA,
          status: ForecastStatus.SETTLED,
          _id: forecastA_id,
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

        expect(updatePlanForecastDetailsMock).toHaveBeenCalledTimes(1)
        expect(updatePlanForecastDetailsMock).toHaveBeenCalledWith(
          { _id: forecast.plan._id, currentForecast: forecast._id },
          null
        )

        expect(deleteTradeMock).toHaveBeenCalledTimes(2)
        expect(deleteTradeMock).toHaveBeenNthCalledWith(1, { _id: trade1._id })
        expect(deleteTradeMock).toHaveBeenNthCalledWith(2, { _id: trade2._id })
      })
    })
  })
})
