import { mathUtility } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('Math Utility', () => {
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(mathUtility)
      expect(methods).toEqual([
        'getRandomNumberFromRange',
        'getRandomNumbersFromArray',
      ])
    })
  })
  // getRandomNumberFromRange
  describe('getRandomNumberFromRange', () => {
    request

    const testCase = [
      { num1: 1, num2: 2 },
      { num1: -5, num2: 10 },
      { num1: 0, num2: 6 },
      { num1: 20, num2: 10 },
      { num1: 0, num2: 0 },
      { num1: 2, num2: 2 },
      { num1: -5, num2: -5 },
    ]

    test.each(testCase)(
      'should return a random number between $num1 and $num2',
      ({ num1, num2 }) => {
        const expectedNumber = mathUtility.getRandomNumberFromRange(num1, num2)
        expect(expectedNumber).toBeGreaterThanOrEqual(Math.min(num1, num2))
        expect(expectedNumber).toBeLessThanOrEqual(Math.max(num1, num2))
      }
    )
  })

  // getRandomNumbersFromArray
  describe('getRandomNumbersFromArray', () => {
    request

    const testCase = [
      { ref: 1, numbers: [1, 2, 3, 4] },
      { ref: 2, numbers: [-2, 0, 2, 4] },
      { ref: 3, numbers: [0, 8, 1, -1, -2] },
      { ref: 4, numbers: [13, 13] },
      { ref: 4, numbers: [-7, -7] },
      { ref: 5, numbers: [5, 0] },
      { ref: 6, numbers: [1] },
    ]

    test.each(testCase)(
      'should return an array of random numbers between each consecutive numbers of ref-$ref numbers',
      ({ numbers }) => {
        const expectedNumbers = mathUtility.getRandomNumbersFromArray(
          numbers
        ) as number[]

        expectedNumbers.forEach((val, i) => {
          const nextIndex = numbers[i + 1] !== undefined ? i + 1 : i

          const min = Math.min(numbers[i], numbers[nextIndex])
          const max = Math.max(numbers[i], numbers[nextIndex])

          expect(val).toBeGreaterThanOrEqual(min)
          expect(val).toBeLessThanOrEqual(max)
        })
      }
    )
  })
})
