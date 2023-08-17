import { pairA_id, pairC_id } from './../../pair/__test__/pair.payload'
import { createTransactionNotificationMock } from '../../notification/__test__/notification.mock'
import {
  createTransactionTransactionMock,
  updateAmountTransactionTransactionMock,
} from '../../transaction/__test__/transaction.mock'
import tradeModel from '../../trade/trade.model'
import {
  NotificationCategory,
  NotificationForWho,
} from '../../notification/notification.enum'
import formatNumber from '../../../utils/formats/formatNumber'
import { TransactionCategory } from '../../transaction/transaction.enum'
import { TradeMove, TradeStatus } from '../../trade/trade.enum'
import { request } from '../../../test'
import { adminA, userA, userA_id } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { Types } from 'mongoose'

import { executeTransactionManagerMock } from '../../transactionManager/__test__/transactionManager.mock'
import {
  tradeA,
  tradeA_id,
  tradeModelReturn,
  tradeAObj,
  tradeB,
} from './trade.payload'
import { createTransactionTradeMock } from './trade.mock'
import { HttpResponseStatus } from '../../http/http.enum'
import Encryption from '../../../utils/encryption'
import { UserEnvironment } from '../../user/user.enum'
import {
  investmentA,
  investmentAObj,
  investmentA_id,
} from '../../investment/__test__/investment.payload'
import {
  fundTransactionInvestmentMock,
  getInvestmentMock,
  updateStatusTransactionInvestmentMock,
} from '../../investment/__test__/investment.mock'
import { getPairMock } from '../../pair/__test__/pair.mock'
import {
  getRandomValueMock,
  randomPickFromArrayMock,
} from '../../../utils/helpers/__test__/helpers.mock'
import TradeService from '../trade.service'
import { dynamicRangeMock } from '../../math/__test__/math.mock'
import { InvestmentStatus } from '../../investment/investment.enum'
import AppRepository from '../../app/app.repository'
import { IUser } from '../../user/user.interface'
import { ITrade } from '../trade.interface'

const userRepository = new AppRepository<IUser>(userModel)
const tradeRepository = new AppRepository<ITrade>(tradeModel)

