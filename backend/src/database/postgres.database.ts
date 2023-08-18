import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import userModel from '@/modules/user/user.model'

const models = [userModel]

const postgresDatabase = (options: SequelizeOptions) => {
  new Sequelize({
    dialect: 'postgres',
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

export default postgresDatabase
