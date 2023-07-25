import { defineStore } from 'pinia'
import type { IUser } from './user.interface'
// import type { SubmissionContext } from 'vee-validate'

export const useUserStore = defineStore('user', () => {
  const httpStore = useHttpStore()
  const basePath = 'users'
  const users = ref<IUser[]>()
  const loaded = ref(false)

  function setUsers(usersArr: IUser[]) {
    users.value = usersArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setUsers(result.data.data.users)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return { loaded, fetchAll }
})
