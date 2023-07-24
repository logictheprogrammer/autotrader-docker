<template>
  <div class="card overflow-hidden">
    <div class="card-body bg-gradient-mine-sm p-2">
      <div
        class="coinmarketcap-currency-widget"
        data-currencyid="1"
        data-base="USD"
        data-secondary="USD"
        data-ticker="true"
        data-rank="true"
        data-marketcap="true"
        data-volume="true"
        data-statsticker="true"
        data-stats="USD"
      >
        <CoinMarketPreview />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
onMounted(() => setTimeout(window.initCoinMarket, 500))
</script>

<style scoped></style>
