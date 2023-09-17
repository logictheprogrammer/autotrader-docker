import assetModel from '../../../modules/asset/asset.model'
import pairModel from '../../pair/pair.model'
import { request } from '../../../test'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { pairA, pairB } from './pair.payload'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { getAssetMock } from '../../asset/__test__/asset.mock'
import {
  assetA,
  assetA_id,
  assetB,
  assetB_id,
} from '../../asset/__test__/asset.payload'
import { IUser } from '../../user/user.interface'
import { IPair } from '../pair.interface'
import { Types } from 'mongoose'

describe('pair', () => {
  const baseUrl = '/api/pair/'
  describe('create', () => {
    const url = baseUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userA)
        const token = Encryption.createToken(user)

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
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const payload = {
          assetType: '',
          baseAssetId: '',
          quoteAssetId: '',
        }

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"assetType" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given pair already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

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
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getAssetMock).toHaveBeenCalledTimes(2)

        const pairCount = await pairModel.count()

        expect(pairCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and pair payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

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

        expect(body.message).toBe('Pair added successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        body.data.pair.baseAssetObject = null
        body.data.pair.quoteAssetObject = null
        expect(body.data).toEqual({
          pair: {
            ...pairA,
            baseAsset: pairA.baseAsset.toString(),
            quoteAsset: pairA.quoteAsset.toString(),
            baseAssetObject: null,
            quoteAssetObject: null,
            __v: 0,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const pairCount = await pairModel.count()

        expect(pairCount).toBe(2)
      })
    })
  })

  describe('update', () => {
    const url = baseUrl + 'update'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {
          pairId: new Types.ObjectId().toString(),
        }
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
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const payload = {
          pairId: new Types.ObjectId().toString(),
          assetType: '',
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"assetType" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given pair those not exist', () => {
      it('should throw a 404 not found', async () => {
        await pairModel.create(pairA)
        const payload = {
          pairId: new Types.ObjectId().toString(),
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const pairCount = await pairModel.count()

        expect(pairCount).toBe(1)
      })
    })
    describe('given pair already exist', () => {
      it('should throw a 409 not found', async () => {
        await pairModel.create(pairB)
        const pair = await pairModel.create(pairA)
        const payload = {
          pairId: pair._id,
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and pair payload', async () => {
        const pair = await pairModel.create(pairA)
        const payload = {
          pairId: pair._id,
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        body.data.pair.baseAssetObject = null
        body.data.pair.quoteAssetObject = null
        expect(body.data).toEqual({
          pair: {
            ...pairB,
            baseAsset: pairB.baseAsset.toString(),
            quoteAsset: pairB.quoteAsset.toString(),
            baseAssetObject: null,
            quoteAssetObject: null,
            __v: 0,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const pairCount = await pairModel.count()

        expect(pairCount).toBe(1)
      })
    })
  })

  describe('get pairs', () => {
    const url = baseUrl
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
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
    describe('given no pair available', () => {
      it('should return an empty array of pair', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Pairs fetch successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          pairs: [],
        })
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and pairs payload', async () => {
        const admin = await userModel.create(adminA)
        const token = Encryption.createToken(admin)

        const baseAsset = await assetModel.create(assetA)
        const quoteAsset = await assetModel.create(assetB)

        const pair = await pairModel.create({ ...pairA, baseAsset, quoteAsset })

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Pairs fetch successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          pairs: [
            {
              assetType: pair.assetType,
              baseAsset: {
                ...pair.baseAssetObject,
                _id: baseAsset._id.toString(),
              },
              quoteAsset: {
                ...pair.quoteAssetObject,
                _id: quoteAsset._id.toString(),
              },
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
})
