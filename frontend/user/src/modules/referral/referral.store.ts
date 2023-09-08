import { defineStore } from 'pinia'
import type { IReferral, IReferralUsers } from './referral.interface'

export const useReferralStore = defineStore('referral', () => {
  const httpStore = useHttpStore()
  const basePath = 'referral'
  const referrals = ref<IReferral[]>([])
  const loaded = ref(false)
  const referralUsers = ref<IReferralUsers[]>([])
  const referralUsersLoaded = ref(false)

  function setReferrals(referralsArr: IReferral[]) {
    referrals.value = referralsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  function setReferralUsers(referralsArr: IReferralUsers[]) {
    referralUsers.value = referralsArr
  }

  function setReferralUsersLoaded(hasLoaded: boolean) {
    referralUsersLoaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setReferrals(result.data.data.referralTransactions)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function fetchAllReferralUsers() {
    setReferralUsersLoaded(false)
    try {
      const result = await axios.get(`${basePath}/earnings`)
      setReferralUsers(result.data.data.referralEarnings)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setReferralUsersLoaded(true)
  }

  return {
    loaded,
    referrals,
    fetchAll,
    referralUsersLoaded,
    referralUsers,
    fetchAllReferralUsers,
  }
})
