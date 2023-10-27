import { planService } from '../../../setup'
import {
  planA,
  planA_id,
  planB,
  planB_id,
  planC,
  planC_id,
} from './plan.payload'

export const fetchPlanMock = jest
  .spyOn(planService, 'fetch')
  // @ts-ignore
  .mockImplementation(({ _id: key }) => {
    if (key.toString() === planA_id.toString()) {
      return Promise.resolve({
        ...planA,
        _id: planA_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === planB_id.toString()) {
      return Promise.resolve({
        ...planB,
        _id: planB_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (key.toString() === planC_id.toString()) {
      return Promise.resolve({
        ...planC,
        _id: planC_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.reject('Mock: plan id not handled')
    }
  })
