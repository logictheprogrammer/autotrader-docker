<template>
  <div class="row mt-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title">Deposit Methods</h4>
          <button
            class="btn btn-primary"
            type="button"
            @click="() => (openAddNewModel = true)"
          >
            Add New
          </button>
        </div>
        <EmptyResourceComponent
          v-if="depositMethodLoaded && !depositMethods?.length"
        >
          No Deposit Methods Found
        </EmptyResourceComponent>
        <div class="card-body pt-0 px-0" v-else>
          <TablePreview v-if="!depositMethodLoaded" :rows="4" :cols="6" />
          <MyDataTableComponent v-else>
            <thead class="bg-background">
              <tr>
                <th class="text-sharp">Action</th>
                <th class="text-sharp">Currency</th>
                <th class="text-sharp">Network</th>
                <th class="text-sharp">Price</th>
                <th class="text-sharp text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dm in depositMethods" :key="dm._id">
                <td>
                  <MyDropdownComponent>
                    <a
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      @click="() => editDepositMethodHandler(dm)"
                      ><i class="bi bi-pencil-square me-2"></i> Edit</a
                    >
                    <a
                      class="dropdown-item border-bottom"
                      href="javascript:;"
                      @click="() => depositMethodStatusHandler(dm)"
                      ><i
                        :class="`bi bi-${
                          dm.status === DepositMethodStatus.ENABLED
                            ? 'slash'
                            : 'check'
                        }-circle me-2`"
                      ></i>
                      {{
                        dm.status === DepositMethodStatus.ENABLED
                          ? 'Disable'
                          : 'Enable'
                      }}</a
                    >
                    <a
                      class="dropdown-item"
                      href="javascript:;"
                      @click="() => deleteDepositMethodHandler(dm)"
                      ><i class="bi bi-trash me-2"></i>Delete</a
                    >
                  </MyDropdownComponent>
                </td>
                <td>
                  <div class="d-flex">
                    <img
                      :src="`/icons/crypto-svg/${dm.logo}`"
                      class="me-3"
                      :alt="dm.name"
                      width="24"
                    />
                    <div class="d-flex flex-column">
                      <span class="fw-bold">{{
                        Helpers.toTitleCase(dm.name)
                      }}</span>
                      <span class="fs-14">{{ dm.symbol.toUpperCase() }} </span>
                    </div>
                  </div>
                </td>
                <td>{{ dm.network.toUpperCase() }}</td>
                <td>{{ Helpers.toDollar(dm.price) }}</td>
                <td class="text-center">
                  <span
                    :class="`badge light badge-${Helpers.toStatus(dm.status)}`"
                    >{{ Helpers.toTitleCase(dm.status) }}
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
    @confirm="addNewDepositMethod"
    :validation-schema="addNewSchema"
    v-slot="{ errors }"
    title="Add New Deposit Method"
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
        <label class="form-label text-sharp">Address</label>
        <Field
          name="address"
          type="text"
          placeholder="Address"
          class="form-control"
          :validate-on-input="true"
        />
        <span class="error-message">{{ errors.address }}</span>
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
        <label class="form-label text-sharp">Min Deposit</label>
        <Field
          name="minDeposit"
          type="number"
          placeholder="Min Deposit"
          class="form-control"
          :validate-on-input="true"
        />
        <span class="error-message">{{ errors.minDeposit }}</span>
      </div>
    </div>
  </ModalComponent>

  <ModalComponent
    :is-open="openEditModel"
    @close="() => (openEditModel = false)"
    @confirm="updateDepositMethod"
    :validation-schema="editSchema"
    v-slot="{ errors }"
    title="Add New Deposit Method"
  >
    <div class="w-100">
      <Field
        name="depositMethodId"
        type="hidden"
        class="form-control"
        :value="selectedDepositMethod?._id"
      />
      <div class="mb-3">
        <label class="form-label text-sharp">Currency</label>
        <Field
          class="default-select form-control wide mb-3"
          name="currencyId"
          as="select"
          :value="selectedDepositMethod?.currency"
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
        <label class="form-label text-sharp">Wallet Address</label>
        <Field
          name="address"
          type="text"
          placeholder="Wallet Address"
          class="form-control"
          :validate-on-input="true"
          :value="selectedDepositMethod?.address"
        />
        <span class="error-message">{{ errors.address }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Network</label>
        <Field
          name="network"
          type="text"
          placeholder="Network"
          class="form-control"
          :validate-on-input="true"
          :value="selectedDepositMethod?.network"
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
          :value="selectedDepositMethod?.fee"
        />
        <span class="error-message">{{ errors.fee }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Min Deposit</label>
        <Field
          name="minDeposit"
          type="number"
          placeholder="Min Deposit"
          class="form-control"
          :validate-on-input="true"
          :value="selectedDepositMethod?.minDeposit"
        />
        <span class="error-message">{{ errors.minDeposit }}</span>
      </div>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import type {
  IAddNewDepositMethod,
  IDepositMethod,
  IEditDepositMethod,
} from '@/modules/depositeMethod/depositMethod.interface'
import { ResponseStatus } from '@/modules/http/http.enum'

const selectedDepositMethod = ref<IDepositMethod>()

const openAddNewModel = ref(false)
const openEditModel = ref(false)
const openAlertModal = ref(false)

const currencyStore = useCurrencyStore()
const currencies = computed(() => currencyStore.currencies)
const currencyLoaded = computed(() => currencyStore.loaded)
// fetch currencies if not fetched
if (!currencyLoaded.value) currencyStore.fetchAll()

const depositMethodStore = useDepositMethodStore()
const depositMethods = computed(() => depositMethodStore.depositMethods)
const depositMethodLoaded = computed(() => depositMethodStore.loaded)
// fetch deposit methods if not fetched
if (!depositMethodLoaded.value) depositMethodStore.fetchAll()

const alertModalInfo = reactive<{
  status: ResponseStatus
  title: string
  message: string
  onConfirm: Function
}>({ status: ResponseStatus.INFO, title: '', message: '', onConfirm: () => {} })

const addNewSchema = yup.object({
  currencyId: yup.string().required('Currency is required'),
  address: yup.string().required('Address is required'),
  network: yup.string().required('Network is required'),
  fee: yup
    .number()
    .typeError('Fee is required')
    .min(0, 'Fee should not be a nagative value')
    .required('Fee is required'),
  minDeposit: yup
    .number()
    .typeError('Min deposit is required')
    .positive('Min deposit should be greater than zero')
    .required('Min deposit is required'),
})

const editSchema = yup.object({
  currencyId: yup.string().required('Currency is required'),
  address: yup.string().required('Address is required'),
  network: yup.string().required('Network is required'),
  fee: yup
    .number()
    .typeError('Fee is required')
    .min(0, 'Fee should not be a nagative value')
    .required('Fee is required'),
  minDeposit: yup
    .number()
    .typeError('Min deposit is required')
    .positive('Min deposit should be greater than zero')
    .required('Min deposit is required'),
})

// Edit Deposit Method handler
const editDepositMethodHandler = (depositMethod: IDepositMethod) => {
  selectedDepositMethod.value = depositMethod

  openEditModel.value = true
}

// Deposit method Status handler
const depositMethodStatusHandler = (depositMethod: IDepositMethod) => {
  selectedDepositMethod.value = depositMethod

  if (selectedDepositMethod.value.status === DepositMethodStatus.ENABLED) {
    alertModalInfo.status = ResponseStatus.WARNING
    alertModalInfo.title = `Do you really wants to disabled ${Helpers.toTitleCase(
      depositMethod.name
    )} - ${depositMethod.symbol.toUpperCase()}?`
    alertModalInfo.message =
      'Disabling this deposit method will hide it from all users, there by preventing them from depositing with it.'
  } else {
    alertModalInfo.status = ResponseStatus.INFO
    alertModalInfo.title = `Do you really wants to enable ${Helpers.toTitleCase(
      depositMethod.name
    )} - ${depositMethod.symbol.toUpperCase()}?`
    alertModalInfo.message =
      'Enabling this deposit method will allow users to deposit with it.'
  }

  alertModalInfo.onConfirm = updateDepositMethodStatus
  openAlertModal.value = true
}

// Delete Deposit Method handler
const deleteDepositMethodHandler = (depositMethod: IDepositMethod) => {
  selectedDepositMethod.value = depositMethod

  alertModalInfo.status = ResponseStatus.DANGER
  alertModalInfo.title = `Do you really wants to delete  ${Helpers.toTitleCase(
    depositMethod.name
  )} - ${depositMethod.symbol.toUpperCase()}?`
  alertModalInfo.message = ''

  alertModalInfo.onConfirm = deleteDepositMethod
  openAlertModal.value = true
}

// Update Deposite Method Status
const updateDepositMethodStatus = () => {
  if (!selectedDepositMethod.value) return
  openAlertModal.value = false
  depositMethodStore.updateDepositMethodStatus({
    depositMethodId: selectedDepositMethod.value._id,
    status:
      selectedDepositMethod.value.status === DepositMethodStatus.ENABLED
        ? DepositMethodStatus.DISABLED
        : DepositMethodStatus.ENABLED,
  })
}

// Add new deposit method
const addNewDepositMethod = (data: IAddNewDepositMethod) => {
  openAddNewModel.value = false
  depositMethodStore.addNewDepositMethod(data)
}

// Edit deposit method
const updateDepositMethod = (data: IEditDepositMethod) => {
  openEditModel.value = false
  depositMethodStore.updateDepositMethod(data)
}

// Delete deposit method
const deleteDepositMethod = () => {
  openAlertModal.value = false
  if (!selectedDepositMethod.value) return
  depositMethodStore.deleteDepositMethod(selectedDepositMethod.value._id)
}
</script>

<style scoped></style>
