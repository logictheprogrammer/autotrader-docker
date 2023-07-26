<template>
  <Suspense>
    <EditUserPage />
  </Suspense>
</template>

<script setup lang="ts">
const userStore = useUserStore()
const httpStore = useHttpStore()
const usersLoaded = computed(() => userStore.loaded)

if (!usersLoaded.value) {
  httpStore.setPost(true)
}
</script>

<style scoped></style>
