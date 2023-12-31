import { adminAInput, userBInput } from './../../user/__test__/user.payload'
import investmentModel from '../../investment/investment.model'
import {
  NotificationTitle,
  NotificationForWho,
} from '../../notification/notification.enum'
import { TransactionTitle } from '../../transaction/transaction.enum'
import { InvestmentStatus } from '../../investment/investment.enum'
import { request } from '../../../test'
import {
  userA,
  userA_id,
  userB,
  userB_id,
  userAInput,
} from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'

import {
  investmentA,
  investmentA_id,
  investmentB_id,
  investmentAObj,
  investmentB,
  investmentBObj,
} from './investment.payload'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { ReferralTypes } from '../../referral/referral.enum'
import { planA, planA_id } from '../../plan/__test__/plan.payload'
import { fetchPlanMock } from '../../plan/__test__/plan.mock'
import { Types } from 'mongoose'
import { StatusCode } from '../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import Helpers from '../../../utils/helpers'
import { fundUserMock } from '../../user/__test__/user.mock'
import { createTransactionMock } from '../../transaction/__test__/transaction.mock'
import { createNotificationMock } from '../../notification/__test__/notification.mock'
import { createReferralMock } from '../../referral/__test__/referral.mock'
import { IControllerRoute } from '../../../core/utils'
import { investmentController } from '../../../setup'

