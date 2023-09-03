<template>
  <div class="custom-select-form form">
    <div class="custom-select-type d-block">
      <div class="select-container">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.select-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.custom-select-type {
  display: flex;
}
</style>
