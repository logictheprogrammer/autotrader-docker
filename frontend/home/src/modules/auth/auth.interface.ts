export interface IRegister {
  name: string
  email: string
  username: string
  country: string
  password: string
  confirmPassword: string
  invite?: string
}

export interface ILogin {
  account: string
  password: string
}
