<template>
  <div class="container">
    <div id="translator">
      <GoogleTranslateWidget></GoogleTranslateWidget>
    </div>
  </div>
  <WhatsAppWidget v-if="onWhatsApp"></WhatsAppWidget>
  <HeaderComponent></HeaderComponent>
  <RouterView></RouterView>
  <FooterComponent></FooterComponent>
</template>

<script setup lang="ts">
const onWhatsApp = useConfigStore().whatsApp
</script>

<style scoped>
#translator {
  position: absolute;
  top: 5rem;
  z-index: 10;
}
</style>
