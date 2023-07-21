<template>
  <div>
    <div
      class="swal2-icon swal2-error swal2-animate-error-icon"
      style="display: flex"
    >
      <span class="swal2-icon-text swal-red">!</span>
    </div>
    <h5 class="modal-title text-center"><slot></slot></h5>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.swal2-icon.swal2-error {
  animation: swal2-animate-error-icon 0.5s;
}

.swal-red {
  color: #f27474;
}
</style>
