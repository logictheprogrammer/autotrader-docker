<template>
  <Transition name="slide">
    <div v-if="currentPage === PAGE.MAKE_DEPOSIT">
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
                <div class="col-12 text-center">
                  <h2 class="text-white fs-36" v-if="authStore.user">
                    {{ Helpers.toDollar(authStore.user.mainBalance) }}
                  </h2>
                  <p class="fs-16">Main Balance</p>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center mb-3">
            <a
              href="javascript:void(0);"
              class="btn btn-outline-secondary"
              @click="() => setCurrentPage(PAGE.DEPOSIT_HISTORY)"
              >View Deposit History</a
            >
          </div>
        </div>
        <div class="col-xl-12 col-xxl-8">
          <div class="card">
            <div class="card-body py-4">
              <div class="settings-form">
                <Form
                  @submit="(data)=>makeDeposit(data as ICreateDeposit)"
                  v-slot="{ errors }"
                  class="custom-modal-content"
                  :validation-schema="makeDepositSchema"
                >
                  <label class="form-label">Deposit Method</label>
                  <MyFineSelectComponent>
                    <MyFineOptionComponent
                      v-for="dm in depositMethods"
                      :key="dm._id"
                      :selected="selectedDepositMethod?._id === dm._id"
                      @click="() => setSelectedDepositMethod(dm)"
                    >
                      <span class="d-block fw-bold">{{
                        Helpers.toTitleCase(dm.currency?.name || 'Unknown')
                      }}</span>
                      <img
                        style="height: 34px"
                        :src="`/svg/crypto-icons/${dm.currency?.logo}`"
                        :alt="dm.currency?.name"
                      />
                      <span class="d-block">{{
                        dm.network.toUpperCase()
                      }}</span>
                    </MyFineOptionComponent>
                  </MyFineSelectComponent>
                  <Field
                    name="depositMethodId"
                    v-model="selectedDepositMethodId"
                    type="hidden"
                  />
                  <span class="error-message">{{
                    errors.depositMethodId
                  }}</span>
                  <div class="row mt-4">
                    <div class="mb-3 col-12">
                      <div class="d-flex justify-content-between">
                        <label class="form-label">Amount</label>
                        <div class="d-flex gap-2">
                          <div
                            class="d-flex"
                            v-if="
                              selectedDepositMethod && selectedDepositMethod.fee
                            "
                          >
                            <span class="">fee: </span>
                            <span class="fw-bold">{{
                              ' ' + selectedDepositMethod?.fee
                            }}</span>
                          </div>
                          <div class="d-flex" v-if="selectedDepositMethod">
                            <span class="">min: </span>
                            <span class="fw-bold">{{
                              ' ' + selectedDepositMethod?.minDeposit
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
                        :value="deposit.amount || ''"
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
    <div class="card" v-if="currentPage === PAGE.CONFIRM_DEPOSIT">
      <div class="card-header">
        <h4 class="card-title">Make Payment and Confirm</h4>
      </div>
      <div class="card-body">
        <p class="fs-18 text-center mx-auto mb-4" style="max-width: 490px">
          SEND
          <span class="fw-bold text-info"
            >{{ Helpers.toDollar(deposit.amount) }}
          </span>
          TO THE WALLET ADDRESS BELOW OR SCAN THE QR CODE WITH YOUR WALLET APP
        </p>
        <div class="row">
          <div class="col-lg-5 mb-3 mb-lg-0">
            <div
              class="d-flex justify-content-center align-items-center h-100 flex-column"
            >
              <div class="bg-background p-4 rounded">
                <div class="p-2 bg-skin rounded-2">
                  <MyQRCodeComponent :value="selectedDepositMethod!.address" />
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="mb-3">
              <label class="form-label">Coin Name</label>
              <input
                type="text"
                placeholder="Coin Name"
                class="form-control"
                :value="`${Helpers.toTitleCase(selectedDepositMethod!.currency?.name || 'Unknown')} - (${selectedDepositMethod!.currency?.symbol.toUpperCase()})`"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Network</label>
              <input
                type="text"
                placeholder="Coin Network"
                class="form-control"
                :value="selectedDepositMethod?.network.toUpperCase()"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Copy Wallet Address</label>
              <input
                type="text"
                placeholder="Wallet Address"
                class="form-control"
                :value="selectedDepositMethod?.address"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Amount</label>
              <input
                type="text"
                placeholder="Amount"
                class="form-control"
                :value="Helpers.toDollar(deposit.amount)"
                readonly
              />
            </div>
          </div>
          <div class="col-lg-5">
            <p class="text-info mt-3 text-primary text-center">
              Awaiting payment...
            </p>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3 mt-3">
          <button
            class="btn btn-secondary"
            @click="() => setCurrentPage(PAGE.MAKE_DEPOSIT)"
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
    <div class="row mt-4" v-if="currentPage === PAGE.DEPOSIT_HISTORY">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title">Deposit History</h4>
            <button
              class="btn btn-outline-secondary"
              @click="() => setCurrentPage(PAGE.MAKE_DEPOSIT)"
            >
              Deposit
            </button>
          </div>
          <EmptyResourceComponent v-if="depositLoaded && !deposits?.length">
            No Deposit Record Found
          </EmptyResourceComponent>
          <div class="card-body pt-0 px-0" v-else>
            <TablePreview v-if="!depositLoaded" :rows="8" :cols="6" />
            <MyDataTableComponent v-else>
              <thead class="bg-background">
                <tr>
                  <th class="text-sharp d-none">Sort</th>
                  <th class="text-sharp text-center">Status</th>
                  <th class="text-sharp">Amount</th>
                  <th class="text-sharp">fee</th>
                  <th class="text-sharp">Currency</th>
                  <th class="text-sharp">Network</th>
                  <th class="text-sharp">Created</th>
                  <th class="text-sharp">Settled</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(deposit, i) in deposits" :key="deposit._id">
                  <td class="d-none">{{ i + 1 }}</td>
                  <td class="text-center">
                    <span
                      :class="`badge light badge-${Helpers.toStatus(
                        deposit.status
                      )}`"
                      >{{ Helpers.toTitleCase(deposit.status) }}
                    </span>
                  </td>
                  <td>{{ Helpers.toDollar(deposit.amount) }}</td>
                  <td>
                    {{ deposit.fee ? Helpers.toDollar(-deposit.fee) : '--' }}
                  </td>
                  <td>
                    <div class="d-flex">
                      <img
                        :src="`/icons/crypto-svg/${deposit.currency?.logo}`"
                        class="me-3"
                        :alt="deposit.currency?.name"
                        width="24"
                      />
                      <div class="d-flex flex-column">
                        <span class="fw-bold">{{
                          Helpers.toTitleCase(
                            deposit.currency?.name || 'Unknown'
                          )
                        }}</span>
                        <span class="fs-14"
                          >{{ deposit.currency?.symbol.toUpperCase() }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {{ deposit.depositMethod?.network.toUpperCase() }}
                  </td>
                  <td>
                    {{ Helpers.toNiceDate(deposit.createdAt) }}
                  </td>
                  <td>
                    {{
                      deposit.status === DepositStatus.PENDING
                        ? '--'
                        : Helpers.toNiceDate(deposit.updatedAt)
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
import type { IDepositMethod } from '@/modules/depositMethod/depositMethod.interface'
import type { ICreateDeposit } from '@/modules/deposit/deposit.interface'
import type { IAlertModalInfo } from '@/util/interfaces/alertModalInfo.interface'

enum PAGE {
  MAKE_DEPOSIT,
  CONFIRM_DEPOSIT,
  DEPOSIT_HISTORY,
}

const httpStore = useHttpStore()
const authStore = useAuthStore()
const depositStore = useDepositStore()

const currentPage = ref(PAGE.MAKE_DEPOSIT)
const setCurrentPage = (page: PAGE) => {
  scrollTo({ top: 0 })
  setTimeout(() => {
    currentPage.value = page
  }, 100)
}
const deposit = ref<ICreateDeposit>({
  depositMethodId: '',
  amount: 0,
})
const setDeposit = (data: ICreateDeposit) => {
  deposit.value = data
}

const makeDeposit = (data: ICreateDeposit) => {
  httpStore.setPost(true)
  setTimeout(() => {
    setDeposit(data)
    setCurrentPage(PAGE.CONFIRM_DEPOSIT)
    httpStore.setPost(false)
  }, 1000)
}
const selectedDepositMethod = ref<IDepositMethod>()
const selectedDepositMethodId = ref('')
const setSelectedDepositMethod = (dm?: IDepositMethod) => {
  if (!dm) return
  selectedDepositMethod.value = dm
  selectedDepositMethodId.value = dm._id
}

const deposits = computed(() => depositStore.deposits)
const depositLoaded = computed(() => depositStore.loaded)
// fetch deposit s if not fetched
if (!depositLoaded.value) depositStore.fetchAll()

const depositMethodStore = useDepositMethodStore()
const depositMethods = computed(() => depositMethodStore.depositMethods)
const depositMethodLoaded = computed(() => depositMethodStore.loaded)
// fetch deposit methods if not fetched
if (!depositMethodLoaded.value) depositMethodStore.fetchAll()

const openAlertModal = ref(false)
const setOpenAlertModal = (isOpen: boolean) => (openAlertModal.value = isOpen)
const alertModalInfo = reactive<IAlertModalInfo>({
  status: ResponseStatus.INFO,
  title: 'Confirming The Deposit',
  message:
    'Please make sure you have made the deposit to the provided address before confirming',
  onConfirm: () => createDeposit(),
})

const makeDepositSchema = yup.object({
  depositMethodId: yup.string().required('Deposit method is required'),
  amount: yup
    .number()
    .typeError('amount is required')
    .min(0, 'amount should not be a nagative value')
    .required('amount is required')
    .test(function (value) {
      if (
        selectedDepositMethod.value &&
        value < selectedDepositMethod.value.minDeposit
      ) {
        throw this.createError({
          message: `Amount must be at least ${selectedDepositMethod.value.minDeposit}`,
        })
      }

      return true
    }),
})

// Create Deposit
const createDeposit = async () => {
  setOpenAlertModal(false)
  const isCreated = await depositStore.createDeposit(deposit.value)
  if (isCreated) {
    setCurrentPage(PAGE.DEPOSIT_HISTORY)
    setDeposit({
      depositMethodId: depositMethods.value[0]._id,
      amount: 0,
    })
  }
}

setSelectedDepositMethod(depositMethods.value[0])
watch(depositMethodLoaded, (value, oldValue) => {
  if (!oldValue && value) setSelectedDepositMethod(depositMethods.value[0])
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
