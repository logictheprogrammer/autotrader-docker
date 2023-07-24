<template>
  <div id="qrcode"></div>
</template>

<script setup lang="ts">
// qrcode
const address = "jjjjj";

onMounted(() => {
  window.$("#qrcode").html("");
  const qrcode = new window.QRCode(document.getElementById("qrcode"));
  qrcode.makeCode(address);
});
</script>

<style scoped></style>
