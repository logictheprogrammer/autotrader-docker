<template>
  <div>
    <div
      class="swal2-icon swal2-warning swal2-animate-warning-icon"
      style="display: flex"
    >
      <span class="swal2-icon-text">!</span>
    </div>
    <h5 class="modal-title text-center"><slot></slot></h5>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.swal2-icon.swal2-warning {
  animation: swal2-animate-error-icon 0.5s;
}
</style>
