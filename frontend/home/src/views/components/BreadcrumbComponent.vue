<template>
  <ul class="breadcrumb pt-3">
    <li class="breadcrumb__item">
      <RouterLink :to="{ name: 'home' }">Home</RouterLink>
    </li>
    <li class="breadcrumb__item breadcrumb__item--active">{{ title }}</li>
  </ul>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped></style>
