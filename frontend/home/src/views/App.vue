<template>
  <AppAlert />
  <SpinnerComponent />
  <AppProgressBar />
  <RouterView />
</template>

<script setup lang="ts">
const httpStore = useHttpStore()

onMounted(async () => {
  httpStore.setFetching(false)
  axios.get('http://localhost:3000/token').then((res) => console.log(res))
})

const isFetching = computed(() => httpStore.isFetching)

watch(isFetching, (currentValue) => {
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
