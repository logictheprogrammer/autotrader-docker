<template>
  <transition name="spinner">
    <div v-if="isPosting" class="ld-over-full-inverse running">
      <div class="ld ldld default"></div>
    </div>
  </transition>
</template>

<script setup lang="ts">
const isPosting = computed(() => useHttpStore().post.active)

watch(isPosting, (currentValue) => {
  if (currentValue) window.$('body').addClass('spinner-overflow')
  else {
    setTimeout(() => {
      window.$('body').removeClass('spinner-overflow')
    }, 500)
  }
})
</script>

<style>
.spinner-overflow {
  overflow: hidden;
}
</style>

<style scoped>
.ld-over-full-inverse {
  position: relative;
  transition: all 0.3s;
  transition-timing-function: ease-in;
}

.ld-over-full-inverse:before {
  overflow: hidden;
  content: ' ';
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all 0.2s ease-in-out;
  background: rgba(0, 0, 0, 0.6);
}

.ld-over-full-inverse.running:before {
  position: fixed;
  opacity: 1;
  z-index: 4000;
  display: block;
}

.ld {
  transform-origin: 50% 50%;
  transform-box: fill-box;
}

.ldld.default {
  transform: translate(-50%, -50%);
}

.ld-over-full-inverse > .ld {
  top: 50%;
  left: 50%;
  width: 1em;
  height: 1em;
  margin: -0.5em;
  transition: all 0.2s ease-in-out;
  transition-timing-function: ease-in;
  color: rgba(255, 255, 255, 0.8);
}

.ld-over-full-inverse.running > .ld {
  opacity: 1;
  visibility: visible;
  z-index: 4001;
  position: fixed;
}

.ldld.default:before {
  content: ' ';
  margin-left: 0.5rem;
  display: block;
  background: 0;
  animation: ldld-default 0.5s ease-in-out infinite;
  border-radius: 50%;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid #fff;
  border-color: currentColor transparent currentColor transparent;
  transition: all 0.2s ease-in-out;
}

@-moz-keyframes ldld-default {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes ldld-default {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

@-o-keyframes ldld-default {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes ldld-default {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}

.spinner-enter-from.running:before,
.spinner-leave-to.running:before {
  opacity: 0;
}

.spinner-enter-from.running > .ld,
.spinner-leave-to.running > .ld {
  opacity: 0;
  margin: -0.75em;
}

.spinner-enter-from.running .ldld.default:before,
.spinner-leave-to.running .ldld.default:before {
  width: 150%;
  height: 150%;
}
</style>
