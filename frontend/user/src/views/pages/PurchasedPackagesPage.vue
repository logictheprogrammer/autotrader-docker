<template>
  <div class="custom-tab-1">
    <ul class="nav nav-tabs border-2 d-flex text-nowrap mb-4">
      <li class="nav-item">
        <a
          href="#running-packages"
          data-bs-toggle="tab"
          class="nav-link show active rounded-top m-0 text-center"
          style="border: none"
          >Running Packages</a
        >
      </li>
      <li class="nav-item">
        <a
          href="#closed-packages"
          data-bs-toggle="tab"
          class="nav-link rounded-top m-0 text-center"
          style="border: none"
          >Closed Packages</a
        >
      </li>
    </ul>
    <div class="tab-content">
      <div id="running-packages" class="tab-pane fade active show">
        <div class="row">
          <PurchasedPackageCardComponent
            v-for="packageInvestment in investments"
            :investment="packageInvestment"
            :key="packageInvestment._id"
          />
        </div>
      </div>
      <div id="closed-packages" class="tab-pane fade"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const investmentStore = useInvestmentStore()
const investments = computed(() => investmentStore.investments)
const investmentLoaded = computed(() => investmentStore.loaded)
// fetch if not fetched
if (!investmentLoaded.value) investmentStore.fetchAll()
</script>

<style scoped></style>
