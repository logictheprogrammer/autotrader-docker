<template>
  <!-- page wrap -->
  <div class="d-flex justify-content-center auth-translate">
    <GoogleTranslateWidget></GoogleTranslateWidget>
  </div>
  <div class="section section--content">
    <div class="section__content">
      <!-- form -->

      <RouterView></RouterView>
      <!-- end form -->
    </div>

    <!-- bg animation -->
    <MyCanvasComponent></MyCanvasComponent>
    <!-- end bg animation -->
  </div>
  <!-- end page wrap -->
</template>

<script setup lang="ts"></script>

<style scoped>
.auth-translate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
