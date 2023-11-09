import { Inject, Service } from 'typedi'
import ServiceToken from '../../core/serviceToken'
import { IMathService, IMathUtility } from './math.interface'

@Service()
class MathService implements IMathService {
  public constructor(
    @Inject(ServiceToken.MATH_UTILITY) private mathUtility: IMathUtility
  ) {}

  /**
   * Get A Random array of numbers that meets a condition
   * @param {number} averageValueOne An Average Range Values to use as a reference
   * @param {number} averageValueTwo An Average Range Values to use as a reference
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @returns {number} An array of Random number that meets a condition
   */
  public _getValues(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number
  ): number[] {
    // sanitizing inputs
    breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
    spread = Math.abs(spread)
    averageValueOne = Math.abs(averageValueOne)
    averageValueTwo = Math.abs(averageValueTwo)

    const minAverageRange = Math.min(averageValueOne, averageValueTwo)
    const maxAverageRange = Math.max(averageValueOne, averageValueTwo)

    // constants
    const difference = Math.abs(minAverageRange * spread)
    const unit = difference / breakpoint

    // get the smallest and largest possible value
    const min = minAverageRange - difference
    const max = maxAverageRange + difference

    // min/max values
    const minAverageRanges = []
    const maxAverageRanges = []

    for (let x = 0; x < breakpoint && spread > 0; x++) {
      const minAverageRange = min + unit * x
      const maxAverageRange = max - unit * (breakpoint - (x + 1))

      minAverageRanges.push(minAverageRange)
      maxAverageRanges.push(maxAverageRange)
    }

    // values array
    const values = [
      ...minAverageRanges,
      minAverageRange,
      maxAverageRange,
      ...maxAverageRanges,
    ]

    // console.log('Values: ', values)

    return values
  }

  /**
   * Get half of the remaining values probability
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @param {number} probability It should only be an auguement between 0.5 to 1
   * @returns {number} half of the remaining values probability
   */
  public _getValuesProbability(
    breakpoint: number,
    probability: number
  ): number[] {
    // sanitizing inputs
    breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
    probability = probability > 1 ? 1 : probability < 0.5 ? 0.5 : probability

    // values propability
    const valuesProbability = []

    const remainingProbability = (1 - probability) / 2

    let probSum = 0
    for (let x = 0; x < breakpoint; x++) {
      const prob = probability * (probability + 1) ** x
      valuesProbability.push(prob)
      probSum += prob
    }

    // console.log('valuesProbability: ', valuesProbability)

    const probUnit = 1 / probSum
    // set values probability
    for (let i = 0; i < breakpoint; i++) {
      valuesProbability[i] =
        remainingProbability * (probUnit * valuesProbability[i])
    }

    // console.log('valuesProbability: ', valuesProbability)

    return valuesProbability
  }

  /**
   * Get The Negative Unit value
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many unit will be generated to get to the last value
   * @returns {number} The Sum Of Negative Unit value that meets approximatly at zero
   */
  public _getNegativeUnit(spread: number, breakpoint: number): number {
    breakpoint = Math.abs(Math.ceil(breakpoint)) || 1
    spread = Math.abs(spread)
    spread = spread < 2 ? 2 : spread

    return ((spread - 1) / spread) * breakpoint
  }

  // public _old_getNegativeUnit(spread: number, breakpoint: number): number {
  //   let negativeUnit: number = 0

  //   const values = this._getValues(1, 2, spread, breakpoint)

  //   let currNegativeValue, nextNegativeValue

  //   for (let x = 0; x < values.length; x++) {
  //     currNegativeValue = values[x]
  //     nextNegativeValue = values[x + 1]
  //     if (
  //       currNegativeValue < 0 &&
  //       (!nextNegativeValue || nextNegativeValue < 0)
  //     ) {
  //       negativeUnit += 1
  //     } else if (
  //       currNegativeValue < 0 &&
  //       nextNegativeValue &&
  //       nextNegativeValue === 0
  //     ) {
  //       negativeUnit += 1
  //     } else if (
  //       currNegativeValue < 0 &&
  //       nextNegativeValue &&
  //       nextNegativeValue > 0
  //     ) {
  //       negativeUnit +=
  //         (0 - currNegativeValue) / (nextNegativeValue - currNegativeValue)
  //     } else break
  //   }

  //   return negativeUnit
  // }

  /**
   * Get The Rate at which a loss will occur
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many unit will be generated to get to the last value
   * @param {number} probability The probability of getting the average range value
   * @returns {number} The Rate at which a loss will occur
   */
  public _getPercentageLoss(
    spread: number,
    breakpoint: number,
    probability: number
  ): number {
    const valuesProbability = this._getValuesProbability(
      breakpoint,
      probability
    )

    const negativeValue = this._getNegativeUnit(spread, breakpoint)

    let negativeValueLeft = negativeValue
    let lossProb = 0

    for (let x = 1; x < negativeValue + 1; x++) {
      if (negativeValueLeft < 1) {
        lossProb += negativeValueLeft * valuesProbability[x - 1]
      } else {
        lossProb += valuesProbability[x - 1]
      }

      negativeValueLeft--
    }

    return lossProb
  }

