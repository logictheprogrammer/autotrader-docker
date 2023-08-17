import assetModel from '../../../modules/asset/asset.model'
import { request } from '../../../test'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { Types } from 'mongoose'
import { assetA, assetB } from './asset.payload'
import Encryption from '../../../utils/encryption'
import { HttpResponseStatus } from '../../http/http.enum'
import AppRepository from '../../app/app.repository'
import { IAsset } from '../asset.interface'
import { IUser } from '../../user/user.interface'

const assetRepository = new AppRepository<IAsset>(assetModel)
const userRepository = new AppRepository<IUser>(userModel)

describe('asset', () => {
  const baseUrl = '/api/asset/'
  describe('create', () => {
    const url = baseUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(assetA)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ ...assetA, name: '' })

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given asset already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        await assetRepository.create(assetA).save()

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(assetA)

        expect(body.message).toBe('Asset already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const assetCount = await assetRepository.count()

        expect(assetCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and asset payload', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        await assetRepository.create(assetB).save()

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(assetA)

        expect(body.message).toBe('Asset added successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          asset: {
            ...assetA,
            __v: 0,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const assetCount = await assetRepository.count()

        expect(assetCount).toBe(2)
      })
    })
  })

  describe('update', () => {
    const url = baseUrl + 'update'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = {
          assetId: new Types.ObjectId().toString(),
          ...assetB,
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
          assetId: new Types.ObjectId().toString(),
          ...assetB,
          name: '',
        }
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given asset those not exist', () => {
      it('should throw a 404 not found', async () => {
        await assetRepository.create(assetA).save()
        const payload = {
          assetId: new Types.ObjectId().toString(),
          ...assetB,
        }
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Asset not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)

        const assetCount = await assetRepository.count()

        expect(assetCount).toBe(1)
      })
    })
    describe('given asset already exist', () => {
      it('should throw a 409 not found', async () => {
        await assetRepository.create(assetB).save()
        const asset = await assetRepository.create(assetA).save()
        const payload = {
          assetId: asset._id,
          ...assetB,
        }
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Asset already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and asset payload', async () => {
        const asset = await assetRepository.create(assetA).save()
        const payload = {
          assetId: asset._id,
          ...assetB,
        }
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Asset updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          asset: {
            ...assetRepository.toObject(asset),
            ...assetB,
            __v: expect.any(Number),
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const assetCount = await assetRepository.count()

        expect(assetCount).toBe(1)
      })
    })
  })

  describe('get assets', () => {
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
    describe('given no asset available', () => {
      it('should return an empty array of asset', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Assets fetch successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          assets: [],
        })
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and assets payload', async () => {
        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const asset = await assetRepository.create(assetA).save()

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Assets fetch successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data).toEqual({
          assets: [
            {
              ...assetRepository.toObject(asset),
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
