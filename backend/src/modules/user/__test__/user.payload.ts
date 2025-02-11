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
  verified: false,
  role: UserRole.USER,
  refer: 'i8qoq1Aqmz',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  password: '123456789',
}

export const verifiedUser = {
  key: '8f5a4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'john',
  country: 'USA',
  email: 'johndoe@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.USER,
  refer: 'i8qoq1Aqmz',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  password: '123456789',
}

export const suspendedUser = {
  key: '8f6a4c9d7f4b9c3b8e8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'suspendeduser',
  country: 'USA',
  email: 'suspendeduser@gmail.com',
  status: UserStatus.SUSPENDED,
  verified: true,
  role: UserRole.USER,
  refer: 'suspendeduser',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  password: '123456789',
}

export const adminUser = {
  key: '8f6a4c9d7f4b9c2b8e8a8d6c8a8d6c8c',
  name: 'John Doe',
  username: 'Admin',
  country: 'USA',
  email: 'admin@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.ADMIN,
  refer: 'i8qoq1Aqmy',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
  password: '123456789',
}

// @ts-ignore
export const notFoundUser: IUserObject = {
  name: 'John Doe',
  username: 'nobody',
  country: 'USA',
  email: 'usera@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.USER,
  refer: 'usera',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
}

export const userA_id = new Types.ObjectId('6345de5d5b1f5b3a5c1b539a')
// @ts-ignore
export const userA: IUserObject = {
  name: 'John Doe',
  username: 'usera',
  country: 'USA',
  email: 'usera@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.USER,
  refer: 'usera',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
}
// @ts-ignore
export const userAInput: IUser = {
  ...userA,
  key: '8f6c4a9d7f4b9c2b8e8a8d6c8a8d6c8a',
  password: '123456789',
}

export const userB_id = new Types.ObjectId('6345de5d5b1f5b3a5c1b539b')
// @ts-ignore
export const userB: IUserObject = {
  name: 'John Doe',
  username: 'userb',
  country: 'USA',
  email: 'userb@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.USER,
  refer: 'userb',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
}
// @ts-ignore
export const userBInput: IUser = {
  ...userB,
  key: '8f6c4c9d7f3b9c2b8e8a8d6c8a8d6c8b',
  password: '123456789',
}

export const userC_id = new Types.ObjectId('6345de5d5b1f5b3a5c1b539c')
// @ts-ignore
export const userC: IUserObject = {
  name: 'John Doe',
  username: 'userc',
  country: 'USA',
  email: 'userc@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.USER,
  refer: 'userc',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
}
// @ts-ignore
export const userCInput: IUser = {
  ...userC,
  key: '8f6c4c9d7f4b9c2b8e1a8d6c8a8d6c8c',
  password: '123456789',
}

export const adminA_id = '6445de5d5b1f5b3a5c1b539a'
export const adminA = {
  key: '8f6b4c9d7e4b9c2b8a8a8d6c8b8d6c8a',
  name: 'John Doe',
  username: 'admina',
  country: 'USA',
  email: 'admina@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.ADMIN,
  refer: 'admina',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
}
// @ts-ignore
export const adminAInput: IUser = {
  ...adminA,
  key: '8f6c4c9d7f4b9c2b8e8c8d6c8a8d6c8a',
  password: '123456789',
}

export const adminB_id = '6445de5d5b1f5b3a5c1b539b'
export const adminB = {
  key: '8f6c4c9d7f4c9c2b8b8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'adminb',
  country: 'USA',
  email: 'adminb@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.ADMIN,
  refer: 'adminb',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
}
// @ts-ignore
export const adminBInput: IUser = {
  ...adminB,
  key: '8f6c4c9d7f4a9c2b8e8a8d6c8a8d6c8a',
  password: '123456789',
}

export const adminC_id = '6445de5d5b1f5b3a5c1b539c'
export const adminC = {
  key: '8e6c4c9d7f4b9c2b8c8a8d6c8a8d6c8a',
  name: 'John Doe',
  username: 'adminc',
  country: 'USA',
  email: 'adminc@gmail.com',
  status: UserStatus.ACTIVE,
  verified: true,
  role: UserRole.ADMIN,
  refer: 'adminc',
  mainBalance: 200,
  referralBalance: 1076.85,
  demoBalance: 1000,
  bonusBalance: 50,
}
// @ts-ignore
export const adminCInput: IUser = {
  ...adminC,
  key: '8f6d4c9d7f4b9c2b8e8a8d6c8a8d6c8a',
  password: '123456789',
}

export const editedUser = {
  name: 'edited name',
  username: 'editedusername',
  country: 'editedusa',
  email: 'editedusera@gmail.com',
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
