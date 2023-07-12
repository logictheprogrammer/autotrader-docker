export default class Helpers {
  public static deepClone<T = any>(data?: T | Array<T>): T | Array<T> {
    return data ? JSON.parse(JSON.stringify(data)) : undefined
  }

  public static randomPickFromArray<T = any>(arrValues: Array<T>): T {
    const arrValueIndex = Math.floor(Math.random() * arrValues.length)
    return arrValues[arrValueIndex]
  }

  public static getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }
}
