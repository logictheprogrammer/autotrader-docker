export default class FormatNumber {
  public static toDollar(num: number): string {
    return '$' + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  }
}
