<template>
  <div class="row">
    <PackagePlanCardComponent
      v-for="packagePlan in packagePlans"
      @show="showModal"
      :packagePlan="packagePlan"
      :key="packagePlan._id"
    />
  </div>
  <ModalComponent
    :is-open="isOpenModal"
    @close="closeModal"
    @confirm="closeModal"
    title="Account To Invest In"
  >
    <div class="row">
      <div class="d-flex justify-content-between">
        <label for="">From:</label>
        <span>{{ packagePlanAmount }}</span>
      </div>
      <AccountTypeComponent></AccountTypeComponent>
    </div>
  </ModalComponent>
</template>

<script setup lang="ts">
const isOpenModal = ref(false)
const packagePlanAmount = ref('')

const packagePlans: any[] = []

const showModal = (packagePlan: any) => {
  packagePlanAmount.value = `$${packagePlan.minAmount} - $${packagePlan.maxAmount}`
  isOpenModal.value = true
}

const closeModal = () => {
  isOpenModal.value = false
}
</script>

<style scoped></style>
