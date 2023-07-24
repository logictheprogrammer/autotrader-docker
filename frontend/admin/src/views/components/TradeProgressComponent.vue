<template>
  <div class="card-body">
    <div class="progress default-progress">
      <div
        class="progress-bar bg-gradient-1 progress-animated"
        style="width: 45%"
        role="progressbar"
      >
        <span class="sr-only">45% Complete</span>
      </div>
    </div>
    <div class="d-flex align-items-end mt-2 pb-3 justify-content-between">
      <span>Investment</span>
      <span class="fs-18"
        ><span class="text-black pe-2">$1415</span>/$2000</span
      >
    </div>
    <div class="progress default-progress mt-4">
      <div
        class="progress-bar bg-gradient-2 progress-animated"
        style="width: 70%"
        role="progressbar"
      >
        <span class="sr-only">70% Complete</span>
      </div>
    </div>
    <div class="d-flex align-items-end mt-2 pb-3 justify-content-between">
      <span>Restaurant</span>
      <span class="fs-18"
        ><span class="text-black pe-2">$1567</span>/$5000</span
      >
    </div>
    <div class="progress default-progress mt-4">
      <div
        class="progress-bar bg-gradient-3 progress-animated"
        style="width: 35%"
        role="progressbar"
      >
        <span class="sr-only">35% Complete</span>
      </div>
    </div>
    <div class="d-flex align-items-end mt-2 pb-3 justify-content-between">
      <span>Installment</span>
      <span class="fs-18"
        ><span class="text-black pe-2">$487</span>/$10000</span
      >
    </div>
    <div class="progress default-progress mt-4">
      <div
        class="progress-bar bg-gradient-4 progress-animated"
        style="width: 95%"
        role="progressbar"
      >
        <span class="sr-only">95% Complete</span>
      </div>
    </div>
    <div class="d-flex align-items-end mt-2 justify-content-between">
      <span>Property</span>
      <span class="fs-18"
        ><span class="text-black pe-2">$3890</span>/$4000</span
      >
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.default-progress {
  height: 8px;
}
</style>
