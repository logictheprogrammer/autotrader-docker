<template>
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Withdrawal Methods</h4>
          <button
            class="btn btn-primary"
            type="button"
            @click="() => (openAddNewModel = true)"
          >
            Add New
          </button>
        </div>
        <EmptyResourceComponent
          v-if="withdrawalMethodLoaded && !withdrawalMethods?.length"
        >
          No Withdrawal Methods Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!withdrawalMethodLoaded" :rows="4" :cols="6" />
          <MyDataTableComponent v-else>
            <thead class="bg-background">
              <tr>
                <th class="text-sharp">Action</th>
                <th class="text-sharp">Currency</th>
                <th class="text-sharp">Network</th>
                <th class="text-sharp text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="wm in withdrawalMethods" :key="wm._id">
                <td>
                  <MyDropdownComponent>
                    <a
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      @click="() => editWithdrawalMethodHandler(wm)"
                      ><i class="bi bi-pencil-square me-2"></i> Edit</a
                    >
                    <a
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      @click="() => withdrawalMethodStatusHandler(wm)"
                      ><i
                        :class="`bi bi-${
                          wm.status === WithdrawalMethodStatus.ENABLED
                            ? 'slash'
                            : 'check'
                        }-circle me-2`"
                      ></i>
                      {{
                        wm.status === WithdrawalMethodStatus.ENABLED
                          ? 'Disable'
                          : 'Enable'
                      }}</a
                    >
                    <a
                      class="dropdown-item"
                      href="javascript:;"
                      @click="() => deleteWithdrawalMethodHandler(wm)"
                      ><i class="bi bi-trash me-2"></i>Delete</a
                    >
                  </MyDropdownComponent>
                </td>
                <td>
                  <div class="d-flex">
                    <img
                      :src="`/icons/crypto-svg/${wm.logo}`"
                      class="me-3"
                      :alt="wm.name"
                      width="24"
                    />
                    <div class="d-flex flex-column">
                      <span class="fw-bold">{{
                        Helpers.toTitleCase(wm.name)
                      }}</span>
                      <span class="fs-14">{{ wm.symbol.toUpperCase() }} </span>
                    </div>
                  </div>
                </td>
                <td>{{ wm.network.toUpperCase() }}</td>
                <td class="text-center">
                  <span
                    :class="`badge light badge-${Helpers.toStatus(wm.status)}`"
                    >{{ Helpers.toTitleCase(wm.status) }}
                  </span>
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

  <ModalComponent
    :is-open="openAddNewModel"
    @close="() => (openAddNewModel = false)"
    @confirm="addNewWithdrawalMethod"
    :validation-schema="addNewSchema"
    v-slot="{ errors }"
    title="Add New Withdrawal Method"
  >
    <div class="w-100">
      <div class="mb-3">
        <label class="form-label text-sharp">Currency</label>
        <Field
          class="default-select form-control wide mb-3"
          name="currencyId"
          as="select"
          v-slot="{ value }"
          :validate-on-input="true"
          :class="{ 'border-danger': errors.currency }"
        >
          <option value="" disabled>Select a currency</option>
          <option
            class="text-black"
            v-for="currency in currencies"
            :key="currency._id"
            :value="currency._id"
            :selected="value && value.includes(currency)"
          >
            {{ Helpers.toTitleCase(currency.name) }} -
            {{ currency.symbol.toUpperCase() }}
          </option>
        </Field>
        <span class="error-message">{{ errors.currencyId }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Network</label>
        <Field
          name="network"
          type="text"
          placeholder="Network"
          class="form-control"
          :validate-on-input="true"
        />
        <span class="error-message">{{ errors.network }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Fee</label>
        <Field
          name="fee"
          type="number"
          placeholder="Fee"
          class="form-control"
          :validate-on-input="true"
        />
        <span class="error-message">{{ errors.fee }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Min Withdrawal</label>
        <Field
          name="minWithdrawal"
          type="number"
          placeholder="Min Withdrawal"
          class="form-control"
          :validate-on-input="true"
        />
        <span class="error-message">{{ errors.minWithdrawal }}</span>
      </div>
    </div>
  </ModalComponent>

  <ModalComponent
    :is-open="openEditModel"
    @close="() => (openEditModel = false)"
    @confirm="updateWithdrawalMethod"
    :validation-schema="editSchema"
    v-slot="{ errors }"
    title="Add New Withdrawal Method"
  >
    <div class="w-100">
      <Field
        name="withdrawalMethodId"
        type="hidden"
        class="form-control"
        :value="selectedWithdrawalMethod?._id"
      />
      <div class="mb-3">
        <label class="form-label text-sharp">Currency</label>
        <Field
          class="default-select form-control wide mb-3"
          name="currencyId"
          as="select"
          :value="selectedWithdrawalMethod?.currency"
          v-slot="{ value }"
          :validate-on-input="true"
          :class="{ 'border-danger': errors.currency }"
        >
          <option value="" disabled>Select a currency</option>
          <option
            class="text-black"
            v-for="currency in currencies"
            :key="currency._id"
            :value="currency._id"
            :selected="value && value.includes(currency)"
          >
            {{ Helpers.toTitleCase(currency.name) }} -
            {{ currency.symbol.toUpperCase() }}
          </option>
        </Field>
        <span class="error-message">{{ errors.currencyId }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Network</label>
        <Field
          name="network"
          type="text"
          placeholder="Network"
          class="form-control"
          :validate-on-input="true"
          :value="selectedWithdrawalMethod?.network"
        />
        <span class="error-message">{{ errors.network }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Fee</label>
        <Field
          name="fee"
          type="number"
          placeholder="Fee"
          class="form-control"
          :validate-on-input="true"
          :value="selectedWithdrawalMethod?.fee"
        />
        <span class="error-message">{{ errors.fee }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Min Withdrawal</label>
        <Field
          name="minWithdrawal"
          type="number"
          placeholder="Min Withdrawal"
          class="form-control"
          :validate-on-input="true"
          :value="selectedWithdrawalMethod?.minWithdrawal"
        />
        <span class="error-message">{{ errors.minWithdrawal }}</span>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import type {
  IAddNewWithdrawalMethod,
  IWithdrawalMethod,
  IEditWithdrawalMethod,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { ResponseStatus } from '@/modules/http/http.enum'

const selectedWithdrawalMethod = ref<IWithdrawalMethod>()

const openAddNewModel = ref(false)
const openEditModel = ref(false)
const openAlertModal = ref(false)

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.currencies)
const currencyLoaded = computed(() => currencyStore.loaded)
// fetch currencies if not fetched
if (!currencyLoaded.value) currencyStore.fetchAll()

const withdrawalMethodStore = useWithdrawalMethodStore()
const withdrawalMethods = computed(
  () => withdrawalMethodStore.withdrawalMethods
)
const withdrawalMethodLoaded = computed(() => withdrawalMethodStore.loaded)
// fetch withdrawal methods if not fetched
if (!withdrawalMethodLoaded.value) withdrawalMethodStore.fetchAll()

const alertModalInfo = reactive<{
  status: ResponseStatus
  title: string
  message: string
  onConfirm: Function
}>({ status: ResponseStatus.INFO, title: '', message: '', onConfirm: () => {} })

const addNewSchema = yup.object({
  currencyId: yup.string().required('Currency is required'),
  network: yup.string().required('Network is required'),
  fee: yup
    .number()
    .typeError('Fee is required')
    .min(0, 'Fee should not be a nagative value')
    .required('Fee is required'),
  minWithdrawal: yup
    .number()
    .typeError('Min withdrawal is required')
    .positive('Min withdrawal should be greater than zero')
    .required('Min withdrawal is required'),
})

const editSchema = yup.object({
  currencyId: yup.string().required('Currency is required'),
  network: yup.string().required('Network is required'),
  fee: yup
    .number()
    .typeError('Fee is required')
    .min(0, 'Fee should not be a nagative value')
    .required('Fee is required'),
  minWithdrawal: yup
    .number()
    .typeError('Min withdrawal is required')
    .positive('Min withdrawal should be greater than zero')
    .required('Min withdrawal is required'),
})

// Edit Withdrawal Method handler
const editWithdrawalMethodHandler = (withdrawalMethod: IWithdrawalMethod) => {
  selectedWithdrawalMethod.value = withdrawalMethod

  openEditModel.value = true
}

// Withdrawal method Status handler
const withdrawalMethodStatusHandler = (withdrawalMethod: IWithdrawalMethod) => {
  selectedWithdrawalMethod.value = withdrawalMethod

  if (
    selectedWithdrawalMethod.value.status === WithdrawalMethodStatus.ENABLED
  ) {
    alertModalInfo.status = ResponseStatus.WARNING
    alertModalInfo.title = `Do you really wants to disabled ${Helpers.toTitleCase(
      withdrawalMethod.name
    )} - ${withdrawalMethod.symbol.toUpperCase()}?`
    alertModalInfo.message =
      'Disabling this withdrawal method will hide it from all users, there by preventing them from withdrawaling with it.'
  } else {
    alertModalInfo.status = ResponseStatus.INFO
    alertModalInfo.title = `Do you really wants to enable ${Helpers.toTitleCase(
      withdrawalMethod.name
    )} - ${withdrawalMethod.symbol.toUpperCase()}?`
    alertModalInfo.message =
      'Enabling this withdrawal method will allow users to withdrawal with it.'
  }

  alertModalInfo.onConfirm = updateWithdrawalMethodStatus
  openAlertModal.value = true
}

// Delete Withdrawal Method handler
const deleteWithdrawalMethodHandler = (withdrawalMethod: IWithdrawalMethod) => {
  selectedWithdrawalMethod.value = withdrawalMethod

  alertModalInfo.status = ResponseStatus.DANGER
  alertModalInfo.title = `Do you really wants to delete  ${Helpers.toTitleCase(
    withdrawalMethod.name
  )} - ${withdrawalMethod.symbol.toUpperCase()}?`
  alertModalInfo.message = ''

  alertModalInfo.onConfirm = deleteWithdrawalMethod
  openAlertModal.value = true
}

// Update Withdrawal Method Status
const updateWithdrawalMethodStatus = () => {
  if (!selectedWithdrawalMethod.value) return
  openAlertModal.value = false
  withdrawalMethodStore.updateWithdrawalMethodStatus({
    withdrawalMethodId: selectedWithdrawalMethod.value._id,
    status:
      selectedWithdrawalMethod.value.status === WithdrawalMethodStatus.ENABLED
        ? WithdrawalMethodStatus.DISABLED
        : WithdrawalMethodStatus.ENABLED,
  })
}

// Add new withdrawal method
const addNewWithdrawalMethod = (data: IAddNewWithdrawalMethod) => {
  openAddNewModel.value = false
  withdrawalMethodStore.addNewWithdrawalMethod(data)
}

// Edit withdrawal method
const updateWithdrawalMethod = (data: IEditWithdrawalMethod) => {
  openEditModel.value = false
  withdrawalMethodStore.updateWithdrawalMethod(data)
}

// Delete withdrawal method
const deleteWithdrawalMethod = () => {
  openAlertModal.value = false
  if (!selectedWithdrawalMethod.value) return
  withdrawalMethodStore.deleteWithdrawalMethod(
    selectedWithdrawalMethod.value._id
  )
}
</script>

<style scoped></style>
