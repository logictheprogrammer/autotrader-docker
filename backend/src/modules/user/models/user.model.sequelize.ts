import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table({
  timestamps: true,
  tableName: 'users',
})
class Users extends Model {
  @Column({
    type: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  _id!: string
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username!: string
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  country!: string
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status!: string
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  verifield!: boolean
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string
  @Column({
    type: DataType.UUIDV4,
    allowNull: true,
  })
  referred!: string
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  refer!: string
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  mainBalance!: number
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  referralBalance!: number
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  demoBalance!: number
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isDeleted!: boolean
}

const userModel = Users

export default userModel
