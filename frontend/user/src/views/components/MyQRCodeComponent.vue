<template>
  <div :id="id"></div>
</template>

<script setup lang="ts">
const id = 'qrcode' + Math.ceil(Math.random() * 10000)

const props = defineProps<{
  value: string
}>()

onMounted(() => {
  window.$(`#${id}`).html('')
  const qrcode = new window.QRCode(document.getElementById(id))
  qrcode.makeCode(props.value)
})
</script>

<style scoped></style>
