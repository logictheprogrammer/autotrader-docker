import Cryptograph from '../../../core/cryptograph'
import {
  investmentB,
  investmentB_id,
} from './../../investment/__test__/investment.payload'
import {
  adminAInput,
  userAInput,
  userBInput,
  userB_id,
} from './../../user/__test__/user.payload'
import tradeModel from '../../trade/trade.model'
import { ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { userA_id } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { Types } from 'mongoose'

import { tradeA, tradeB } from './trade.payload'
import { UserEnvironment } from '../../user/user.enum'
import {
  investmentA,
  investmentA_id,
} from '../../investment/__test__/investment.payload'
import investmentModel from '../../investment/investment.model'
import { StatusCode } from '../../../core/apiResponse'

describe('trade', () => {
  const baseUrl = '/api/trade/'
  const demoUrl = '/api/demo/trade/'
  const masterUrl = '/api/master/trade/'
  const masterDemoUrl = '/api/master/demo/trade/'

  describe('get All live trades', () => {
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

    describe('on successfull entry', () => {
      it('should return an array of all users trades', async () => {
        const trade1 = await tradeModel.create(tradeA)
        const trade2 = await tradeModel.create(tradeB)
        const user1 = await userModel.create({ ...userAInput, _id: userA_id })
        await userModel.create({ ...userBInput, _id: userB_id })
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trades fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.trades.length).toBe(2)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].user.username).toBe(user1.username)
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
        )
      })
    })
  })

  describe('get All demo trades', () => {
    const url = `${masterDemoUrl}`
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

    describe('on successfull entry', () => {
      it('should return an array of all users trades', async () => {
        await tradeModel.create(tradeA)
        await tradeModel.create(tradeB)
        const user1 = await userModel.create({ ...userAInput, _id: userA_id })
        const user2 = await userModel.create({ ...userBInput, _id: userB_id })
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const trade1 = await tradeModel.create({
          ...tradeA,
          environment: UserEnvironment.DEMO,
        })

        await tradeModel.create({
          ...tradeB,
          environment: UserEnvironment.DEMO,
        })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trades fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.trades.length).toBe(2)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].user.username).toBe(user1.username)
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
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
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('on successfull entry', () => {
      it('should return an array of current users trades', async () => {
        const trade1 = await tradeModel.create(tradeA)
        await tradeModel.create(tradeB)
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const user = await userModel.create({ ...userAInput, _id: userA_id })
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trades fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.trades.length).toBe(1)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
        )
      })
    })
  })

  describe('get current user demo trades', () => {
    const url = `${demoUrl}`
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const user = await userModel.create(userAInput)

        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })

    describe('on successfull entry', () => {
      it('should return an array of current user trades', async () => {
        await tradeModel.create(tradeA)
        await tradeModel.create(tradeB)
        await investmentModel.create({ ...investmentA, _id: investmentA_id })
        await investmentModel.create({ ...investmentB, _id: investmentB_id })

        const trade1 = await tradeModel.create({
          ...tradeA,
          environment: UserEnvironment.DEMO,
        })

        const trade2 = await tradeModel.create({
          ...tradeB,
          environment: UserEnvironment.DEMO,
        })

        const user = await userModel.create({ ...userAInput, _id: userA_id })
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trades fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.trades.length).toBe(1)
        expect(body.data.trades[0].environment).toBe(trade1.environment)
        expect(body.data.trades[0].stake).toBe(trade1.stake)
        expect(body.data.trades[0].profit).toBe(trade1.profit)
        expect(body.data.trades[0].status).toBe(trade1.status)
        expect(body.data.trades[0].user._id).toBe(trade1.user.toString())
        expect(body.data.trades[0].investment._id).toBe(
          trade1.investment.toString()
        )
      })
    })
  })

  describe('delete trade', () => {
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
    describe('given trade those not exist', () => {
      it('should return a 404 error', async () => {
        const url = `${masterUrl}delete/${new Types.ObjectId().toString()}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given trade has not been settled', () => {
      it('should return a 400 error', async () => {
        const trade = await tradeModel.create(tradeA)
        const url = `${masterUrl}delete/${trade._id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade has not been settled yet')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success entry', () => {
      it('should return a 200 with a payload', async () => {
        const trade = await tradeModel.create({
          ...tradeA,
          status: ForecastStatus.SETTLED,
        })

        const url = `${masterUrl}delete/${trade._id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Trade deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.trade._id).toBe(trade._id.toString())

        expect(await tradeModel.count()).toBe(0)
      })
    })
  })
})
