<template>
  <div class="row page-titles">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <RouterLink :to="{ name: 'home' }">Dashboard</RouterLink>
      </li>
      <template v-if="parents">
        <li
          class="breadcrumb-item"
          v-for="parent in parents"
          :key="parent.name"
        >
          <RouterLink :to="{ name: parent.to }">{{ parent.name }}</RouterLink>
        </li>
      </template>
      <li class="breadcrumb-item active">
        <a href="javascript:void(0)"> {{ current }}</a>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: string
  parents?: { name: string; to: string }[]
}>()
</script>

<style scoped></style>
