<template>
  <Transition name="slide">
    <div v-if="currentPage === PAGE.MAKE_TRANSFER">
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
                    {{ Helpers.toDollar(authStore.user.mainBalance) }}
                  </h2>
                  <p class="fs-16">Main Balance</p>
                </div>
                <div class="col-sm-6 col-xl-12 text-center">
                  <h2 class="text-white fs-36" v-if="authStore.user">
                    {{ Helpers.toDollar(authStore.user.referralBalance) }}
                  </h2>
                  <p class="fs-16">Referrals Balance</p>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-center mb-3">
            <a
              href="javascript:void(0);"
              class="btn btn-outline-secondary"
              @click="() => setCurrentPage(PAGE.TRANSFER_HISTORY)"
              >View Transfer History</a
            >
          </div>
        </div>
        <div class="col-xl-12 col-xxl-8">
          <div class="card">
            <div class="card-body py-4">
              <div class="settings-form">
                <Form
                  @submit="(data)=>makeTransfer(data as ICreateTransfer)"
                  v-slot="{ errors }"
                  class="custom-modal-content"
                  :validation-schema="makeTransferSchema"
                >
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
                        @click="
                          () => setUserAccount(UserAccount.REFERRAL_BALANCE)
                        "
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
                      <label class="form-label">Recipient Username</label>
                      <Field
                        name="toUserUsername"
                        type="text"
                        placeholder="Recipient Username"
                        class="form-control"
                        :validate-on-input="true"
                        :value="transfer.toUserUsername"
                      />
                      <span class="error-message">{{
                        errors.toUserUsername
                      }}</span>
                    </div>
                    <div class="mb-3 col-12">
                      <div class="d-flex justify-content-between">
                        <label class="form-label">Amount</label>
                        <div class="d-flex gap-2">
                          <div
                            class="d-flex"
                            v-if="transferSettings && transferSettings.fee"
                          >
                            <span class="">fee: </span>
                            <span class="fw-bold">{{
                              ' ' + transferSettings.fee
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
                        :value="transfer.amount || ''"
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
    <div class="card" v-if="currentPage === PAGE.CONFIRM_TRANSFER">
      <div class="card-header">
        <h4 class="card-title">Proceed Transfer</h4>
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
              <label class="form-label">Recipient Username</label>
              <input
                type="text"
                placeholder="Recipient Username"
                class="form-control"
                :value="transfer.toUserUsername"
                readonly
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Amount To Transfer</label>
              <input
                type="text"
                placeholder="Amount"
                class="form-control"
                :value="Helpers.toDollar(transfer.amount)"
                readonly
              />
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center gap-3 mt-3">
          <button
            class="btn btn-secondary"
            @click="() => setCurrentPage(PAGE.MAKE_TRANSFER)"
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
    <div class="row mt-4" v-if="currentPage === PAGE.TRANSFER_HISTORY">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h4 class="card-title">Transfer History</h4>
            <button
              class="btn btn-outline-secondary"
              @click="() => setCurrentPage(PAGE.MAKE_TRANSFER)"
            >
              Transfer
            </button>
          </div>
          <EmptyResourceComponent v-if="transferLoaded && !transfers?.length">
            No Transfer Record Found
          </EmptyResourceComponent>
          <div class="card-body pt-0 px-0" v-else>
            <TablePreview v-if="!transferLoaded" :rows="8" :cols="6" />
            <MyDataTableComponent v-else>
              <thead class="bg-background">
                <tr>
                  <th class="text-sharp d-none">Sort</th>
                  <th class="text-sharp text-center">Status</th>
                  <th class="text-sharp">Amount</th>
                  <th class="text-sharp">Fee</th>
                  <th class="text-sharp">Sender</th>
                  <th class="text-sharp">Receiver</th>
                  <th class="text-sharp">Created</th>
                  <th class="text-sharp">Settled</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(transfer, i) in transfers" :key="transfer._id">
                  <td class="d-none">{{ i + 1 }}</td>
                  <td class="text-center">
                    <span
                      :class="`badge light badge-${Helpers.toStatus(
                        transfer.status
                      )}`"
                      >{{ Helpers.toTitleCase(transfer.status) }}
                    </span>
                  </td>
                  <td>{{ Helpers.toDollar(transfer.amount) }}</td>
                  <td>
                    {{ transfer.fee ? Helpers.toDollar(-transfer.fee) : '--' }}
                  </td>
                  <td>
                    {{
                      transfer.fromUser?._id === authStore.user?._id
                        ? 'Me'
                        : transfer.fromUser?.username || 'Unknown'
                    }}
                  </td>
                  <td>
                    {{
                      transfer.toUser?._id === authStore.user?._id
                        ? 'Me'
                        : transfer.toUser?.username || 'Unknown'
                    }}
                  </td>
                  <td>
                    {{ Helpers.toNiceDate(transfer.createdAt) }}
                  </td>
                  <td>
                    {{
                      transfer.status === TransferStatus.PENDING
                        ? '--'
                        : Helpers.toNiceDate(transfer.updatedAt)
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
import type { ICreateTransfer } from '@/modules/transfer/transfer.interface'
import type { IAlertModalInfo } from '@/util/interfaces/alertModalInfo.interface'
import { UserAccount } from '@/modules/user/user.enum'

enum PAGE {
  MAKE_TRANSFER,
  CONFIRM_TRANSFER,
  TRANSFER_HISTORY,
}

const httpStore = useHttpStore()
const authStore = useAuthStore()
const transferStore = useTransferStore()
const transfers = computed(() => transferStore.transfers)
const transferLoaded = computed(() => transferStore.loaded)
// fetch transfer s if not fetched
if (!transferLoaded.value) transferStore.fetchAll()

const transferSettingsStore = useTransferSettingsStore()
const transferSettings = computed(() => transferSettingsStore.transferSettings)
const transferSettingsLoaded = computed(() => transferSettingsStore.loaded)
// fetch withdrawal methods if not fetched
if (!transferSettingsLoaded.value) transferSettingsStore.fetch()

const currentPage = ref(PAGE.MAKE_TRANSFER)
const setCurrentPage = (page: PAGE) => {
  scrollTo({ top: 0 })
  setTimeout(() => {
    currentPage.value = page
  }, 100)
}

const userAccount = ref(UserAccount.MAIN_BALANCE)
const setUserAccount = (account: UserAccount) => (userAccount.value = account)

const transfer = ref<ICreateTransfer>({
  account: userAccount.value,
  amount: 0,
  toUserUsername: '',
})

const setTransfer = (data: ICreateTransfer) => {
  transfer.value = data
}

const makeTransfer = (data: ICreateTransfer) => {
  httpStore.setPost(true)

  setTransfer(data)
  setCurrentPage(PAGE.CONFIRM_TRANSFER)
  httpStore.setPost(false)
}

const openAlertModal = ref(false)
const setOpenAlertModal = (isOpen: boolean) => (openAlertModal.value = isOpen)
const alertModalInfo = reactive<IAlertModalInfo>({
  status: ResponseStatus.INFO,
  title: 'Confirming The Transfer',
  message:
    'By confirming, you have agreed that any mistake on the details you provided could lead to the money loss',
  onConfirm: () => createTransfer(),
})

const makeTransferSchema = yup.object({
  account: yup.string().required('Account is required'),
  toUserUsername: yup.string().required('Recipient username is required'),
  amount: yup
    .number()
    .typeError('amount is required')
    .min(0, 'amount should not be a negative value')
    .required('amount is required')
    .test(function (value) {
      if (
        authStore.user &&
        value + transferSettings.value!.fee > authStore.user[userAccount.value]
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

// Create Transfer
const createTransfer = async () => {
  setOpenAlertModal(false)
  const isCreated = await transferStore.createTransfer(transfer.value)
  if (isCreated) {
    setTransfer({
      account: UserAccount.MAIN_BALANCE,
      amount: 0,
      toUserUsername: '',
    })
    setCurrentPage(PAGE.TRANSFER_HISTORY)
  }
}
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
