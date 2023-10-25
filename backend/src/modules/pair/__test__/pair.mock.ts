import PairService from '../../pair/pair.service'
import {
  pairA,
  pairA_id,
  pairB,
  pairB_id,
  pairC,
  pairC_id,
} from './pair.payload'

export const fetchPairMock = jest
  .spyOn(PairService.prototype, 'fetch')
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
    } else {
      return Promise.reject('Mock: pair id not handled')
    }
  })
