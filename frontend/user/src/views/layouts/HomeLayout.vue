<template>
  <div id="main-wrapper">
    <Transition name="timer">
      <NoticeTimerWidget v-if="authNotice" />
    </Transition>
    <HeaderComponent />
    <!--**********************************
        Content body start
    ***********************************-->
    <div class="content-body">
      <!-- row -->
      <div class="container-fluid">
        <div
          id="google-translator"
          class="translator d-flex justify-content-center"
        >
          <GoogleTranslateWidget></GoogleTranslateWidget>
        </div>
        <BreadcrumbComponent
          :current="meta.page"
          :parents="meta.breadcrumb"
          v-if="!meta.hideBreadcrumb"
        />
        <RouterView></RouterView>
      </div>
    </div>
    <div class="my-4 pb-4 pt-3 d-md-none" v-if="meta.page !== 'Support'"></div>
    <!--**********************************
        Content body end
    ***********************************-->
    <FloatingMenuComponent v-if="meta.page !== 'Support'" />
  </div>
</template>

<script setup lang="ts">
const meta = computed(() => useRoute().meta)
const authNotice = computed(() => useAuthStore().authNotice)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      window.$('.floating-menu').removeClass('no-float')
    } else {
      window.$('.floating-menu').addClass('no-float')
    }
  })

  observer.observe(document.getElementById('google-translator')!)
})
</script>

<style scoped>
.timer-enter-active,
.timer-leave-active {
  transition: all 0.3s ease-out;
}

.timer-enter-from,
.timer-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.translator {
  position: absolute;
  top: 5rem;
  left: 0;
  right: 0;
  z-index: 1;
}

@media only screen and (min-width: 768px) {
  .translator {
    left: auto;
    right: auto;
    padding-left: 1rem;
    display: block;
  }
}

@media only screen and (min-width: 1199px) {
  .translator {
    top: 6.3rem;
  }
}

@media only screen and (min-width: 1400px) {
  .translator {
    top: 7.3rem;
  }
}
</style>
