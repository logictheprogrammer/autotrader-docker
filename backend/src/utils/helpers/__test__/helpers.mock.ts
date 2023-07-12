import Helpers from '../helpers'

export const randomPickFromArrayMock = jest
  .spyOn(Helpers, 'randomPickFromArray')
  .mockImplementation((arr) => {
    return arr[Math.ceil(arr.length / 2) - 1]
  })

export const getRandomValueMock = jest
  .spyOn(Helpers, 'getRandomValue')
  .mockImplementation((min, max) => {
    return min
  })
