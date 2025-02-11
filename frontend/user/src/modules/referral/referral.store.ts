import { defineStore } from 'pinia'
import type {
  IReferralEarning,
  IReferredUser,
  IActiveReferral,
} from './referral.interface'

export const useReferralStore = defineStore('referral', () => {
  const httpStore = useHttpStore()
  const basePath = 'referral'
  const activeReferrals = ref<IActiveReferral[]>([])
  const referredUsers = ref<IReferredUser[]>([])
  const referralEarnings = ref<IReferralEarning[]>([])
  const activeReferralsLoaded = ref(false)
  const referralEarningsLoaded = ref(false)
  const referredUsersLoaded = ref(false)

  function setActiveReferrals(activeReferralsArr: IActiveReferral[]) {
    activeReferrals.value = activeReferralsArr
  }

  function setActiveReferralsLoaded(loaded: boolean) {
    activeReferralsLoaded.value = loaded
  }

  function setReferralEarningsLoaded(loaded: boolean) {
    referralEarningsLoaded.value = loaded
  }

  function setReferredUsers(referralsArr: IReferredUser[]) {
    referredUsers.value = referralsArr
  }

  function setReferralEarnings(referralsArr: IReferralEarning[]) {
    referralEarnings.value = referralsArr
  }

  function setReferredUsersLoaded(loaded: boolean) {
    referredUsersLoaded.value = loaded
  }

  async function fetchAllReferredUsers() {
    setReferredUsersLoaded(false)
    try {
      const result = await axios.get(`users/referred-users`)
      console.log(result.data.data)
      setReferredUsers(result.data.data.users)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setReferredUsersLoaded(true)
  }

  async function fetchAllActiveReferrals() {
    setActiveReferralsLoaded(false)
    try {
      const result = await axios.get(`${basePath}/earnings`)
      console.log(result.data.data)
      setActiveReferrals(result.data.data.referralEarnings)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setActiveReferralsLoaded(true)
  }

  async function fetchAllReferralEarnings() {
    setReferralEarningsLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setReferralEarnings(result.data.data.referrals)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setReferralEarningsLoaded(true)
  }

  return {
    referralEarningsLoaded,
    activeReferralsLoaded,
    referredUsersLoaded,
    referralEarnings,
    referredUsers,
    activeReferrals,
    fetchAllActiveReferrals,
    fetchAllReferralEarnings,
    fetchAllReferredUsers,
  }
})
