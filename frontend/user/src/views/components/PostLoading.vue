<template>
  <Transition>
    <div class="spinner">
      <div class="lds-dual-ring"></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
onMounted(() => {
  window.$("body").addClass("overflow-hidden-loading");
});
onBeforeUnmount(() => {
  window.$("body").removeClass("overflow-hidden-loading");
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.spinner {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  background-color: rgba(var(--background-rgb), 0.5);
  backdrop-filter: blur(5px);
}
.lds-dual-ring {
  display: inline-block;
  width: 80px;
  height: 80px;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 64px;
  height: 64px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: lds-dual-ring 0.8s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
