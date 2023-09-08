<template>
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Users Transfers</h4>
        </div>
        <EmptyResourceComponent v-if="transferLoaded && !transfers?.length">
          No Transfer Record Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!transferLoaded" :rows="8" :cols="6" searching />
          <MyDataTableComponent ordering searching v-else>
            <thead class="bg-background">
              <tr>
                <th class="text-sharp d-none">Sort</th>
                <th class="text-sharp text-center">Action</th>
                <th class="text-sharp text-center">Status</th>
                <th class="text-sharp">Amount</th>
                <th class="text-sharp">Fee</th>
                <th class="text-sharp">Sender</th>
                <th class="text-sharp">Reciever</th>
                <th class="text-sharp">Created</th>
                <th class="text-sharp">Settled</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(transfer, i) in transfers" :key="transfer._id">
                <td class="d-none">{{ i + 1 }}</td>
                <td>
                  <MyDropdownComponent>
                    <a
                      @click="
                        () => statusHandler(transfer, TransferStatus.SUCCESSFUL)
                      "
                      v-if="transfer.status === TransferStatus.PENDING"
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      ><i :class="`bi bi-check-circle me-2`"></i>Approve</a
                    >
                    <a
                      @click="
                        () => statusHandler(transfer, TransferStatus.REVERSED)
                      "
                      v-if="transfer.status === TransferStatus.PENDING"
                      class="dropdown-item"
                      href="javascript:;"
                      ><i :class="`bi bi-slash-circle me-2`"></i>Cancel</a
                    >
                    <a
                      @click="() => deleteHandler(transfer)"
                      v-if="transfer.status !== TransferStatus.PENDING"
                      class="dropdown-item"
                      href="javascript:;"
                      ><i class="bi bi-trash me-2"></i>Delete</a
                    >
                  </MyDropdownComponent>
                </td>
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
                  {{ transfer.fromUser.username }}
                </td>
                <td>
                  {{ transfer.toUser.username }}
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
import { TransferStatus } from '@/modules/transfer/transfer.enum'
import type { ITransfer } from '@/modules/transfer/transfer.interface'
import { ResponseStatus } from '@/modules/http/http.enum'

const openAlertModal = ref(false)

const transfer = ref<ITransfer>()
const setTransfer = (data: ITransfer) => (transfer.value = data)
const status = ref<TransferStatus>()
const setStatus = (value: TransferStatus) => (status.value = value)

const transferStore = useTransferStore()
const transfers = computed(() => transferStore.transfers)
const transferLoaded = computed(() => transferStore.loaded)
// fetch transfers if not fetched
if (!transferLoaded.value) transferStore.fetchAll()

const alertModalInfo = reactive<{
  status: ResponseStatus
  title: string
  message: string
  onConfirm: Function
}>({ status: ResponseStatus.INFO, title: '', message: '', onConfirm: () => {} })

//  Status handler
const statusHandler = (transfer: ITransfer, status: TransferStatus) => {
  setTransfer(transfer)
  setStatus(status)

  if (status === TransferStatus.SUCCESSFUL) {
    alertModalInfo.status = ResponseStatus.INFO
    alertModalInfo.title = `Do you really wants to approve this transfer?`
    alertModalInfo.message = `Approving this transfer will credit ${Helpers.toTitleCase(
      transfer.toUser.username
    )} with the sum of ${Helpers.toDollar(
      transfer.amount
    )} and cannot be reversed.`
  } else {
    alertModalInfo.status = ResponseStatus.WARNING
    alertModalInfo.title = `Do you really wants to cancel this transfer?`
    alertModalInfo.message = `Canceling this transfer mark it has ${status} and reversed the money back to the sender account`
  }

  alertModalInfo.onConfirm = updateStatus
  openAlertModal.value = true
}

// Delete handler
const deleteHandler = (Transfer: ITransfer) => {
  transfer.value = Transfer

  alertModalInfo.status = ResponseStatus.DANGER
  alertModalInfo.title = `Do you really wants to delete this transfer?`
  alertModalInfo.message = 'Deleting this transfer can not be reversed'

  alertModalInfo.onConfirm = deleteOne
  openAlertModal.value = true
}

// Update status
const updateStatus = () => {
  if (!transfer.value) return
  if (
    status.value !== TransferStatus.REVERSED &&
    status.value !== TransferStatus.SUCCESSFUL
  )
    return
  openAlertModal.value = false
  transferStore.updateStatus(transfer.value._id, status.value)
}

// Delete One
const deleteOne = () => {
  if (!transfer.value) return
  openAlertModal.value = false

  transferStore.deleteOne(transfer.value._id)
}
</script>

<style scoped></style>
