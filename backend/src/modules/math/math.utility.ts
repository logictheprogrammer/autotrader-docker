import { Service } from 'typedi'
import { IMathUtility } from './math.interface'

@Service()
class MathUtility implements IMathUtility {
  /**
   * To get a random number between the two provided numbers
   * @param {number} num1
   * @param {number} num2
   * @returns {number} a random number between the two provided numbers
   */
  public getRandomNumberFromRange(num1: number, num2: number): number {
    const min = Math.min(num1, num2)
    const max = Math.max(num1, num2)
    return Math.random() * (max - min) + min
  }

  /**
   * To get an array of random numbers between each consecutive numbers in the provided numbers params
   * @param {number} numbers
   * @returns {number} an array of random numbers between each consecutive numbers in the provided numbers params
   */
  public getRandomNumbersFromArray(numbers: number[]): number[] {
    const randomValues = []

    for (let i = 0; i < numbers.length - 1; i++) {
      const value = this.getRandomNumberFromRange(numbers[i], numbers[i + 1])

      randomValues.push(value)
    }

    return randomValues
  }
}

export default MathUtility
