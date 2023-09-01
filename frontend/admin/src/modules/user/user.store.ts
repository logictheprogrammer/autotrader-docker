import { defineStore } from 'pinia'
import type {
  IFundUserAccount,
  IUpdateUserEmail,
  IUpdateUserProfile,
  IUser,
} from './user.interface'
import type { UserStatus } from './user.enum'
// import type { SubmissionContext } from 'vee-validate'

export const useUserStore = defineStore('user', () => {
  const httpStore = useHttpStore()
  const basePath = 'users'
  const users = ref<IUser[]>([])
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

  async function updateUserProfile(form: IUpdateUserProfile) {
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

  async function updateUserEmail(form: IUpdateUserEmail) {
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

  async function updateUserStatus(userId: string, status: UserStatus) {
    try {
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

  async function deleteUser(userId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(`${basePath}/${userId}/delete-user`)

      const allUsers = users.value
      if (!allUsers) return
      const finalUsers = allUsers.filter((user) => user._id !== userId)

      setUsers(finalUsers)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function fundUserAccount(userId: string, form: IFundUserAccount) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(
        `${basePath}/${userId}/force-fund-user`,
        form
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
    deleteUser,
    fundUserAccount,
  }
})
