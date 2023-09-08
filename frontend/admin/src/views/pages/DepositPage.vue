<template>
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Users Deposits</h4>
        </div>
        <EmptyResourceComponent v-if="depositLoaded && !deposits?.length">
          No Deposit Record Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!depositLoaded" :rows="8" :cols="6" searching />
          <MyDataTableComponent ordering searching v-else>
            <thead class="bg-background">
              <tr>
                <th class="text-sharp d-none">Sort</th>
                <th class="text-sharp text-center">Action</th>
                <th class="text-sharp text-center">Status</th>
                <th class="text-sharp">User</th>
                <th class="text-sharp">Amount</th>
                <th class="text-sharp">Currency</th>
                <th class="text-sharp">Network</th>
                <th class="text-sharp">Created</th>
                <th class="text-sharp">Settled</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(deposit, i) in deposits" :key="deposit._id">
                <td class="d-none">{{ i + 1 }}</td>
                <td>
                  <MyDropdownComponent>
                    <a
                      @click="
                        () => statusHandler(deposit, DepositStatus.APPROVED)
                      "
                      v-if="deposit.status === DepositStatus.PENDING"
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      ><i :class="`bi bi-check-circle me-2`"></i>Approve</a
                    >
                    <a
                      @click="
                        () => statusHandler(deposit, DepositStatus.CANCELLED)
                      "
                      v-if="deposit.status === DepositStatus.PENDING"
                      class="dropdown-item"
                      href="javascript:;"
                      ><i :class="`bi bi-slash-circle me-2`"></i>Cancel</a
                    >
                    <a
                      @click="() => deleteHandler(deposit)"
                      v-if="deposit.status !== DepositStatus.PENDING"
                      class="dropdown-item"
                      href="javascript:;"
                      ><i class="bi bi-trash me-2"></i>Delete</a
                    >
                  </MyDropdownComponent>
                </td>
                <td class="text-center">
                  <span
                    :class="`badge light badge-${Helpers.toStatus(
                      deposit.status
                    )}`"
                    >{{ Helpers.toTitleCase(deposit.status) }}
                  </span>
                </td>
                <td>{{ Helpers.toTitleCase(deposit.user.username) }}</td>
                <td>{{ Helpers.toDollar(deposit.amount) }}</td>
                <td>
                  <div class="d-flex">
                    <img
                      :src="`/icons/crypto-svg/${deposit.depositMethodObject.logo}`"
                      class="me-3"
                      :alt="deposit.depositMethodObject.name"
                      width="24"
                    />
                    <div class="d-flex flex-column">
                      <span class="fw-bold">{{
                        Helpers.toTitleCase(deposit.depositMethodObject.name)
                      }}</span>
                      <span class="fs-14"
                        >{{ deposit.depositMethodObject.symbol.toUpperCase() }}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  {{ deposit.depositMethodObject.network.toUpperCase() }}
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
import { DepositStatus } from '@/modules/deposit/deposit.enum'
import type { IDeposit } from '@/modules/deposit/deposit.interface'
import { ResponseStatus } from '@/modules/http/http.enum'

const openAlertModal = ref(false)

const deposit = ref<IDeposit>()
const setDeposit = (data: IDeposit) => (deposit.value = data)
const status = ref<DepositStatus>()
const setStatus = (value: DepositStatus) => (status.value = value)

const depositStore = useDepositStore()
const deposits = computed(() => depositStore.deposits)
const depositLoaded = computed(() => depositStore.loaded)
// fetch deposit s if not fetched
if (!depositLoaded.value) depositStore.fetchAll()

const alertModalInfo = reactive<{
  status: ResponseStatus
  title: string
  message: string
  onConfirm: Function
}>({ status: ResponseStatus.INFO, title: '', message: '', onConfirm: () => {} })

//  Status handler
const statusHandler = (deposit: IDeposit, status: DepositStatus) => {
  setDeposit(deposit)
  setStatus(status)

  if (status === DepositStatus.APPROVED) {
    alertModalInfo.status = ResponseStatus.INFO
    alertModalInfo.title = `Do you really wants to approve this deposit?`
    alertModalInfo.message = `Approving this deposit will credit ${Helpers.toTitleCase(
      deposit.user.username
    )} with the sum of ${Helpers.toDollar(
      deposit.amount
    )} and cannot be reversed.`
  } else {
    alertModalInfo.status = ResponseStatus.WARNING
    alertModalInfo.title = `Do you really wants to cancel this deposit?`
    alertModalInfo.message = `Canceling this deposit mark it has ${status} whereby the user will not be credited`
  }

  alertModalInfo.onConfirm = updateStatus
  openAlertModal.value = true
}

// Delete handler
const deleteHandler = (Deposit: IDeposit) => {
  deposit.value = Deposit

  alertModalInfo.status = ResponseStatus.DANGER
  alertModalInfo.title = `Do you really wants to delete this deposit?`
  alertModalInfo.message = 'Deleting this deposit can not be reversed'

  alertModalInfo.onConfirm = deleteOne
  openAlertModal.value = true
}

// Update status
const updateStatus = () => {
  if (!deposit.value) return
  if (
    status.value !== DepositStatus.APPROVED &&
    status.value !== DepositStatus.CANCELLED
  )
    return
  openAlertModal.value = false
  depositStore.updateStatus(deposit.value._id, status.value)
}

// Delete One
const deleteOne = () => {
  if (!deposit.value) return
  openAlertModal.value = false

  depositStore.deleteOne(deposit.value._id)
}
</script>

<style scoped></style>
