import { Types } from 'mongoose'
import { IUser, IUserObject } from '../../../modules/user/user.interface'
import { UserRole, UserStatus } from './../user.enum'

export const existingUser = {
  key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'john',
  country: 'USA',
  email: 'johndoe@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: false,
  password: '1234567890',
  role: UserRole.USER,
  refer: 'i8qoq1Aqmz',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const verifieldUser = {
  key: '8f5a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'john',
  country: 'USA',
  email: 'johndoe@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.USER,
  refer: 'i8qoq1Aqmz',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const suspendedUser = {
  key: '8f6a4c9d7f4b9c3b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'suspendeduser',
  country: 'USA',
  email: 'suspendeduser@gmail.com',
  status: UserStatus.SUSPENDED,
  verifield: true,
  password: '1234567890',
  role: UserRole.USER,
  refer: 'suspendeduser',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const adminUser = {
  key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8c',
  name: 'John Doe',
  username: 'Admin',
  country: 'USA',
  email: 'admin@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.ADMIN,
  refer: 'i8qoq1Aqmy',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

// @ts-ignore
export const notFoundUser: IUserObject = {
  key: '8f6b4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'nobody',
  country: 'USA',
  email: 'usera@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.USER,
  refer: 'usera',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const userA_id = new Types.ObjectId('6345de5d5b1f5b3a5c1b539a')
// @ts-ignore
export const userA: IUserObject = {
  key: '8f6b4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'usera',
  country: 'USA',
  email: 'usera@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.USER,
  refer: 'usera',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const userB_id = new Types.ObjectId('6345de5d5b1f5b3a5c1b539b')
// @ts-ignore
export const userB: IUserObject = {
  key: '8f6c4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'userb',
  country: 'USA',
  email: 'userb@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.USER,
  refer: 'userb',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const userC_id = new Types.ObjectId('6345de5d5b1f5b3a5c1b539c')
// @ts-ignore
export const userC: IUserObject = {
  key: '8f6d4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'userc',
  country: 'USA',
  email: 'userc@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.USER,
  refer: 'userc',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const adminA_id = '6445de5d5b1f5b3a5c1b539a'
export const adminA = {
  key: '8f6b4c9d7f4b9c2b8a8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'admina',
  country: 'USA',
  email: 'admina@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.ADMIN,
  refer: 'admina',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const adminB_id = '6445de5d5b1f5b3a5c1b539b'
export const adminB = {
  key: '8f6c4c9d7f4b9c2b8b8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'adminb',
  country: 'USA',
  email: 'adminb@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.ADMIN,
  refer: 'adminb',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const adminC_id = '6445de5d5b1f5b3a5c1b539c'
export const adminC = {
  key: '8f6c4c9d7f4b9c2b8c8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'adminc',
  country: 'USA',
  email: 'adminc@gmail.com',
  status: UserStatus.ACTIVE,
  verifield: true,
  password: '1234567890',
  role: UserRole.ADMIN,
  refer: 'adminc',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  isDeleted: false,
}

export const editedUser = {
  name: 'edited name',
  username: 'editedusername',
  country: 'editedusa',
  email: 'editedusera@gmail.com',
}

// @ts-ignore
export const userModelReturn: IUser = {
  save: jest.fn(),
  _id: 'user id',
}

// @ts-ignore
export const userAObj: IUserObject = {
  ...userA,
  // @ts-ignore
  _id: userA_id,
}

// @ts-ignore
export const userBObj: IUserObject = {
  ...userB,
  // @ts-ignore
  _id: userB_id,
  // @ts-ignore
  referred: userA_id,
}
