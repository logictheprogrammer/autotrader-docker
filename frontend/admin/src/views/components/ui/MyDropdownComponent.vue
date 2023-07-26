<template>
  <div class="dropdown dropend custom-dropdown mb-0">
    <div class="btn sharp btn-primary tp-btn" data-bs-toggle="dropdown">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="18px"
        height="18px"
        viewBox="0 0 24 24"
        version="1.1"
      >
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <rect x="0" y="0" width="24" height="24" />
          <circle fill="#000000" cx="12" cy="5" r="2" />
          <circle fill="#000000" cx="12" cy="12" r="2" />
          <circle fill="#000000" cx="12" cy="19" r="2" />
        </g>
      </svg>
    </div>
    <div class="dropdown-menu dropdown-menu-end shadow">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.dropdown-menu {
  border: 1px solid #3a3a52 !important;
}
</style>
