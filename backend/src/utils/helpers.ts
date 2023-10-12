import jsdom from 'jsdom'

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

  public static toDollar(num: number): string {
    return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  }

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

  public static clearHtml(body: string): string {
    const dom = new jsdom.JSDOM(body)
    const links = dom.window.document.querySelectorAll('a[data-link-replace]')
    links.forEach((link) => {
      const linkText = link.getAttribute('data-link-replace') || ''
      link.innerHTML = linkText
      link.removeAttribute('href')
    })
    const text = dom.window.document.documentElement.textContent

    return text || ''
  }
}
