<template>
  <div
    class="bg-skin rounded-2 floating-menu shadow d-flex justify-content-around border border-dark d-md-none"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="{ name: item.to }"
      custom
      v-slot="{ isExactActive, href, isActive }"
    >
      <RouterLink
        :to="href"
        :class="`ai-icon py-3 flex-column d-flex align-items-center ${
          isExactActive ? 'text-info' : 'text-sharp'
        }`"
        aria-expanded="false"
      >
        <i class="flaticon-025-dashboard"></i>
        <span
          :class="`icon-text ${isExactActive ? 'text-info' : 'text-sharp'}`"
        >
          {{ item.name }}
        </span>
      </RouterLink>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  {
    name: "Home",
    to: "home",
    parent: false,
  },
  {
    name: "Trade",
    to: "active-trade",
    parent: false,
  },
  {
    name: "Wallet",
    to: "wallet",
    parent: true,
  },
  {
    name: "Settings",
    to: "settings",
    parent: false,
  },
];
</script>

<style scoped>
.floating-menu {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 5;
}

.icon-text {
  color: #828690;
  font-family: "Cairo", sans-serif;
}
</style>
