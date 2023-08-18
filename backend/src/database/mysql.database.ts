import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import userModel from '@/modules/user/user.model'

const models = [userModel]

const mysqlDatabase = (options: SequelizeOptions) => {
  new Sequelize({
    dialect: 'mysql',
    ...options,
    logging: false,
    models: [],
  })
    .sync()
    .then(() => {
      console.log('Database synced successfully')
    })
    .catch((err) => {
      throw err
    })
}

export default mysqlDatabase
