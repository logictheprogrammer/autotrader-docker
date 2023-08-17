import { PlanStatus } from './../plan.enum'
import planModel from '../../../modules/plan/plan.model'
import { request } from '../../../test'
import Encryption from '../../../utils/encryption'
import { getAssetMock } from '../../asset/__test__/asset.mock'
import { HttpResponseStatus } from '../../http/http.enum'
import { adminA, userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { planA, planA_id, planB, planC } from './plan.payload'
import AppRepository from '../../app/app.repository'
import { IPlan } from '../plan.interface'
import { IUser } from '../../user/user.interface'
import AppObjectId from '../../app/app.objectId'

const userRepository = new AppRepository<IUser>(userModel)
const planRepository = new AppRepository<IPlan>(planModel)

describe('plan', () => {
  const baseUrl = '/api/plans'
  describe('create a plan', () => {
    const url = `${baseUrl}/create`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
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
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          ...planA,
          name: '',
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given unknown assets', () => {
      it('should return a 404', async () => {
        const payload = {
          ...planA,
          assets: [new AppObjectId().toString(), new AppObjectId().toString()],
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Some of the selected assets those not exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const payload = {
          ...planA,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan has been created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.plan.name).toBe(payload.name)

        expect(getAssetMock).toHaveBeenCalledTimes(4)
      })
    })
  })

  describe('update a plan', () => {
    const url = `${baseUrl}/update`
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
          planId: planA_id,
          ...planB,
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
    describe('given plan those not exist', () => {
      it('should return a 404', async () => {
        const payload = {
          planId: planA_id,
          ...planB,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given unknown assets', () => {
      it('should return a 404', async () => {
        const payload = {
          planId: planA_id,
          ...planB,
          assets: [new AppObjectId().toString(), new AppObjectId().toString()],
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Some of the selected assets those not exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const plan = await planRepository.create(planA).save()
        const payload = {
          planId: plan._id,
          ...planB,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan has been updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.plan._id).toBe(plan._id.toString())
        expect(body.data.plan.name).toBe(payload.name)
        expect(body.data.plan.icon).toBe(payload.icon)
        expect(body.data.plan.engine).toBe(payload.engine)
        expect(body.data.plan.minProfit).toBe(payload.minProfit)

        expect(getAssetMock).toHaveBeenCalledTimes(4)
      })
    })
  })

  describe('update plan status', () => {
    const url = `${baseUrl}/update-status`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .patch(url)
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
          planId: planA_id,
          status: 'unknown',
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          '"status" must be one of [active, suspended, on maintenance]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('given plan those not exist', () => {
      it('should return a 404', async () => {
        const payload = {
          planId: planA_id,
          status: PlanStatus.SUSPENDED,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const plan = await planRepository.create(planA).save()
        const payload = {
          planId: plan._id,
          status: PlanStatus.SUSPENDED,
        }

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan status has been updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.plan._id).toBe(plan._id.toString())
      })
    })
  })

  describe('delete a plan', () => {
    // const url = `${baseUrl}/delete/:planId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${baseUrl}/delete/${planA_id}`

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
    describe('given plan those not exist', () => {
      it('should return a 404', async () => {
        const url = `${baseUrl}/delete/${planA_id}`

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const plan = await planRepository.create(planA).save()
        const url = `${baseUrl}/delete/${plan._id}`

        console.log(plan)

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plan has been deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.plan._id).toBe(plan._id.toString())

        const planCount = await planRepository.count()

        expect(planCount).toBe(0)
      })
    })
  })

  describe('fetch plans master', () => {
    const url = `${baseUrl}/master`
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
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        await planRepository.create(planA).save()
        await planRepository
          .create({ ...planB, status: PlanStatus.SUSPENDED })
          .save()
        await planRepository
          .create({
            ...planC,
            status: PlanStatus.ON_MAINTENANCE,
          })
          .save()

        const admin = await userRepository.create(adminA).save()
        const token = Encryption.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plans fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)

        expect(body.data.plans.length).toBe(3)
      })
    })
  })

  describe('fetch plans', () => {
    const url = `${baseUrl}`
    describe('given user is not logged in', () => {
      it('should return a 401 Unauthorized error', async () => {
        const { statusCode, body } = await request.get(url)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(HttpResponseStatus.ERROR)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        await planRepository.create(planA).save()
        await planRepository
          .create({ ...planB, status: PlanStatus.SUSPENDED })
          .save()
        await planRepository
          .create({
            ...planC,
            status: PlanStatus.ON_MAINTENANCE,
          })
          .save()

        const user = await userRepository.create(userA).save()
        const token = Encryption.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plans fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(HttpResponseStatus.SUCCESS)
        expect(body.data.plans.length).toBe(2)
      })
    })
  })
})
