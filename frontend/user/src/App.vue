<template>
  <div>
    <MyProgressBar v-if="isRequesting"></MyProgressBar>
    <Preloader></Preloader>
    <RouterView></RouterView>
  </div>
</template>

<script setup lang="ts">
const isRequesting = computed(() => useGeneralStore().isRequesting);
</script>

<style scoped></style>
