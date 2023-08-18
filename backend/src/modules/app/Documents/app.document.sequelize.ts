import { Model } from 'sequelize'

export default class AppDocument<
  TModelAttributes extends {} = any,
  TCreationAttributes extends {} = TModelAttributes
> extends Model {
  constructor() {
    super()
  }

  $add: any
  $set: any
  $get: any
  $count: any
  $create: any
  $has: any
  $remove: any
}
