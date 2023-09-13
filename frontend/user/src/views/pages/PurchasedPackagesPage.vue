<template>
  <div class="row">
    <PurchasedPackageCardComponent
      v-for="packageInvestment in investments"
      :investment="packageInvestment"
      :key="packageInvestment._id"
    >
      <RouterLink
        :to="{
          name: 'purchasedPackage',
          params: { packageId: packageInvestment._id },
        }"
        :class="`btn btn-outline-secondary w-100 mt-3`"
      >
        View Trades
      </RouterLink>
    </PurchasedPackageCardComponent>
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
