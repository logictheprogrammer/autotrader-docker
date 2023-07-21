<template>
  <div id="main-wrapper">
    <Header></Header>
    <!--**********************************
        Content body start
    ***********************************-->
    <div class="content-body">
      <!-- row -->
      <div class="container-fluid">
        <Breadcrumb
          :current="meta.page"
          :parents="meta.breadcrumb"
          v-if="!meta.hideBreadcrumb"
        ></Breadcrumb>
        <RouterView></RouterView>
      </div>
    </div>
    <!--**********************************
        Content body end
    ***********************************-->
    <FloatingMenu v-if="meta.page !== 'Support'"></FloatingMenu>
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
const meta = computed(() => useRoute().meta)
console.log(meta.value)
</script>

<style scoped></style>
