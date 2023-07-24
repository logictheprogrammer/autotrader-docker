<template>
  <Transition name="progress">
    <MyProgressBarWidget v-if="isNavigating" />
  </Transition>
</template>

<script setup lang="ts">
const httpStore = useHttpStore()
const isNavigating = computed(() => httpStore.isNavigating)
</script>

<style scoped>
.progress-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.progress-leave-to {
  opacity: 0;
}
</style>
