<template>
  <div></div>
</template>

<script setup lang="ts">
const params = useRoute().params
const key = params.key as string
const token = params.token as string

useAuthStore().verifyEmail(key, token)
</script>

<style scoped></style>
