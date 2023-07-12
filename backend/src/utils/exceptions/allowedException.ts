export default class AllowedException {
  public allow = true
  constructor(public err: any) {
    console.log(err)
  }
}
