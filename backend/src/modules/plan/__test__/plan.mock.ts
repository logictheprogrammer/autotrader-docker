import PlanService from '../../../modules/plan/plan.service'
import {
  planA,
  planA_id,
  planB,
  planB_id,
  planC,
  planC_id,
} from './plan.payload'

export const getPlanMock = jest
  .spyOn(PlanService.prototype, 'get')
  .mockImplementation((key) => {
    if (key.toString() === planA_id.toString()) {
      return Promise.resolve({
        ...planA,
        _id: planA_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (key.toString() === planB_id.toString()) {
      return Promise.resolve({
        ...planB,
        _id: planB_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (key.toString() === planC_id.toString()) {
      return Promise.resolve({
        ...planC,
        _id: planC_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else {
      return Promise.resolve(null)
    }
  })