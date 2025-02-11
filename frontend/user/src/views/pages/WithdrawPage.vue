<template>
  <Transition name="slide">
    <div v-if="currentPage === PAGE.MAKE_WITHDRAWAL">
      <div class="row">
        <div class="col-xl-12 col-xxl-4">
          <div class="card card-bx bg-blue action-card">
            <img
              class="pattern-img"
              src="/images/pattern/pattern11.png"
              alt=""
            />
            <div class="card-body text-white">
              <img src="/images/pattern/circle.png" class="mb-4" alt="" />
              <div class="row">
                <div class="col-sm-6 col-xl-12 text-center">
                  <h2 class="text-white fs-36" v-if="authStore.user">
                    {{ Helpers.toDollar(authStore.user.profit) }}
                  </h2>
                  <p class="fs-16">Available Profit</p>
                </div>
                <div class="col-sm-6 col-xl-12 text-center">
                  <h2 class="text-white fs-36" v-if="authStore.user">
                    {{ Helpers.toDollar(authStore.user.bonusBalance) }}
                  </h2>
                  <p class="fs-16">Bonus Balance</p>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center mb-3">
            <a
              href="javascript:void(0);"
              class="btn btn-outline-secondary"
              @click="() => setCurrentPage(PAGE.WITHDRAWAL_HISTORY)"
              >View Withdrawal History</a
            >
          </div>
        </div>
        <div class="col-xl-12 col-xxl-8">
          <div class="card">
            <div class="card-body py-4">
              <div class="settings-form">
                <Form
                  @submit="(data)=>makeWithdrawal(data as ICreateWithdrawal)"
                  v-slot="{ errors }"
                  class="custom-modal-content"
                  :validation-schema="makeWithdrawalSchema"
                >
                  <div class="row mt-4" v-if="authStore.user">
                    <label class="form-label">Account</label>
                    <MyFineSelectComponent>
                      <MyFineOptionComponent
                        @click="() => setUserAccount(UserAccount.PROFIT)"
                        :selected="userAccount === UserAccount.PROFIT"
                      >
                        <span class="d-block">Available Profit</span>
                        <h4 class="text-center">
                          {{ Helpers.toDollar(authStore.user.profit) }}
                        </h4>
                      </MyFineOptionComponent>
                      <MyFineOptionComponent
                        :selected="userAccount === UserAccount.BONUS_BALANCE"
                        @click="() => setUserAccount(UserAccount.BONUS_BALANCE)"
                      >
                        <span class="d-block">Bonus Balance</span>
                        <h4 class="text-center">
                          {{ Helpers.toDollar(authStore.user.bonusBalance) }}
                        </h4>
                      </MyFineOptionComponent>
                    </MyFineSelectComponent>
                    <Field name="account" v-model="userAccount" type="hidden" />
                    <span class="error-message">{{ errors.account }}</span>
                  </div>
                  <div class="row mt-4">
                    <label class="form-label">Withdrawal Method</label>
                    <MyFineSelectComponent>
                      <MyFineOptionComponent
                        v-for="wm in withdrawalMethods"
                        :key="wm._id"
                        :selected="selectedWithdrawalMethod?._id === wm._id"
                        @click="() => setSelectedWithdrawalMethod(wm)"
                      >
                        <span class="d-block fw-bold">{{
                          Helpers.toTitleCase(wm.currency?.name || 'Unknown')
                        }}</span>
                        <img
                          style="height: 34px"
                          :src="`/svg/crypto-icons/${wm.currency?.logo}`"
                          :alt="wm.currency?.name"
                        />
                        <span class="d-block">{{
                          wm.network.toUpperCase()
                        }}</span>
                      </MyFineOptionComponent>
                    </MyFineSelectComponent>
                    <Field
                      name="withdrawalMethodId"
                      v-model="selectedWithdrawalMethodId"
                      type="hidden"
                    />
                    <span class="error-message">{{
                      errors.withdrawalMethodId
                    }}</span>
                  </div>
                  <div class="row mt-4">
                    <div class="mb-3 col-12">
                      <label class="form-label">Wallet Address</label>
                      <Field
                        name="address"
                        type="text"
                        placeholder="Your Wallet Address"
                        class="form-control"
                        :validate-on-input="true"
                        :value="withdrawal.address"
                      />
                      <span class="error-message">{{ errors.address }}</span>
                    </div>
                    <div class="mb-3 col-12">
                      <div class="d-flex justify-content-between">
                        <label class="form-label">Amount</label>
                        <div class="d-flex gap-2">
                          <div
                            class="d-flex"
                            v-if="
                              selectedWithdrawalMethod &&
                              selectedWithdrawalMethod.fee
                            "
                          >
                            <span class="">fee: </span>
                            <span class="fw-bold">{{
                              ' ' + selectedWithdrawalMethod?.fee
                            }}</span>
                          </div>
                          <div class="d-flex" v-if="selectedWithdrawalMethod">
                            <span class="">min: </span>
                            <span class="fw-bold">{{
                              ' ' + selectedWithdrawalMethod?.minWithdrawal
                            }}</span>
                          </div>
                        </div>
                      </div>
                      <Field
                        name="amount"
                        type="number"
                        placeholder="Amount"
                        class="form-control"
                        :validate-on-input="true"
                        :value="withdrawal.amount || ''"
                      />
                      <span class="error-message">{{ errors.amount }}</span>
                    </div>

                    <div class="text-center mt-2">
                      <button class="btn btn-primary" type="submit">
                        Pay Now
                      </button>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  <Transition name="slide">
    <div class="card" v-if="currentPage === PAGE.CONFIRM_WITHDRAWAL">
      <div class="card-header">
        <h4 class="card-title">Proceed Withdrawal</h4>
      </div>
      <div class="card-body">
        <p class="fs-18 text-center mx-auto mb-4" style="max-width: 490px">
          PLEASE CHECK AND CONFIRM THE DETAILS YOU'VE ENTERED ARE CORRECT TO
          PROCEED, ANY MISTAKE COULD LEAD TO COIN LOSS WHICH MAY NOT BE
          REVERSED.
        </p>
        <div class="row">
          <div class="offset-lg-2 col-lg-8">
            <div class="mb-3">
              <label class="form-label">Selected Coin Name</label>
              <input
                type="text"
                placeholder="Coin Name"
                class="form-control"
                :value="`${Helpers.toTitleCase(selectedWithdrawalMethod!.currency?.name || 'Unknown')} - (${selectedWithdrawalMethod!.currency?.symbol.toUpperCase()})`"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Selected Network</label>
              <input
                type="text"
                placeholder="Coin Network"
                class="form-control"
                :value="selectedWithdrawalMethod?.network.toUpperCase()"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Your Wallet Address</label>
              <input
                type="text"
                placeholder="Wallet Address"
                class="form-control"
                :value="withdrawal.address"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Amount To Withdraw</label>
              <input
                type="text"
                placeholder="Amount"
                class="form-control"
                :value="Helpers.toDollar(withdrawal.amount)"
                readonly
              />
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3 mt-3">
          <button
            class="btn btn-secondary"
            @click="() => setCurrentPage(PAGE.MAKE_WITHDRAWAL)"
          >
            Go Back
          </button>
          <button
            class="btn btn-primary"
            @click="() => setOpenAlertModal(true)"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </Transition>
  <Transition name="slide">
    <div class="row mt-4" v-if="currentPage === PAGE.WITHDRAWAL_HISTORY">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title">Withdrawal History</h4>
            <button
              class="btn btn-outline-secondary"
              @click="() => setCurrentPage(PAGE.MAKE_WITHDRAWAL)"
            >
              Withdrawal
            </button>
          </div>
          <EmptyResourceComponent
            v-if="withdrawalLoaded && !withdrawals?.length"
          >
            No Withdrawal Record Found
          </EmptyResourceComponent>
          <div class="card-body pt-0 px-0" v-else>
            <TablePreview v-if="!withdrawalLoaded" :rows="8" :cols="6" />
            <MyDataTableComponent v-else>
              <thead class="bg-background">
                <tr>
                  <th class="text-sharp d-none">Sort</th>
                  <th class="text-sharp text-center">Status</th>
                  <th class="text-sharp">Amount</th>
                  <th class="text-sharp">Fee</th>
                  <th class="text-sharp">Currency</th>
                  <th class="text-sharp">Network</th>
                  <th class="text-sharp">Wallet Address</th>
                  <th class="text-sharp">Created</th>
                  <th class="text-sharp">Settled</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(withdrawal, i) in withdrawals"
                  :key="withdrawal._id"
                >
                  <td class="d-none">{{ i + 1 }}</td>
                  <td class="text-center">
                    <span
                      :class="`badge light badge-${Helpers.toStatus(
                        withdrawal.status
                      )}`"
                      >{{ Helpers.toTitleCase(withdrawal.status) }}
                    </span>
                  </td>
                  <td>{{ Helpers.toDollar(withdrawal.amount) }}</td>
                  <td>
                    {{
                      withdrawal.fee ? Helpers.toDollar(-withdrawal.fee) : '--'
                    }}
                  </td>
                  <td>
                    <div class="d-flex">
                      <img
                        :src="`/icons/crypto-svg/${withdrawal.currency?.logo}`"
                        class="me-3"
                        :alt="withdrawal.currency?.name"
                        width="24"
                      />
                      <div class="d-flex flex-column">
                        <span class="fw-bold">{{
                          Helpers.toTitleCase(
                            withdrawal.currency?.name || 'Unknown'
                          )
                        }}</span>
                        <span class="fs-14"
                          >{{ withdrawal.currency?.symbol.toUpperCase() }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {{ withdrawal.withdrawalMethod?.network.toUpperCase() }}
                  </td>
                  <td>{{ withdrawal.address }}</td>
                  <td>
                    {{ Helpers.toNiceDate(withdrawal.createdAt) }}
                  </td>
                  <td>
                    {{
                      withdrawal.status === WithdrawalStatus.PENDING
                        ? '--'
                        : Helpers.toNiceDate(withdrawal.updatedAt)
                    }}
                  </td>
                </tr>
              </tbody>
            </MyDataTableComponent>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  <AlertConfirmComponent
    :is-open="openAlertModal"
    :status="alertModalInfo.status"
    :title="alertModalInfo.title"
    :message="alertModalInfo.message"
    @confirm="alertModalInfo.onConfirm"
    @close="setOpenAlertModal(false)"
    confirm-btn-text="Yes, Confirm"
  />
</template>

<script setup lang="ts">
import type { IWithdrawalMethod } from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import type { ICreateWithdrawal } from '@/modules/withdrawal/withdrawal.interface'
import type { IAlertModalInfo } from '@/util/interfaces/alertModalInfo.interface'
import { UserAccount } from '@/modules/user/user.enum'

enum PAGE {
  MAKE_WITHDRAWAL,
  CONFIRM_WITHDRAWAL,
  WITHDRAWAL_HISTORY,
}

const httpStore = useHttpStore()
const authStore = useAuthStore()
const withdrawalStore = useWithdrawalStore()
const withdrawals = computed(() => withdrawalStore.withdrawals)
const withdrawalLoaded = computed(() => withdrawalStore.loaded)
// fetch withdrawal s if not fetched
if (!withdrawalLoaded.value) withdrawalStore.fetchAll()

const currentPage = ref(PAGE.MAKE_WITHDRAWAL)
const setCurrentPage = (page: PAGE) => {
  scrollTo({ top: 0 })
  setTimeout(() => {
    currentPage.value = page
  }, 100)
}

const userAccount = ref(UserAccount.PROFIT)
const setUserAccount = (account: UserAccount) => (userAccount.value = account)

const withdrawal = ref<ICreateWithdrawal>({
  withdrawalMethodId: '',
  account: userAccount.value,
  address: '',
  amount: 0,
})
const setWithdrawal = (data: ICreateWithdrawal) => {
  withdrawal.value = data
}
const makeWithdrawal = (data: ICreateWithdrawal) => {
  httpStore.setPost(true)

  setWithdrawal(data)
  setCurrentPage(PAGE.CONFIRM_WITHDRAWAL)
  httpStore.setPost(false)
}

const selectedWithdrawalMethod = ref<IWithdrawalMethod>()
const selectedWithdrawalMethodId = ref('')
const setSelectedWithdrawalMethod = (dm?: IWithdrawalMethod) => {
  if (!dm) return
  selectedWithdrawalMethod.value = dm
  selectedWithdrawalMethodId.value = dm._id
}

const withdrawalMethodStore = useWithdrawalMethodStore()
const withdrawalMethods = computed(
  () => withdrawalMethodStore.withdrawalMethods
)
const withdrawalMethodLoaded = computed(() => withdrawalMethodStore.loaded)
// fetch withdrawal methods if not fetched
if (!withdrawalMethodLoaded.value) withdrawalMethodStore.fetchAll()

const openAlertModal = ref(false)
const setOpenAlertModal = (isOpen: boolean) => (openAlertModal.value = isOpen)
const alertModalInfo = reactive<IAlertModalInfo>({
  status: ResponseStatus.INFO,
  title: 'Confirming The Withdrawal',
  message:
    'By confirming, you have agreed that any mistake on the details you provided could lead to the money loss',
  onConfirm: () => createWithdrawal(),
})

const makeWithdrawalSchema = yup.object({
  withdrawalMethodId: yup.string().required('Withdrawal method is required'),
  account: yup.string().required('Account is required'),
  address: yup.string().required('Your wallet address is required'),
  amount: yup
    .number()
    .typeError('amount is required')
    .min(0, 'amount should not be a negative value')
    .required('amount is required')
    .test(function (value) {
      if (
        selectedWithdrawalMethod.value &&
        value < selectedWithdrawalMethod.value.minWithdrawal
      ) {
        throw this.createError({
          message: `Amount must be at least ${selectedWithdrawalMethod.value.minWithdrawal}`,
        })
      }
      if (
        authStore.user &&
        selectedWithdrawalMethod.value &&
        value + selectedWithdrawalMethod.value.fee >
          authStore.user[userAccount.value]
      ) {
        throw this.createError({
          message: `You do not have sufficient balance in your ${Helpers.fromCamelToTitleCase(
            userAccount.value
          )} Account`,
        })
      }

      return true
    }),
})

// Create Withdrawal
const createWithdrawal = async () => {
  setOpenAlertModal(false)
  const isCreated = await withdrawalStore.createWithdrawal(withdrawal.value)
  if (isCreated) {
    setWithdrawal({
      account: UserAccount.MAIN_BALANCE,
      address: '',
      amount: 0,
      withdrawalMethodId: '',
    })
    setCurrentPage(PAGE.WITHDRAWAL_HISTORY)
  }
}

setSelectedWithdrawalMethod(withdrawalMethods.value[0])
watch(withdrawalMethodLoaded, (value, oldValue) => {
  if (!oldValue && value)
    setSelectedWithdrawalMethod(withdrawalMethods.value[0])
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.2s ease-in-out;
}
</style>