describe('investment', () => {
  const baseUrl = '/api/investment/'
  const demoUrl = '/api/demo/investment/'
  const masterUrl = '/api/master/investment/'
  const masterDemoUrl = '/api/master/demo/investment/'
  describe('Validate routes', () => {
    const routes = investmentController.routes as IControllerRoute[]
    it('should expect 10 routes', () => {
      expect(routes.length).toBe(10)
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
  describe('create investment on live mode and demo', () => {
    const url = baseUrl + 'create'
    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {}
        const { statusCode, body } = await request.post(url).send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload are not valid', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          planId: planA_id,
        }

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"amount" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given investment amount is lower than min investment of selected plan', () => {
      it('should throw a 400 error', async () => {
        const payload = {
          planId: planA_id,
          account: UserAccount.MAIN_BALANCE,
          amount: planA.minAmount - 10,
        }

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          `The amount allowed in this plan is between ${Helpers.toDollar(
            planA.minAmount
          )} and ${Helpers.toDollar(planA.maxAmount)}.`
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchPlanMock).toHaveBeenCalledTimes(1)
        expect(fetchPlanMock).toHaveBeenCalledWith({ _id: planA_id.toString() })
      })
    })
    describe('given all validations passed', () => {
      describe('given user those not have a referral', () => {
        it('should return a 201 and the investment payload', async () => {
          const payload = {
            planId: planA_id,
            amount: planA.minAmount,
            account: UserAccount.MAIN_BALANCE,
          }

          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const token = Cryptograph.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Investment registered successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(StatusCode.SUCCESS)

          expect(body.data.investment.amount).toBe(payload.amount)
          expect(body.data.investment.account).toBe(payload.account)
          expect(body.data.investment.environment).toBe(UserEnvironment.LIVE)
          expect(body.data.investment.user._id).toBe(user._id.toString())

          const investmentCount = await investmentModel.count({
            _id: body.data.investment._id,
            user: user._id,
            plan: payload.planId,
            environment: UserEnvironment.LIVE,
          })
          expect(investmentCount).toBe(1)

          expect(fetchPlanMock).toHaveBeenCalledTimes(1)
          expect(fetchPlanMock).toHaveBeenCalledWith({
            _id: planA_id.toString(),
          })

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock).toHaveBeenCalledWith(
            user._id,
            payload.account,
            -payload.amount
          )

          expect(createReferralMock).toHaveBeenCalledTimes(1)
          expect(createReferralMock).toHaveBeenCalledWith(
            ReferralTypes.INVESTMENT,
            expect.objectContaining({
              _id: user._id,
            }),
            payload.amount
          )

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining({
              _id: user._id,
            }),
            TransactionTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(2)
          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your investment of ${Helpers.toDollar(payload.amount)} on the ${
              planA.name
            } plan is up and running`,
            NotificationTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            expect.objectContaining({
              _id: user._id,
            })
          )

          expect(createNotificationMock.mock.calls[1]).toEqual([
            `${user.username} just invested in the ${
              planA.name
            } plan with the sum of ${Helpers.toDollar(
              payload.amount
            )}, on his ${UserEnvironment.LIVE} account`,
            NotificationTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            NotificationForWho.ADMIN,
            UserEnvironment.LIVE,
            undefined,
          ])
        })
      })
      describe('given user was referred', () => {
        it('should return a 201 and the investment payload', async () => {
          const payload = {
            planId: planA_id,
            amount: planA.minAmount,
            account: UserAccount.MAIN_BALANCE,
          }

          const user = await userModel.create({ ...userBInput, _id: userB_id })

          const token = Cryptograph.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Investment registered successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(StatusCode.SUCCESS)

          expect(body.data.investment.amount).toBe(payload.amount)
          expect(body.data.investment.account).toBe(payload.account)
          expect(body.data.investment.environment).toBe(UserEnvironment.LIVE)
          expect(body.data.investment.user._id).toBe(user._id.toString())

          const investmentCount = await investmentModel.count({
            _id: body.data.investment._id,
            user: user._id,
            plan: payload.planId,
            environment: UserEnvironment.LIVE,
          })
          expect(investmentCount).toBe(1)

          expect(fetchPlanMock).toHaveBeenCalledTimes(1)
          expect(fetchPlanMock).toHaveBeenCalledWith({
            _id: planA_id.toString(),
          })

          expect(fundUserMock).toHaveBeenCalledTimes(1)

          expect(fundUserMock).toHaveBeenCalledWith(
            user._id,
            payload.account,
            -payload.amount
          )

          expect(createReferralMock).toHaveBeenCalledTimes(1)
          expect(createReferralMock).toHaveBeenCalledWith(
            ReferralTypes.INVESTMENT,
            expect.objectContaining({
              _id: user._id,
            }),
            payload.amount
          )

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining({
              _id: user._id,
            }),
            TransactionTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            payload.amount,
            UserEnvironment.LIVE
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(2)
          expect(createNotificationMock.mock.calls[0]).toEqual([
            `Your investment of ${Helpers.toDollar(payload.amount)} on the ${
              planA.name
            } plan is up and running`,
            NotificationTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            { ...userB, _id: userB_id, referred: userA_id },
          ])

          expect(createNotificationMock.mock.calls[1]).toEqual([
            `${user.username} just invested in the ${
              planA.name
            } plan with the sum of ${Helpers.toDollar(
              payload.amount
            )}, on his ${UserEnvironment.LIVE} account`,
            NotificationTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            NotificationForWho.ADMIN,
            UserEnvironment.LIVE,
            undefined,
          ])
        })
      })
    })
    describe('given a demo account', () => {
      const url = demoUrl + 'create'
      describe('given account is not demo', () => {
        it('should throw a 400 error', async () => {
          const payload = {
            planId: planA_id,
            account: UserAccount.MAIN_BALANCE,
            amount: planA.minAmount,
          }

          const user = await userModel.create(userAInput)
          const token = Cryptograph.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe(`\"account\" must be [demoBalance]`)
          expect(statusCode).toBe(400)
          expect(body.status).toBe(StatusCode.DANGER)
        })
      })
      describe('on success entry', () => {
        it('should return a 201 and the investment payload', async () => {
          const payload = {
            planId: planA_id,
            amount: planA.minAmount,
            account: UserAccount.DEMO_BALANCE,
          }

          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const token = Cryptograph.createToken(user)

          const { statusCode, body } = await request
            .post(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Investment registered successfully')
          expect(statusCode).toBe(201)
          expect(body.status).toBe(StatusCode.SUCCESS)

          expect(body.data.investment.amount).toBe(payload.amount)
          expect(body.data.investment.account).toBe(payload.account)
          expect(body.data.investment.environment).toBe(UserEnvironment.DEMO)
          expect(body.data.investment.user._id).toBe(user._id.toString())

          const investmentCount = await investmentModel.count({
            _id: body.data.investment._id,
            user: user._id,
            plan: payload.planId,
            environment: UserEnvironment.DEMO,
          })
          expect(investmentCount).toBe(1)

          expect(fetchPlanMock).toHaveBeenCalledTimes(1)
          expect(fetchPlanMock).toHaveBeenCalledWith({
            _id: planA_id.toString(),
          })

          expect(fundUserMock).toHaveBeenCalledTimes(1)

          expect(fundUserMock).toHaveBeenCalledWith(
            user._id,
            payload.account,
            -payload.amount
          )

          expect(createReferralMock).toHaveBeenCalledTimes(0)

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining(userA),
            TransactionTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            payload.amount,
            UserEnvironment.DEMO
          )

          // expect(createNotificationMock).toHaveBeenCalledTimes(2)
          expect(createNotificationMock).toHaveBeenNthCalledWith(
            1,
            `Your investment of ${Helpers.toDollar(payload.amount)} on the ${
              planA.name
            } plan is up and running`,
            NotificationTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            NotificationForWho.USER,
            UserEnvironment.DEMO,
            expect.objectContaining({
              _id: user._id,
            })
          )

          expect(createNotificationMock).toHaveBeenNthCalledWith(
            2,
            `${user.username} just invested in the ${
              planA.name
            } plan with the sum of ${Helpers.toDollar(
              payload.amount
            )}, on his ${UserEnvironment.DEMO} account`,
            NotificationTitle.INVESTMENT_PURCHASED,
            expect.any(Object),
            NotificationForWho.ADMIN,
            UserEnvironment.DEMO
          )
        })
      })
    })
  })

  describe('update investment status', () => {
    // const url = masterUrl + `update-status/:investmentId`

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
          '"status" must be one of [running, awaiting trade, preparing new trade, suspended, out of gas, refilling, on maintainace, finalizing, completed]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given investment those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const user = await userModel.create({ ...userAInput, _id: userA_id })

        // const { password: _, ...userA1 } = userA
        const token = Cryptograph.createToken(admin)

        const status = InvestmentStatus.SUSPENDED

        const payload = {
          status,
        }

        const url = masterUrl + `update-status/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given investment has already been completed', () => {
      it('should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const user = await userModel.create({ ...userAInput, _id: userA_id })

        const investment = await investmentModel.create({
          ...investmentA,
          status: InvestmentStatus.COMPLETED,
          _id: investmentA_id,
          user: user._id,
        })

        // const { password: _, ...userA1 } = userA
        const token = Cryptograph.createToken(admin)

        const status = InvestmentStatus.SUSPENDED

        const payload = {
          status,
        }

        const url = masterUrl + `update-status/${investment._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment plan has already been settled')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      describe('given status was suspended', () => {
        it('should execute 2 transactions', async () => {
          const admin = await userModel.create(adminAInput)
          const user = await userModel.create({ ...userAInput, _id: userA_id })

          // const { password: _, ...userA1 } = userA
          const token = Cryptograph.createToken(admin)

          const investment = await investmentModel.create({
            ...investmentA,
            _id: investmentA_id,
            user: user._id,
          })

          const status = InvestmentStatus.SUSPENDED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${investment._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)

          expect(body.data.investment._id).toBe(investment._id.toString())
          expect(body.data.investment.status).toBe(status)
          expect(body.data.investment.user._id).toBe(user._id.toString())

          const investmentCount = await investmentModel.count({
            _id: body.data.investment._id,
            user: user._id,
            status: status,
          })
          expect(investmentCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(0)

          expect(createReferralMock).toHaveBeenCalledTimes(0)

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          expect(createNotificationMock.mock.calls[0][0]).toBe(
            `Your investment package has been ${status}`
          )
          expect(createNotificationMock.mock.calls[0][1]).toBe(
            NotificationTitle.INVESTMENT_SUSPENDED
          )
          expect(createNotificationMock.mock.calls[0][3]).toBe(
            NotificationForWho.USER
          )
        })
      })
      describe('given status was set to completed but no referrer', () => {
        it('should return a 200 and the investment payload', async () => {
          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          const user = await userModel.create({ ...userAInput, _id: userA_id })

          const investment = await investmentModel.create({
            ...investmentA,
            _id: investmentA_id,
          })

          const status = InvestmentStatus.COMPLETED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${investment._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.investment._id).toBe(investment._id.toString())
          expect(body.data.investment.status).toBe(status)
          expect(body.data.investment.user._id).toBe(user._id.toString())

          const investmentCount = await investmentModel.count({
            _id: body.data.investment._id,
            user: user._id,
            status: status,
          })
          expect(investmentCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock).toHaveBeenCalledWith(
            { _id: investmentAObj.user },
            UserAccount.MAIN_BALANCE,
            investmentAObj.balance
          )

          expect(createReferralMock).toHaveBeenCalledTimes(1)
          expect(createReferralMock).toHaveBeenCalledWith(
            ReferralTypes.COMPLETED_PACKAGE_EARNINGS,
            expect.objectContaining({
              _id: user._id,
            }),
            investment.balance - investment.amount
          )

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining(userA),
            TransactionTitle.INVESTMENT_COMPLETED,
            expect.any(Object),
            investment.balance,
            UserEnvironment.LIVE
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          investmentAObj.status = status
          expect(createNotificationMock).toHaveBeenCalledWith(
            `Your investment package has been completed`,
            NotificationTitle.INVESTMENT_COMPLETED,
            expect.objectContaining({
              _id: investment._id,
            }),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            expect.objectContaining({
              _id: user._id,
            })
          )
        })
      })
      describe('given status was set to completed but there is a referrer', () => {
        it('should return a 200 and the investment payload', async () => {
          const admin = await userModel.create(adminAInput)
          const token = Cryptograph.createToken(admin)

          const user = await userModel.create({ ...userBInput, _id: userB_id })

          const investment = await investmentModel.create({
            ...investmentB,
            _id: investmentB_id,
          })

          const status = InvestmentStatus.COMPLETED

          const payload = {
            status,
          }

          const url = masterUrl + `update-status/${investment._id}`

          const { statusCode, body } = await request
            .patch(url)
            .set('Authorization', `Bearer ${token}`)
            .send(payload)

          expect(body.message).toBe('Status updated successfully')
          expect(statusCode).toBe(200)
          expect(body.status).toBe(StatusCode.SUCCESS)
          expect(body.data.investment._id).toBe(investment._id.toString())
          expect(body.data.investment.status).toBe(status)
          expect(body.data.investment.user._id).toBe(user._id.toString())

          const investmentCount = await investmentModel.count({
            _id: body.data.investment._id,
            user: user._id,
            status: status,
          })
          expect(investmentCount).toBe(1)

          expect(fundUserMock).toHaveBeenCalledTimes(1)
          expect(fundUserMock).toHaveBeenNthCalledWith(
            1,
            { _id: investmentBObj.user },
            UserAccount.MAIN_BALANCE,
            investmentBObj.balance
          )

          expect(createReferralMock).toHaveBeenCalledTimes(1)

          expect(createReferralMock).toHaveBeenCalledWith(
            ReferralTypes.COMPLETED_PACKAGE_EARNINGS,
            expect.objectContaining({
              _id: user._id,
            }),
            investment.amount
          )

          expect(createTransactionMock).toHaveBeenCalledTimes(1)
          expect(createTransactionMock).toHaveBeenCalledWith(
            expect.objectContaining({ _id: userB_id }),
            TransactionTitle.INVESTMENT_COMPLETED,
            expect.any(Object),
            investment.balance,
            UserEnvironment.LIVE
          )

          expect(createNotificationMock).toHaveBeenCalledTimes(1)
          investmentBObj.status = status
          expect(createNotificationMock).toHaveBeenNthCalledWith(
            1,
            `Your investment package has been ${status}`,
            NotificationTitle.INVESTMENT_COMPLETED,
            expect.objectContaining({
              _id: investment._id,
            }),
            NotificationForWho.USER,
            UserEnvironment.LIVE,
            expect.objectContaining({
              _id: user._id,
            })
          )
        })
      })
    })
  })

  describe('fund', () => {
    // const url = `${masterUrl}fund/:investmentId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${masterUrl}fund/${new Types.ObjectId()}`

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
        const payload = {}

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}fund/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"amount" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given investment those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          amount: 100,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}fund/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return a 200 and an investment payload', async () => {
        const investment = await investmentModel.create(investmentA)

        const payload = {
          amount: 100,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}fund/${investment._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment funded successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.investment._id).toBe(investment._id.toString())

        expect(body.data.investment.balance).toBe(
          payload.amount + investmentA.balance
        )

        const investmentCount = await investmentModel.count({
          _id: body.data.investment._id,
          balance: payload.amount + investmentA.balance,
        })
        expect(investmentCount).toBe(1)
      })
    })
  })

  describe('refill', () => {
    // const url = `${masterUrl}refill/:investmentId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${masterUrl}refill/${new Types.ObjectId()}`

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
        const payload = {}

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}refill/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"gas" is required')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given investment those not exist', () => {
      it('should return a 404 error', async () => {
        const payload = {
          gas: 100,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}refill/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return a 200 and an investment payload', async () => {
        const investment = await investmentModel.create(investmentA)

        const payload = {
          gas: 100,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}refill/${investment._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Investment has been refilled successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.investment._id).toBe(investment._id.toString())

        expect(body.data.investment.gas).toBe(payload.gas + investmentA.gas)

        const investmentCount = await investmentModel.count({
          _id: body.data.investment._id,
          gas: payload.gas + investmentA.gas,
        })
        expect(investmentCount).toBe(1)
      })
    })
  })

  describe('delete investment', () => {
    // const url = masterUrl + `delete/:investmentId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `delete/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given investment id those not exist', () => {
      it('should throw a 404 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `delete/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given investment has not been settled', () => {
      it('should return a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const investment = await investmentModel.create(investmentA)

        const url = masterUrl + `delete/${investment._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and the investment payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const investment = await investmentModel.create({
          ...investmentA,
          status: InvestmentStatus.COMPLETED,
        })

        const url = masterUrl + `delete/${investment._id}`

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investment deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        const investmentCount = await investmentModel.count({
          _id: body.data.investment._id,
        })
        expect(investmentCount).toBe(0)
      })
    })
  })

  describe('get users investment plan', () => {
    const url = masterUrl

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
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
      it('should return a 200 and an empty array of investment payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const admin = await userModel.create(adminAInput)
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(admin)
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )

        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user._id).toBe(
          investment.user.toString()
        )

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(1)
      })
    })
  })

  describe('get users demo investment plan', () => {
    const url = masterDemoUrl

    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized error', async () => {
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
      it('should return a 200 and an empty array of investment payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const admin = await userModel.create(adminAInput)
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(admin)
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )

        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user._id).toBe(
          investment.user.toString()
        )

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(1)
      })
    })
  })

  describe('get investment plan', () => {
    const url = baseUrl

    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and an empty array of investment payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        await investmentModel.create(investmentB)
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )

        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user._id).toBe(
          investment.user.toString()
        )
        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(2)
      })
    })
  })

  describe('get demo investment plan', () => {
    const url = demoUrl

    describe('given user is not loggedin', () => {
      it('should throw a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('given all validations passed', () => {
      it('should return a 200 and an empty array of investment payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data).toEqual({
          investments: [],
        })

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(0)
      })
      it('should return a 200 and an array of investment payload', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)
        await investmentModel.create({ ...investmentB, user: user._id })
        const investment = await investmentModel.create({
          ...investmentA,
          user: user._id,
          environment: UserEnvironment.DEMO,
        })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Investments fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.investments.length).toBe(1)
        expect(body.data.investments[0].environment).toBe(
          investment.environment
        )

        expect(body.data.investments[0].balance).toBe(investment.balance)
        expect(body.data.investments[0].status).toBe(investment.status)
        expect(body.data.investments[0].user._id).toBe(
          investment.user.toString()
        )

        const investmentCounts = await investmentModel.count()

        expect(investmentCounts).toBe(2)
      })
    })
  })
})
