<template>
  <div class="card-body px-0 text-nowrap">
    <div class="d-flex justify-content-center">
      <div
        class="empty-icon rounded-circle d-flex justify-content-center align-items-center"
      >
        <img src="/images/empty2.png" alt="" />
      </div>
    </div>
    <p class="text-center mt-2"><slot /></p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.empty-icon {
  width: 100px;
  height: 100px;
  background: var(--rgba-primary-1);
}
</style>
