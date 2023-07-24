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
      <div id="observe"></div>
      <!-- row -->
      <div class="container-fluid">
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
const route = useRoute()
const authStore = useAuthStore()

const meta = computed(() => route.meta)
const authNotice = computed(() => authStore.authNotice)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      window.$('.floating-menu').removeClass('no-float')
    } else {
      window.$('.floating-menu').addClass('no-float')
    }
  })

  observer.observe(document.getElementById('observe')!)
})
</script>

<style scoped></style>
