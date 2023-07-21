<template>
  <div class="row">
    <div class="col-12">
      <div class="card overflow-hidden bg-gradient-mine">
        <div class="card-body p-0">
          <div class="row align-items-center">
            <div class="col-xl-6 p-0">
              <MinningRingWidget />
            </div>
            <div
              class="col-xl-6 d-flex align-items-center justify-content-center h-100 position-relative"
            >
              <CurveComponent />
              <div class="mb-0 mt-5 mt-xl-0 mx-4 w-100">
                <TradeProgressComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <PackageInfoComponent />
  <ReferralWidget />
</template>

<script setup lang="ts"></script>

<style scoped></style>
