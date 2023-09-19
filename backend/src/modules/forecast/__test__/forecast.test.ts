import {
  investmentB,
  investmentB_id,
} from './../../investment/__test__/investment.payload'
import { userB, userB_id } from './../../user/__test__/user.payload'
import { pairA_id, pairC_id } from './../../pair/__test__/pair.payload'
import { createTransactionNotificationMock } from '../../notification/__test__/notification.mock'
import {
  createTransactionTransactionMock,
  updateAmountTransactionTransactionMock,
} from '../../transaction/__test__/transaction.mock'
import forecastModel from '../../forecast/forecast.model'
import {
  NotificationCategory,
  NotificationForWho,
} from '../../notification/notification.enum'
import formatNumber from '../../../utils/formats/formatNumber'
import { TransactionCategory } from '../../transaction/transaction.enum'
import { ForecastMove, ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { adminA, userA, userA_id } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { Types } from 'mongoose'

import { executeTransactionManagerMock } from '../../transactionManager/__test__/transactionManager.mock'
import {
  forecastA,
  forecastA_id,
  forecastModelReturn,
  forecastAObj,
  forecastB,
} from './forecast.payload'
import { createTransactionForecastMock } from './forecast.mock'
import { HttpResponseStatus } from '../../http/http.enum'
import Encryption from '../../../utils/encryption'
import { UserEnvironment } from '../../user/user.enum'
import {
  investmentA,
  investmentAObj,
  investmentA_id,
} from '../../investment/__test__/investment.payload'
import {
  getInvestmentMock,
  updateStatusTransactionInvestmentMock,
} from '../../investment/__test__/investment.mock'
import { getPairMock } from '../../pair/__test__/pair.mock'
import {
  getRandomValueMock,
  randomPickFromArrayMock,
} from '../../../utils/helpers/__test__/helpers.mock'
import ForecastService from '../forecast.service'
import { dynamicRangeMock } from '../../math/__test__/math.mock'
import { InvestmentStatus } from '../../investment/investment.enum'
import { IUser } from '../../user/user.interface'
import { IForecast } from '../forecast.interface'
import investmentModel from '../../investment/investment.model'

describe('forecast', () => {
  const baseUrl = '/api/forecast/'
  describe('create forecast on live mode and demo', () => {
    const url = baseUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
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
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          investmentId: investmentA_id,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"pairId" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given investment those not exits', () => {
      it('should throw a 404 error', async () => {
        const investmentId = new Types.ObjectId().toString()
        const pairId = new Types.ObjectId().toString()
        const payload = {
          investmentId,
          pairId,
          stake: forecastA.stake,
          profit: forecastA.profit,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getInvestmentMock).toHaveBeenCalledTimes(1)
        expect(getInvestmentMock).toHaveBeenCalledWith(investmentId)

        expect(createTransactionForecastMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given user those not exits', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: new Types.ObjectId().toString(),
          stake: forecastA.stake,
          profit: forecastA.profit,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(createTransactionForecastMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given pair those not exits', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: new Types.ObjectId().toString(),
          stake: forecastA.stake,
          profit: forecastA.profit,
        }

        await userModel.create({ ...userA, _id: userA_id })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('The selected pair no longer exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPairMock).toHaveBeenCalledTimes(1)
        expect(getPairMock).toHaveBeenCalledWith(payload.pairId)

        expect(createTransactionForecastMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given pair is not compatible', () => {
      it('should throw a 400 error', async () => {
        const pairId = pairC_id
        const payload = {
          investmentId: investmentA_id,
          pairId,
          stake: forecastA.stake,
          profit: forecastA.profit,
        }
        await userModel.create({ ...userA, _id: userA_id })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'The pair is not compatible with this investment plan'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(createTransactionForecastMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201 and the forecast payload', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: pairA_id,
          stake: forecastA.stake,
          profit: forecastA.profit,
        }

        await userModel.create({ ...userA, _id: userA_id })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(forecastModelReturn.save).toHaveBeenCalledTimes(1)

        expect(body.data).toMatchObject({
          forecast: { _id: forecastModelReturn._id },
        })

        expect(getInvestmentMock).toHaveBeenCalledTimes(1)
        expect(getInvestmentMock).toHaveBeenCalledWith(
          investmentA_id.toString()
        )

        expect(getPairMock).toHaveBeenCalledTimes(1)
        expect(getPairMock).toHaveBeenCalledWith(pairA_id.toString())

        expect(randomPickFromArrayMock).toHaveBeenCalledTimes(1)
        expect(randomPickFromArrayMock).toHaveBeenCalledWith(
          Object.values(ForecastMove)
        )

        expect(getRandomValueMock).toHaveBeenCalledTimes(1)
        expect(getRandomValueMock).toHaveBeenCalledWith(
          ForecastService.minStakeRate,
          ForecastService.maxStakeRate
        )

        const minProfit =
          investmentA.planObject.minProfit / ForecastService.dailyForecasts

        const maxProfit =
          investmentA.planObject.maxProfit / ForecastService.dailyForecasts

        const stake = investmentA.amount * ForecastService.minStakeRate

        const spread = minProfit * ForecastService.minStakeRate

        const breakpoint = spread * ForecastService.profitBreakpoint

        expect(dynamicRangeMock).toHaveBeenCalledTimes(1)
        expect(dynamicRangeMock).toHaveBeenCalledWith(
          minProfit,
          maxProfit,
          spread,
          breakpoint,
          ForecastService.profitProbability
        )

        const investmentPercentage = minProfit

        const profit = (investmentPercentage / 100) * investmentA.amount

        const outcome = stake + profit

        const percentage = (profit * 100) / stake

        expect(createTransactionForecastMock).toHaveBeenCalledTimes(1)

        // @ts-ignore
        expect(
          createTransactionForecastMock.mock.calls[0][0]._id.toString()
        ).toBe(userA_id.toString())
        // @ts-ignore
        expect(
          createTransactionForecastMock.mock.calls[0][1]._id.toString()
        ).toBe(investmentA_id.toString())
        // @ts-ignore
        expect(
          createTransactionForecastMock.mock.calls[0][2]._id.toString()
        ).toBe(pairA_id.toString())
        expect(createTransactionForecastMock.mock.calls[0][3]).toBe(
          ForecastMove.LONG
        )
        expect(createTransactionForecastMock.mock.calls[0][4]).toBe(stake)
        expect(createTransactionForecastMock.mock.calls[0][5]).toBe(outcome)
        expect(createTransactionForecastMock.mock.calls[0][6]).toBe(profit)
        expect(createTransactionForecastMock.mock.calls[0][7]).toBe(percentage)
        expect(createTransactionForecastMock.mock.calls[0][8]).toBe(
          investmentPercentage
        )
        // expect(createTransactionForecastMock.mock.calls[0][9]).toBe(
        //   investmentA.environment
        // )
        // expect(createTransactionForecastMock.mock.calls[0][10]).toBe(true)
      })
    })
  })

  describe('update forecast status', () => {
    const url = baseUrl + 'update-status'

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const payload = {
          forecastId: '',
          status: '',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given payload is not valid', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const payload = {
          forecastId: '',
          status: '',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"forecastId" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given forecast was not found', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const payload = {
          forecastId: new Types.ObjectId(),
          status: ForecastStatus.ON_HOLD,
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given forecast status is not allowed', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const forecast = await forecastModel.create({
          ...forecastA,
          _id: forecastA_id,
        })

        const payload = {
          forecastId: forecast._id,
          status: ForecastStatus.PREPARING,
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status not allowed')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('given forecast status is not allowed for auto forecasts', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

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
            forecastId: forecast._id,
            status: status,
          }

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          if (statuses.includes(status)) {
            expect(body.message).toBe('Status not allowed')
            expect(statusCode).toBe(400)
            expect(body.status).toBe(HttpResponseStatus.ERROR)
          }
        }
      })
    })

    describe('given all validations passed', () => {
      for (const status of Object.values(ForecastStatus)) {
        it(`should executes forecast with ${status} status`, async () => {
          const admin = await userModel.create(adminA)
          const user = await userModel.create({ ...userA, _id: userA_id })

          const { password: _, ...userA1 } = userA
          const token = Encryption.createToken(admin)

          const forecast = await forecastModel.create({
            ...forecastA,
            _id: forecastA_id,
            user: user._id,
          })

          let payload: any
          let statusCode: any
          let body: any
          switch (status) {
            case ForecastStatus.ON_HOLD:
              payload = {
                forecastId: forecast._id,
                status,
              }
              ;({ statusCode, body } = await request
                .patch(url)
                .set('Authorization', `Bearer ${token}`)
                .send(payload))

              expect(body.message).toBe('Status updated successfully')
              expect(statusCode).toBe(200)
              expect(body.status).toBe(HttpResponseStatus.SUCCESS)
              expect(body.data).toEqual({
                forecast: {
                  _id: forecastModelReturn._id,
                  collection: forecastModelReturn.collection,
                },
              })

              expect(createTransactionTransactionMock).toHaveBeenCalledTimes(0)

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(1)
              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledWith(investmentA_id, InvestmentStatus.SUSPENDED)

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment forecast is currently on hold`,
                NotificationCategory.FORECAST,
                forecastAObj,
                NotificationForWho.USER,
                status,
                forecastA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case ForecastStatus.RUNNING:
              payload = {
                forecastId: forecast._id,
                status,
              }
              ;({ statusCode, body } = await request
                .patch(url)
                .set('Authorization', `Bearer ${token}`)
                .send(payload))

              expect(body.message).toBe('Status updated successfully')
              expect(statusCode).toBe(200)
              expect(body.status).toBe(HttpResponseStatus.SUCCESS)
              expect(body.data).toEqual({
                forecast: {
                  _id: forecastModelReturn._id,
                  collection: forecastModelReturn.collection,
                },
              })

              expect(createTransactionTransactionMock).toHaveBeenCalledTimes(0)

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(1)
              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledWith(investmentA_id, InvestmentStatus.RUNNING)

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment forecast is now running`,
                NotificationCategory.FORECAST,
                forecastAObj,
                NotificationForWho.USER,
                status,
                forecastA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case ForecastStatus.PREPARING:
              forecast.manualMode = true
              await forecast.save()

              payload = {
                forecastId: forecast._id,
                status,
              }
              ;({ statusCode, body } = await request
                .patch(url)
                .set('Authorization', `Bearer ${token}`)
                .send(payload))

              expect(body.message).toBe('Status updated successfully')
              expect(statusCode).toBe(200)
              expect(body.status).toBe(HttpResponseStatus.SUCCESS)
              expect(body.data).toEqual({
                forecast: {
                  _id: forecastModelReturn._id,
                  collection: forecastModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(0)

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(0)

              expect(createTransactionTransactionMock).toHaveBeenCalledTimes(0)

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(1)

              break

            case ForecastStatus.PREPARING:
              forecast.manualMode = true
              await forecast.save()

              payload = {
                forecastId: forecast._id,
                status,
              }
              ;({ statusCode, body } = await request
                .patch(url)
                .set('Authorization', `Bearer ${token}`)
                .send(payload))

              expect(body.message).toBe('Status updated successfully')
              expect(statusCode).toBe(200)
              expect(body.status).toBe(HttpResponseStatus.SUCCESS)
              expect(body.data).toEqual({
                forecast: {
                  _id: forecastModelReturn._id,
                  collection: forecastModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(0)

              expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)
              expect(createTransactionTransactionMock).toHaveBeenCalledWith(
                expect.objectContaining(userA1),
                ForecastStatus.PREPARING,
                TransactionCategory.FORECAST,
                forecastAObj,
                forecast.stake,
                forecast.environment,
                forecast.stake
              )

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment forecast just kick started`,
                NotificationCategory.FORECAST,
                forecastAObj,
                NotificationForWho.USER,
                status,
                forecastA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case ForecastStatus.MARKET_CLOSED:
              forecast.manualMode = true
              await forecast.save()

              payload = {
                forecastId: forecast._id,
                status,
              }
              ;({ statusCode, body } = await request
                .patch(url)
                .set('Authorization', `Bearer ${token}`)
                .send(payload))

              expect(body.message).toBe('Status updated successfully')
              expect(statusCode).toBe(200)
              expect(body.status).toBe(HttpResponseStatus.SUCCESS)
              expect(body.data).toEqual({
                forecast: {
                  _id: forecastModelReturn._id,
                  collection: forecastModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(1)
              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledWith(
                investmentA_id,
                InvestmentStatus.AWAITING_FORECAST
              )

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment of ${formatNumber.toDollar(
                  investmentA.amount
                )} has closed until the next business hours`,
                NotificationCategory.INVESTMENT,
                { ...investmentAObj, status },
                NotificationForWho.USER,
                status,
                forecastA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case ForecastStatus.RUNNING:
              forecast.manualMode = true
              await forecast.save()

              payload = {
                forecastId: forecast._id,
                status,
              }
              ;({ statusCode, body } = await request
                .patch(url)
                .set('Authorization', `Bearer ${token}`)
                .send(payload))

              expect(body.message).toBe('Status updated successfully')
              expect(statusCode).toBe(200)
              expect(body.status).toBe(HttpResponseStatus.SUCCESS)
              expect(body.data).toEqual({
                forecast: {
                  _id: forecastModelReturn._id,
                  collection: forecastModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(1)
              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledWith(investmentA_id, InvestmentStatus.RUNNING)

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment of ${formatNumber.toDollar(
                  investmentA.amount
                )} has been opened and running`,
                NotificationCategory.INVESTMENT,
                { ...investmentAObj, status },
                NotificationForWho.USER,
                status,
                forecastA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case ForecastStatus.SETTLED:
              forecast.manualMode = true
              await forecast.save()

              payload = {
                forecastId: forecast._id,
                status,
              }
              ;({ statusCode, body } = await request
                .patch(url)
                .set('Authorization', `Bearer ${token}`)
                .send(payload))

              expect(body.message).toBe('Status updated successfully')
              expect(statusCode).toBe(200)
              expect(body.status).toBe(HttpResponseStatus.SUCCESS)
              expect(body.data).toEqual({
                forecast: {
                  _id: forecastModelReturn._id,
                  collection: forecastModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(0)

              // expect(fundTransactionInvestmentMock).toHaveBeenCalledTimes(1)

              // expect(fundTransactionInvestmentMock).toHaveBeenCalledWith(
              //   investmentA_id,
              //   forecast.outcome
              // )

              expect(
                updateAmountTransactionTransactionMock
              ).toHaveBeenCalledTimes(1)

              expect(
                updateAmountTransactionTransactionMock
              ).toHaveBeenCalledWith(
                forecast._id.toString(),
                status,
                forecast.outcome
              )

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment forecast has been settled`,
                NotificationCategory.FORECAST,
                forecastAObj,
                NotificationForWho.USER,
                status,
                forecastA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(4)

              break
          }
        })
      }
    })
  })

  describe('update forecast', () => {
    const url = `${baseUrl}update`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userA)
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
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          forecastId: '123',
          pairId: '123',
          move: ForecastMove.LONG,
          stake: 100,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"profit" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given forecast those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          forecastId: new Types.ObjectId().toString(),
          pairId: '123',
          move: ForecastMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPairMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given pair those not exist', () => {
      it('should return a 404 error', async () => {
        const forecast = await forecastModel.create(forecastA)
        const payload = {
          forecastId: forecast._id,
          pairId: new Types.ObjectId().toString(),
          move: ForecastMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('The selected pair no longer exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPairMock).toHaveBeenCalledTimes(1)
        expect(getPairMock).toHaveBeenCalledWith(payload.pairId)
      })
    })
    describe('given pair is not compatible', () => {
      it('should return a 400 error', async () => {
        const forecast = await forecastModel.create(forecastA)
        const payload = {
          forecastId: forecast._id,
          pairId: pairC_id,
          move: ForecastMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          'The pair is not compatible with this forecast'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPairMock).toHaveBeenCalledTimes(1)
      })
    })
    describe('on success entry', () => {
      it('should return a 200 and payload', async () => {
        const forecast = await forecastModel.create(forecastA)
        const payload = {
          forecastId: forecast._id,
          pairId: pairA_id,
          move: ForecastMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Forecast updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.forecast._id).toBe(payload.forecastId.toString())
        expect(body.data.forecast.stake).toBe(payload.stake)

        expect(getPairMock).toHaveBeenCalledTimes(1)

        const updatedForecast = await forecastModel.findById(payload.forecastId)

        expect(updatedForecast?.stake).toBe(payload.stake)
      })
    })
  })

  describe('get All live forecasts', () => {
    const url = `${baseUrl}master`
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

    describe('on successfull entry', () => {
      it('should return an array of all users forecasts', async () => {
        const forecast1 = await forecastModel.create(forecastA)
        const forecast2 = await forecastModel.create(forecastB)
        await userModel.create({ ...userA, _id: userA_id })
        await userModel.create({ ...userB, _id: userB_id })
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.forecasts.length).toBe(2)
        expect(body.data.forecasts[0].environment).toBe(forecast1.environment)
        expect(body.data.forecasts[0].stake).toBe(forecast1.stake)
        expect(body.data.forecasts[0].profit).toBe(forecast1.profit)
        expect(body.data.forecasts[0].status).toBe(forecast1.status)
        expect(body.data.forecasts[0].user._id).toBe(forecast1.user.toString())
        expect(body.data.forecasts[0].user.username).toBe(
          forecast1.userObject.username
        )
        expect(body.data.forecasts[0].investment._id).toBe(
          forecast1.investment.toString()
        )
      })
    })
  })

  describe('get All demo forecasts', () => {
    const url = `${baseUrl}master/demo`
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

    describe('on successfull entry', () => {
      it('should return an array of all users forecasts', async () => {
        await forecastModel.create(forecastA)
        await forecastModel.create(forecastB)
        await userModel.create({ ...userA, _id: userA_id })
        await userModel.create({ ...userB, _id: userB_id })
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const forecast1 = await forecastModel.create({
          ...forecastA,
          environment: UserEnvironment.DEMO,
        })

        await forecastModel.create({
          ...forecastB,
          environment: UserEnvironment.DEMO,
        })

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.forecasts.length).toBe(2)
        expect(body.data.forecasts[0].environment).toBe(forecast1.environment)
        expect(body.data.forecasts[0].stake).toBe(forecast1.stake)
        expect(body.data.forecasts[0].profit).toBe(forecast1.profit)
        expect(body.data.forecasts[0].status).toBe(forecast1.status)
        expect(body.data.forecasts[0].user._id).toBe(forecast1.user.toString())
        expect(body.data.forecasts[0].user.username).toBe(
          forecast1.userObject.username
        )
        expect(body.data.forecasts[0].investment._id).toBe(
          forecast1.investment.toString()
        )
      })
    })
  })

  describe('get current user live forecasts', () => {
    const url = `${baseUrl}`
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('on successfull entry', () => {
      it('should return an array of current users forecasts', async () => {
        const forecast1 = await forecastModel.create(forecastA)
        await forecastModel.create(forecastB)
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const user = await userModel.create({ ...userA, _id: userA_id })
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.forecasts.length).toBe(1)
        expect(body.data.forecasts[0].environment).toBe(forecast1.environment)
        expect(body.data.forecasts[0].stake).toBe(forecast1.stake)
        expect(body.data.forecasts[0].profit).toBe(forecast1.profit)
        expect(body.data.forecasts[0].status).toBe(forecast1.status)
        expect(body.data.forecasts[0].user).toBe(forecast1.user.toString())
        expect(body.data.forecasts[0].investment._id).toBe(
          forecast1.investment.toString()
        )
      })
    })
  })

  describe('get current user demo forecasts', () => {
    const url = `${baseUrl}demo`
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userA)

        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('on successfull entry', () => {
      it('should return an array of current user forecasts', async () => {
        await forecastModel.create(forecastA)
        await forecastModel.create(forecastB)
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const forecast1 = await forecastModel.create({
          ...forecastA,
          environment: UserEnvironment.DEMO,
        })

        const forecast2 = await forecastModel.create({
          ...forecastB,
          environment: UserEnvironment.DEMO,
        })

        const user = await userModel.create({ ...userA, _id: userA_id })
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.forecasts.length).toBe(1)
        expect(body.data.forecasts[0].environment).toBe(forecast1.environment)
        expect(body.data.forecasts[0].stake).toBe(forecast1.stake)
        expect(body.data.forecasts[0].profit).toBe(forecast1.profit)
        expect(body.data.forecasts[0].status).toBe(forecast1.status)
        expect(body.data.forecasts[0].user).toBe(forecast1.user.toString())
        expect(body.data.forecasts[0].investment._id).toBe(
          forecast1.investment.toString()
        )
      })
    })
  })

  describe('delete forecast', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}delete/${new Types.ObjectId().toString()}`

        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given forecast those not exist', () => {
      it('should return a 404 error', async () => {
        const url = `${baseUrl}delete/${new Types.ObjectId().toString()}`

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given forecast has not been settled', () => {
      it('should return a 400 error', async () => {
        const forecast = await forecastModel.create(forecastA)
        const url = `${baseUrl}delete/${forecast._id}`

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200 with a payload', async () => {
        const forecast = await forecastModel.create({
          ...forecastA,
          status: ForecastStatus.SETTLED,
        })

        const url = `${baseUrl}delete/${forecast._id}`

        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Forecast deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.forecast._id).toBe(forecast._id.toString())

        expect(await forecastModel.count()).toBe(0)
      })
    })
  })
})
