import { NotFoundError } from '../../../core/apiError'
import { pairService } from '../../../setup'
import {
  pairA,
  pairA_id,
  pairB,
  pairB_id,
  pairC,
  pairC_id,
  pairD,
  pairD_id,
} from './pair.payload'

export const fetchPairMock = jest
  .spyOn(pairService, 'fetch')
  // @ts-ignore
  .mockImplementation(({ _id: pairId }) => {
    if (pairId.toString() === pairA_id.toString()) {
      return Promise.resolve({
        ...pairA,
        _id: pairA_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (pairId.toString() === pairB_id.toString()) {
      return Promise.resolve({
        ...pairB,
        _id: pairB_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (pairId.toString() === pairC_id.toString()) {
      return Promise.resolve({
        ...pairC,
        _id: pairC_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (pairId.toString() === pairD_id.toString()) {
      return Promise.resolve({
        ...pairD,
        _id: pairD_id,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      throw new NotFoundError('Mock: Pair not found')
    }
  })
