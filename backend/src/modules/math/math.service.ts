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
}

export default MathService

// const mathService = new MathService()

// mathService.dynamicRange(2, 5, 2, 2, 0.5)

// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
// console.log(mathService.dynamicRange(2, 5, 1, 25, 0.5))
