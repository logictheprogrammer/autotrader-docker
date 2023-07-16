<template>
  <div class="row">
    <PlanCard
      v-for="plan in plans"
      @show="showModal"
      :plan="plan"
      :key="plan._id"
    ></PlanCard>
  </div>
  <MyModal
    :is-open="isOpenModal"
    @close="closeModal"
    @confirm="closeModal"
    title="Account To Invest In"
  >
    <div class="row">
      <div class="d-flex justify-content-between">
        <label for="">From:</label>
        <span>{{ planAmount }}</span>
      </div>
      <AccountType></AccountType>
    </div>
  </MyModal>
</template>

<script setup lang="ts">
import type { Plan } from "@/types/plan";

const isOpenModal = ref(false);
const planAmount = ref("");

const plans = usePlanStore().plans;

const showModal = (plan: Plan) => {
  planAmount.value = `$${plan.minAmount} - $${plan.maxAmount}`;
  isOpenModal.value = true;
};

const closeModal = () => {
  isOpenModal.value = false;
};
</script>

<style scoped></style>
