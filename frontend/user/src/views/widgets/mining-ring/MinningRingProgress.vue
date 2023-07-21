<template>
  <div class="progress-container">
    <div class="my-progress"></div>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  const wrapper = document.querySelectorAll(".my-progress");
  const barCount = 50; // number of bars
  const percentDemo = (50 * 80) / 100; // 90%
  for (let index = 0; index < barCount; index++) {
    const className = index < percentDemo ? "selected-demo" : "";
    wrapper[0].innerHTML += `<i style="--i: ${index};" class="${className}"></i>`;
  }
});
</script>

<style scoped></style>

<style>
.progress-container {
  height: calc(100% - 13.5rem);
  aspect-ratio: 1/1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.my-progress {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 2;
}

.my-progress i {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: rotate(
    calc(45deg + calc(calc(360deg / var(--tlt-br-cnt)) * var(--i)))
  );
}
.my-progress i::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  background: hsla(0, 0%, 100%, 12%);
  width: 5px;
  height: 20px;
  border-radius: 999rem;
  transform: rotate(-45deg);
  transform-origin: top;
  opacity: 0;
  animation: barCreationAnimation 100ms ease forwards;
  animation-delay: calc(var(--i) * 15ms);
}
.my-progress .selected-demo::after {
  background: rgb(0, 255, 42);
  box-shadow: 0 0 1px rgb(0, 255, 42), 0 0 3px rgb(0, 153, 25),
    0 0 4px rgb(0, 51, 8);
}

@media only screen and (max-width: 478px) {
  .progress-container {
    height: calc(50%);
  }
  .my-progress i::after {
    width: 3px;
    height: 15px;
    transform: rotate(-45deg);
  }
}

@media only screen and (max-width: 368px) {
  .progress-container {
    height: calc(47%);
  }
  .my-progress i::after {
    width: 3px;
    height: 15px;
    transform: rotate(-45deg);
  }
}

@keyframes barCreationAnimation {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
