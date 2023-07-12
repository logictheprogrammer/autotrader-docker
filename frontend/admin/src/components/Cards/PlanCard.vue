<template>
  <div class="col-xl-4 col-lg-6 col-sm-12">
    <div class="card">
      <div
        class="card-header border-0 pb-0 justify-content-start align-items-stretch gap-2"
      >
        <div class="media me-2 rounded-profile overflow-hidden">
          <img alt="image" width="50" src="/images/avatar/4.jpg" />
        </div>
        <div class="d-flex flex-column justify-content-between">
          <h2 class="card-title fw-bold">{{ plan.name }}</h2>
          <p class="mb-0">{{ plan.network }}</p>
        </div>
      </div>
      <div class="card-body pb-0">
        <p>
          {{ plan.description }}
        </p>
      </div>
      <hr class="mt-2" />
      <div class="card-body pt-0">
        <ul>
          <li class="text-white mb-2">
            Devices
            <span class="ms-3 fs-5">{{
              plan.coins.map((str) => str.name.capitalize()).join(", ")
            }}</span>
          </li>
          <li class="text-white mb-2">
            Trading Hours
            <span class="ms-3 fw-bold text-warning fs-5">
              {{ plan.hours }} hours
            </span>
          </li>
          <li class="text-white mb-2">
            Stakeable Amount
            <span class="ms-3 fw-bold text-warning fs-5"
              >${{ plan.minAmount }} - ${{ plan.maxAmount }}</span
            >
          </li>
          <li class="text-white mb-2">
            Potential Profit
            <span class="ms-3 fw-bold text-success fs-5">
              +{{ plan.profit }} percent</span
            >
          </li>
        </ul>
        <button
          type="button"
          @click="$emit('show', plan)"
          class="btn btn-outline-secondary w-100 mt-3"
        >
          Edit<svg
            width="24"
            height="24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Plan } from "@/types/plan";
defineEmits(["show"]);
defineProps<{
  plan: Plan;
}>();
</script>

<style scoped></style>
