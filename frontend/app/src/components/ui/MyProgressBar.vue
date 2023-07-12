<template>
  <progressBar mode="indeterminate" color="#b387d0"></progressBar>
</template>

<script setup>
import progressBar from "lightvue/progress-bar";
</script>

<style scoped>
.lv-progressbar--indeterminate {
  height: 0.15rem;
  position: fixed;
  z-index: 9999;
  top: 0.1rem;
  left: 0;
  right: 0;
}

.lv-progressbar {
  background-color: transparent;
}
</style>
