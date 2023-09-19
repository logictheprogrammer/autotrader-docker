import { Service } from 'typedi'
import { IMathService } from './math.interface'

@Service()
class MathService implements IMathService {
  public _getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  public _setRandomValues(numbers: number[]): number[] {
    const randomValues = []

    for (let i = 0; i < numbers.length - 1; i++) {
      const value = this._getRandomValue(numbers[i], numbers[i + 1])

      randomValues.push(value)
    }

    return randomValues
  }

  // spread - how far away from the provide value should be possible: min 0
  // breakpoint - breakpoints to get to the provided values: more than zero
  public dynamicRange(
    minValue: number,
    maxValue: number,
    spread: number,
    breakpoint: number,
    probability: number
  ): number {
    // validating input
    if (probability > 1 || probability < 0)
      throw new Error('probability aguement should be between 0 to 1')
    if (minValue > maxValue)
      throw new Error(
        'minValue aguement should be lesser than the maxValue aguement'
      )
    if (minValue <= 0)
      throw new Error('minValue aguement should not be lesser than zero')
    if (spread < 0) throw new Error('spread aguement should not be negative')
    if (breakpoint <= 0)
      throw new Error('breakpoint aguement should be greater than zero')

    // sanitizing inputs
    breakpoint = Math.ceil(breakpoint)

    // constants
    const difference = minValue * spread
    const unit = difference / breakpoint

    // get the smallest and largest possible value
    const min = minValue - difference
    const max = maxValue + difference

    // min/max values
    const minValues = []
    const maxValues = []

    for (let x = 0; x < breakpoint; x++) {
      const minValue = min + unit * x
      const maxValue = max - unit * (breakpoint - (x + 1))

      minValues.push(minValue)
      maxValues.push(maxValue)
    }

    // values array
    const values = [...minValues, minValue, maxValue, ...maxValues]

    // get random values
    const randomValues = this._setRandomValues(values)

    // targetPosition
    const targetPosition = values.length / 2

    // values propability
    const subPicks = []

    const failureChance = (1 - probability) / 2

    let pickSum = 0
    for (let x = 1; x < targetPosition; x++) {
      const pick = probability * (probability + 1) ** (x - 1)
      subPicks.push(pick)
      pickSum += pick
    }

    const pickUnit = 1 / pickSum
    // set values probability
    for (let i = 1; i < targetPosition; i++) {
      subPicks[i - 1] = failureChance * (pickUnit * subPicks[i - 1])
    }

    // console.log(subPicks.map((pick) => (pick * 100).toFixed(2)))

    const remainder =
      1 -
      probability -
      subPicks.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      ) *
        2

    // console.log(remainder * 100)

    let lastValue = 0
    const picks = [
      ...subPicks,
      probability + remainder,
      ...[...subPicks].reverse(),
    ].map((value) => {
      lastValue = lastValue + value

      return lastValue
    })

    const choosenNumber = Math.random()

    const choosenIndex = picks.findIndex((value, i, arr) => {
      const lastValue = arr[i - 1] !== undefined ? arr[i - 1] : 0

      return lastValue < choosenNumber && choosenNumber <= value
    })

    return randomValues[choosenIndex]
  }

  public quickDynamicRange(
    minValue: number,
    maxValue: number,
    total: number
  ): number {
    const breakpoint = 2.5 * (maxValue - minValue) * (total / 10)
    const spread = (minValue / 1.5) * (total / 10)

    return this.dynamicRange(minValue, maxValue, spread, breakpoint, 0.5)
  }
}

export default MathService

// const mathService = new MathService()

// const total = 10
// const min = 50
// const max = 75

// const breakpoint = 2.5 * (max - min) * (total / 10)
// const spread = (min / 1.5) * (total / 10)

// let sum = 0
// for (let x = 0; x < total; x++) {
//   const curr = mathService.dynamicRange(min, max, spread, breakpoint, 0.5)
//   sum += curr
//   console.log(curr)
// }

// console.log('Final: ', sum / total)

////////////
// testing breakpoint to be ((3) * (maxValue - minValue)) * total/10
// and spread to be (minValue / (3)) * total/10

///////////
// RUN npx ts-node .\math.service.ts

//////////
// Documentation

// minValue
// maxValue
// spread
// breakpoint
// probability

// the lowest value to get is = minValue - (minValue * spread), where 0 will make it the provided minValue
// the highest value to get is = maxValue - (minValue * spread)

// the breakpoint determine the steps, where 1 will be 1 step away from the provided minValue to the lowest value to get

// the probability determine the rate at which the value should leave the original values, where 0 is always why 1 is never
