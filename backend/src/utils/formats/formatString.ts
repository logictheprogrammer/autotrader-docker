export default class FormatString {
  public static toTitleCase = (str: string): string => {
    return str.replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    )
  }

  public static fromCamelToTitleCase(input: string): string {
    const words = input.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  public static mask(
    str: string,
    startChars: number = 1,
    endChars: number = 1
  ): string {
    const firstChars = str.slice(0, startChars)
    const lastChars = str.slice(-endChars)
    const maskedChars = '*'.repeat(str.length - startChars - endChars)
    return `${firstChars}${maskedChars}${lastChars}`
  }
}