describe('trade', () => {
  const baseUrl = '/api/trade/'
  describe('create trade on live mode and demo', () => {
    const url = baseUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
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
          investmentId: investmentA_id,
        }

        const admin = await userRepository.create(adminA).save()
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
        }

        const admin = await userRepository.create(adminA).save()
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

        expect(createTransactionTradeMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given user those not exits', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: new Types.ObjectId().toString(),
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('User not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(createTransactionTradeMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given pair those not exits', () => {
      it('should throw a 404 error', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: new Types.ObjectId().toString(),
        }

        await userRepository.create({ ...userA, _id: userA_id }).save()

        const admin = await userRepository.create(adminA).save()
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

        expect(createTransactionTradeMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given pair is not compatible', () => {
      it('should throw a 400 error', async () => {
        const pairId = pairC_id
        const payload = {
          investmentId: investmentA_id,
          pairId,
        }
        await userRepository.create({ ...userA, _id: userA_id }).save()

        const admin = await userRepository.create(adminA).save()
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

        expect(createTransactionTradeMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given all validations passed', () => {
      it('should return a 201 and the trade payload', async () => {
        const payload = {
          investmentId: investmentA_id,
          pairId: pairA_id,
        }

        await userRepository.create({ ...userA, _id: userA_id }).save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Trade created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(tradeModelReturn.save).toHaveBeenCalledTimes(1)

        expect(body.data).toMatchObject({
          trade: { _id: tradeModelReturn._id },
        })

        expect(getInvestmentMock).toHaveBeenCalledTimes(1)
        expect(getInvestmentMock).toHaveBeenCalledWith(
          investmentA_id.toString()
        )

        expect(getPairMock).toHaveBeenCalledTimes(1)
        expect(getPairMock).toHaveBeenCalledWith(pairA_id.toString())

        expect(randomPickFromArrayMock).toHaveBeenCalledTimes(1)
        expect(randomPickFromArrayMock).toHaveBeenCalledWith(
          Object.values(TradeMove)
        )

        expect(getRandomValueMock).toHaveBeenCalledTimes(1)
        expect(getRandomValueMock).toHaveBeenCalledWith(
          TradeService.minStakeRate,
          TradeService.maxStakeRate
        )

        const minProfit = investmentA.minProfit / TradeService.dailTrades

        const maxProfit = investmentA.maxProfit / TradeService.dailTrades

        const stake = investmentA.amount * TradeService.minStakeRate

        const spread = minProfit * TradeService.minStakeRate

        const breakpoint = spread * TradeService.profitBreakpoint

        expect(dynamicRangeMock).toHaveBeenCalledTimes(1)
        expect(dynamicRangeMock).toHaveBeenCalledWith(
          minProfit,
          maxProfit,
          spread,
          breakpoint,
          TradeService.profitProbability
        )

        const investmentPercentage = minProfit

        const profit = (investmentPercentage / 100) * investmentA.amount

        const outcome = stake + profit

        const percentage = (profit * 100) / stake

        expect(createTransactionTradeMock).toHaveBeenCalledTimes(1)

        // @ts-ignore
        expect(createTransactionTradeMock.mock.calls[0][0]._id.toString()).toBe(
          userA_id.toString()
        )
        // @ts-ignore
        expect(createTransactionTradeMock.mock.calls[0][1]._id.toString()).toBe(
          investmentA_id.toString()
        )
        // @ts-ignore
        expect(createTransactionTradeMock.mock.calls[0][2]._id.toString()).toBe(
          pairA_id.toString()
        )
        expect(createTransactionTradeMock.mock.calls[0][3]).toBe(TradeMove.LONG)
        expect(createTransactionTradeMock.mock.calls[0][4]).toBe(stake)
        expect(createTransactionTradeMock.mock.calls[0][5]).toBe(outcome)
        expect(createTransactionTradeMock.mock.calls[0][6]).toBe(profit)
        expect(createTransactionTradeMock.mock.calls[0][7]).toBe(percentage)
        expect(createTransactionTradeMock.mock.calls[0][8]).toBe(
          investmentPercentage
        )
        expect(createTransactionTradeMock.mock.calls[0][9]).toBe(
          investmentA.environment
        )
        expect(createTransactionTradeMock.mock.calls[0][10]).toBe(true)
      })
    })
  })

  describe('update trade status', () => {
    const url = baseUrl + 'update-status'

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const payload = {
          tradeId: '',
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const payload = {
          tradeId: '',
          status: '',
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"tradeId" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given trade was not found', () => {
      it('should throw a 404 error', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const payload = {
          tradeId: new Types.ObjectId(),
          status: TradeStatus.ON_HOLD,
        }

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Trade not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given trade status is not allowed', () => {
      it('should throw a 400 error', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const trade = await tradeRepository
          .create({
            ...tradeA,
            _id: tradeA_id,
          })
          .save()

        const payload = {
          tradeId: trade._id,
          status: TradeStatus.WAITING,
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

    describe('given trade status is not allowed for auto trades', () => {
      it('should throw a 400 error', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const trade = await tradeRepository
          .create({
            ...tradeA,
            _id: tradeA_id,
          })
          .save()

        const statuses = [
          TradeStatus.PREPARING,
          TradeStatus.START,
          TradeStatus.ACTIVE,
          TradeStatus.MARKET_CLOSED,
          TradeStatus.MARKET_OPENED,
          TradeStatus.SETTLED,
          TradeStatus.WAITING,
        ]

        for (const status of Object.values(TradeStatus)) {
          const payload = {
            tradeId: trade._id,
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
      for (const status of Object.values(TradeStatus)) {
        it(`should executes trade with ${status} status`, async () => {
          const admin = await userRepository.create(adminA).save()
          const user = await userRepository
            .create({ ...userA, _id: userA_id })
            .save()

          const { password: _, ...userA1 } = userA
          const token = Encryption.createToken(admin)

          const trade = await tradeRepository
            .create({
              ...tradeA,
              _id: tradeA_id,
              user: user._id,
            })
            .save()
          let payload: any
          let statusCode: any
          let body: any
          switch (status) {
            case TradeStatus.ON_HOLD:
              payload = {
                tradeId: trade._id,
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
                trade: {
                  _id: tradeModelReturn._id,
                  collection: tradeModelReturn.collection,
                },
              })

              expect(createTransactionTransactionMock).toHaveBeenCalledTimes(0)

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(1)
              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledWith(
                investmentA_id,
                InvestmentStatus.TRADE_ON_HOLD
              )

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment trade is currently on hold`,
                NotificationCategory.TRADE,
                tradeAObj,
                NotificationForWho.USER,
                status,
                tradeA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case TradeStatus.RUNNING:
              payload = {
                tradeId: trade._id,
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
                trade: {
                  _id: tradeModelReturn._id,
                  collection: tradeModelReturn.collection,
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
                `Your investment trade is now running`,
                NotificationCategory.TRADE,
                tradeAObj,
                NotificationForWho.USER,
                status,
                tradeA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case TradeStatus.PREPARING:
              trade.manualMode = true
              await tradeRepository.save(trade)

              payload = {
                tradeId: trade._id,
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
                trade: {
                  _id: tradeModelReturn._id,
                  collection: tradeModelReturn.collection,
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

            case TradeStatus.START:
              trade.manualMode = true
              await tradeRepository.save(trade)

              payload = {
                tradeId: trade._id,
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
                trade: {
                  _id: tradeModelReturn._id,
                  collection: tradeModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(0)

              expect(createTransactionTransactionMock).toHaveBeenCalledTimes(1)
              expect(createTransactionTransactionMock).toHaveBeenCalledWith(
                expect.objectContaining(userA1),
                TradeStatus.ACTIVE,
                TransactionCategory.TRADE,
                tradeAObj,
                trade.stake,
                trade.environment,
                trade.stake
              )

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment trade just kick started`,
                NotificationCategory.TRADE,
                tradeAObj,
                NotificationForWho.USER,
                status,
                tradeA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case TradeStatus.MARKET_CLOSED:
              trade.manualMode = true
              await tradeRepository.save(trade)

              payload = {
                tradeId: trade._id,
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
                trade: {
                  _id: tradeModelReturn._id,
                  collection: tradeModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(1)
              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledWith(
                investmentA_id,
                InvestmentStatus.MARKET_CLOSED
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
                tradeA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case TradeStatus.MARKET_OPENED:
              trade.manualMode = true
              await tradeRepository.save(trade)

              payload = {
                tradeId: trade._id,
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
                trade: {
                  _id: tradeModelReturn._id,
                  collection: tradeModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(1)
              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledWith(
                investmentA_id,
                InvestmentStatus.MARKET_OPENED
              )

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment of ${formatNumber.toDollar(
                  investmentA.amount
                )} has been opened and running`,
                NotificationCategory.INVESTMENT,
                { ...investmentAObj, status },
                NotificationForWho.USER,
                status,
                tradeA.environment,
                expect.objectContaining(userA1)
              )

              expect(executeTransactionManagerMock).toHaveBeenCalledTimes(1)

              expect(
                executeTransactionManagerMock.mock.calls[0][0].length
              ).toBe(3)

              break

            case TradeStatus.SETTLED:
              trade.manualMode = true
              await tradeRepository.save(trade)

              payload = {
                tradeId: trade._id,
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
                trade: {
                  _id: tradeModelReturn._id,
                  collection: tradeModelReturn.collection,
                },
              })

              expect(
                updateStatusTransactionInvestmentMock
              ).toHaveBeenCalledTimes(0)

              expect(fundTransactionInvestmentMock).toHaveBeenCalledTimes(1)

              expect(fundTransactionInvestmentMock).toHaveBeenCalledWith(
                investmentA_id,
                trade.outcome
              )

              expect(
                updateAmountTransactionTransactionMock
              ).toHaveBeenCalledTimes(1)

              expect(
                updateAmountTransactionTransactionMock
              ).toHaveBeenCalledWith(
                trade._id.toString(),
                status,
                trade.outcome
              )

              expect(createTransactionNotificationMock).toHaveBeenCalledTimes(1)

              expect(createTransactionNotificationMock).toHaveBeenCalledWith(
                `Your investment trade has been settled`,
                NotificationCategory.TRADE,
                tradeAObj,
                NotificationForWho.USER,
                status,
                tradeA.environment,
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

  describe('update trade', () => {
    const url = `${baseUrl}update`
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
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          tradeId: '123',
          pairId: '123',
          move: TradeMove.LONG,
          stake: 100,
        }

        const admin = await userRepository.create(adminA).save()
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
    describe('given trade those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          tradeId: new Types.ObjectId().toString(),
          pairId: '123',
          move: TradeMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Trade not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPairMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given pair those not exist', () => {
      it('should return a 404 error', async () => {
        const trade = await tradeRepository.create(tradeA).save()
        const payload = {
          tradeId: trade._id,
          pairId: new Types.ObjectId().toString(),
          move: TradeMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userRepository.create(adminA).save()
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
        const trade = await tradeRepository.create(tradeA).save()
        const payload = {
          tradeId: trade._id,
          pairId: pairC_id,
          move: TradeMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('The pair is not compatible with this trade')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getPairMock).toHaveBeenCalledTimes(1)
      })
    })
    describe('on success entry', () => {
      it('should return a 200 and payload', async () => {
        const trade = await tradeRepository.create(tradeA).save()
        const payload = {
          tradeId: trade._id,
          pairId: pairA_id,
          move: TradeMove.LONG,
          stake: 100,
          profit: 50,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Trade updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.trade._id).toBe(payload.tradeId.toString())
        expect(body.data.trade.stake).toBe(payload.stake)

        expect(getPairMock).toHaveBeenCalledTimes(1)

        const updatedTrade = await tradeRepository
          .findById(payload.tradeId)
          .collect()

        expect(updatedTrade?.stake).toBe(payload.stake)
      })
    })
  })

  describe('get All live trades', () => {
    const url = `${baseUrl}master`
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

    describe('on successfull entry', () => {
      it('should return an array of all users trades', async () => {
        const trade1 = await tradeRepository.create(tradeA).save()
        const trade2 = await tradeRepository.create(tradeB).save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.trades.length).toBe(2)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].user.username).toBe(
          trade1.userObject.username
        )
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
        )
        expect(body.data.trades[0].investment.name).toBe(
          trade1.investmentObject.name
        )
      })
    })
  })

  describe('get All demo trades', () => {
    const url = `${baseUrl}master/demo`
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

    describe('on successfull entry', () => {
      it('should return an array of all users trades', async () => {
        await tradeRepository.create(tradeA).save()
        await tradeRepository.create(tradeB).save()

        const trade1 = await tradeRepository
          .create({
            ...tradeA,
            environment: UserEnvironment.DEMO,
          })
          .save()
        await tradeRepository
          .create({
            ...tradeB,
            environment: UserEnvironment.DEMO,
          })
          .save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.trades.length).toBe(2)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].user.username).toBe(
          trade1.userObject.username
        )
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
        )
        expect(body.data.trades[0].investment.name).toBe(
          trade1.investmentObject.name
        )
      })
    })
  })

  describe('get current user live trades', () => {
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
      it('should return an array of current users trades', async () => {
        const trade1 = await tradeRepository.create(tradeA).save()
        await tradeRepository.create(tradeB).save()

        const user = await userRepository
          .create({ ...userA, _id: userA_id })
          .save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.trades.length).toBe(1)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].user.username).toBe(
          trade1.userObject.username
        )
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
        )
        expect(body.data.trades[0].investment.name).toBe(
          trade1.investmentObject.name
        )
      })
    })
  })

  describe('get current user demo trades', () => {
    const url = `${baseUrl}demo`
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userRepository.create(userA).save()

        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })

    describe('on successfull entry', () => {
      it('should return an array of current user trades', async () => {
        await tradeRepository.create(tradeA).save()
        await tradeRepository.create(tradeB).save()

        const trade1 = await tradeRepository
          .create({
            ...tradeA,
            environment: UserEnvironment.DEMO,
          })
          .save()
        const trade2 = await tradeRepository
          .create({
            ...tradeB,
            environment: UserEnvironment.DEMO,
          })
          .save()

        const user = await userRepository
          .create({ ...userA, _id: userA_id })
          .save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade history fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.trades.length).toBe(1)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].user.username).toBe(
          trade1.userObject.username
        )
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
        )
        expect(body.data.trades[0].investment.name).toBe(
          trade1.investmentObject.name
        )
      })
    })
  })

  describe('delete trade', () => {
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}delete/${new Types.ObjectId().toString()}`

        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given trade those not exist', () => {
      it('should return a 404 error', async () => {
        const url = `${baseUrl}delete/${new Types.ObjectId().toString()}`

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given trade has not been settled', () => {
      it('should return a 400 error', async () => {
        const trade = await tradeRepository.create(tradeA).save()
        const url = `${baseUrl}delete/${trade._id}`

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success entry', () => {
      it('should return a 200 with a payload', async () => {
        const trade = await tradeRepository
          .create({
            ...tradeA,
            status: TradeStatus.SETTLED,
          })
          .save()

        const url = `${baseUrl}delete/${trade._id}`

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.trade._id).toBe(trade._id.toString())

        expect(await tradeRepository.count()).toBe(0)
      })
    })
  })
})
