import { defineStore } from 'pinia'
import type { IUser } from './user.interface'
import type { UserStatus } from './user.enum'
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

  function findById(userId: string) {
    return users.value?.find((user) => user._id === userId)
  }

  function updateById(userId: string, data: IUser) {
    const updateUsers = users.value
    if (!updateUsers) return
    const userIndex = updateUsers.findIndex((user) => user._id === userId)
    updateUsers[userIndex] = data

    setUsers(updateUsers)
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

  async function updateUserProfile(form: any) {
    try {
      httpStore.setPost(true)
      const userId = form.userId
      const result = await axios.put(
        `${basePath}/${userId}/update-user-profile`,
        form
      )

      updateById(userId, result.data.data.user)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function updateUserEmail(form: any) {
    try {
      httpStore.setPost(true)
      const userId = form.userId
      const result = await axios.patch(
        `${basePath}/${userId}/update-user-email`,
        form
      )

      updateById(userId, result.data.data.user)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function updateUserStatus(userId?: string, status?: UserStatus) {
    try {
      if (!userId || !status) return
      httpStore.setPost(true)
      const result = await axios.patch(
        `${basePath}/${userId}/update-user-status`,
        {
          status,
        }
      )

      updateById(userId, result.data.data.user)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return {
    loaded,
    users,
    findById,
    fetchAll,
    updateUserProfile,
    updateUserEmail,
    updateUserStatus,
  }
})
