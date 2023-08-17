import pairModel from '../../pair/pair.model'
import { request } from '../../../test'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { pairA, pairB } from './pair.payload'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import { getAssetMock } from '../../asset/__test__/asset.mock'
import { assetA_id, assetB_id } from '../../asset/__test__/asset.payload'
import AppRepository from '../../app/app.repository'
import { IUser } from '../../user/user.interface'
import { IPair } from '../pair.interface'
import AppObjectId from '../../app/app.objectId'

const userRepository = new AppRepository<IUser>(userModel)
const pairRepository = new AppRepository<IPair>(pairModel)

describe('pair', () => {
  const baseUrl = '/api/pair/'
  describe('create', () => {
    const url = baseUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userRepository.create(userA).save()
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
        const admin = await userRepository.create(adminA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const payload = {
          assetType: pairA.assetType,
          baseAssetId: pairA.baseAsset,
          quoteAssetId: pairA.quoteAsset,
        }

        await pairRepository.create(pairA).save()

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        expect(getAssetMock).toHaveBeenCalledTimes(2)

        const pairCount = await pairRepository.count()

        expect(pairCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and pair payload', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const payload = {
          assetType: pairA.assetType,
          baseAssetId: pairA.baseAsset,
          quoteAssetId: pairA.quoteAsset,
        }

        await pairRepository.create(pairB).save()

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

        const pairCount = await pairRepository.count()

        expect(pairCount).toBe(2)
      })
    })
  })

  describe('update', () => {
    const url = baseUrl + 'update'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {
          pairId: new AppObjectId().toString(),
        }
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
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const payload = {
          pairId: new AppObjectId().toString(),
          assetType: '',
        }
        const admin = await userRepository.create(adminA).save()
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
        await pairRepository.create(pairA).save()
        const payload = {
          pairId: new AppObjectId().toString(),
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Pair not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const pairCount = await pairRepository.count()

        expect(pairCount).toBe(1)
      })
    })
    describe('given pair already exist', () => {
      it('should throw a 409 not found', async () => {
        await pairRepository.create(pairB).save()
        const pair = await pairRepository.create(pairA).save()
        const payload = {
          pairId: pair._id,
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userRepository.create(adminA).save()
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
        const pair = await pairRepository.create(pairA).save()
        const payload = {
          pairId: pair._id,
          assetType: pairB.assetType,
          baseAssetId: pairB.baseAsset,
          quoteAssetId: pairB.quoteAsset,
        }
        const admin = await userRepository.create(adminA).save()
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

        const pairCount = await pairRepository.count()

        expect(pairCount).toBe(1)
      })
    })
  })

  describe('get pairs', () => {
    const url = baseUrl
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
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
    describe('given no pair available', () => {
      it('should return an empty array of pair', async () => {
        const admin = await userRepository.create(adminA).save()
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
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const pair = await pairRepository.create(pairA).save()

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
              baseAsset: { ...pair.baseAssetObject, _id: assetA_id.toString() },
              quoteAsset: {
                ...pair.quoteAssetObject,
                _id: assetB_id.toString(),
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
