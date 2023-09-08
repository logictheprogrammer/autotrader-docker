<template>
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Users Withdrawals</h4>
        </div>
        <EmptyResourceComponent v-if="withdrawalLoaded && !withdrawals?.length">
          No Withdrawal Record Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!withdrawalLoaded" :rows="8" :cols="6" />
          <MyDataTableComponent v-else>
            <thead class="bg-background">
              <tr>
                <th class="text-sharp d-none">Sort</th>
                <th class="text-sharp text-center">Action</th>
                <th class="text-sharp text-center">Status</th>
                <th class="text-sharp">User</th>
                <th class="text-sharp">Amount</th>
                <th class="text-sharp">Currency</th>
                <th class="text-sharp">Network</th>
                <th class="text-sharp">User's Wallet Address</th>
                <th class="text-sharp">Created</th>
                <th class="text-sharp">Settled</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(withdrawal, i) in withdrawals" :key="withdrawal._id">
                <td class="d-none">{{ i + 1 }}</td>
                <td>
                  <MyDropdownComponent>
                    <a
                      @click="
                        () =>
                          statusHandler(withdrawal, WithdrawalStatus.APPROVED)
                      "
                      v-if="withdrawal.status === WithdrawalStatus.PENDING"
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      ><i :class="`bi bi-check-circle me-2`"></i>Approve</a
                    >
                    <a
                      @click="
                        () =>
                          statusHandler(withdrawal, WithdrawalStatus.CANCELLED)
                      "
                      v-if="withdrawal.status === WithdrawalStatus.PENDING"
                      class="dropdown-item"
                      href="javascript:;"
                      ><i :class="`bi bi-slash-circle me-2`"></i>Cancel</a
                    >
                    <a
                      @click="() => deleteHandler(withdrawal)"
                      v-if="withdrawal.status !== WithdrawalStatus.PENDING"
                      class="dropdown-item"
                      href="javascript:;"
                      ><i class="bi bi-trash me-2"></i>Delete</a
                    >
                  </MyDropdownComponent>
                </td>
                <td class="text-center">
                  <span
                    :class="`badge light badge-${Helpers.toStatus(
                      withdrawal.status
                    )}`"
                    >{{ Helpers.toTitleCase(withdrawal.status) }}
                  </span>
                </td>
                <td>{{ Helpers.toTitleCase(withdrawal.user.username) }}</td>
                <td>{{ Helpers.toDollar(withdrawal.amount) }}</td>
                <td>
                  <div class="d-flex">
                    <img
                      :src="`/icons/crypto-svg/${withdrawal.withdrawalMethodObject.logo}`"
                      class="me-3"
                      :alt="withdrawal.withdrawalMethodObject.name"
                      width="24"
                    />
                    <div class="d-flex flex-column">
                      <span class="fw-bold">{{
                        Helpers.toTitleCase(
                          withdrawal.withdrawalMethodObject.name
                        )
                      }}</span>
                      <span class="fs-14"
                        >{{
                          withdrawal.withdrawalMethodObject.symbol.toUpperCase()
                        }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  {{ withdrawal.withdrawalMethodObject.network.toUpperCase() }}
                </td>
                <td>
                  {{ withdrawal.address }}
                </td>
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

  <AlertConfirmComponent
    :is-open="openAlertModal"
    :status="alertModalInfo.status"
    :title="alertModalInfo.title"
    :message="alertModalInfo.message"
    @confirm="alertModalInfo.onConfirm"
    @close="openAlertModal = false"
  />
</template>

<script setup lang="ts">
import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import type { IWithdrawal } from '@/modules/withdrawal/withdrawal.interface'
import { ResponseStatus } from '@/modules/http/http.enum'

const openAlertModal = ref(false)

const withdrawal = ref<IWithdrawal>()
const setWithdrawal = (data: IWithdrawal) => (withdrawal.value = data)
const status = ref<WithdrawalStatus>()
const setStatus = (value: WithdrawalStatus) => (status.value = value)

const withdrawalStore = useWithdrawalStore()
const withdrawals = computed(() => withdrawalStore.withdrawals)
const withdrawalLoaded = computed(() => withdrawalStore.loaded)
// fetch withdrawal s if not fetched
if (!withdrawalLoaded.value) withdrawalStore.fetchAll()

const alertModalInfo = reactive<{
  status: ResponseStatus
  title: string
  message: string
  onConfirm: Function
}>({ status: ResponseStatus.INFO, title: '', message: '', onConfirm: () => {} })

//  Status handler
const statusHandler = (withdrawal: IWithdrawal, status: WithdrawalStatus) => {
  setWithdrawal(withdrawal)
  setStatus(status)

  if (status === WithdrawalStatus.APPROVED) {
    alertModalInfo.status = ResponseStatus.INFO
    alertModalInfo.title = `Do you really wants to approve this withdrawal?`
    alertModalInfo.message = `Approving cannot be reversed.`
  } else {
    alertModalInfo.status = ResponseStatus.WARNING
    alertModalInfo.title = `Do you really wants to cancel this withdrawal?`
    alertModalInfo.message = `Canceling this withdrawal mark it has ${status} whereby the user will be credited back on his/her account`
  }

  alertModalInfo.onConfirm = updateStatus
  openAlertModal.value = true
}

// Delete handler
const deleteHandler = (Withdrawal: IWithdrawal) => {
  withdrawal.value = Withdrawal

  alertModalInfo.status = ResponseStatus.DANGER
  alertModalInfo.title = `Do you really wants to delete this withdrawal?`
  alertModalInfo.message = 'Deleting this withdrawal can not be reversed'

  alertModalInfo.onConfirm = deleteOne
  openAlertModal.value = true
}

// Update status
const updateStatus = () => {
  if (!withdrawal.value) return
  if (
    status.value !== WithdrawalStatus.APPROVED &&
    status.value !== WithdrawalStatus.CANCELLED
  )
    return
  openAlertModal.value = false
  withdrawalStore.updateStatus(withdrawal.value._id, status.value)
}

// Delete One
const deleteOne = () => {
  if (!withdrawal.value) return
  openAlertModal.value = false

  withdrawalStore.deleteOne(withdrawal.value._id)
}
</script>

<style scoped></style>
