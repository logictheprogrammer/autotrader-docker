import assetModel from '../../../modules/asset/asset.model'
import pairModel from '../../pair/pair.model'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { pairA, pairB } from './pair.payload'
import { fetchAssetMock } from '../../asset/__test__/asset.mock'
import { assetA, assetB } from '../../asset/__test__/asset.payload'
import { Types } from 'mongoose'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'
import { IControllerRoute } from '../../../core/utils'
import { pairController } from '../../../setup'

describe('pair', () => {
  const baseUrl = '/api/pair/'
  const masterUrl = '/api/master/pair/'
  describe('Validate routes', () => {
    const routes = pairController.routes as IControllerRoute[]
    it('should expect 3 routes', () => {
      expect(routes.length).toBe(3)
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
  describe('create', () => {
    const url = masterUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const payload = {
          assetType: '',
          baseAssetId: '',
          quoteAssetId: '',
        }

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const payload = {
          assetType: '',
          baseAssetId: '',
          quoteAssetId: '',
        }

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"assetType" must be one of [crypto, forex]')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given pair already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const payload = {
          assetType: pairA.assetType,
          baseAssetId: pairA.baseAsset,
          quoteAssetId: pairA.quoteAsset,
        }

        await pairModel.create(pairA)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        expect(fetchAssetMock).toHaveBeenCalledTimes(2)

        const pairCount = await pairModel.count()

        expect(pairCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 201 and pair payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const payload = {
          assetType: pairA.assetType,
          baseAssetId: pairA.baseAsset,
          quoteAssetId: pairA.quoteAsset,
        }

        await pairModel.create(pairB)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.pair.assetType).toBe(payload.assetType)

        const pairCount = await pairModel.count({ _id: body.data.pair._id })
        expect(pairCount).toBe(1)
      })
    })
  })

  describe('update', () => {
    // const url = masterUrl + `update/:pairId`
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {}
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + `update/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .put(url)
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
          assetType: '',
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"assetType" must be one of [crypto, forex]')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given pair those not exist', () => {
      it('should throw a 404 not found', async () => {
        await pairModel.create(pairA)
        const payload = {
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${new Types.ObjectId().toString()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const pairCount = await pairModel.count()

        expect(pairCount).toBe(1)
      })
    })
    describe('given pair already exist', () => {
      it('should throw a 409 not found', async () => {
        await pairModel.create(pairB)
        const pair = await pairModel.create(pairA)
        const payload = {
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${pair._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and pair payload', async () => {
        const pair = await pairModel.create(pairA)
        const payload = {
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + `update/${pair._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          pair: {
            ...pairB,
            baseAsset: pairB.baseAsset.toString(),
            quoteAsset: pairB.quoteAsset.toString(),
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const pairCount = await pairModel.count({
          _id: pair._id,
          baseAsset: payload.baseAssetId,
          quoteAsset: payload.quoteAssetId,
          assetType: payload.assetType,
        })

        expect(pairCount).toBe(1)
      })
    })
  })

  describe('get pairs', () => {
    const url = masterUrl
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
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
    describe('given no pair available', () => {
      it('should return an empty array of pair', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Pairs fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          pairs: [],
        })
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and pairs payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const baseAsset = await assetModel.create(assetA)
        const quoteAsset = await assetModel.create(assetB)

        const pair = await pairModel.create({ ...pairA, baseAsset, quoteAsset })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Pairs fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          pairs: [
            {
              assetType: pair.assetType,
              baseAsset: expect.objectContaining({
                _id: baseAsset._id.toString(),
              }),
              quoteAsset: expect.objectContaining({
                _id: quoteAsset._id.toString(),
              }),

              _id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            },
          ],
        })
      })
    })
  })
})
