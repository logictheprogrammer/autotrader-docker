<template>
  <div
    class="bg-skin floating-menu menu-shadow d-flex justify-content-around border border-dark d-md-none"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="{ name: item.to }"
      custom
      v-slot="{ isExactActive, href }"
    >
      <RouterLink
        :to="href"
        :class="`ai-icon py-3 flex-column d-flex align-items-center ${
          isExactActive ? 'text-info' : 'text-sharp'
        }`"
        aria-expanded="false"
      >
        <i :class="item.icon"></i>
        <span
          style="margin-top: 0.15rem"
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
    name: 'Home',
    to: 'home',
    parent: false,
    icon: 'fa-solid fa-house',
  },
  {
    name: 'Trades',
    to: 'purchasedPackages',
    parent: false,
    icon: 'fa-solid fa-bolt',
  },
  {
    name: 'Wallet',
    to: 'wallet',
    parent: true,
    icon: 'fa-solid fa-wallet',
  },
  {
    name: 'Settings',
    to: 'settings',
    parent: false,
    icon: 'fa-solid fa-gear',
  },
]
</script>

<style scoped>
.floating-menu {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  border-radius: 0.75rem;
  z-index: 5;
  transition: all 0.2s ease-out;
}

.icon-text {
  color: #828690;
  font-family: 'Cairo', sans-serif;
}

.no-float {
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 0;
}
</style>
