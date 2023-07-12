import MathService from '../math.service'

export const dynamicRangeMock = jest
  .spyOn(MathService.prototype, 'dynamicRange')
  .mockImplementation((minValue, ...restParams) => {
    return minValue
  })
