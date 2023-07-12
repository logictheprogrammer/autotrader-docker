import { defineStore } from 'pinia'
import type { SubmissionContext } from 'vee-validate'
import type { ILogin, IRegister } from './auth.interface'

export const useAuthStore = defineStore('auth', () => {
  const basePath = 'authentication'
  const httpStore = useHttpStore()
  async function login(form: ILogin, contex: SubmissionContext) {
    try {
      httpStore.setRequesting(true)
      const result = await axios.post(`${basePath}/login`, form)
      httpStore.handleRequest(result)
      contex.resetForm()
      console.log(result)
    } catch (error: any) {
      httpStore.handleRequest(error.response)
    }
  }

  async function register(form: IRegister, contex: SubmissionContext) {
    try {
      httpStore.setRequesting(true)
      const result = await axios.post(`${basePath}/register`, form)
      httpStore.handleRequest(result)
      contex.resetForm()
    } catch (error: any) {
      console.log(error)
      httpStore.handleRequest(error.response)
    }
  }

  return { login, register }
})
