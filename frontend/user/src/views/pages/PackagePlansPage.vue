<template>
  <div class="row">
    <PackagePlanCardComponent
      v-for="packagePlan in plans"
      :plan="packagePlan"
      :key="packagePlan._id"
    >
      <button
        @click="() => setOpenPurchasePlanModal(true, packagePlan)"
        type="button"
        :class="`btn btn-outline-secondary w-100 mt-3 ${
          packagePlan.status === PlanStatus.ON_MAINTENANCE ? 'border-0' : ''
        }`"
        :disabled="packagePlan.status === PlanStatus.ON_MAINTENANCE"
      >
        {{
          packagePlan.status === PlanStatus.ON_MAINTENANCE
            ? 'Engine is on maintenance'
            : 'Invest'
        }}
      </button>
    </PackagePlanCardComponent>
  </div>

  <ModalComponent
    :is-open="openPurchasePlanModal"
    v-slot="{ errors }"
    :validation-schema="purchasePlanSchema"
    @confirm="onPurchasePlanHandler"
    @close="() => setOpenPurchasePlanModal(false)"
    confirm-btn-text="Invest"
  >
    <h3 class="border-bottom text-dark text-center pb-3">MAKE INVESTMENT</h3>
    <Field name="planId" :value="selectedPlan?._id" type="hidden" />
    <div class="row mt-4" v-if="authStore.user">
      <label class="form-label">Account</label>
      <MyFineSelectComponent>
        <MyFineOptionComponent
          @click="() => setUserAccount(UserAccount.MAIN_BALANCE)"
          :selected="userAccount === UserAccount.MAIN_BALANCE"
        >
          <span class="d-block">Main Balance</span>
          <h4 class="text-center">
            {{ Helpers.toDollar(authStore.user.mainBalance) }}
          </h4>
        </MyFineOptionComponent>
        <MyFineOptionComponent
          :selected="userAccount === UserAccount.REFERRAL_BALANCE"
          @click="() => setUserAccount(UserAccount.REFERRAL_BALANCE)"
        >
          <span class="d-block">Referral Balance</span>
          <h4 class="text-center">
            {{ Helpers.toDollar(authStore.user.referralBalance) }}
          </h4>
        </MyFineOptionComponent>
      </MyFineSelectComponent>
      <Field name="account" v-model="userAccount" type="hidden" />
      <span class="error-message">{{ errors.account }}</span>
    </div>

    <div class="row mt-4">
      <div class="mb-3 col-12">
        <div class="d-flex justify-content-between">
          <label class="form-label">Amount</label>
          <div class="d-flex gap-2">
            <div class="d-flex">
              <span class="">min: </span>
              <span class="fw-bold">{{ ' ' + selectedPlan?.minAmount }}</span>
            </div>
            <div class="d-flex">
              <span class="">max: </span>
              <span class="fw-bold">{{ ' ' + selectedPlan?.maxAmount }}</span>
            </div>
          </div>
        </div>
        <Field
          name="amount"
          type="number"
          placeholder="Amount"
          class="form-control"
          v-model="purchaseAmount"
          :validate-on-input="true"
        />
        <span class="error-message">{{ errors.amount }}</span>
      </div>
    </div>
  </ModalComponent>

  <AlertConfirmComponent
    :is-open="openAlertModal"
    :status="alertModalInfo.status"
    :title="alertModalInfo.title"
    :message="alertModalInfo.message"
    @confirm="alertModalInfo.onConfirm"
    @close="() => setOpenAlertModal(false)"
  />
</template>

<script setup lang="ts">
import { ResponseStatus } from '@/modules/http/http.enum'
import type { PlanStatus } from '@/modules/plan/plan.enum'
import type { IPlan } from '@/modules/plan/plan.interface'
import type { ICreateInvestment } from '@/modules/investment/investment.interface'
import { UserAccount } from '@/modules/user/user.enum'
import type { IAlertModalInfo } from '@/util/interfaces/alertModalInfo.interface'

const authStore = useAuthStore()
const investmentStore = useInvestmentStore()

const planStore = usePlanStore()
const plans = computed(() => planStore.plans)
const planLoaded = computed(() => planStore.loaded)
// fetch if not fetched
if (!planLoaded.value) planStore.fetchAll()

const selectedPlan = ref<IPlan>()
const purchaseAmount = ref<number>()
const userAccount = ref(UserAccount.MAIN_BALANCE)
const setUserAccount = (account: UserAccount) => (userAccount.value = account)

const setSelectedPlan = (plan?: IPlan) => (selectedPlan.value = plan)

// Modal
const openPurchasePlanModal = ref(false)
const setOpenPurchasePlanModal = (isOpen: boolean, plan?: IPlan) => {
  openPurchasePlanModal.value = isOpen
  setSelectedPlan(plan)
}

// alert
const openAlertModal = ref(false)
const setOpenAlertModal = (isOpen: boolean) => (openAlertModal.value = isOpen)
const alertModalInfo = reactive<IAlertModalInfo>({
  status: ResponseStatus.INFO,
  title: '',
  message: '',
  onConfirm: () => {},
})
const setAlertModalInfo = (data: IAlertModalInfo) => {
  alertModalInfo.status = data.status
  alertModalInfo.title = data.title
  alertModalInfo.message = data.message
  alertModalInfo.onConfirm = data.onConfirm
}

// On Purchase Plan Handler
const onPurchasePlanHandler = (form: ICreateInvestment) => {
  setAlertModalInfo({
    status: ResponseStatus.INFO,
    title: `You are about to purchase this plan with the sum of ${Helpers.toDollar(
      purchaseAmount.value || 0
    )}`,
    message: 'Click on the confirm button to confirm this purchase.',
    onConfirm: async () => {
      setOpenAlertModal(false)
      const success = await investmentStore.createInvestment(form)
      if (success) setOpenPurchasePlanModal(false)
    },
  })

  setOpenAlertModal(true)
}

// Schema
const purchasePlanSchema = yup.object({
  account: yup.string().required('Account is required'),
  amount: yup
    .number()
    .typeError('amount is required')
    .min(0, 'amount should not be a nagative value')
    .required('amount is required')
    .test(function (value) {
      if (selectedPlan.value && value < selectedPlan.value.minAmount) {
        throw this.createError({
          message: `Amount must be at least ${selectedPlan.value.minAmount}`,
        })
      }
      if (authStore.user && value > authStore.user[userAccount.value]) {
        throw this.createError({
          message: `You do not have sufficient balance in your ${Helpers.fromCamelToTitleCase(
            userAccount.value
          )} Account`,
        })
      }

      return true
    }),
})
</script>

<style scoped></style>
