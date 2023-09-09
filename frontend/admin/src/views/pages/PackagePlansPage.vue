<template>
  <div class="d-flex justify-content-end mb-3 border-bottom pb-3">
    <button
      class="btn btn-primary"
      type="button"
      @click="() => setOpenPlanFormModal(true, PlanForm.CREATE)"
    >
      Add New
    </button>
  </div>
  <div class="row">
    <PackagePlanCardComponent
      v-for="packagePlan in plans"
      :plan="packagePlan"
      :key="packagePlan._id"
    >
      <button
        type="button"
        class="btn btn-outline-secondary w-100 mt-3 dropdown-toggle"
        data-bs-toggle="dropdown"
      >
        Action
      </button>
      <div class="dropdown-menu">
        <a
          class="dropdown-item"
          href="javascript:void(0)"
          @click="
            () => setOpenPlanFormModal(true, PlanForm.UPDATE, packagePlan)
          "
          >Edit</a
        >
        <a
          class="dropdown-item"
          href="javascript:void(0)"
          @click="
            () => onPlanStatusChangeHandler(packagePlan, PlanStatus.ACTIVE)
          "
          >Unsuspend</a
        >
        <a
          class="dropdown-item"
          href="javascript:void(0)"
          @click="
            () => onPlanStatusChangeHandler(packagePlan, PlanStatus.SUSPENDED)
          "
          >Suspend</a
        >
        <a
          @click="
            () =>
              onPlanStatusChangeHandler(packagePlan, PlanStatus.ON_MAINTENANCE)
          "
          class="dropdown-item"
          href="javascript:void(0)"
          >On Maintainace</a
        >
        <a
          class="dropdown-item"
          href="javascript:void(0)"
          @click="() => onDeletePlanHandler(packagePlan)"
          >Delete</a
        >
      </div>
    </PackagePlanCardComponent>
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
    :is-open="openPlanFormModal"
    @close="() => setOpenPlanFormModal(false)"
    @confirm="onSubmitPlanFormHandler"
    :validation-schema="planFormSchema"
    v-slot="{ errors }"
    :title="planForm === PlanForm.CREATE ? `Create New Plan` : `Update Plan`"
  >
    <div class="w-100">
      <Field
        v-if="planForm === PlanForm.UPDATE"
        name="planId"
        type="hidden"
        class="form-control"
        :value="selectedPlan?._id"
      />

      <div class="mb-3">
        <label class="form-label text-sharp">Plan Name</label>
        <Field
          name="name"
          type="text"
          placeholder="Plan Name"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.name"
        />
        <span class="error-message">{{ errors.name }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Engine</label>
        <Field
          name="engine"
          type="text"
          placeholder="Engine"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.engine"
        />
        <span class="error-message">{{ errors.engine }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Description</label>
        <Field
          name="description"
          as="textarea"
          rows="3"
          placeholder="Description"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.description"
        />
        <span class="error-message">{{ errors.description }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Daily Trades</label>
        <Field
          name="dailyTrades"
          type="number"
          placeholder="Daily Trades"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.dailyTrades"
        />
        <span class="error-message">{{ errors.dailyTrades }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Duration (days)</label>
        <Field
          name="duration"
          type="number"
          placeholder="Duration"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.duration"
        />
        <span class="error-message">{{ errors.duration }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Gas</label>
        <Field
          name="gas"
          type="number"
          placeholder="Gas"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.gas"
        />
        <span class="error-message">{{ errors.gas }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Min Amount</label>
        <Field
          name="minAmount"
          type="number"
          placeholder="Min Amount"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.minAmount"
        />
        <span class="error-message">{{ errors.minAmount }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Max Amount</label>
        <Field
          name="maxAmount"
          type="number"
          placeholder="Max Amount"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.maxAmount"
        />
        <span class="error-message">{{ errors.maxAmount }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Min Percentage Profit</label>
        <Field
          name="minProfit"
          type="number"
          placeholder="Min Percentage Profit"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.minProfit"
        />
        <span class="error-message">{{ errors.minProfit }}</span>
      </div>

      <div class="mb-3">
        <label class="form-label text-sharp">Max Percentage Profit</label>
        <Field
          name="maxProfit"
          type="number"
          placeholder="Max Percentage Profit"
          class="form-control"
          :validate-on-input="true"
          :value="planForm === PlanForm.CREATE ? `` : selectedPlan?.maxProfit"
        />
        <span class="error-message">{{ errors.maxProfit }}</span>
      </div>
      <div class="mb-3">
        <label class="form-label text-sharp">Asset Type</label>
        <Field
          class="default-select form-control wide mb-3"
          name="assetType"
          as="select"
          :value="selectedPlan?.assetType"
          v-slot="{ value }"
          :validate-on-input="true"
          :class="{ 'border-danger': errors.assetType }"
        >
          <option value="" disabled>Select a asset Type</option>
          <option
            class="text-black"
            v-for="assetType in assetTypeValues"
            :key="assetType"
            :value="assetType"
            :selected="value && value === assetType"
          >
            {{ Helpers.toTitleCase(assetType) }}
          </option>
        </Field>
        <span class="error-message">{{ errors.assetType }}</span>
      </div>
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <label class="form-label text-sharp">Assets</label>
          <button
            @click="() => setOpenAssetModal(true)"
            type="button"
            class="py-1 btn btn-outline-success btn-xs"
          >
            Add
            <i class="bi bi-plus"></i>
          </button>
        </div>
        <div class="d-flex gap-3 flex-wrap">
          <a
            v-for="asset in selectedAssets"
            :key="asset._id"
            :class="`border p-2 rounded-5 shadow overflow-hidden ${
              selectedAsset?._id === asset._id ? 'border-danger' : ''
            } position-relative`"
            href="javascript: void(0);"
            @click="() => setSelectedAsset(asset)"
          >
            <span
              @click="() => removeFromSelectedAssets(asset)"
              v-if="selectedAsset?._id === asset._id"
              class="position-absolute bg-danger top-0 bottom-0 start-0 end-0 bg-opacity-15"
            ></span>
            <img
              :src="`/icons/crypto-svg/${asset.logo}`"
              class="me-2"
              :alt="asset.name"
              width="24"
            /><span class=""> {{ asset.name }} </span></a
          >
        </div>
      </div>
    </div>
  </ModalComponent>

  <ModalComponent
    :is-open="openAssetModal"
    :close-self="true"
    :only-one-btn="true"
    @close="() => setOpenAssetModal(false)"
    @confirm="() => setOpenAssetModal(false)"
    :z-index="700"
  >
    <div class="d-flex gap-3 flex-wrap">
      <a
        v-for="asset in assets"
        :key="asset._id"
        :class="`border p-2 rounded-5 shadow overflow-hidden position-relative`"
        href="javascript: void(0);"
        @click="() => addToSelectedAssets(asset)"
      >
        <span
          @click.stop="() => removeFromSelectedAssets(asset)"
          v-if="
            selectedAssets.filter(
              (selectedAsset) => selectedAsset._id === asset._id
            ).length
          "
          class="position-absolute bg-danger top-0 bottom-0 start-0 end-0 bg-opacity-15"
        ></span>
        <img
          :src="`/icons/crypto-svg/${asset.logo}`"
          class="me-2"
          :alt="asset.name"
          width="24"
        /><span class=""> {{ asset.name }} </span></a
      >
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
import type { IAsset } from '@/modules/asset/asset.interface'
import { ResponseStatus } from '@/modules/http/http.enum'
import { PlanStatus } from '@/modules/plan/plan.enum'
import type {
  IPlan,
  ICreatePlan,
  IEditPlan,
} from '@/modules/plan/plan.interface'
import type { IAlertModalInfo } from '@/util/interfaces/alertModalInfo.interface'

const planStore = usePlanStore()
const plans = computed(() => planStore.plans)
const planLoaded = computed(() => planStore.loaded)
// fetch if not fetched
if (!planLoaded.value) planStore.fetchAll()

const assetStore = useAssetStore()
const assets = computed(() => assetStore.assets)
const assetLoaded = computed(() => assetStore.loaded)
// fetch if not fetched
if (!assetLoaded.value) assetStore.fetchAll()

const assetTypeValues: string[] = Object.keys(AssetType).map(
  (key) => AssetType[key as keyof typeof AssetType]
)

const selectedPlan = ref<IPlan>()
const selectedAsset = ref<IAsset>()
const selectedAssets = ref<IAsset[]>([])

const setSelectedAsset = (asset: IAsset) => {
  if (selectedAsset.value) return (selectedAsset.value = undefined)
  selectedAsset.value = asset
}

const setSelectedAssets = (assets: IAsset[]) => {
  selectedAssets.value = assets
}

const addToSelectedAssets = (asset: IAsset) => {
  const newAssets = selectedAssets.value.slice()
  newAssets.push(asset)
  setSelectedAssets(newAssets)
}

const removeFromSelectedAssets = (asset: IAsset) => {
  const newAssets = selectedAssets.value.filter((ast) => ast._id !== asset._id)
  setSelectedAssets(newAssets)
}

// Plan Form
enum PlanForm {
  CREATE,
  UPDATE,
}

const planForm = ref<PlanForm>()
const openPlanFormModal = ref(false)
const setOpenPlanFormModal = (
  isOpen: boolean,
  form?: PlanForm,
  plan?: IPlan
) => {
  openPlanFormModal.value = isOpen
  planForm.value = form
  selectedPlan.value = plan
  setSelectedAssets(plan ? plan.assets : [])
}

const openAssetModal = ref(false)
const setOpenAssetModal = (isOpen: boolean) => {
  openAssetModal.value = isOpen
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

const planFormSchema = yup.object({
  name: yup.string().required('Plane name is required'),
  engine: yup.string().required('Engine is required'),
  description: yup.string().required('Description is required'),
  assetType: yup.string().required('Asset Type is required'),
  minAmount: yup
    .number()
    .typeError('Min amount is required')
    .positive('Min amount should be greater than zero')
    .required('Min amount is required'),
  maxAmount: yup
    .number()
    .typeError('Max amount is required')
    .positive('Max amount should be greater than zero')
    .required('Max amount is required')
    .test(
      'is-greater',
      'Max amount should be greater than the min',
      function (value) {
        if (!this.resolve(yup.ref('minAmount'))) return true
        return value > this.resolve(yup.ref('minAmount') as any)
      }
    ),
  minProfit: yup
    .number()
    .typeError('Min profit is required')
    .positive('Min profit should be greater than zero')
    .required('Min profit is required'),
  maxProfit: yup
    .number()
    .typeError('Max profit is required')
    .positive('Max profit should be greater than zero')
    .required('Max profit is required')
    .test(
      'is-greater',
      'Max profit should be greater than the min',
      function (value) {
        if (!this.resolve(yup.ref('minProfit'))) return true
        return value > this.resolve(yup.ref('minProfit') as any)
      }
    ),
  gas: yup
    .number()
    .typeError('Gas is required')
    .positive('Gas should be greater than zero')
    .required('Gas is required'),
  duration: yup
    .number()
    .typeError('Duration is required')
    .positive('Duration should be greater than zero')
    .required('Duration is required'),
  dailyTrades: yup
    .number()
    .typeError('Daily Trades is required')
    .positive('Daily Trades should be greater than zero')
    .required('Daily Trades is required'),
})

// Delete Plan Handler
const onDeletePlanHandler = (plan: IPlan) => {
  selectedPlan.value = plan
  setAlertModalInfo({
    status: ResponseStatus.DANGER,
    title: `Do you really wants to delete this plan`,
    message: `Please note that this action cannot be reversed`,
    onConfirm: () => console.log(plan),
  })
  setOpenAlertModal(true)
}

// Plan Status Change Handler
const onPlanStatusChangeHandler = (plan: IPlan, status: PlanStatus) => {
  selectedPlan.value = plan
  let resStatus = ResponseStatus.INFO,
    title = '',
    message = ''

  switch (status) {
    case PlanStatus.ACTIVE:
      resStatus = ResponseStatus.INFO
      title = `Do you really wants to make this plan active?`
      message = 'This will makes the plan available to be purchased by users'
      break
    case PlanStatus.SUSPENDED:
      resStatus = ResponseStatus.WARNING
      title = `Do you really wants to suspend this plan?`
      message = 'This will hide the plan from users and unable to be purchased'
      break
    case PlanStatus.ON_MAINTENANCE:
      resStatus = ResponseStatus.INFO
      title = `Do you really wants to set this plan on maintainace?`
      message =
        "This will make the plan to be visible to users, but they won' be able to purchase it"
      break
  }

  setAlertModalInfo({
    status: resStatus,
    title,
    message,
    onConfirm: () => console.log(plan),
  })
  setOpenAlertModal(true)
}

// Submit Plan Form handler
const onSubmitPlanFormHandler = async (form: ICreatePlan | IEditPlan) => {
  form.assets = selectedAssets.value.map((asset) => asset._id)
  let successful = false
  if (planForm.value === PlanForm.CREATE)
    successful = await planStore.createPlan(form as ICreatePlan)
  else successful = await planStore.updatePlan(form as IEditPlan)

  if (successful) setOpenPlanFormModal(false)
}
</script>

<style scoped></style>
