import { PlanStatus } from './../plan.enum'
import planModel from '../../../modules/plan/plan.model'
import { request } from '../../../test'
import { fetchAssetMock } from '../../asset/__test__/asset.mock'
import { adminAInput, userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { planA, planA_id, planB, planC } from './plan.payload'
import { Types } from 'mongoose'
import Cryptograph from '../../../core/cryptograph'
import { StatusCode } from '../../../core/apiResponse'

describe('plan', () => {
  const baseUrl = '/api/plan'
  const masterUrl = '/api/master/plan'
  describe('create a plan', () => {
    const url = `${masterUrl}/create`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          ...planA,
          name: '',
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given unknown assets', () => {
      it('should return a 404', async () => {
        const payload = {
          ...planA,
          assets: [
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString(),
          ],
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Some of the selected assets those not exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const payload = {
          ...planA,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .post(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan created successfully')
        expect(statusCode).toBe(201)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.plan.name).toBe(payload.name)

        expect(fetchAssetMock).toHaveBeenCalledTimes(2)

        const planCount = await planModel.count({ _id: body.data.plan._id })
        expect(planCount).toBe(1)
      })
    })
  })

  describe('update a plan', () => {
    // const url = `${masterUrl}/update/:planId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${masterUrl}/update/${new Types.ObjectId()}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Unauthorized')
        expect(statusCode).toBe(401)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given inputs are incorrect', () => {
      it('should return a 400 error', async () => {
        const payload = {
          ...planB,
          name: '',
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/update/${planA_id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('"name" is not allowed to be empty')
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given plan those not exist', () => {
      it('should return a 404', async () => {
        const payload = {
          ...planB,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/update/${planA_id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given unknown assets', () => {
      it('should return a 404', async () => {
        const plan = await planModel.create(planA)
        const payload = {
          ...planB,
          assets: [
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString(),
          ],
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/update/${plan._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Some of the selected assets those not exist')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const plan = await planModel.create(planA)
        const payload = {
          ...planB,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/update/${plan._id}`

        const { statusCode, body } = await request
          .put(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.plan._id).toBe(plan._id.toString())
        expect(body.data.plan.name).toBe(payload.name)
        expect(body.data.plan.icon).toBe(payload.icon)
        expect(body.data.plan.engine).toBe(payload.engine)
        expect(body.data.plan.minPercentageProfit).toBe(
          payload.minPercentageProfit
        )

        expect(fetchAssetMock).toHaveBeenCalledTimes(2)

        const planCount = await planModel.count({
          _id: body.data.plan._id,
          name: payload.name,
          engine: payload.engine,
        })
        expect(planCount).toBe(1)
      })
    })
  })

  describe('update plan status', () => {
    // const url = `${masterUrl}/update-status/:planId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const payload = {}

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const url = `${masterUrl}/update-status/${new Types.ObjectId()}`

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
        const payload = {
          status: 'unknown',
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/update-status/${planA_id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe(
          '"status" must be one of [active, suspended, on maintenance]'
        )
        expect(statusCode).toBe(400)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('given plan those not exist', () => {
      it('should return a 404', async () => {
        const payload = {
          status: PlanStatus.SUSPENDED,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/update-status/${planA_id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const plan = await planModel.create(planA)
        const payload = {
          status: PlanStatus.SUSPENDED,
        }

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const url = `${masterUrl}/update-status/${plan._id}`

        const { statusCode, body } = await request
          .patch(url)
          .set('Authorization', `Bearer ${token}`)
          .send(payload)

        expect(body.message).toBe('Status updated successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.plan._id).toBe(plan._id.toString())

        const planCount = await planModel.count({
          _id: body.data.plan._id,
          status: payload.status,
        })
        expect(planCount).toBe(1)
      })
    })
  })

  describe('delete a plan', () => {
    // const url = `${masterUrl}/delete/:planId`
    describe('given logged in user is not an admin', () => {
      it('should return a 401 Unauthorized error', async () => {
        const url = `${masterUrl}/delete/${planA_id}`

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
    describe('given plan those not exist', () => {
      it('should return a 404', async () => {
        const url = `${masterUrl}/delete/${planA_id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plan not found')
        expect(statusCode).toBe(404)
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        const plan = await planModel.create(planA)
        const url = `${masterUrl}/delete/${plan._id}`

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .delete(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plan deleted successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.plan._id).toBe(plan._id.toString())

        const planCount = await planModel.count()
        expect(planCount).toBe(0)
      })
    })
  })

  describe('fetch plans master', () => {
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
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        await planModel.create(planA)
        await planModel.create({ ...planB, status: PlanStatus.SUSPENDED })

        await planModel.create({
          ...planC,
          status: PlanStatus.ON_MAINTENANCE,
        })

        const admin = await userModel.create(adminAInput)
        const token = Cryptograph.createToken(admin)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plans fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)

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
        expect(body.status).toBe(StatusCode.DANGER)
      })
    })
    describe('on success', () => {
      it('should return a 200 and payload', async () => {
        await planModel.create(planA)
        await planModel.create({ ...planB, status: PlanStatus.SUSPENDED })

        await planModel.create({
          ...planC,
          status: PlanStatus.ON_MAINTENANCE,
        })

        const user = await userModel.create(userAInput)
        const token = Cryptograph.createToken(user)

        const { statusCode, body } = await request
          .get(url)
          .set('Authorization', `Bearer ${token}`)

        expect(body.message).toBe('Plans fetched successfully')
        expect(statusCode).toBe(200)
        expect(body.status).toBe(StatusCode.SUCCESS)
        expect(body.data.plans.length).toBe(2)
      })
    })
  })
})
