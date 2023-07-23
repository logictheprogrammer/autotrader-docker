<template>
  <AppAlert />
  <SpinnerComponent />
  <AppProgressBar />
  <RouterView />
</template>

<script setup lang="ts">
const httpStore = useHttpStore()
const authStore = useAuthStore()

authStore.setAuth()
const isLoading = computed(() => httpStore.get.active)

watch(isLoading, (currentValue) => {
  if (!currentValue) {
    window.$('#mainLoader').addClass('d-none')
    window.$('body').removeClass('preloader-overflow')
  } else {
    window.$('#mainLoader').removeClass('d-none')
    window.$('body').addClass('preloader-overflow')
  }
})
</script>

<style scoped></style>