  /**
   * Get The Dynamic options params to achieve this winRate
   * @param {number} winRate The rate for a win to occure which should be 0.77 to 0.95
   * @returns {object} The Dynamic options params to achieve this winRate
   */
  public dynamicRangeOptions(winRate: number): {
    spread: number
    breakpoint: number
    probability: number
  } {
    winRate = Math.abs(winRate)
    winRate = winRate > 0.95 ? 0.95 : winRate < 0.77 ? 0.77 : winRate

    const lossRate = 1 - winRate

    const lowLossRate = lossRate - 0.0001
    const highLossRate = lossRate + 0.0001

    const probability = 0.5
    let spread: number = 12.5,
      breakpoint: number = 1,
      percentageLoss: number,
      statge: 'breakpoint' | 'spread' = 'breakpoint',
      spreadChange = 1,
      loopRan = 0
    while (true) {
      if (loopRan >= 50) break
      loopRan++
      percentageLoss = this._getPercentageLoss(spread, breakpoint, probability)

      if (percentageLoss >= lowLossRate && percentageLoss <= highLossRate) {
        break
      }

      if (statge === 'breakpoint') {
        if (percentageLoss > highLossRate) {
          breakpoint++
        } else if (percentageLoss < lowLossRate) {
          breakpoint--
          statge = 'spread'
        }

        if (breakpoint > 7 || breakpoint < 1) {
          breakpoint = breakpoint > 7 ? 7 : 1
          statge = 'spread'
        }
      } else if (statge === 'spread') {
        if (percentageLoss < lowLossRate) {
          spreadChange = spreadChange / 2
          spread += spreadChange
        } else if (percentageLoss > highLossRate) {
          spreadChange = spreadChange === 1 ? 1 : spreadChange / 2
          spread -= spreadChange
        }
      }
    }

    return { spread, breakpoint, probability }
  }

  /**
   * Get A Random number that meets the condition
   * @param {number} averageValueOne An Average Range Value to use as a reference
   * @param {number} averageValueTwo An Average Range Value to use as a reference
   * @param {number} spread How far should the lowest value go in relative to zero, 1 will be the length for the lowest value to be zero
   * @param {number} breakpoint How many sub values will be generated to get to the last value
   * @param {number} probability The Probability value for the provided averageValueOne and averageValueTwo params, It should only be an auguement between 0.5 to 1
   * @returns {number} A Random number that meets the condition
   */
  public dynamicRange(
    averageValueOne: number,
    averageValueTwo: number,
    spread: number,
    breakpoint: number,
    probability: number
  ): number {
    const values = this._getValues(
      averageValueOne,
      averageValueTwo,
      spread,
      breakpoint
    )

    const valuesProbability = this._getValuesProbability(
      breakpoint,
      probability
    )

    // get random values
    const randomValues = this.mathUtility.getRandomNumbersFromArray(values)

    // console.log('randomValues: ', randomValues)

    const remainder =
      1 -
      probability -
      valuesProbability.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ) *
        2

    // console.log('remainder: ', remainder)

    let accumulatedProbability = 0
    const finalValuesProbability = [
      ...valuesProbability,
      probability + remainder,
      ...[...valuesProbability].reverse(),
    ].map((currentProbability) => {
      accumulatedProbability += currentProbability

      return accumulatedProbability
    })

    const probabilityPicked = Math.random()

    const probabilityIndex = finalValuesProbability.findIndex(
      (currentProbability, i, arr) => {
        const prevProbability = arr[i - 1] !== undefined ? arr[i - 1] : 0

        return (
          prevProbability < probabilityPicked &&
          probabilityPicked <= currentProbability
        )
      }
    )

    return randomValues[probabilityIndex]
  }
}

export default MathService

////////////////////////////
///////////////////////////
// EXPERIMENTAL TESTING
////////////////////////////
///////////////////////////

// import MathUtility from './math.utility'
// const mathService = new MathService(new MathUtility())

// const options = mathService.dynamicRangeOptions(0.8)

// const avg1 = 5
// const avg2 = 100
// const sprd = options.spread
// const bkp = options.breakpoint
// const prob = options.probability

// const run = 100000
// const negativeValues = []
// const positiveValues = []

// let sum = 0
// const startTime = new Date().getTime()
// for (let x = 0; x < run; x++) {
//   const curr = mathService.dynamicRange(avg1, avg2, sprd, bkp, prob)
//   sum += curr
//   if (curr > 0) {
//     positiveValues.push(curr)
//   }
//   if (curr < 0) {
//     negativeValues.push(curr)
//   }
// }
// const average = sum / run

// console.log('=====================')
// console.log('negative: ', negativeValues.length / run)
// console.log('Average: ', average)
// console.log('=====================')
// console.log('max: ', positiveValues.length, Math.max(...positiveValues))
// console.log('min: ', negativeValues.length, Math.min(...negativeValues))
// console.log('=====================')
// console.log('Time: ', (new Date().getTime() - startTime) / 1000)

////////////////////////////////////
///////////////////////////////////
// RUN npx ts-node .\math.service.ts
////////////////////////////////////
///////////////////////////////////
