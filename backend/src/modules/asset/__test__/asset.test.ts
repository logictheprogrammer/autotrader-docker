import { StatusCode } from './../../../core/apiResponse'
import Cryptograph from '../../../core/cryptograph'
import assetModel from '../../../modules/asset/asset.model'
import { request } from '../../../test'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { assetA, assetB } from './asset.payload'
import { Types } from 'mongoose'

describe('asset', () => {
  const baseUrl = '/api/asset/'
  const masterUrl = '/api/master/asset/'
  describe('create', () => {
    const url = masterUrl + 'create'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(assetA)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given payload is not valid', () => {
      it('it should throw a 400 error', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send({ ...assetA, name: '' })

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given asset already exist', () => {
      it('should throw a 409', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await assetModel.create(assetA)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(assetA)

        expect(body.message).toBe('Asset already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)

        const assetCount = await assetModel.count()

        expect(assetCount).toBe(1)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and asset payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        await assetModel.create(assetB)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(assetA)

        expect(body.message).toBe('Asset created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          asset: {
            ...assetA,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        })

        const assetCount = await assetModel.count()

        expect(assetCount).toBe(2)
      })
    })
  })

  describe('update', () => {
    // const url = masterUrl + 'update/:assetId'
    describe('given user is not an admin', () => {
      it('should throw a 401 Unauthorized', async () => {
        const payload = assetB
        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = masterUrl + 'update/' + new Types.ObjectId().toString()

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
          ...assetB,
          name: '',
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + 'update/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given asset those not exist', () => {
      it('should throw a 404 not found', async () => {
        await assetModel.create(assetA)
        const payload = {
          ...assetB,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + 'update/' + new Types.ObjectId().toString()

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Asset not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)

        const assetCount = await assetModel.count()

        expect(assetCount).toBe(1)
      })
    })
    describe('given asset already exist', () => {
      it('should throw a 409 not found', async () => {
        await assetModel.create(assetB)
        const asset = await assetModel.create(assetA)
        const payload = {
          ...assetB,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + 'update/' + asset._id

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Asset already exist')
        expect(statusCode).toBe(409)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and asset payload', async () => {
        const asset = await assetModel.create(assetA)
        const payload = {
          ...assetB,
        }
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = masterUrl + 'update/' + asset._id

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Asset updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.asset.name).toBe(assetB.name)
        expect(body.data.asset.symbol).toBe(assetB.symbol)
        expect(body.data.asset.logo).toBe(assetB.logo)
        expect(body.data.asset.type).toBe(assetB.type)

        const assetCount = await assetModel.count(body.data.asset)

        expect(assetCount).toBe(1)
      })
    })
  })

  describe('get assets', () => {
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
    describe('given no asset available', () => {
      it('should return an empty array of asset', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Assets fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data).toEqual({
          assets: [],
        })
      })
    })
    describe('successful entry', () => {
      it('should return a 200 and assets payload', async () => {
        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const asset = await assetModel.create(assetA)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Assets fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

        expect(body.data.assets.length).toBe(1)
        expect(body.data.assets[0].name).toBe(asset.name)
      })
    })
  })
})
