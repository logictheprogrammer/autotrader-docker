import PairService from '../../pair/pair.service'
import {
  pairA,
  pairA_id,
  pairB,
  pairB_id,
  pairC,
  pairC_id,
} from './pair.payload'

export const getPairMock = jest
  .spyOn(PairService.prototype, 'get')
  // @ts-ignore
  .mockImplementation((pairId) => {
    if (pairId.toString() === pairA_id.toString()) {
      return Promise.resolve({
        ...pairA,
        _id: pairA_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (pairId.toString() === pairB_id.toString()) {
      return Promise.resolve({
        ...pairB,
        _id: pairB_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (pairId.toString() === pairC_id.toString()) {
      return Promise.resolve({
        ...pairC,
        _id: pairC_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else {
      return Promise.resolve(null)
    }
  })
