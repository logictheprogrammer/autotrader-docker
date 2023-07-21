<template>
  <div id="main-wrapper">
    <HeaderComponent />
    <!--**********************************
        Content body start
    ***********************************-->
    <div class="content-body">
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
    <!--**********************************
        Content body end
    ***********************************-->
    <FloatingMenuComponent v-if="meta.page !== 'Support'" />
  </div>
</template>

<script setup lang="ts">
const meta = computed(() => useRoute().meta)
</script>

<style scoped></style>
